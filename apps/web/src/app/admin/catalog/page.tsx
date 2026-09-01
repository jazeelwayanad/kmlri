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
  Bookmark,
  Edit3,
  Trash2
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { getRecordSlug } from '@/lib/slugs';

export default function CatalogueRecordsPage() {
  const [records, setRecords] = useState<BibliographicRecord[]>([]);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2-Step Record Creation / Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [createdRecordId, setCreatedRecordId] = useState<string>('');
  
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

  // Section 3: Publication & Physical Extent
  const [pubPlace, setPubPlace] = useState('Ponnani'); // 260$a
  const [publisher, setPublisher] = useState('KMLRI Press'); // 260$b
  const [pubYear, setPubYear] = useState('2026'); // 260$c
  const [extent, setExtent] = useState('184 pages'); // 300$a

  // Section 4: Notes, Subjects & Digital URI
  const [subjects, setSubjects] = useState('Islamic Jurisprudence, Malabar Manuscripts'); // 650
  const [notes, setNotes] = useState(''); // 500$a
  const [uri, setUri] = useState(''); // 856$u

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
    setEditingRecordId(null);
    setStep(1);
    setTitle('');
    setSubtitle('');
    setAuthor('');
    setStatementOfResp('');
    setUniformTitle('');
    setItemType('Book');
    setLanguage('Malayalam');
    setDdcClass('297.14');
    setDdcItem('M14');
    setIsbn('');
    setPubPlace('Ponnani');
    setPublisher('KMLRI Press');
    setPubYear('2026');
    setExtent('184 pages');
    setSubjects('Islamic Jurisprudence, Malabar Manuscripts');
    setNotes('');
    setUri('');
    setAddedItems([]);
    setShowAddModal(true);
  };

  // Open Edit Record Modal
  const handleOpenEditModal = (rec: BibliographicRecord) => {
    setEditingRecordId(rec.id);
    setStep(1);
    setTitle(rec.titleLatin);
    setSubtitle('');
    setAuthor(Array.isArray(rec.authors) ? rec.authors.join(', ') : (rec.authors || ''));
    setStatementOfResp('');
    setUniformTitle(rec.titleArabic || '');
    setItemType(rec.format === 'MANUSCRIPT' ? 'Manuscripts' : rec.format === 'RARE_BOOK' ? 'Reference' : 'Book');
    setLanguage(rec.language || 'Malayalam');
    const shelfParts = (rec.shelfmark || '297.14 M14').split(' ');
    setDdcClass(shelfParts[0] || '297.14');
    setDdcItem(shelfParts[1] || 'M14');
    const rAny = rec as any;
    setIsbn(rAny.isbn || '');
    setPublisher(rAny.publisher || 'KMLRI Press');
    setPubYear(rAny.publicationYear || '2026');
    setExtent(rAny.extent || '184 pages');
    setSubjects((rec.subjects || []).join(', '));
    setNotes(rAny.summary || '');
    setUri(rAny.coverImageUrl || '');
    setAddedItems([]);
    setShowAddModal(true);
  };

  const [saving, setSaving] = useState(false);

  // Step 1: Submit Record -> Proceed to Step 2 (or Save on Edit)
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setNotification({ type: 'error', text: 'Title and author are required.' });
      return;
    }

    const format = itemType === 'Manuscripts' ? 'MANUSCRIPT' : itemType === 'Reference' ? 'RARE_BOOK' : itemType === 'Lithographs' ? 'ARABI_MALAYALAM_PRINT' : 'MONOGRAPH';
    const payload = {
      titleLatin: title + (subtitle ? `: ${subtitle}` : ''),
      titleArabic: uniformTitle || undefined,
      authors: author.split(',').map((a) => a.trim()).filter(Boolean),
      shelfmark: `${ddcClass} ${ddcItem}`.trim(),
      isbn: isbn || undefined,
      format,
      language,
      publicationYear: pubYear || undefined,
      publisher: publisher || undefined,
      extent: extent || undefined,
      subjects: subjects.split(',').map((s) => s.trim()).filter(Boolean),
      summary: notes || undefined,
      coverImageUrl: uri || undefined,
      initialCopiesCount: 0,
    };

    setSaving(true);
    try {
      if (editingRecordId) {
        await api.updateCatalogItem(editingRecordId, payload);
        setShowAddModal(false);
        setNotification({ type: 'success', text: `Catalogue record "${title}" updated successfully.` });
        await loadRecords();
      } else {
        const created = await api.createCatalogItem(payload);
        setCreatedRecordId(created.id);
        setCallNumber(`${ddcClass} ${ddcItem}`);
        setBarcode(`KMLRI-${Date.now().toString().slice(-6)}`);
        setStep(2); // Proceed immediately to Step 2: Add Item
        await loadRecords();
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not save the record.' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Step 2: Add Holding Item Copy
  const handleAddItemCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || !createdRecordId) return;

    try {
      const copy = await api.addCatalogCopy(createdRecordId, { barcode: barcode.trim(), location });
      setAddedItems([...addedItems, copy]);
      setBarcode(`KMLRI-${Date.now().toString().slice(-6)}`);
      setRfidTag('');
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not attach item copy.' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleFinishCreation = async () => {
    setShowAddModal(false);
    setNotification({
      type: 'success',
      text: `Catalogue record "${title}" created successfully with ${addedItems.length} item copy(s).`,
    });
    setTimeout(() => setNotification(null), 5000);
    await loadRecords();
  };

  const handleDeleteRecord = async (id: string, titleName: string) => {
    if (!confirm(`Are you sure you want to permanently delete catalogue record "${titleName}" and all associated item copies?`)) return;
    try {
      await api.deleteCatalogItem(id);
      setNotification({ type: 'success', text: `Catalogue record "${titleName}" deleted successfully.` });
      await loadRecords();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not delete this record.' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
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
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <Link
                      href={`/admin/catalog/${getRecordSlug(r)}`}
                      className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View &amp; Items</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(r)}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(r.id, r.titleLatin)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded inline-block align-middle"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 2-Step Modern Add / Edit Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
              <div>
                <span className="text-[10px] text-[#A52307] font-bold uppercase tracking-wider">Catalogue Management</span>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingRecordId ? 'Edit Bibliographic Record' : step === 1 ? 'Add New Bibliographic Record' : 'Step 2: Add Physical Item Copies'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-[#FAF8F5] border border-gray-200 text-gray-700 px-3 py-1 rounded">
                  {editingRecordId ? 'Edit Mode' : step === 1 ? 'Step 1 of 2: Metadata' : 'Step 2 of 2: Physical Holdings'}
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

            {/* STEP 1: Metadata Form */}
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
                        Subtitle / Remainder <span className="text-gray-500 font-mono text-[10px]">(245$b)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 16th-century naval resistance chronicle"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Primary Author / Creator* <span className="text-[#A52307] font-bold font-mono text-[10px]">(100$a - Required)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shaykh Zayn al-Dīn al-Makhdūm II"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs font-semibold text-gray-900 bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Uniform / Original Title (Arabic Script) <span className="text-gray-500 font-mono text-[10px]">(240$a)</span>
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="تحفة المجاهدين في بعض أخبار البرتغاليين"
                        value={uniformTitle}
                        onChange={(e) => setUniformTitle(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-sm font-amiri text-gray-900 bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Statement of Responsibility <span className="text-gray-500 font-mono text-[10px]">(245$c)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ed. and annot. by Dr. Fatima Zahra"
                        value={statementOfResp}
                        onChange={(e) => setStatementOfResp(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Classification & Language */}
                <div className="bg-[#FAF8F5] border border-[#E2E0DB] p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-2">
                    <Layers className="w-4 h-4 text-[#A52307]" />
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Classification &amp; Language</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Koha / Catalog Item Type* <span className="text-[#A52307] font-bold font-mono text-[10px]">(942$c)</span>
                      </label>
                      <select
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs bg-white text-gray-900 outline-none"
                      >
                        <option value="Manuscripts">Manuscripts (Palm leaf / Paper)</option>
                        <option value="Lithographs">Arabi-Malayalam Lithographs</option>
                        <option value="Reference">Rare Books &amp; Archival Special</option>
                        <option value="Book">Monographs &amp; Studies</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Language* <span className="text-[#A52307] font-bold font-mono text-[10px]">(041$a)</span>
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs bg-white text-gray-900 outline-none"
                      >
                        <option value="Arabi-Malayalam">Arabi-Malayalam</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="English">English</option>
                        <option value="Persian">Persian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        DDC Class Number <span className="text-gray-500 font-mono text-[10px]">(082$a)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="297.14"
                        value={ddcClass}
                        onChange={(e) => setDdcClass(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs font-mono text-gray-900 bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Publication, Physical Extent & Notes */}
                <div className="bg-[#FAF8F5] border border-[#E2E0DB] p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-2">
                    <FileText className="w-4 h-4 text-[#A52307]" />
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Publication &amp; Extent</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Place of Publication</label>
                      <input
                        type="text"
                        value={pubPlace}
                        onChange={(e) => setPubPlace(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Publisher</label>
                      <input
                        type="text"
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Year / Era</label>
                      <input
                        type="text"
                        value={pubYear}
                        onChange={(e) => setPubYear(e.target.value)}
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs font-mono text-gray-900 bg-white outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block font-bold text-gray-700 uppercase mb-1">Subjects (Comma separated)</label>
                      <input
                        type="text"
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder="Islamic Jurisprudence, Malabar Manuscripts, Codicology"
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-[11px] text-gray-500">
                    {editingRecordId ? 'Click Update to save changes' : 'Step 1 of 2: Next step adds physical item copies'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow-md disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : editingRecordId ? 'Update Record' : 'Save & Proceed to Add Items →'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: Add Holding Copies */}
            {step === 2 && (
              <div className="flex-1 overflow-y-auto space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <strong className="text-emerald-900 text-xs block">Bibliographic Master Record Saved!</strong>
                    <span className="text-emerald-700 text-[11px]">
                      Now attach physical barcode copies, RFID identifiers, and stack room locations.
                    </span>
                  </div>
                </div>

                {/* Add Item Form */}
                <form onSubmit={handleAddItemCopy} className="bg-[#FAF8F5] border border-[#E2E0DB] p-4 rounded-lg space-y-3">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-[#A52307]" />
                    <span>Attach New Item Copy (Holding)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Item Barcode*</label>
                      <input
                        type="text"
                        required
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono font-bold text-gray-900 bg-white outline-none focus:border-[#A52307]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">RFID Hex Tag</label>
                      <input
                        type="text"
                        placeholder="Auto-generated if empty"
                        value={rfidTag}
                        onChange={(e) => setRfidTag(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono text-gray-900 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Permanent Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-3 rounded text-xs text-gray-900 bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307] transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Attach This Item Copy</span>
                    </button>
                  </div>
                </form>

                {/* Added Items List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-800 text-xs uppercase">Attached Copies ({addedItems.length})</h4>
                  {addedItems.length === 0 ? (
                    <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded text-center text-gray-500">
                      No copies attached yet. Enter a barcode above and click Attach.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded divide-y divide-gray-200">
                      {addedItems.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white flex justify-between items-center text-xs">
                          <div>
                            <span className="font-mono font-bold text-gray-900">{item.barcode}</span>
                            <span className="text-gray-500 font-mono text-[11px] ml-2">({item.rfidTag})</span>
                            <span className="text-gray-700 text-[11px] ml-3 font-semibold">📍 {item.location}</span>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleFinishCreation}
                    className="px-6 py-2.5 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Complete &amp; Return to Catalog</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
