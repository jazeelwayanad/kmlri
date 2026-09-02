import { NextRequest, NextResponse } from 'next/server';

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const blob = new Blob([data as any]);
  const stream = new Response(blob).body!.pipeThrough(new DecompressionStream('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

async function readZipEntries(buffer: Uint8Array): Promise<Record<string, Uint8Array>> {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const textDecoder = new TextDecoder();
  let offset = 0;
  const files: Record<string, Uint8Array> = {};
  
  while (offset < buffer.length - 4) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break; // Local file header signature
    
    const method = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    
    const fileName = textDecoder.decode(buffer.subarray(offset + 30, offset + 30 + nameLen));
    const fileDataOffset = offset + 30 + nameLen + extraLen;
    const fileData = buffer.subarray(fileDataOffset, fileDataOffset + compSize);
    
    try {
      if (method === 0) {
        files[fileName] = fileData;
      } else if (method === 8) {
        files[fileName] = await inflateRaw(fileData);
      }
    } catch (e) {
      console.warn(`Error unpacking zip entry ${fileName}:`, e);
    }
    
    offset = fileDataOffset + compSize;
  }
  return files;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    let buffer: Uint8Array;
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
    } else {
      const arrayBuffer = await req.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'No file buffer provided' }, { status: 400 });
    }

    // Extract content.xml from ODS
    const zipEntries = await readZipEntries(buffer);
    const contentXmlBuffer = zipEntries['content.xml'];

    if (!contentXmlBuffer) {
      return NextResponse.json(
        { error: 'Invalid ODS file. content.xml could not be located inside the archive.' },
        { status: 400 }
      );
    }

    const xml = new TextDecoder().decode(contentXmlBuffer);

    // Parse ODS Table Rows
    const rowRegex = /<table:table-row[^>]*>([\s\S]*?)<\/table:table-row>/g;
    const cellRegex = /<table:table-cell([^>]*)>([\s\S]*?)<\/table:table-cell>/g;
    const pRegex = /<text:p[^>]*>([\s\S]*?)<\/text:p>/g;

    const rawRows: string[][] = [];
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRegex.exec(xml)) !== null) {
      const rowContent = rowMatch[1];
      let cellMatch: RegExpExecArray | null;
      const cells: string[] = [];

      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        const attrs = cellMatch[1];
        const cellContent = cellMatch[2];
        let pMatch: RegExpExecArray | null;
        const textParts: string[] = [];

        while ((pMatch = pRegex.exec(cellContent)) !== null) {
          const clean = pMatch[1].replace(/<[^>]+>/g, '').trim();
          if (clean) textParts.push(clean);
        }

        const val = textParts.join(' ');
        const repeatMatch = attrs.match(/table:number-columns-repeated="(\d+)"/);
        const repeat = repeatMatch ? parseInt(repeatMatch[1], 10) : 1;

        if (repeat > 1) {
          if (val) {
            for (let i = 0; i < Math.min(repeat, 50); i++) cells.push(val);
          } else if (repeat < 25) {
            for (let i = 0; i < repeat; i++) cells.push('');
          }
        } else {
          cells.push(val);
        }
      }

      if (cells.some((c) => c !== '')) {
        rawRows.push(cells);
      }
    }

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in the ODS document.' }, { status: 400 });
    }

    const headers = rawRows[0].map((h) => h.trim().toLowerCase());
    
    // Find column indexes
    const getIdx = (candidates: string[]) => {
      return headers.findIndex((h) => candidates.some((c) => h.includes(c)));
    };

    const idxBiblio = getIdx(['biblio', 'id']);
    const idxBarcode = getIdx(['barcode', 'accession']);
    const idxAccDate = getIdx(['accdate', 'date']);
    const idxCallNo = getIdx(['callno', 'shelfmark', 'class']);
    const idxIsbn = getIdx(['isbn']);
    const idxAuthor = getIdx(['author', 'creator']);
    const idxTitle = getIdx(['title', 'name']);
    const idxEdition = getIdx(['ed', 'edition']);
    const idxYear = getIdx(['year', 'pubdate', 'date']);
    const idxPlace = getIdx(['place']);
    const idxPublisher = getIdx(['pub', 'publisher']);
    const idxPages = getIdx(['page', 'extent']);
    const idxSubject = getIdx(['subject', 'topic']);
    const idxLocation = getIdx(['loc', 'location', 'branch']);
    const idxUniformTitle = getIdx(['uniform', 'arabic']);
    const idxLanguage = getIdx(['lang', 'language']);

    // Group rows by biblionumber / title into Bibliographic Records with Holding Items
    const recordsMap = new Map<string, any>();
    let totalItemsCount = 0;

    for (let r = 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      const title = (idxTitle !== -1 ? row[idxTitle] : '') || 'Untitled Bibliographic Record';
      const biblioId = (idxBiblio !== -1 ? row[idxBiblio] : '') || `KOHA-${r}`;
      const barcode = (idxBarcode !== -1 ? row[idxBarcode] : '') || `ACC-${biblioId}-${r}`;
      const callNo = (idxCallNo !== -1 ? row[idxCallNo] : '') || '297.14';
      const author = idxAuthor !== -1 ? row[idxAuthor] : '';
      const isbn = idxIsbn !== -1 ? row[idxIsbn] : '';
      const year = idxYear !== -1 ? row[idxYear] : '';
      const place = idxPlace !== -1 ? row[idxPlace] : '';
      const publisher = idxPublisher !== -1 ? row[idxPublisher] : '';
      const pages = idxPages !== -1 ? row[idxPages] : '';
      const subject = idxSubject !== -1 ? row[idxSubject] : '';
      const location = (idxLocation !== -1 ? row[idxLocation] : '') || 'Main Heritage Stacks';
      const uniformTitle = idxUniformTitle !== -1 ? row[idxUniformTitle] : '';
      const language = (idxLanguage !== -1 ? row[idxLanguage] : '') || 'Malayalam';
      const accDate = idxAccDate !== -1 ? row[idxAccDate] : '';

      const key = biblioId || title;
      totalItemsCount++;

      const itemCopy = {
        id: `item-${totalItemsCount}`,
        barcode: barcode || `ACC-${String(totalItemsCount).padStart(5, '0')}`,
        shelfmark: callNo,
        location: location || 'General Stacks',
        acquisitionDate: accDate,
        status: 'AVAILABLE',
      };

      if (!recordsMap.has(key)) {
        const subjectsArray = subject
          ? subject.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
          : ['Islamic Literature', 'Malabar Heritage'];

        // Determine format
        let format = 'MONOGRAPH';
        const tLower = title.toLowerCase();
        if (tLower.includes('manuscript') || tLower.includes('codex') || tLower.includes('ms ')) format = 'MANUSCRIPT';
        else if (tLower.includes('digest') || tLower.includes('journal') || tLower.includes('periodical')) format = 'PERIODICAL';
        else if (tLower.includes('litho') || tLower.includes('arabi-malayalam')) format = 'LITHOGRAPH';
        else if (tLower.includes('rare') || (year && parseInt(year, 10) < 1950)) format = 'RARE_BOOK';

        recordsMap.set(key, {
          id: `KOHA-${biblioId}`,
          kohaBiblioNumber: biblioId,
          titleLatin: title,
          titleArabic: uniformTitle || undefined,
          authors: author ? [author] : ['Unknown Author'],
          shelfmark: callNo || '297.14',
          isbn: isbn || undefined,
          format: format,
          language: language,
          originDate: year || undefined,
          originPlace: place || undefined,
          publisher: publisher || undefined,
          extent: pages ? `${pages} pages` : undefined,
          subjects: subjectsArray,
          accessLevel: 'OPEN_ACCESS',
          totalCopiesCount: 1,
          availableCopiesCount: 1,
          items: [itemCopy],
        });
      } else {
        const existing = recordsMap.get(key);
        existing.items.push(itemCopy);
        existing.totalCopiesCount = existing.items.length;
        existing.availableCopiesCount = existing.items.length;
      }
    }

    const parsedRecords = Array.from(recordsMap.values());

    // Full row set, normalized to the accession-register column shape the Nest API's
    // POST /catalog/import endpoint expects, so the modal can commit the entire file
    // (not just the 50-row preview) as a real backend import.
    const accessionRows = [];
    for (let r = 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      accessionRows.push({
        biblionumber: idxBiblio !== -1 ? row[idxBiblio] : '',
        Barcode: idxBarcode !== -1 ? row[idxBarcode] : '',
        AccDate: idxAccDate !== -1 ? row[idxAccDate] : '',
        CallNo: idxCallNo !== -1 ? row[idxCallNo] : '',
        ISBN: idxIsbn !== -1 ? row[idxIsbn] : '',
        Author: idxAuthor !== -1 ? row[idxAuthor] : '',
        Title: idxTitle !== -1 ? row[idxTitle] : '',
        Ed: idxEdition !== -1 ? row[idxEdition] : '',
        Year: idxYear !== -1 ? row[idxYear] : '',
        Place: idxPlace !== -1 ? row[idxPlace] : '',
        Pub: idxPublisher !== -1 ? row[idxPublisher] : '',
        Pages: idxPages !== -1 ? row[idxPages] : '',
        Subject: idxSubject !== -1 ? row[idxSubject] : '',
        Location: idxLocation !== -1 ? row[idxLocation] : '',
        UniformTitle: idxUniformTitle !== -1 ? row[idxUniformTitle] : '',
        Language: idxLanguage !== -1 ? row[idxLanguage] : '',
      });
    }

    return NextResponse.json({
      success: true,
      totalRowsParsed: rawRows.length - 1,
      totalRecordsCount: parsedRecords.length,
      totalItemsCount: totalItemsCount,
      headers: rawRows[0],
      samplePreview: parsedRecords.slice(0, 50),
      accessionRows,
    });
  } catch (error: any) {
    console.error('Error importing Koha ODS:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process ODS spreadsheet' },
      { status: 500 }
    );
  }
}
