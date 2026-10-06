'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, BibliographicRecord } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Edit3,
  Filter,
  Layers,
  SlidersHorizontal,
  BookmarkPlus,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { getRecordSlug } from '@/lib/slugs';
import { confirmDialog } from '@/lib/dialog';
import AddRecordDropdown from '@/components/forms/AddRecordDropdown';
import { FormFrameworkSchema } from '@/components/forms/DynamicFormRenderer';

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

interface SavedFilterPreset {
  id: string;
  name: string;
  search: string;
  formatFilter: string;
  accessFilter: string;
  languageFilter: string;
  sortBy: string;
  advFrameworkCode?: string;
  advFieldValues?: Record<string, string>;
}

export default function CatalogueRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<BibliographicRecord[]>([]);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [accessFilter, setAccessFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [facets, setFacets] = useState<{
    formats: { key: string; count: number }[];
    accessLevels: { key: string; count: number }[];
    languages: { key: string; count: number }[];
  }>({
    formats: [],
    accessLevels: [],
    languages: [],
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<FormFrameworkSchema[]>([]);

  // Advanced Search State - Dynamic Form Fields only
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedSearchFrameworkCode, setSelectedSearchFrameworkCode] = useState<string>('');
  const [advFrameworkCode, setAdvFrameworkCode] = useState<string>('ALL');
  const [advFieldValues, setAdvFieldValues] = useState<Record<string, string>>({});

  // Saved Filter Presets
  const [savedFilters, setSavedFilters] = useState<SavedFilterPreset[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  // Load frameworks and saved filter presets
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const fwList = await api.getFormFrameworks('ITEM');
        if (isMounted && Array.isArray(fwList)) {
          setFrameworks(fwList);
          if (fwList.length > 0 && !selectedSearchFrameworkCode) {
            setSelectedSearchFrameworkCode(fwList[0].code);
          }
        }
      } catch (err) {
        console.warn('Failed to load item frameworks:', err);
      }
    })();

    // Load saved filters from localStorage
    try {
      const stored = localStorage.getItem('kmlri_saved_catalog_filters');
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      // Extract specific search params from dynamic framework fields
      let customTitle: string | undefined = undefined;
      let customAuthor: string | undefined = undefined;
      let customShelfmark: string | undefined = undefined;
      let customPublisher: string | undefined = undefined;
      const additionalTerms: string[] = [];

      Object.entries(advFieldValues).forEach(([key, val]) => {
        if (!val || !val.trim()) return;
        const cleanVal = val.trim();
        if (['titleProper', 'titleLatin', 'title', 'name'].includes(key)) {
          customTitle = cleanVal;
        } else if (['author', 'authors', 'scribe'].includes(key)) {
          customAuthor = cleanVal;
        } else if (['shelfmark', 'callNumber'].includes(key)) {
          customShelfmark = cleanVal;
        } else if (['publisher'].includes(key)) {
          customPublisher = cleanVal;
        } else {
          additionalTerms.push(cleanVal);
        }
      });

      const combinedSearch = [search, ...additionalTerms].filter(Boolean).join(' ');

      const res = await api.searchCatalog({
        q: combinedSearch || undefined,
        title: customTitle,
        author: customAuthor,
        shelfmark: customShelfmark,
        publisher: customPublisher,
        frameworkCode: advFrameworkCode && advFrameworkCode !== 'ALL' ? advFrameworkCode : undefined,
        format: formatFilter === 'ALL' ? undefined : formatFilter,
        accessLevel: accessFilter === 'ALL' ? undefined : accessFilter,
        page,
        limit: PAGE_SIZE,
        sortBy,
      });

      let recs: BibliographicRecord[] = [];
      let total = 0;

      if (Array.isArray(res)) {
        recs = res;
        total = res.length;
      } else if (res && Array.isArray(res.data)) {
        recs = res.data;
        total = res.meta?.total ?? res.total ?? res.data.length;
      } else if (res && Array.isArray(res.records)) {
        recs = res.records;
        total = res.total ?? res.records.length;
      }

      // Language filter (client-side if needed)
      if (languageFilter !== 'ALL') {
        recs = recs.filter((r) => r.language?.toLowerCase() === languageFilter.toLowerCase());
      }

      setRecords(recs);
      setTotalCount(total);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));

      // Extract facet counts
      if (res && res.facets) {
        setFacets({
          formats: res.facets.formats || [],
          accessLevels: res.facets.accessLevels || [],
          languages: res.facets.languages || [],
        });
      }
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
  }, [
    search,
    formatFilter,
    accessFilter,
    languageFilter,
    sortBy,
    page,
    advFrameworkCode,
    advFieldValues,
  ]);

  const updateFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setActiveFilterId(null);
    setPage(1);
  };
  const handleSearchChange = updateFilter(setSearch);
  const handleFormatChange = updateFilter(setFormatFilter);
  const handleAccessChange = updateFilter(setAccessFilter);
  const handleLanguageChange = updateFilter(setLanguageFilter);
  const handleSortChange = updateFilter(setSortBy);

  const handleResetFilters = () => {
    setSearch('');
    setFormatFilter('ALL');
    setAccessFilter('ALL');
    setLanguageFilter('ALL');
    setSortBy('recent');
    setAdvFieldValues({});
    if (frameworks.length > 0) setAdvFrameworkCode(frameworks[0].code);
    else setAdvFrameworkCode('ALL');
    setActiveFilterId(null);
    setPage(1);
  };

  const handleSaveFilterPreset = () => {
    if (!newFilterName.trim()) return;
    const newPreset: SavedFilterPreset = {
      id: `filter-${Date.now()}`,
      name: newFilterName.trim(),
      search,
      formatFilter,
      accessFilter,
      languageFilter,
      sortBy,
      advFrameworkCode,
      advFieldValues,
    };

    const updated = [...savedFilters, newPreset];
    setSavedFilters(updated);
    localStorage.setItem('kmlri_saved_catalog_filters', JSON.stringify(updated));
    setActiveFilterId(newPreset.id);
    setNewFilterName('');
    setShowSaveModal(false);
    setNotification({ type: 'success', text: `Filter preset "${newPreset.name}" saved.` });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApplyPreset = (preset: SavedFilterPreset) => {
    setActiveFilterId(preset.id);
    setSearch(preset.search || '');
    setFormatFilter(preset.formatFilter || 'ALL');
    setAccessFilter(preset.accessFilter || 'ALL');
    setLanguageFilter(preset.languageFilter || 'ALL');
    setSortBy(preset.sortBy || 'recent');
    setAdvFrameworkCode(preset.advFrameworkCode || (frameworks[0]?.code || 'ALL'));
    setAdvFieldValues(preset.advFieldValues || {});
    if (preset.advFieldValues && Object.keys(preset.advFieldValues).length > 0) {
      setShowAdvancedSearch(true);
    }
    setPage(1);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('kmlri_saved_catalog_filters', JSON.stringify(updated));
    if (activeFilterId === id) setActiveFilterId(null);
  };

  const handleDeleteRecord = async (id: string, titleName: string) => {
    if (
      !(await confirmDialog({
        title: 'Delete Catalogue Record',
        message: `Are you sure you want to permanently delete catalogue record "${titleName}" and all associated item copies?`,
        tone: 'danger',
      }))
    )
      return;
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

  const hasAdvValues = Object.values(advFieldValues).some((v) => !!v && !!v.trim());
  const hasActiveFilters =
    search ||
    formatFilter !== 'ALL' ||
    accessFilter !== 'ALL' ||
    languageFilter !== 'ALL' ||
    hasAdvValues;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );

  const activeSelectedFramework =
    frameworks.find((f) => f.code === selectedSearchFrameworkCode) || frameworks[0];

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Cataloging · Bibliographic Master Records"
        title="Catalogues"
        actions={
          <div className="flex items-center gap-2">
            <AddRecordDropdown
              moduleType="ITEM"
              defaultLabel="Add New Record"
              onSelectForm={(fw) => router.push(`/admin/catalog/create?framework=${encodeURIComponent(fw.code)}`)}
              onFallback={() => router.push('/admin/catalog/create')}
            />
          </div>
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

      {/* Filter and Search Bar Container */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl flex flex-col gap-3 shadow-sm">
        {/* Saved Filter Presets Chips */}
        {savedFilters.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap mr-1">
              Saved Presets:
            </span>
            {savedFilters.map((preset) => {
              const isSelected = activeFilterId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#A52307] text-white border-[#A52307]'
                      : 'bg-[#FAF8F5] text-gray-700 hover:bg-gray-100 border-[#E2E0DB]'
                  }`}
                >
                  <span>{preset.name}</span>
                  <span
                    onClick={(e) => handleDeletePreset(preset.id, e)}
                    className="hover:opacity-100 opacity-60 ml-0.5 p-0.5 cursor-pointer"
                    title="Delete preset"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search records by title, shelfmark, author, subjects..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-[#E2E0DB] rounded-lg text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showAdvancedSearch || hasAdvValues
                  ? 'bg-[#FAF8F5] text-[#A52307] border-[#A52307]'
                  : 'bg-white text-gray-700 border-[#E2E0DB] hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Advanced Search</span>
              {showAdvancedSearch ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setShowSaveModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-[#E2E0DB] text-gray-700 hover:text-[#A52307] hover:bg-gray-50 transition-colors cursor-pointer"
                title="Save current filters as a preset"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save Filter</span>
              </button>
            )}

            <span className="text-[11px] text-gray-500 font-mono whitespace-nowrap pl-2">
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <LoadingSpinner size="xs" />
                </span>
              ) : (
                `${totalCount.toLocaleString()} record${totalCount === 1 ? '' : 's'}`
              )}
            </span>
          </div>
        </div>

        {/* Quick Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase mr-1">
            <Filter className="w-3 h-3" /> Filters
          </span>
          <select
            value={formatFilter}
            onChange={(e) => handleFormatChange(e.target.value)}
            className="border border-[#E2E0DB] h-9 px-3 rounded-lg text-xs outline-none bg-white text-gray-700 font-medium"
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
            className="border border-[#E2E0DB] h-9 px-3 rounded-lg text-xs outline-none bg-white text-gray-700 font-medium"
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
            className="border border-[#E2E0DB] h-9 px-3 rounded-lg text-xs outline-none bg-white text-gray-700 font-medium"
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
            className="border border-[#E2E0DB] h-9 px-3 rounded-lg text-xs outline-none bg-white text-gray-700 font-medium ml-auto"
          >
            <option value="recent">Sort: Recently catalogued</option>
            <option value="title">Sort: Title A–Z</option>
            <option value="year">Sort: Publication year</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-gray-500 hover:text-[#A52307] underline cursor-pointer ml-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Dynamic Form Fields Only - Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="pt-4 border-t border-gray-100 bg-[#FAF8F5] -mx-4 -mb-4 p-4 rounded-b-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#A52307]" />
                <span>Form Framework Fields</span>
                {activeSelectedFramework && (
                  <span className="text-[11px] font-semibold text-[#A52307] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {activeSelectedFramework.name}
                  </span>
                )}
              </span>

              {frameworks.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Switch Framework:</span>
                  <select
                    value={selectedSearchFrameworkCode}
                    onChange={(e) => {
                      setSelectedSearchFrameworkCode(e.target.value);
                      setAdvFieldValues({});
                      setPage(1);
                    }}
                    className="border border-[#E2E0DB] h-7 px-2 rounded text-xs outline-none bg-white text-gray-800 font-semibold"
                  >
                    {frameworks.map((fw) => (
                      <option key={fw.code} value={fw.code}>
                        {fw.name} ({fw.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* ONLY render the specific fields defined in this created form framework */}
            {activeSelectedFramework && activeSelectedFramework.fields && activeSelectedFramework.fields.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {activeSelectedFramework.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 truncate" title={field.label}>
                      {field.label} {field.required ? '*' : ''}
                    </label>
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      placeholder={`Search ${field.label.toLowerCase()}…`}
                      value={advFieldValues[field.name] || ''}
                      onChange={(e) => {
                        setAdvFieldValues({
                          ...advFieldValues,
                          [field.name]: e.target.value,
                        });
                        setPage(1);
                      }}
                      className="w-full h-8 px-2.5 bg-white border border-[#E2E0DB] rounded text-xs outline-none focus:border-[#A52307]"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-gray-500 bg-white rounded-lg border border-[#E2E0DB]">
                No form fields configured for this framework.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAdvFieldValues({});
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-white border border-[#E2E0DB] text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Reset Fields
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Filter Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-[#E2E0DB] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <BookmarkPlus className="w-4 h-4 text-[#A52307]" />
                <span>Save Filter Preset</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Save your current search queries and filter parameters as a quick preset for future access.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Preset Name</label>
              <input
                type="text"
                placeholder="e.g. My Custom Filter"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                autoFocus
                className="w-full h-9 px-3 border border-[#E2E0DB] rounded-lg text-xs outline-none focus:border-[#A52307]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveFilterPreset();
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E0DB] text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFilterPreset}
                disabled={!newFilterName.trim()}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#A52307] text-white hover:bg-red-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Results Table */}
      <div className="space-y-4">
        {/* Pagination Bar (Top) */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 my-2 overflow-x-auto pb-1">
            {page > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  « First
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  ‹ Prev
                </button>
              </>
            )}

            {pageNumbers.map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => setPage(pNum)}
                className={`min-w-[32px] px-2.5 py-1.5 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                  pNum === page
                    ? 'bg-[#A52307] text-white font-bold shadow-sm'
                    : 'border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                {pNum}
              </button>
            ))}

            {page < totalPages && (
              <>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Next ›
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Last »
                </button>
              </>
            )}
          </div>
        )}

        {/* Main Table Container */}
        <div className="bg-white border border-[#E2E0DB] rounded-xl shadow-sm overflow-hidden text-xs">
          {/* Bulk Action Header */}
          {selectedIds.length > 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between">
              <span className="font-semibold text-amber-900 text-xs">
                {selectedIds.length} of {records.length} record(s) selected
              </span>
              <button
                type="button"
                onClick={async () => {
                  const ok = await confirmDialog({
                    title: 'Bulk Delete Records',
                    message: `Are you sure you want to delete ${selectedIds.length} selected record(s)? This cannot be undone.`,
                    tone: 'danger',
                  });
                  if (!ok) return;
                  for (const item of selectedIds) {
                    try {
                      await api.deleteCatalogItem(item);
                    } catch (e) {
                      console.error(e);
                    }
                  }
                  setSelectedIds([]);
                  loadRecords();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center text-gray-500">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-xs font-medium">Loading catalogue records…</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-16 text-center text-gray-500 space-y-2">
              <p className="text-sm font-bold text-gray-700">No catalogue records found</p>
              <p className="text-xs">Try adjusting your search query, format, language, or access filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-700 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4 w-10 text-center border-r border-[#E2E0DB]">
                      <input
                        type="checkbox"
                        checked={records.length > 0 && selectedIds.length === records.length}
                        onChange={() => {
                          if (selectedIds.length === records.length) {
                            setSelectedIds([]);
                          } else {
                            setSelectedIds(records.map((r) => r.id));
                          }
                        }}
                        className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307] cursor-pointer"
                        title="Select all"
                      />
                    </th>
                    <th className="py-3.5 px-4 font-bold border-r border-[#E2E0DB] w-[48%]">Results</th>
                    <th className="py-3.5 px-4 font-bold border-r border-[#E2E0DB] w-[32%]">Items &amp; Availability</th>
                    <th className="py-3.5 px-4 font-bold w-[20%] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {records.map((r, idx) => {
                    const itemIndex = (page - 1) * PAGE_SIZE + idx + 1;
                    const isSel = selectedIds.includes(r.id);
                    const totalCopies = r.totalCopiesCount || (r.copies?.length || 0);
                    const availCopies = r.availableCopiesCount ?? totalCopies;

                    const customData = (() => {
                      try {
                        return r.customFields ? JSON.parse(r.customFields) : {};
                      } catch {
                        return {};
                      }
                    })();

                    // Find framework matching this record, or first item framework
                    const fw = frameworks.find((f) => f.code === r.frameworkCode) || frameworks[0];

                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                          isSel ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td className="py-4 px-3 text-center align-top pt-4 border-r border-[#EEECE7]">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => {
                              setSelectedIds((prev) =>
                                prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                              );
                            }}
                            className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307] cursor-pointer"
                          />
                        </td>

                        {/* 1. Results Column */}
                        <td className="py-4 px-4 border-r border-[#EEECE7] align-top space-y-2">
                          <div>
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-gray-400 font-mono text-xs mt-0.5">{itemIndex}.</span>
                              <div className="flex-1 min-w-0">
                                <Link
                                  prefetch
                                  href={`/admin/catalog/${getRecordSlug(r)}`}
                                  className="font-bold text-gray-900 hover:text-[#A52307] text-sm leading-snug transition-colors block"
                                >
                                  {r.titleLatin}
                                  {r.subtitle ? `: ${r.subtitle}` : ''}
                                </Link>
                                {r.titleArabic && (
                                  <span className="font-amiri text-base text-gray-700 block mt-0.5" dir="rtl">
                                    {r.titleArabic}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dynamic / Configured Fields checked as showInTable */}
                          {(() => {
                            const renderedKeys = new Set<string>();

                            // 1. Fields defined in framework
                            const fwFieldsToRender = (fw?.fields || [])
                              .filter((field) => field.showInTable !== false)
                              .map((field) => {
                                let rawVal = customData[field.name];
                                if (rawVal === undefined || rawVal === null || rawVal === '') {
                                  rawVal = (r as any)[field.name];
                                }
                                if (rawVal === undefined || rawVal === null || rawVal === '') {
                                  if (field.name === 'author' || field.name === 'authors') rawVal = r.authors;
                                  else if (field.name === 'shelfmark' || field.name === 'callNumber') {
                                    rawVal = !r.shelfmark?.startsWith('REC-') ? r.shelfmark : undefined;
                                  } else if (field.name === 'summary' || field.name === 'notes' || field.name === 'description') {
                                    rawVal = r.notes || r.summary;
                                  } else if (field.name === 'publisher') {
                                    rawVal = r.publisher;
                                  } else if (field.name === 'publicationYear' || field.name === 'year') {
                                    rawVal = r.publicationYear;
                                  } else if (field.name === 'format') {
                                    rawVal = FORMAT_LABELS[r.format] || r.format;
                                  } else if (field.name === 'language') {
                                    rawVal = r.language;
                                  }
                                }

                                if (
                                  rawVal === undefined ||
                                  rawVal === null ||
                                  rawVal === '' ||
                                  (Array.isArray(rawVal) && rawVal.length === 0)
                                ) {
                                  return null;
                                }

                                // Skip title since it is already rendered in the heading
                                if (
                                  ['title', 'titleLatin', 'titleProper', 'titleArabic', 'uniformTitle'].includes(
                                    field.name
                                  )
                                ) {
                                  return null;
                                }

                                renderedKeys.add(field.name);
                                const displayVal = Array.isArray(rawVal) ? rawVal.join(', ') : String(rawVal);

                                return (
                                  <div key={field.name} className="flex items-start gap-1.5">
                                    <span className="font-semibold text-gray-700 text-[11px] min-w-[90px]">
                                      {field.label}:
                                    </span>
                                    <span className="text-gray-900 font-medium">{displayVal}</span>
                                  </div>
                                );
                              })
                              .filter(Boolean);

                            // 2. Any additional custom fields stored in record that were not in fw.fields
                            const extraCustomFields = Object.entries(customData)
                              .filter(([k, v]) => {
                                if (renderedKeys.has(k)) return false;
                                if (['title', 'titleLatin', 'titleProper', 'titleArabic', 'uniformTitle', 'name'].includes(k)) return false;
                                return v !== undefined && v !== null && v !== '' && (!Array.isArray(v) || v.length > 0);
                              })
                              .map(([k, v]) => {
                                renderedKeys.add(k);
                                const label = fw?.fields?.find((f) => f.name === k)?.label || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                                const displayVal = Array.isArray(v) ? v.join(', ') : (typeof v === 'object' ? JSON.stringify(v) : String(v));
                                return (
                                  <div key={k} className="flex items-start gap-1.5">
                                    <span className="font-semibold text-gray-700 text-[11px] min-w-[90px] capitalize">
                                      {label}:
                                    </span>
                                    <span className="text-gray-900 font-medium">{displayVal}</span>
                                  </div>
                                );
                              });

                            const hasRenderedFields = fwFieldsToRender.length > 0 || extraCustomFields.length > 0;

                            if (hasRenderedFields) {
                              return (
                                <div className="text-xs text-gray-600 leading-relaxed pt-1 space-y-1 pl-4">
                                  {fwFieldsToRender}
                                  {extraCustomFields}
                                </div>
                              );
                            }

                            // 3. Fallback when no framework/custom fields are populated
                            return (
                              <div className="text-xs text-gray-600 leading-relaxed pt-1 space-y-0.5 pl-4">
                                {r.authors &&
                                  r.authors.length > 0 &&
                                  r.authors.some((a) => a && a !== 'Unknown') && (
                                    <div className="flex items-start gap-1.5">
                                      <span className="font-semibold text-gray-700 text-[11px] min-w-[90px]">Author:</span>
                                      <span className="text-gray-900 font-medium">
                                        {r.authors.filter((a) => a && a !== 'Unknown').join(', ')}
                                      </span>
                                    </div>
                                  )}
                                {r.publisher && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="font-semibold text-gray-700 text-[11px] min-w-[90px]">Publisher:</span>
                                    <span className="text-gray-900 font-medium">{r.publisher}</span>
                                  </div>
                                )}
                                {r.format && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="font-semibold text-gray-700 text-[11px] min-w-[90px]">Format:</span>
                                    <span className="text-gray-900">{FORMAT_LABELS[r.format] || r.format}</span>
                                  </div>
                                )}
                                {r.language && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="font-semibold text-gray-700 text-[11px] min-w-[90px]">Language:</span>
                                    <span className="text-gray-900">{r.language}</span>
                                  </div>
                                )}
                                {r.isbn && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="font-semibold text-gray-700 text-[11px] min-w-[90px]">ISBN:</span>
                                    <span className="font-mono text-gray-900">{r.isbn}</span>
                                  </div>
                                )}
                                {r.shelfmark && !r.shelfmark.startsWith('REC-') && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="font-semibold text-gray-700 text-[11px] min-w-[90px]">Shelfmark:</span>
                                    <span className="font-mono text-gray-900">{r.shelfmark}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* 2. Items & Availability Column */}
                        <td className="py-4 px-4 border-r border-[#EEECE7] align-top space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs">
                              {totalCopies} {totalCopies === 1 ? 'item' : 'items'}, {availCopies} available
                            </span>
                            {availCopies > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Available
                              </span>
                            ) : totalCopies > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                On Loan / Reserved
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                No Copies
                              </span>
                            )}
                          </div>

                          {totalCopies > 0 && r.shelfmark && !r.shelfmark.startsWith('REC-') ? (
                            <div className="text-xs text-gray-700 pt-0.5">
                              <div className="font-mono font-bold text-gray-900 bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E2E0DB] inline-flex items-center gap-1.5">
                                <span>{r.shelfmark}</span>
                                {r.format && (
                                  <span className="text-gray-500 font-sans font-normal text-[11px]">
                                    · ({totalCopies}) {FORMAT_LABELS[r.format] || r.format}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : totalCopies > 0 ? (
                            <div className="text-xs text-gray-600">
                              {r.language && <span className="italic mr-2">{r.language}</span>}
                              <span>Available in collection</span>
                            </div>
                          ) : (
                            <div className="text-gray-400 italic text-xs py-1">
                              No physical copies attached.
                            </div>
                          )}
                        </td>

                        {/* 3. Actions Column */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                            <Link
                              prefetch
                              href={`/admin/catalog/${getRecordSlug(r)}`}
                              className="inline-flex items-center justify-center gap-1 w-full sm:w-auto px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-xs"
                              title="View details & items"
                            >
                              <Eye className="w-3.5 h-3.5 text-gray-500" />
                              <span>View</span>
                            </Link>

                            <Link
                              prefetch
                              href={`/admin/catalog/${r.id}/edit`}
                              className="inline-flex items-center justify-center gap-1 w-full sm:w-auto px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white hover:bg-[#FAF8F5] text-gray-700 hover:text-[#A52307] transition-colors shadow-xs"
                              title="Edit record"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                              <span>Edit</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(r.id, r.titleLatin)}
                              className="inline-flex items-center justify-center gap-1 w-full sm:w-auto px-2.5 py-1 text-xs font-semibold rounded-md border border-red-200 bg-white hover:bg-red-50 text-red-700 transition-colors shadow-xs cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Bar (Bottom) */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 my-2 overflow-x-auto pt-1">
            {page > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  « First
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  ‹ Prev
                </button>
              </>
            )}

            {pageNumbers.map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => setPage(pNum)}
                className={`min-w-[32px] px-2.5 py-1.5 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                  pNum === page
                    ? 'bg-[#A52307] text-white font-bold shadow-sm'
                    : 'border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                {pNum}
              </button>
            ))}

            {page < totalPages && (
              <>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Next ›
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Last »
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
