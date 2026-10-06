'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  Building,
  UserCheck,
  Link2,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  X,
  FileText,
  Unlink,
  Bookmark,
  Eye,
} from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';
import DynamicFormRenderer, { FormFrameworkSchema } from '@/components/forms/DynamicFormRenderer';
import AddRecordDropdown from '@/components/forms/AddRecordDropdown';
import { confirmDialog } from '@/lib/dialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthorityRecord {
  id: string;
  headingType: string; // PERSONAL_NAME, CORPORATE_NAME, PUBLISHER, SUBJECT, SERIES, UNIFORM_TITLE
  heading: string;
  seeAlso: string;
  notes?: string | null;
  marcXml?: string | null;
  customFields?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    headings: number;
  };
}

const PAGE_SIZE = 10;

export default function AuthoritiesAdminPage() {
  const [activeTab, setActiveTab] = useState<'authors' | 'publications' | 'all'>('authors');
  const [authorities, setAuthorities] = useState<AuthorityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Frameworks for Dynamic Creation
  const [authorFramework, setAuthorFramework] = useState<FormFrameworkSchema | null>(null);
  const [publicationFramework, setPublicationFramework] = useState<FormFrameworkSchema | null>(null);
  const [customSelectedFramework, setCustomSelectedFramework] = useState<FormFrameworkSchema | null>(null);

  // Create Modal State
  const [createModalType, setCreateModalType] = useState<'AUTHOR' | 'PUBLICATION' | 'DYNAMIC' | null>(null);
  const [editingRecord, setEditingRecord] = useState<AuthorityRecord | null>(null);

  // Association / Link Modal State
  const [linkModalRecord, setLinkModalRecord] = useState<AuthorityRecord | null>(null);
  const [bibRecords, setBibRecords] = useState<any[]>([]);
  const [selectedBibId, setSelectedBibId] = useState('');
  const [linkTag, setLinkTag] = useState('100');
  const [linking, setLinking] = useState(false);

  // Usage Drawer State
  const [usageRecord, setUsageRecord] = useState<AuthorityRecord | null>(null);
  const [usageList, setUsageList] = useState<any[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);

  const fetchAuthorities = useCallback(async () => {
    setLoading(true);
    try {
      let headingTypeParam: string | undefined = undefined;
      if (activeTab === 'authors') headingTypeParam = 'AUTHORS';
      else if (activeTab === 'publications') headingTypeParam = 'PUBLICATIONS';

      const data = await api.searchAuthorities(searchQuery || undefined, headingTypeParam);
      setAuthorities(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to load authority records.' });
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchAuthorities();
  }, [fetchAuthorities]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  // Load Frameworks
  useEffect(() => {
    (async () => {
      try {
        const [authFw, pubFw] = await Promise.allSettled([
          api.getDefaultFormFramework('AUTHORITY'),
          api.getFormFramework('PUBLICATION_DEFAULT'),
        ]);
        if (authFw.status === 'fulfilled') setAuthorFramework(authFw.value);
        if (pubFw.status === 'fulfilled') setPublicationFramework(pubFw.value);
      } catch {}
    })();
  }, []);

  const parseSeeAlso = (val?: string | null): string[] => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const parseCustomFields = (val?: string | null): Record<string, any> => {
    if (!val) return {};
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  };

  const handleCreateOrUpdateAuthority = async (values: Record<string, any>) => {
    try {
      const isPub = createModalType === 'PUBLICATION';
      const headingType = values.headingType || (isPub ? 'PUBLISHER' : 'PERSONAL_NAME');
      const heading = values.heading || values.title || values.name;

      if (!heading) {
        alert('Heading name is required.');
        return;
      }

      const seeAlso = Array.isArray(values.seeAlso)
        ? values.seeAlso.filter(Boolean)
        : values.seeAlso
        ? [values.seeAlso]
        : [];

      const payload = {
        headingType,
        heading,
        seeAlso,
        notes: values.notes || values.description,
        customFields: JSON.stringify(values),
      };

      if (editingRecord) {
        await api.updateAuthority(editingRecord.id, payload);
        setNotification({ type: 'success', text: `Authority record "${heading}" updated.` });
      } else {
        const res = await api.createAuthority(payload);
        if (res.duplicate) {
          alert(`Duplicate warning: An authority heading with "${heading}" already exists.`);
          return;
        }
        setNotification({ type: 'success', text: `Created new authority record "${heading}".` });
      }

      setCreateModalType(null);
      setEditingRecord(null);
      await fetchAuthorities();
    } catch (err: any) {
      alert(err.message || 'Failed to save authority record.');
    }
  };

  const handleDeleteAuthority = async (rec: AuthorityRecord) => {
    const ok = await confirmDialog({
      title: 'Delete Authority Record',
      message: `Are you sure you want to permanently delete authority record "${rec.heading}"?`,
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.deleteAuthority(rec.id);
      setNotification({ type: 'success', text: `Authority record "${rec.heading}" deleted.` });
      await fetchAuthorities();
    } catch (err: any) {
      alert(err.message || 'Could not delete authority record.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirmDialog({
      title: 'Bulk Delete Authority Records',
      message: `Are you sure you want to delete ${selectedIds.length} selected authority record(s)? This cannot be undone.`,
      tone: 'danger',
    });
    if (!ok) return;
    for (const id of selectedIds) {
      try {
        await api.deleteAuthority(id);
      } catch (e) {
        console.error(e);
      }
    }
    setSelectedIds([]);
    await fetchAuthorities();
  };

  const handleOpenLinkModal = async (rec: AuthorityRecord) => {
    setLinkModalRecord(rec);
    setSelectedBibId('');
    setLinkTag(rec.headingType === 'PUBLISHER' ? '260' : '100');
    try {
      const res = await api.searchCatalog({ limit: 100 });
      setBibRecords(Array.isArray(res) ? res : res?.records || []);
    } catch {
      setBibRecords([]);
    }
  };

  const handleSaveAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkModalRecord || !selectedBibId) return;
    setLinking(true);
    try {
      await api.linkAuthorityHeading({
        bibRecordId: selectedBibId,
        authorityId: linkModalRecord.id,
        tag: linkTag,
        subfield: 'a',
      });
      setNotification({
        type: 'success',
        text: `Associated authority "${linkModalRecord.heading}" with selected catalogue record.`,
      });
      setLinkModalRecord(null);
      await fetchAuthorities();
    } catch (err: any) {
      alert(err.message || 'Failed to associate authority.');
    } finally {
      setLinking(false);
    }
  };

  const handleViewUsage = async (rec: AuthorityRecord) => {
    setUsageRecord(rec);
    setLoadingUsage(true);
    try {
      const usage = await api.getAuthorityUsage(rec.id);
      setUsageList(Array.isArray(usage) ? usage : []);
    } catch (err: any) {
      setUsageList([]);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleUnlink = async (linkId: string) => {
    const ok = await confirmDialog({
      title: 'Unlink Heading',
      message: 'Unlink this authority heading from the catalogue record?',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.unlinkAuthorityHeading(linkId);
      if (usageRecord) {
        await handleViewUsage(usageRecord);
      }
      await fetchAuthorities();
    } catch (err: any) {
      alert(err.message || 'Could not unlink heading.');
    }
  };

  // Pagination calculations
  const totalCount = authorities.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedAuthorities = authorities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Authority Control"
        title="Authorities Management"
        actions={
          <div className="flex items-center gap-2">
            <AddRecordDropdown
              moduleType="AUTHORITY"
              defaultLabel="Add Authority"
              onSelectForm={(fw) => {
                setEditingRecord(null);
                setCustomSelectedFramework(fw);
                setCreateModalType('DYNAMIC');
              }}
            />
          </div>
        }
      />

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 border ${
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
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Subnav Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'authors', label: 'Authors & Creators', icon: UserCheck },
            { key: 'publications', label: 'Publications & Presses', icon: Building },
            { key: 'all', label: 'All Authorities', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSel
                    ? 'bg-[#A52307] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-gray-700 hover:bg-gray-100 border border-[#E2E0DB]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'authors' ? 'authors' : activeTab === 'publications' ? 'publishers' : 'authorities'}…`}
            className="w-full border border-[#E2E0DB] rounded-lg h-9 pl-9 pr-3 text-xs font-sans text-gray-900 focus:border-[#A52307] outline-none bg-white"
          />
        </div>
      </div>

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
                {selectedIds.length} of {authorities.length} authority record(s) selected
              </span>
              <button
                type="button"
                onClick={handleBulkDelete}
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
              <p className="mt-2 text-xs font-medium">Loading authority records…</p>
            </div>
          ) : authorities.length === 0 ? (
            <div className="p-16 text-center text-gray-500 space-y-2">
              <p className="text-sm font-bold text-gray-700">No authority records found</p>
              <p className="text-xs">Use configured Authority Frameworks to create controlled authority headings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-700 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4 w-10 text-center border-r border-[#E2E0DB]">
                      <input
                        type="checkbox"
                        checked={authorities.length > 0 && selectedIds.length === authorities.length}
                        onChange={() => {
                          if (selectedIds.length === authorities.length) {
                            setSelectedIds([]);
                          } else {
                            setSelectedIds(authorities.map((r) => r.id));
                          }
                        }}
                        className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307] cursor-pointer"
                        title="Select all"
                      />
                    </th>
                    <th className="py-3.5 px-4 font-bold border-r border-[#E2E0DB] w-[48%]">Authority Record &amp; Details</th>
                    <th className="py-3.5 px-4 font-bold border-r border-[#E2E0DB] w-[32%]">Linked Records &amp; Type</th>
                    <th className="py-3.5 px-4 font-bold w-[20%] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {paginatedAuthorities.map((rec, idx) => {
                    const itemIndex = (page - 1) * PAGE_SIZE + idx + 1;
                    const isSel = selectedIds.includes(rec.id);
                    const variants = parseSeeAlso(rec.seeAlso);
                    const isAuthor = rec.headingType === 'PERSONAL_NAME' || rec.headingType === 'CORPORATE_NAME';
                    const isPub = rec.headingType === 'PUBLISHER' || rec.headingType === 'SERIES';
                    const linkedCount = rec._count?.headings ?? 0;
                    const customFields = parseCustomFields(rec.customFields);

                    return (
                      <tr
                        key={rec.id}
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
                                prev.includes(rec.id) ? prev.filter((id) => id !== rec.id) : [...prev, rec.id]
                              );
                            }}
                            className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307] cursor-pointer"
                          />
                        </td>

                        {/* 1. Results / Primary info */}
                        <td className="py-4 px-4 border-r border-[#EEECE7] align-top space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-gray-400 font-mono text-xs mt-0.5">{itemIndex}.</span>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-gray-900 text-sm leading-snug block">
                                {rec.heading}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                                <span className="font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                  ID: {rec.id.slice(0, 8)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Variants / See-also */}
                          {variants.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">See also:</span>
                              {variants.map((v, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 border border-gray-200"
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Notes */}
                          {rec.notes && (
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-[#FAF8F5] p-2 rounded border border-[#E2E0DB]/60">
                              {rec.notes}
                            </p>
                          )}

                          {/* Dynamic Custom Fields */}
                          {Object.keys(customFields).length > 0 && (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[11px] text-gray-600">
                              {Object.entries(customFields).slice(0, 4).map(([k, v]) => {
                                if (typeof v === 'object' || !v || k === 'heading' || k === 'notes' || k === 'seeAlso') return null;
                                return (
                                  <div key={k} className="truncate">
                                    <span className="text-gray-400 font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                                    <span className="font-semibold text-gray-800">{String(v)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* 2. Linked Records & Status */}
                        <td className="py-4 px-4 border-r border-[#EEECE7] align-top space-y-2.5">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                isAuthor
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : isPub
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'bg-purple-100 text-purple-900 border border-purple-200'
                              }`}
                            >
                              {isAuthor ? <UserCheck className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                              <span>{rec.headingType.replace('_', ' ')}</span>
                            </span>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => handleViewUsage(rec)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                linkedCount > 0
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{linkedCount} {linkedCount === 1 ? 'Catalogue Record' : 'Catalogue Records'}</span>
                            </button>
                          </div>
                        </td>

                        {/* 3. Actions Column */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="flex flex-col gap-1.5 items-center justify-center max-w-[140px] mx-auto">
                            <button
                              type="button"
                              onClick={() => handleOpenLinkModal(rec)}
                              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white text-blue-700 hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
                              title="Associate to Catalogue Record"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span>Link Record</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecord(rec);
                                setCreateModalType(isPub ? 'PUBLICATION' : 'AUTHOR');
                              }}
                              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                              title="Edit Authority"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAuthority(rec)}
                              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white text-red-600 hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                              title="Delete Authority"
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
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} authorities
            </span>
            <div className="flex items-center gap-1.5">
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
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL (DYNAMIC FRAMEWORK POWERED) */}
      {createModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E0DB]">
              <div className="flex items-center gap-2">
                {createModalType === 'AUTHOR' ? (
                  <UserCheck className="w-5 h-5 text-[#A52307]" />
                ) : createModalType === 'PUBLICATION' ? (
                  <Building className="w-5 h-5 text-blue-600" />
                ) : (
                  <Sparkles className="w-5 h-5 text-[#A52307]" />
                )}
                <h3 className="text-base font-bold text-gray-900">
                  {editingRecord
                    ? `Edit Authority Record`
                    : createModalType === 'DYNAMIC' && customSelectedFramework
                    ? customSelectedFramework.name
                    : `Add New ${createModalType === 'AUTHOR' ? 'Author' : 'Publication'} Authority`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreateModalType(null);
                  setEditingRecord(null);
                  setCustomSelectedFramework(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* If we have a configured dynamic framework, render it */}
              {(createModalType === 'DYNAMIC'
                ? customSelectedFramework
                : createModalType === 'AUTHOR'
                ? authorFramework
                : publicationFramework) ? (
                <DynamicFormRenderer
                  framework={
                    (createModalType === 'DYNAMIC'
                      ? customSelectedFramework
                      : createModalType === 'AUTHOR'
                      ? authorFramework
                      : publicationFramework)!
                  }
                  initialValues={
                    editingRecord
                      ? {
                          heading: editingRecord.heading,
                          headingType: editingRecord.headingType,
                          seeAlso: parseSeeAlso(editingRecord.seeAlso),
                          notes: editingRecord.notes,
                          ...parseCustomFields(editingRecord.customFields),
                        }
                      : {}
                  }
                  onSubmit={handleCreateOrUpdateAuthority}
                  onCancel={() => {
                    setCreateModalType(null);
                    setEditingRecord(null);
                    setCustomSelectedFramework(null);
                  }}
                  submitLabel={editingRecord ? 'Update Authority' : 'Save Authority'}
                />
              ) : (
                <div className="p-4 text-center text-xs text-gray-500">Loading form framework…</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASSOCIATE / LINK TO RECORD MODAL */}
      {linkModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-300 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E0DB]">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#A52307]" />
                <h3 className="text-base font-bold text-gray-900">Associate Authority to Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalRecord(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssociation} className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-[11px] text-amber-800 uppercase font-bold block mb-0.5">
                  Selected Authority
                </span>
                <span className="text-sm font-bold text-gray-900">{linkModalRecord.heading}</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Classification: {linkModalRecord.headingType.replace('_', ' ')}
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Target Catalogue Record <span className="text-[#A52307]">*</span>
                </label>
                <select
                  required
                  value={selectedBibId}
                  onChange={(e) => setSelectedBibId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg h-10 px-3 text-xs bg-white text-gray-900 font-medium focus:border-[#A52307] outline-none"
                >
                  <option value="">— Select Catalogue Record —</option>
                  {bibRecords.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.titleLatin || b.titleArabic || b.titleProper || 'Untitled'} {b.shelfmark ? `[${b.shelfmark}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">MARC Heading Tag</label>
                <select
                  value={linkTag}
                  onChange={(e) => setLinkTag(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg h-9 px-3 text-xs bg-white text-gray-900 font-medium"
                >
                  <option value="100">100 - Main Entry Personal Name (Primary Author)</option>
                  <option value="700">700 - Added Entry Personal Name (Co-Author / Scribe)</option>
                  <option value="260">260 - Publication / Publisher</option>
                  <option value="600">600 - Subject Added Entry Personal Name</option>
                  <option value="650">650 - Subject Topical Term</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setLinkModalRecord(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linking || !selectedBibId}
                  className="px-6 py-2 bg-[#A52307] text-white rounded-lg text-xs font-bold hover:bg-red-800 transition-colors shadow disabled:opacity-50 cursor-pointer"
                >
                  {linking ? 'Linking…' : 'Associate Heading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USAGE / LINKED RECORDS DRAWER */}
      {usageRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-300 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E0DB]">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Associated Catalogue Records ({usageList.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Authority: <strong>{usageRecord.heading}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUsageRecord(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 text-xs font-sans">
              {loadingUsage ? (
                <div className="p-8 text-center text-gray-500">Loading linked records…</div>
              ) : usageList.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No catalogue records are currently associated with this authority heading.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {usageList.map((link) => {
                    const bib = link.bibRecord;
                    return (
                      <div key={link.id} className="py-3 flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {bib?.titleLatin || bib?.titleArabic || bib?.titleProper || 'Untitled Record'}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                              Tag {link.tag}${link.subfield || 'a'}
                            </span>
                            {bib?.shelfmark && <span>Shelfmark: {bib.shelfmark}</span>}
                            {bib?.format && <span>Format: {bib.format}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUnlink(link.id)}
                          className="px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Unlink className="w-3 h-3" />
                          <span>Unlink</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
