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
  Trash2,
  FileSpreadsheet,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { getRecordSlug } from '@/lib/slugs';
import { ImageUploadField } from '@/components/content/ImageUploadField';
import KohaOdsImportModal from '@/components/admin/KohaOdsImportModal';
import { confirmDialog } from '@/lib/dialog';

const FORMAT_LABELS: Record<string, string> = {
  MANUSCRIPT: 'Manuscript',
  ARABI_MALAYALAM_PRINT: 'Arabi-Malayalam Print',
  RARE_BOOK: 'Rare Book',
  PERIODICAL: 'Periodical',
  THESIS: 'Thesis',
  AUDIO: 'Audio',
  MONOGRAPH: 'Monograph',
  BOOK: 'Book',
};

const ACCESS_LABELS: Record<string, string> = {
  DIGITISED_FULL: 'Digitised in full',
  READING_ROOM_ONLY: 'Reading room only',
  RESTRICTED: 'Restricted',
};

const PAGE_SIZE = 20;

export default function CatalogueRecordsPage() {
  const [records, setRecords] = useState<BibliographicRecord[]>([]);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [accessFilter, setAccessFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [facets, setFacets] = useState<{ formats: { key: string; count: number }[]; accessLevels: { key: string; count: number }[]; languages: { key: string; count: number }[] }>({
    formats: [],
    accessLevels: [],
    languages: [],
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOdsModal, setShowOdsModal] = useState(false);

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
  const [relatorTerm, setRelatorTerm] = useState(''); // 700$e

  // Section 2: Classification, Language & Identifiers
  const [itemType, setItemType] = useState('Book'); // 942$c [Required]
  const [language, setLanguage] = useState('English'); // 041$a [Required]
  const [ddcClass, setDdcClass] = useState(''); // 082$a
  const [ddcItem, setDdcItem] = useState(''); // 082$b
  const [isbn, setIsbn] = useState(''); // 020$a

  // Section 3: Publication & Physical Extent
  const [pubPlace, setPubPlace] = useState(''); // 260$a
  const [publisher, setPublisher] = useState(''); // 260$b
  const [pubYear, setPubYear] = useState(''); // 260$c
  const [edition, setEdition] = useState(''); // 250$a
  const [series, setSeries] = useState(''); // 490$a
  const [extent, setExtent] = useState(''); // 300$a

  // Section 4: Notes, Subjects & Digital URI
  const [subjects, setSubjects] = useState(''); // 650
  const [notes, setNotes] = useState(''); // 500$a
  const [uri, setUri] = useState(''); // 856$u

  // Step 2: Add Item(s) Fields (Holding Copies)
  const [barcode, setBarcode] = useState('');
  const [rfidTag, setRfidTag] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState('Main Stack Room A');
  const [callNumber, setCallNumber] = useState('');
  const [itemStatus, setItemStatus] = useState('AVAILABLE');
  const [addedItems, setAddedItems] = useState<any[]>([]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await api.searchCatalog({
        q: search || undefined,
        format: formatFilter !== 'ALL' ? formatFilter : undefined,
        access: accessFilter !== 'ALL' ? accessFilter : undefined,
        script: languageFilter !== 'ALL' ? languageFilter : undefined,
        sortBy,
        page,
        limit: PAGE_SIZE,
      });
      setRecords(res.data || []);
      setTotalCount(res.meta?.total ?? (res.data || []).length);
      setTotalPages(res.meta?.totalPages ?? 1);
      setFacets({
        formats: res.facets?.formats || [],
        accessLevels: res.facets?.accessLevels || [],
        languages: res.facets?.languages || [],
      });
    } catch {
      setRecords([]);
      setTotalCount(0);
      setTotalPages(1);
      setNotification({ type: 'error', text: 'Could not load catalogue records from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [search, formatFilter, accessFilter, languageFilter, sortBy, page]);

  // Any change to search/filters should jump back to page 1.
  const updateFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };
  const handleSearchChange = updateFilter(setSearch);
  const handleFormatChange = updateFilter(setFormatFilter);
  const handleAccessChange = updateFilter(setAccessFilter);
  const handleLanguageChange = updateFilter(setLanguageFilter);
  const handleSortChange = updateFilter(setSortBy);

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
    setLanguage('English');
    setDdcClass('');
    setDdcItem('');
    setIsbn('');
    setPubPlace('');
    setPublisher('');
    setPubYear('');
    setExtent('');
    setSubjects('');
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
    setSubtitle(rec.subtitle || '');
    setAuthor(Array.isArray(rec.authors) ? rec.authors.join(', ') : (rec.authors || ''));
    setStatementOfResp(rec.statementOfResponsibility || '');
    setUniformTitle(rec.titleArabic || '');
    setItemType(rec.format === 'MANUSCRIPT' ? 'Manuscripts' : rec.format === 'RARE_BOOK' ? 'Reference' : rec.format === 'ARABI_MALAYALAM_PRINT' ? 'Lithographs' : 'Book');
    setLanguage(rec.language || 'Malayalam');
    const shelfParts = (rec.shelfmark || '297.14 M14').split(' ');
    setDdcClass(shelfParts[0] || '297.14');
    setDdcItem(shelfParts[1] || 'M14');
    setIsbn(rec.isbn || '');
    setPubPlace(rec.placeOfPublication || '');
    setPublisher(rec.publisher || '');
    setPubYear(rec.publicationYear || '');
    setEdition(rec.edition || '');
    setSeries(rec.series || '');
    setExtent(rec.extent || '');
    setSubjects((rec.subjects || []).join(', '));
    setNotes(rec.notes || '');
    setUri(rec.coverImageUrl || '');
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
      subtitle: subtitle || undefined,
      statementOfResponsibility: statementOfResp || undefined,
      authors: author.split(',').map((a) => a.trim()).filter(Boolean),
      shelfmark: `${ddcClass} ${ddcItem}`.trim(),
      isbn: isbn || undefined,
      format,
      language,
      publicationYear: pubYear || undefined,
      publisher: publisher || undefined,
      placeOfPublication: pubPlace || undefined,
      edition: edition || undefined,
      series: series || undefined,
      extent: extent || undefined,
      subjects: subjects.split(',').map((s) => s.trim()).filter(Boolean),
      notes: notes || undefined,
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
      const copy = await api.addCatalogCopy(createdRecordId, { barcode: barcode.trim(), location, rfidTag: rfidTag || undefined, imageUrl: itemImageUrl });
      setAddedItems([...addedItems, copy]);
      setBarcode(`KMLRI-${Date.now().toString().slice(-6)}`);
      setRfidTag('');
      setItemImageUrl(undefined);
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
    if (!(await confirmDialog({ message: `Are you sure you want to permanently delete catalogue record "${titleName}" and all associated item copies?`, variant: 'danger' }))) return;
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

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Cataloging · Bibliographic Master Records"
        title="Catalogues"
        description="Create bibliographic records, manage physical holdings &amp; item copies, track live availability statistics, and configure field requirements."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={FileSpreadsheet} onClick={() => setShowOdsModal(true)}>
              Import Koha ODS
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
              Add New Record
            </Button>
          </div>
        }
      />

      {notification && (
        <div
          className={`p-4 border rounded-xl flex items-center gap-3 text-xs font-semibold ${notification.type === 'success'
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
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search records by title, shelfmark, author, subjects..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
            />
          </div>
          <span className="text-[11px] text-gray-500 font-mono whitespace-nowrap">
            {loading ? 'Loading…' : `${totalCount.toLocaleString()} record${totalCount === 1 ? '' : 's'}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase mr-1">
            <Filter className="w-3 h-3" /> Filters
          </span>
          <select
            value={formatFilter}
            onChange={(e) => handleFormatChange(e.target.value)}
            className="border border-gray-200 h-9 px-3 rounded text-xs outline-none bg-white text-gray-700 font-medium"
          >
            <option value="ALL">All Formats</option>
            {facets.formats.map((f) => (
              <option key={f.key} value={f.key}>
                {FORMAT_LABELS[f.key] || f.key} ({f.count})
              </option>
            ))}
          </select>

          <select
            value={accessFilter}
            onChange={(e) => handleAccessChange(e.target.value)}
            className="border border-gray-200 h-9 px-3 rounded text-xs outline-none bg-white text-gray-700 font-medium"
          >
            <option value="ALL">All Access Levels</option>
            {facets.accessLevels.map((a) => (
              <option key={a.key} value={a.key}>
                {ACCESS_LABELS[a.key] || a.key} ({a.count})
              </option>
            ))}
          </select>

          <select
            value={languageFilter}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border border-gray-200 h-9 px-3 rounded text-xs outline-none bg-white text-gray-700 font-medium"
          >
            <option value="ALL">All Languages</option>
            {facets.languages.map((l) => (
              <option key={l.key} value={l.key}>
                {l.key} ({l.count})
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-200 h-9 px-3 rounded text-xs outline-none bg-white text-gray-700 font-medium ml-auto"
          >
            <option value="recent">Sort: Recently catalogued</option>
            <option value="title">Sort: Title A&ndash;Z</option>
            <option value="year">Sort: Publication year</option>
          </select>

          {(formatFilter !== 'ALL' || accessFilter !== 'ALL' || languageFilter !== 'ALL' || search) && (
            <button
              type="button"
              onClick={() => {
                handleSearchChange('');
                handleFormatChange('ALL');
                handleAccessChange('ALL');
                handleLanguageChange('ALL');
              }}
              className="text-[11px] font-bold text-gray-500 hover:text-[#A52307] underline"
            >
              Clear all
            </button>
          )}
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
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 font-mono">
                  No catalogue records matching criteria.
                </td>
              </tr>
            ) : (
              records.map((r) => (
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-[11px] text-gray-500 font-mono">
            Page {page} of {totalPages} &middot; {totalCount.toLocaleString()} record{totalCount === 1 ? '' : 's'} total
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-gray-300 rounded bg-white hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 text-gray-700 transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {pageNumbers[0] > 1 && <span className="px-1 text-gray-400 text-xs">…</span>}
            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`min-w-[28px] h-[28px] px-1.5 rounded text-[11px] font-bold border transition-colors ${
                  p === page
                    ? 'bg-[#A52307] border-[#A52307] text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
            {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="px-1 text-gray-400 text-xs">…</span>}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-gray-300 rounded bg-white hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 text-gray-700 transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

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

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Edition <span className="text-gray-500 font-mono text-[10px]">(250$a)</span>
                      </label>
                      <input
                        type="text"
                        value={edition}
                        onChange={(e) => setEdition(e.target.value)}
                        placeholder="e.g. 2nd revised edition"
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Series <span className="text-gray-500 font-mono text-[10px]">(490$a)</span>
                      </label>
                      <input
                        type="text"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        placeholder="e.g. Malabar Manuscript Series, vol. 4"
                        className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 bg-white outline-none"
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

                    <div className="sm:col-span-3">
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Notes <span className="text-gray-500 font-mono text-[10px]">(500$a)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="General cataloguing notes"
                        className="w-full border border-gray-300 p-3 rounded text-xs text-gray-900 bg-white outline-none resize-y"
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

                  <div className="max-w-xs">
                    <ImageUploadField value={itemImageUrl} onChange={setItemImageUrl} label="Item Photo (optional)" aspectClass="aspect-[4/3]" />
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

      {/* Koha Accession Register ODS Import Modal */}
      <KohaOdsImportModal
        isOpen={showOdsModal}
        onClose={() => setShowOdsModal(false)}
        onImportComplete={(summary) => {
          loadRecords();
          setNotification({
            type: 'success',
            text: `Imported: ${summary.created} created, ${summary.updated} updated${summary.skipped ? `, ${summary.skipped} skipped` : ''} into the catalogue.`,
          });
          setTimeout(() => setNotification(null), 5000);
        }}
      />
    </div>
  );
}
