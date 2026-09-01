'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, BibliographicRecord } from '@/lib/api';
import { 
  Plus, 
  Search, 
  Library, 
  Copy, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ArrowRight, 
  X,
  Boxes,
  Barcode,
  Save,
  Globe,
  Settings,
  BookOpen,
  Layers,
  FileText,
  Bookmark
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { getRecordSlug } from '@/lib/slugs';

export default function CatalogueRecordsPage() {
  const [records, setRecords] = useState<BibliographicRecord[]>([]);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2-Step Record Creation Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [createdRecordId, setCreatedRecordId] = useState<string>('');
  
  // Step 1: Bibliographic Fields (Grouped Cleanly)
  // Section 1: Title & Authorship
  const [title, setTitle] = useState(''); // 245$a [Required]
  const [subtitle, setSubtitle] = useState(''); // 245$b
  const [author, setAuthor] = useState(''); // 100$a [Required]
  const [statementOfResp, setStatementOfResp] = useState(''); // 245$c
  const [uniformTitle, setUniformTitle] = useState(''); // 240$a (Arabic / Original)
  const [varyingTitle, setVaryingTitle] = useState(''); // 246$a
  const [addedPerson, setAddedPerson] = useState(''); // 700$a
  const [relatorTerm, setRelatorTerm] = useState('scribe / commentator'); // 700$e

  // Section 2: Classification, Language & Identifiers
  const [itemType, setItemType] = useState('Book'); // 942$c [Required]
  const [language, setLanguage] = useState('Malayalam'); // 041$a [Required]
  const [ddcClass, setDdcClass] = useState('297.14'); // 082$a
  const [ddcItem, setDdcItem] = useState('M14'); // 082$b
  const [isbn, setIsbn] = useState(''); // 020$a
  const [controlField, setControlField] = useState('260901s2026 xx ||||| 000 0 mul d'); // 008

  // Section 3: Publication & Physical Extent
  const [edition, setEdition] = useState(''); // 250$a
  const [pubPlace, setPubPlace] = useState('Ponnani'); // 260$a
  const [publisher, setPublisher] = useState('KMLRI Press'); // 260$b
  const [pubYear, setPubYear] = useState('2026'); // 260$c
  const [extent, setExtent] = useState('184 pages'); // 300$a
  const [series, setSeries] = useState(''); // 490$a

  // Section 4: Notes, Subjects & Digital URI
  const [subjects, setSubjects] = useState('Islamic Jurisprudence, Malabar Manuscripts'); // 650
  const [notes, setNotes] = useState(''); // 500$a
  const [uri, setUri] = useState(''); // 856$u
  const [uriText, setUriText] = useState('Digital Facsimile'); // 856$y

  // Step 2: Add Item(s) Fields (Holding Copies)
  const [barcode, setBarcode] = useState('');
  const [rfidTag, setRfidTag] = useState('');
  const [location, setLocation] = useState('Main Reading Stack Room A');
  const [callNumber, setCallNumber] = useState('');
  const [itemStatus, setItemStatus] = useState('AVAILABLE');
  const [addedItems, setAddedItems] = useState<any[]>([]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await api.searchCatalog({ q: search, limit: 50 });
      setRecords(res.data || []);
    } catch {
      setRecords([]);
      setNotification({ type: 'error', text: 'Could not load catalogue records from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [search]);

  // Open Add Record Modal
  const handleOpenAddModal = () => {
    setStep(1);
    setTitle('');
    setSubtitle('');
    setAuthor('');
    setStatementOfResp('');
    setUniformTitle('');
    setIsbn('');
    setNotes('');
    setUri('');
    setAddedItems([]);
    setShowAddModal(true);
  };

  // Step 1: Submit Record -> Proceed to Step 2
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }

    const generatedId = `rec-${Date.now().toString().slice(-4)}`;
    setCreatedRecordId(generatedId);

    const newRecord: BibliographicRecord = {
      id: generatedId,
      titleLatin: title + (subtitle ? `: ${subtitle}` : ''),
      titleArabic: uniformTitle || '',
      authors: author ? [author] : ['Unknown Author'],
      shelfmark: `${ddcClass} ${ddcItem}`,
      format: itemType === 'Manuscripts' ? 'MANUSCRIPT' : itemType === 'Reference' ? 'RARE_BOOK' : 'MONOGRAPH',
      language: language,
      accessLevel: 'DIGITISED_FULL',
      totalCopiesCount: 0,
      availableCopiesCount: 0,
      subjects: subjects.split(',').map((s) => s.trim()).filter(Boolean),
    };

    setRecords([newRecord, ...records]);
    setCallNumber(`${ddcClass} ${ddcItem}`);
    setBarcode(`KMLRI-${Date.now().toString().slice(-6)}`);
    setStep(2); // Proceed immediately to Step 2: Add Item
  };

  // Step 2: Add Holding Item Copy
  const handleAddItemCopy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const newItem = {
      id: `copy-${Date.now().toString().slice(-4)}`,
      barcode: barcode.trim(),
      rfidTag: rfidTag.trim() || `RFID-${barcode.trim()}`,
      location,
      callNumber: callNumber || 'GEN-01',
      status: itemStatus,
    };

    setAddedItems([...addedItems, newItem]);

    // Update parent record copy counters
    setRecords((prev) =>
      prev.map((r) =>
        r.id === createdRecordId
          ? {
              ...r,
              totalCopiesCount: (r.totalCopiesCount || 0) + 1,
              availableCopiesCount: (r.availableCopiesCount || 0) + (itemStatus === 'AVAILABLE' ? 1 : 0),
            }
          : r
      )
    );

    setBarcode(`KMLRI-${Date.now().toString().slice(-6)}`);
    setRfidTag('');
  };

  const handleFinishCreation = () => {
    setShowAddModal(false);
    setNotification({
      type: 'success',
      text: `Catalogue record "${title}" created successfully with ${addedItems.length} item copy(s).`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredRecords = records.filter((r) => {
    if (formatFilter !== 'ALL' && r.format !== formatFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Cataloging · Bibliographic Master Records"
        title="Catelogues"
        description="Create bibliographic records, manage physical holdings &amp; item copies, track live availability statistics, and configure field requirements."
        actions={
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add New Record
          </Button>
        }
      />

      {notification && (
        <div
          className={`p-4 border rounded-xl flex items-center gap-3 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search records by title, shelfmark, author, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="border border-gray-200 h-10 px-3 rounded text-xs outline-none bg-white text-gray-700 font-medium"
          >
            <option value="ALL">All Formats</option>
            <option value="MANUSCRIPT">Manuscripts</option>
            <option value="ARABI_MALAYALAM_PRINT">Arabi-Malayalam Lithographs</option>
            <option value="RARE_BOOK">Rare Books</option>
            <option value="MONOGRAPH">Monographs</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Shelfmark &amp; Format</th>
              <th className="py-3 px-4">Title &amp; Author</th>
              <th className="py-3 px-4">Language / Access</th>
              <th className="py-3 px-4">Copies (Avail / Total)</th>
              <th className="py-3 px-4 text-right">Record Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 font-mono">
                  Loading catalogue database...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 font-mono">
                  No catalogue records matching criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-gray-900 block">{r.shelfmark}</span>
                    <Badge variant="neutral">
                      {r.format}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <Link
                      href={`/admin/catalog/${getRecordSlug(r)}`}
                      className="font-bold text-sm text-gray-900 hover:text-[#A52307] transition-colors leading-tight block"
                    >
                      {r.titleLatin}
                    </Link>
                    {r.titleArabic && (
                      <span className="font-amiri text-sm text-gray-600 block mt-0.5" dir="rtl">
                        {r.titleArabic}
                      </span>
                    )}
                    <span className="text-gray-500 text-[11px] block mt-0.5">
                      {r.authors?.join(', ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-gray-800 block">{r.language}</span>
                    <span className="text-[10px] text-gray-500 font-mono block uppercase">
                      {r.accessLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {r.availableCopiesCount || 0}
                    </span>
                    <span className="text-gray-500 font-mono text-[11px]">
                      {' '}/ {r.totalCopiesCount || 0} Copies
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      href={`/admin/catalog/${getRecordSlug(r)}`}
                      className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Record &amp; Items</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 2-Step Modern Add Record / Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
              <div>
                <span className="text-[10px] text-[#A52307] font-bold uppercase tracking-wider">Catalogue Management</span>
                <h3 className="text-lg font-bold text-gray-900">
                  {step === 1 ? 'Add New Bibliographic Record' : 'Step 2: Add Physical Item Copies'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-[#FAF8F5] border border-gray-200 text-gray-700 px-3 py-1 rounded">
                  {step === 1 ? 'Step 1 of 2: Metadata' : 'Step 2 of 2: Physical Holdings'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-900 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* STEP 1: Clean Form Layout */}
            {step === 1 && (
              <form onSubmit={handleSaveRecord} className="flex-1 overflow-y-auto pr-2 space-y-6">
                
                {/* 1. Title & Authorship Section */}
                <div className="bg-[#FAF8F5] border border-[#E2E0DB] p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-2">
                    <BookOpen className="w-4 h-4 text-[#A52307]" />
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Title &amp; Authorship Details</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="col-span-full">
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Title Proper* <span className="text-[#A52307] font-bold font-mono text-[10px]">(245$a - Required)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tuḥfat al-Mujāhidīn fī Baʿḍ Akhbār al-Purtuk͟hālīyīn"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs font-semibold text-gray-900 bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Subtitle / Remainder <span className="text-gray-400 font-mono text-[10px]">(245$b - Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Historical chronicle of Malabar"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Uniform / Original Title <span className="text-gray-400 font-mono text-[10px]">(240$a - Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. تحفة المجاهدين"
                        value={uniformTitle}
                        onChange={(e) => setUniformTitle(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs font-amiri text-sm bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Primary Author / Scribe* <span className="text-[#A52307] font-bold font-mono text-[10px]">(100$a - Required)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shaykh Zayn al-Dīn al-Makhdūm II"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs font-semibold bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Statement of Responsibility <span className="text-gray-400 font-mono text-[10px]">(245$c - Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. translated with annotations by..."
                        value={statementOfResp}
                        onChange={(e) => setStatementOfResp(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Classification & Identifiers Section */}
                <div className="bg-[#FAF8F5] border border-[#E2E0DB] p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-2">
                    <Layers className="w-4 h-4 text-[#A52307]" />
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Classification, Language &amp; Item Type</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Koha Default Item Type* <span className="text-[#A52307] font-bold font-mono text-[10px]">(942$c)</span>
                      </label>
                      <select
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white font-bold text-gray-900"
                      >
                        <option value="Book">Book (General Circulation)</option>
                        <option value="Reference">Reference (Reading Room)</option>
                        <option value="Manuscripts">Manuscripts (Archival Codex)</option>
                        <option value="Rare Book">Rare Antiquarian Book</option>
                        <option value="Serials/Periodicals">Serials / Periodicals</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Language of Text* <span className="text-[#A52307] font-bold font-mono text-[10px]">(041$a)</span>
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      >
                        <option value="Malayalam">Malayalam</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Arabi-Malayalam">Arabi-Malayalam</option>
                        <option value="English">English</option>
                        <option value="Persian">Persian</option>
                        <option value="Sanskrit">Sanskrit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        ISBN / Standard No. <span className="text-gray-400 font-mono text-[10px]">(020$a)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 978-81-948123-4-5"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded font-mono text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        DDC Class Number <span className="text-gray-400 font-mono text-[10px]">(082$a)</span>
                      </label>
                      <input
                        type="text"
                        value={ddcClass}
                        onChange={(e) => setDdcClass(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded font-mono text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        DDC Item Number <span className="text-gray-400 font-mono text-[10px]">(082$b)</span>
                      </label>
                      <input
                        type="text"
                        value={ddcItem}
                        onChange={(e) => setDdcItem(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded font-mono text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Control Field <span className="text-gray-400 font-mono text-[10px]">(008)</span>
                      </label>
                      <input
                        type="text"
                        value={controlField}
                        onChange={(e) => setControlField(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded font-mono text-[11px] bg-white text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Publication & Physical Description Section */}
                <div className="bg-[#FAF8F5] border border-[#E2E0DB] p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-2">
                    <Bookmark className="w-4 h-4 text-[#A52307]" />
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Publication &amp; Physical Extent</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Place of Publication (260$a)</label>
                      <input
                        type="text"
                        value={pubPlace}
                        onChange={(e) => setPubPlace(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Publisher Name (260$b)</label>
                      <input
                        type="text"
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Year of Publication (260$c)</label>
                      <input
                        type="text"
                        value={pubYear}
                        onChange={(e) => setPubYear(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded font-mono text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Physical Description / Extent (300$a)</label>
                      <input
                        type="text"
                        value={extent}
                        onChange={(e) => setExtent(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Edition Statement (250$a)</label>
                      <input
                        type="text"
                        value={edition}
                        onChange={(e) => setEdition(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Series Statement (490$a)</label>
                      <input
                        type="text"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Subjects, Notes & Digital Resource */}
                <div className="bg-[#FAF8F5] border border-[#E2E0DB] p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-2">
                    <Globe className="w-4 h-4 text-[#A52307]" />
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Subjects, Notes &amp; Digital Access</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="col-span-full">
                      <label className="block font-bold text-gray-700 uppercase mb-1">Topical Subject Headings (650)</label>
                      <input
                        type="text"
                        placeholder="Comma-separated e.g. Islamic Jurisprudence, Malabar Maritime History"
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Electronic Access URL / URI (856$u)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={uri}
                        onChange={(e) => setUri(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded font-mono text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Electronic Link Label (856$y)</label>
                      <input
                        type="text"
                        value={uriText}
                        onChange={(e) => setUriText(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      />
                    </div>

                    <div className="col-span-full">
                      <label className="block font-bold text-gray-700 uppercase mb-1">General Cataloging Note (500$a)</label>
                      <textarea
                        rows={2}
                        placeholder="Physical condition, watermark details, or provenance notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <span>Save Record &amp; Proceed to Add Item</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Add Physical Item Copies */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bibliographic record created: &quot;{title}&quot;</span>
                  </div>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    Now attach one or more physical holding copies with barcode and shelf location.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Add Copy Form */}
                  <form onSubmit={handleAddItemCopy} className="bg-[#FAF8F5] border border-[#E2E0DB] p-5 rounded-lg space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm border-b border-[#E2E0DB] pb-2 flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-[#A52307]" />
                      <span>Add Physical Copy / Item</span>
                    </h4>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Item Barcode*</label>
                      <input
                        type="text"
                        required
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded font-mono text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">RFID Transponder EPC</label>
                      <input
                        type="text"
                        placeholder="Auto-generated if empty"
                        value={rfidTag}
                        onChange={(e) => setRfidTag(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded font-mono text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Shelf Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Call Number</label>
                      <input
                        type="text"
                        value={callNumber}
                        onChange={(e) => setCallNumber(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded font-mono text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Availability Status</label>
                      <select
                        value={itemStatus}
                        onChange={(e) => setItemStatus(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2 rounded text-xs bg-white"
                      >
                        <option value="AVAILABLE">Available (In Stack)</option>
                        <option value="CHECKED_OUT">Checked Out</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="CONSERVATION">Under Conservation</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-black text-white rounded font-bold hover:bg-[#A52307] transition-colors flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Attach This Item Copy</span>
                    </button>
                  </form>

                  {/* Added Items List */}
                  <div className="bg-white border border-[#E2E0DB] p-5 rounded-lg space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm border-b border-[#E2E0DB] pb-2 flex items-center justify-between">
                        <span>Copies Attached ({addedItems.length})</span>
                        <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded">ID: {createdRecordId}</span>
                      </h4>

                      {addedItems.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 font-mono text-xs">
                          No item copies added yet. Fill the form to attach copies.
                        </div>
                      ) : (
                        <div className="space-y-2 pt-2 max-h-60 overflow-y-auto">
                          {addedItems.map((item) => (
                            <div key={item.id} className="p-2.5 bg-[#FAF8F5] border border-gray-200 rounded flex justify-between items-center text-xs">
                              <div>
                                <span className="font-mono font-bold text-gray-900 block">{item.barcode}</span>
                                <span className="text-gray-500 text-[11px]">{item.location} · {item.callNumber}</span>
                              </div>
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#E2E0DB] flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleFinishCreation}
                        className="px-6 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors shadow-sm"
                      >
                        Finish &amp; Complete Record
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
