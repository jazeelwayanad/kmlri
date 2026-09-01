'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, BibliographicRecord } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { slugify } from '@/lib/slugs';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [record, setRecord] = useState<BibliographicRecord | null>(null);
  const [selectedFolio, setSelectedFolio] = useState(1);
  const [holdStatus, setHoldStatus] = useState<string | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

  const fallbackCatalog: Record<string, BibliographicRecord> = {
    'bayan-al-fawaid': {
      id: 'rec-1',
      titleLatin: 'Bayān al-Fawāʾid',
      titleArabic: 'بيان الفوائد',
      authors: ['Aḥmad b. Muḥammad al-Ponnānī', 'Scribe: Zayn al-Dīn al-Kātib'],
      shelfmark: 'MS 0142',
      callNumber: 'MS-ARA-0142',
      format: 'MANUSCRIPT',
      language: 'Arabic, with Arabi-Malayalam glosses',
      extent: '84 folios, 21 × 15 cm',
      material: 'Handmade laid paper with Tre Lune watermark, brown ink, red rubrication',
      binding: 'Limp leather over paper boards',
      provenance: 'Acquired from Makhdūm family private repository, 1984',
      summary: 'A classical Malabar coastal manuscript detailing maritime jurisprudence, coastal trade contracts, and customary endowment laws.',
      subjects: ['Islamic Jurisprudence', 'Manuscript Culture', 'Malabar Maritime Trade'],
      accessLevel: 'DIGITISED_FULL',
      totalCopiesCount: 3,
      availableCopiesCount: 2,
      citations: {
        apa: 'Al-Ponnānī, A. M. (1768). Bayān al-Fawāʾid [MS 0142]. Kunhīn Musliyār Library & Research Institute.',
        mla: 'Al-Ponnānī, Aḥmad. Bayān al-Fawāʾid. Manuscript MS 0142, Kunhīn Musliyār Library & Research Institute.',
        chicago: 'Al-Ponnānī, Aḥmad. Bayān al-Fawāʾid. Malabar: KMLRI Archives (MS 0142).',
        bibtex: '@misc{kmlri_0142,\n  title = {Bayān al-Fawāʾid},\n  note = {Shelfmark: MS 0142, KMLRI}\n}',
      },
    },
    'muhyiddin-mala': {
      id: 'rec-2',
      titleLatin: 'Muḥyiddīn Mālā',
      titleArabic: 'محي الدين مالا',
      authors: ['Qāḍī Muḥammad b. ʿAbd al-ʿAzīz al-Kālikūtī'],
      shelfmark: 'AM 0311',
      callNumber: '894.812 QAD-M',
      format: 'ARABI_MALAYALAM_PRINT',
      language: 'Arabi-Malayalam',
      extent: '32 folios, lithograph print',
      material: 'Machine-milled rag paper, black lithographic ink',
      binding: 'Original paper wrappers',
      provenance: 'Ponnāni Press Collection',
      summary: 'The foundational Arabi-Malayalam devotional poem composed in 1607 CE celebrating the virtues of Shaykh ʿAbd al-Qādir al-Jīlānī.',
      subjects: ['Sufi Poetry', 'Arabi-Malayalam Literature', 'Malabar Devotional Tradition'],
      accessLevel: 'DIGITISED_FULL',
      totalCopiesCount: 2,
      availableCopiesCount: 1,
      citations: {
        apa: 'Qāḍī Muḥammad (1607). Muḥyiddīn Mālā [AM 0311]. Kunhīn Musliyār Library & Research Institute.',
        mla: 'Qāḍī Muḥammad. Muḥyiddīn Mālā. Lithograph AM 0311, Kunhīn Musliyār Library & Research Institute.',
        chicago: 'Qāḍī Muḥammad. Muḥyiddīn Mālā. Calicut: KMLRI Rare Prints (AM 0311).',
        bibtex: '@misc{kmlri_0311,\n  title = {Muḥyiddīn Mālā},\n  note = {Shelfmark: AM 0311, KMLRI}\n}',
      },
    },
    'tuhfat-al-mujahidin': {
      id: 'rec-3',
      titleLatin: 'Tuḥfat al-Mujāhidīn fī Baʿḍ Akhbār al-Purtuk͟hālīyīn',
      titleArabic: 'تحفة المجاهدين في بعض أخبار البرتغاليين',
      authors: ['Shaykh Zayn al-Dīn al-Makhdūm II'],
      shelfmark: 'RB 0908',
      callNumber: '954.83 ZAY-T',
      format: 'RARE_BOOK',
      language: 'Arabic',
      extent: '184 pages, Latin translation edition (1833)',
      material: 'Printed octavo volume with marbled endpapers',
      binding: 'Half-calf with gilt lettering',
      provenance: 'Purchased from Lisbon Orientalia Auction, 1992',
      summary: 'The premier contemporary historical chronicle documenting 16th-century anti-colonial naval defense and the alliance between the Zamorin of Calicut and Muslim seafarers.',
      subjects: ['Malabar History', 'Portuguese Resistance', 'Indian Ocean Historiography'],
      accessLevel: 'READING_ROOM_ONLY',
      totalCopiesCount: 4,
      availableCopiesCount: 3,
      citations: {
        apa: 'Al-Makhdūm, Z. (1833). Tuḥfat al-Mujāhidīn [RB 0908]. Kunhīn Musliyār Library & Research Institute.',
        mla: 'Al-Makhdūm, Zayn al-Dīn. Tuḥfat al-Mujāhidīn. Rare Book RB 0908, Kunhīn Musliyār Library & Research Institute.',
        chicago: 'Al-Makhdūm, Zayn al-Dīn. Tuḥfat al-Mujāhidīn. London/Lisbon: KMLRI Rare Books (RB 0908).',
        bibtex: '@misc{kmlri_0908,\n  title = {Tuḥfat al-Mujāhidīn},\n  note = {Shelfmark: RB 0908, KMLRI}\n}',
      },
    },
  };

  useEffect(() => {
    async function loadItem() {
      if (!id) return;
      try {
        const data = await api.getCatalogItem(id);
        if (data && data.titleLatin) {
          setRecord(data);
          return;
        }
      } catch {
        // Continue to fallback lookup
      }

      // Check normalized slug or shelfmark in fallbackCatalog
      const normalized = slugify(id);
      const matched = Object.entries(fallbackCatalog).find(
        ([key, val]) =>
          key === normalized ||
          slugify(val.shelfmark) === normalized ||
          val.id === id ||
          slugify(val.titleLatin).includes(normalized) ||
          normalized.includes(key)
      );

      if (matched) {
        setRecord(matched[1]);
      } else {
        // Default to first record
        setRecord(fallbackCatalog['bayan-al-fawaid']);
      }
    }
    loadItem();
  }, [id]);

  const handlePlaceHold = async () => {
    if (!user) {
      alert('Please sign in to place a hold on this item.');
      return;
    }
    try {
      await api.placeHold(record?.id || id);
      setHoldStatus('Hold placed successfully! We will notify you when ready for collection.');
    } catch (err: any) {
      setHoldStatus(err.message || 'Could not place hold.');
    }
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(format);
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  if (!record) {
    return (
      <div className="min-h-screen bg-paper text-black font-amiri flex items-center justify-center">
        <p className="text-xl font-bold">Loading item record...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-4 sm:px-5 py-6 sm:py-10">
        <nav className="mb-6 text-sm font-sans flex items-center gap-2 text-heritage-muted">
          <Link href="/search" className="hover:text-heritage-red underline">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">{record.shelfmark}</span>
          <span>/</span>
          <span className="text-black truncate max-w-xs">{record.titleLatin}</span>
        </nav>

        {/* Title Header */}
        <div className="border-b border-black pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div>
              <span className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold block mb-1">
                {record.format} · Shelfmark: {record.shelfmark}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-black leading-tight">
                {record.titleLatin}
              </h1>
              {record.titleArabic && (
                <p className="text-2xl sm:text-3xl text-gray-700 mt-1 font-amiri" dir="rtl">
                  {record.titleArabic}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlaceHold}
                className="px-5 py-2.5 bg-black text-white font-sans text-xs uppercase font-bold tracking-wider hover:bg-heritage-red transition-colors"
              >
                Place Hold / Reserve
              </button>
            </div>
          </div>
          {holdStatus && (
            <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-sans rounded">
              {holdStatus}
            </div>
          )}
        </div>

        {/* 2-Column Metadata & IIIF Viewer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Details & Viewer */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            {record.summary && (
              <div className="bg-white p-6 border border-black/15 shadow-sm">
                <h3 className="font-averia text-xs uppercase tracking-wider text-heritage-muted font-bold mb-2">
                  Codicological Summary
                </h3>
                <p className="font-sans text-sm text-gray-800 leading-relaxed">
                  {record.summary}
                </p>
              </div>
            )}

            {/* Digital Folio Viewer Mock */}
            <div className="bg-[#1A1A1A] text-white p-6 border border-black rounded shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-white/20 pb-3">
                <div>
                  <span className="text-xs font-sans text-gray-400 uppercase tracking-wider font-bold">
                    Interactive IIIF Manuscript Viewer
                  </span>
                  <p className="text-sm font-semibold text-gray-200">
                    Folio {selectedFolio} of 84 ({selectedFolio % 2 === 0 ? 'Verso' : 'Recto'})
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-sans">
                  <button
                    type="button"
                    disabled={selectedFolio <= 1}
                    onClick={() => setSelectedFolio(selectedFolio - 1)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30"
                  >
                    ← Prev Folio
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFolio(selectedFolio + 1)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded"
                  >
                    Next Folio →
                  </button>
                </div>
              </div>

              <div className="aspect-[4/3] bg-[#0D0D0D] border border-white/10 flex items-center justify-center text-center p-8 relative overflow-hidden">
                <div className="space-y-2">
                  <p className="font-amiri text-2xl text-amber-200" dir="rtl">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — الحمد لله رب العالمين
                  </p>
                  <p className="text-xs font-sans text-gray-400 max-w-sm mx-auto">
                    High-resolution multi-spectral capture from KMLRI Special Collections Lab.
                  </p>
                </div>
              </div>
            </div>

            {/* Citations Desk */}
            {record.citations && (
              <div className="bg-white p-6 border border-black/15 shadow-sm space-y-4">
                <h3 className="font-averia text-xs uppercase tracking-wider text-heritage-muted font-bold">
                  Scholarly Citations
                </h3>
                <div className="space-y-3 font-sans text-xs">
                  {Object.entries(record.citations).map(([format, text]) => (
                    <div key={format} className="p-3 bg-[#FAF8F5] border border-gray-200 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="uppercase text-gray-600 text-[10px]">{format}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(text, format)}
                          className="text-[#A52307] hover:underline font-bold"
                        >
                          {copiedCitation === format ? 'Copied!' : 'Copy Citation'}
                        </button>
                      </div>
                      <p className="font-mono text-gray-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Bibliographic Metadata Table */}
          <div className="space-y-6">
            <div className="bg-white p-6 border border-black/15 shadow-sm space-y-4 font-sans text-xs">
              <h3 className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold border-b border-gray-200 pb-2">
                Bibliographic Information
              </h3>

              <div className="space-y-2.5">
                <div>
                  <span className="text-gray-500 block text-[11px]">Primary Author(s):</span>
                  <span className="font-semibold text-gray-900">{record.authors?.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Language:</span>
                  <span className="font-semibold text-gray-900">{record.language}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Physical Extent:</span>
                  <span className="font-semibold text-gray-900">{record.extent || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Material &amp; Paper:</span>
                  <span className="font-semibold text-gray-900">{record.material || 'Laid Paper'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Binding:</span>
                  <span className="font-semibold text-gray-900">{record.binding || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Provenance &amp; Custody:</span>
                  <span className="font-semibold text-gray-900">{record.provenance || 'KMLRI Custodial Vault'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Access Clearance:</span>
                  <span className="font-bold text-emerald-800 uppercase">{record.accessLevel}</span>
                </div>
              </div>

              {record.subjects && record.subjects.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-500 block text-[11px] mb-1.5">Subject Headings:</span>
                  <div className="flex flex-wrap gap-1">
                    {record.subjects.map((sub, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px]">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
