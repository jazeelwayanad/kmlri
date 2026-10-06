'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Edit2,
  Trash2,
  AlertTriangle,
  Sparkles,
  Send,
  History,
  ArrowLeft,
  MoreHorizontal,
  BookOpen,
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { confirmDialog } from '@/lib/dialog';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import AddRecordDropdown from '@/components/forms/AddRecordDropdown';
import DynamicFormRenderer, { FormFrameworkSchema } from '@/components/forms/DynamicFormRenderer';

const PERIODICITY_CODES = [
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'BIMONTHLY',
  'QUARTERLY',
  'SEMIANNUAL',
  'ANNUAL',
  'IRREGULAR',
];

interface Vendor {
  id: string;
  name: string;
}

interface SerialClaim {
  id: string;
  issueId: string;
  claimedAt: string;
  claimedByStaffId?: string | null;
  status: 'SENT' | 'RESPONDED' | 'RESOLVED';
  notes?: string | null;
  resolvedAt?: string | null;
}

interface SerialIssue {
  id: string;
  serialId: string;
  issueLabel: string;
  volume?: string | null;
  number?: string | null;
  publicationDate?: string | null;
  expectedDate?: string | null;
  receivedDate?: string | null;
  status: 'EXPECTED' | 'RECEIVED' | 'LATE' | 'MISSING' | 'CLAIMED' | 'SUPPLEMENT' | 'INDEX';
  isSupplement: boolean;
  isIndex: boolean;
  bindingNote?: string | null;
  createdAt: string;
  claims?: SerialClaim[];
}

interface Serial {
  id: string;
  title: string;
  shelfmark?: string | null;
  frequency?: string | null;
  periodicityCode?: string | null;
  numberingPattern?: string | null;
  publisher?: string | null;
  notes?: string | null;
  vendorId?: string | null;
  vendor?: Vendor | null;
  libraryId?: string | null;
  locationCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  cost?: number | null;
  currency?: string | null;
  renewalNote?: string | null;
  createdAt: string;
  updatedAt: string;
  issues: SerialIssue[];
}

interface ClaimCandidate extends SerialIssue {
  serial: Serial;
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'RECEIVED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'MISSING':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'LATE':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'CLAIMED':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'SUPPLEMENT':
    case 'INDEX':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

type Tab = 'list' | 'detail' | 'claims';
const PAGE_SIZE = 10;

export default function CatalogueSerialsPage() {
  const [tab, setTab] = useState<Tab>('list');
  const [serials, setSerials] = useState<Serial[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [selectedSerialId, setSelectedSerialId] = useState<string | null>(null);
  const [selectedSerial, setSelectedSerial] = useState<Serial | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSerialId, setEditingSerialId] = useState<string | null>(null);
  const [activeFrameworkForAdd, setActiveFrameworkForAdd] = useState<FormFrameworkSchema | null>(null);

  const [form, setForm] = useState({
    title: '',
    shelfmark: '',
    frequency: '',
    periodicityCode: 'MONTHLY',
    publisher: '',
    vendorId: '',
    locationCode: '',
    startDate: '',
    cost: '',
    currency: 'INR',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ issueLabel: '', volume: '', number: '', expectedDate: '', isSupplement: false, isIndex: false });
  const [issueSubmitting, setIssueSubmitting] = useState(false);

  const [predictCount, setPredictCount] = useState(1);
  const [predicting, setPredicting] = useState(false);

  const [claimCandidates, setClaimCandidates] = useState<ClaimCandidate[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [daysOverdue, setDaysOverdue] = useState(7);
  const [claimHistoryIssueId, setClaimHistoryIssueId] = useState<string | null>(null);
  const [claimHistory, setClaimHistory] = useState<SerialClaim[]>([]);

  const handleDynamicFormSubmit = async (values: any) => {
    try {
      const payload = {
        title: values.title || values.name || 'Untitled Subscription',
        shelfmark: values.shelfmark || undefined,
        frequency: values.frequency || undefined,
        periodicityCode: values.periodicityCode || 'MONTHLY',
        publisher: values.publisher || undefined,
        vendorId: values.vendorId || values.vendor || undefined,
        locationCode: values.locationCode || undefined,
        startDate: values.startDate || undefined,
        notes: values.notes || values.description || undefined,
      };
      await api.createSerial(payload);
      setActiveFrameworkForAdd(null);
      notify(`Subscription "${payload.title}" registered.`);
      loadSerials();
    } catch (err: any) {
      setError(err.message || 'Failed to save subscription');
    }
  };

  const loadSerials = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .getSerials({ q: search || undefined, status: statusFilter || undefined, vendorId: vendorFilter || undefined })
      .then((data) => {
        setSerials(data);
        setSelectedIds([]);
      })
      .catch((err: any) => setError(err.message || 'Failed to load serials'))
      .finally(() => setLoading(false));
  }, [search, statusFilter, vendorFilter]);

  useEffect(() => {
    loadSerials();
  }, [loadSerials]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, vendorFilter]);

  useEffect(() => {
    api.getVendors().then(setVendors).catch(() => setVendors([]));
  }, []);

  const loadDetail = useCallback((id: string) => {
    setDetailLoading(true);
    api
      .getSerial(id)
      .then((data) => setSelectedSerial(data))
      .catch((err: any) => setError(err.message || 'Failed to load subscription'))
      .finally(() => setDetailLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSerialId && tab === 'detail') loadDetail(selectedSerialId);
  }, [selectedSerialId, tab, loadDetail]);

  const loadClaimCandidates = useCallback(() => {
    setClaimsLoading(true);
    api
      .getSerialClaimCandidates(daysOverdue)
      .then((data) => setClaimCandidates(data))
      .catch((err: any) => setError(err.message || 'Failed to load claim candidates'))
      .finally(() => setClaimsLoading(false));
  }, [daysOverdue]);

  useEffect(() => {
    if (tab === 'claims') loadClaimCandidates();
  }, [tab, loadClaimCandidates]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const openDetail = (id: string) => {
    setSelectedSerialId(id);
    setTab('detail');
  };

  const openCreateModal = () => {
    setEditingSerialId(null);
    setForm({
      title: '',
      shelfmark: '',
      frequency: '',
      periodicityCode: 'MONTHLY',
      publisher: '',
      vendorId: '',
      locationCode: '',
      startDate: '',
      cost: '',
      currency: 'INR',
      notes: '',
    });
    setShowAddModal(true);
  };

  const openEditModal = (s: Serial) => {
    setEditingSerialId(s.id);
    setForm({
      title: s.title,
      shelfmark: s.shelfmark || '',
      frequency: s.frequency || '',
      periodicityCode: s.periodicityCode || 'MONTHLY',
      publisher: s.publisher || '',
      vendorId: s.vendorId || '',
      locationCode: s.locationCode || '',
      startDate: s.startDate ? s.startDate.split('T')[0] : '',
      cost: s.cost != null ? String(s.cost) : '',
      currency: s.currency || 'INR',
      notes: s.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSubmitSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        title: form.title,
        shelfmark: form.shelfmark || undefined,
        frequency: form.frequency || undefined,
        periodicityCode: form.periodicityCode || 'MONTHLY',
        publisher: form.publisher || undefined,
        vendorId: form.vendorId || undefined,
        locationCode: form.locationCode || undefined,
        startDate: form.startDate || undefined,
        cost: form.cost ? parseFloat(form.cost) : undefined,
        currency: form.currency || 'INR',
        notes: form.notes || undefined,
      };

      if (editingSerialId) {
        await api.updateSerial(editingSerialId, payload);
        notify(`Subscription "${form.title}" updated.`);
      } else {
        await api.createSerial(payload);
        notify(`Subscription "${form.title}" registered.`);
      }
      setShowAddModal(false);
      loadSerials();
    } catch (err: any) {
      setError(err.message || 'Failed to save subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSerial = async (id: string, title: string) => {
    const ok = await confirmDialog({
      title: 'Delete Subscription',
      message: `Delete subscription "${title}" and all its recorded issues?`,
      tone: 'danger',
    });
    if (!ok) return;
    setError(null);
    try {
      await api.deleteSerial(id);
      notify(`Subscription "${title}" deleted.`);
      if (selectedSerialId === id) {
        setSelectedSerialId(null);
        setTab('list');
      }
      loadSerials();
    } catch (err: any) {
      setError(err.message || 'Failed to delete subscription');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirmDialog({
      title: 'Bulk Delete Subscriptions',
      message: `Are you sure you want to delete ${selectedIds.length} selected subscription(s)? This cannot be undone.`,
      tone: 'danger',
    });
    if (!ok) return;
    for (const id of selectedIds) {
      try {
        await api.deleteSerial(id);
      } catch (e) {
        console.error(e);
      }
    }
    setSelectedIds([]);
    loadSerials();
  };

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSerialId) return;
    setIssueSubmitting(true);
    setError(null);
    try {
      await api.addSerialIssue(selectedSerialId, {
        issueLabel: issueForm.issueLabel,
        volume: issueForm.volume || undefined,
        number: issueForm.number || undefined,
        expectedDate: issueForm.expectedDate || undefined,
        isSupplement: issueForm.isSupplement,
        isIndex: issueForm.isIndex,
      });
      setShowIssueModal(false);
      setIssueForm({ issueLabel: '', volume: '', number: '', expectedDate: '', isSupplement: false, isIndex: false });
      loadDetail(selectedSerialId);
      loadSerials();
      notify(`Issue "${issueForm.issueLabel}" added to holdings.`);
    } catch (err: any) {
      setError(err.message || 'Failed to add issue');
    } finally {
      setIssueSubmitting(false);
    }
  };

  const handleCheckIn = async (issue: SerialIssue) => {
    if (!selectedSerialId) return;
    setError(null);
    try {
      const result = await api.checkInSerialIssue(issue.id, {});
      notify(
        result?.predictedNext
          ? `Issue "${issue.issueLabel}" checked in. Next issue "${result.predictedNext.issueLabel}" predicted.`
          : `Issue "${issue.issueLabel}" checked in.`,
      );
      loadDetail(selectedSerialId);
      loadSerials();
    } catch (err: any) {
      setError(err.message || 'Failed to check in issue');
    }
  };

  const handleSetStatus = async (issue: SerialIssue, status: 'MISSING' | 'LATE') => {
    if (!selectedSerialId) return;
    setError(null);
    try {
      await api.setSerialIssueStatus(issue.id, status);
      notify(`Issue "${issue.issueLabel}" marked ${status.toLowerCase()}.`);
      loadDetail(selectedSerialId);
      loadSerials();
    } catch (err: any) {
      setError(err.message || `Failed to mark issue ${status.toLowerCase()}`);
    }
  };

  const handlePredict = async () => {
    if (!selectedSerialId) return;
    setPredicting(true);
    setError(null);
    try {
      const created = await api.predictSerialIssues(selectedSerialId, predictCount);
      notify(`Predicted ${Array.isArray(created) ? created.length : 0} upcoming issue(s).`);
      loadDetail(selectedSerialId);
      loadSerials();
    } catch (err: any) {
      setError(err.message || 'Failed to predict issues');
    } finally {
      setPredicting(false);
    }
  };

  const handleClaim = async (issueId: string, label: string) => {
    setError(null);
    try {
      await api.createSerialClaim(issueId, undefined);
      notify(`Claim sent for issue "${label}".`);
      loadClaimCandidates();
      if (selectedSerialId) loadDetail(selectedSerialId);
    } catch (err: any) {
      setError(err.message || 'Failed to create claim');
    }
  };

  const openClaimHistory = (issueId: string) => {
    setClaimHistoryIssueId(issueId);
    api
      .getSerialIssueClaims(issueId)
      .then(setClaimHistory)
      .catch((err: any) => setError(err.message || 'Failed to load claim history'));
  };

  const handleUpdateClaim = async (claimId: string, status: 'RESPONDED' | 'RESOLVED') => {
    setError(null);
    try {
      await api.updateSerialClaim(claimId, { status });
      notify(`Claim marked ${status.toLowerCase()}.`);
      if (claimHistoryIssueId) openClaimHistory(claimHistoryIssueId);
      loadClaimCandidates();
    } catch (err: any) {
      setError(err.message || 'Failed to update claim');
    }
  };

  const filtered = serials.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.shelfmark || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.publisher || '').toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedSerials = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Serials & Continuous Resources"
        title="Serials & Subscriptions"
        actions={
          <div className="flex items-center gap-2">
            <AddRecordDropdown
              moduleType="SERIAL"
              defaultLabel="Add Subscription"
              onSelectForm={(fw) => setActiveFrameworkForAdd(fw)}
              onFallback={openCreateModal}
            />
          </div>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-2">
        {[
          { key: 'list', label: 'Subscriptions List' },
          { key: 'claims', label: 'Claims Desk' },
        ].map((t) => {
          const isSel = tab === t.key || (t.key === 'list' && tab === 'detail');
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key as Tab);
                if (t.key === 'list') setSelectedSerialId(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSel
                  ? 'bg-[#A52307] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-gray-700 hover:bg-gray-100 border border-[#E2E0DB]'
              }`}
            >
              {t.label}
            </button>
          );
        })}

        {tab === 'detail' && selectedSerial && (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTab('list');
                setSelectedSerialId(null);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#E2E0DB] bg-white rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to List</span>
            </button>
          </div>
        )}
      </div>

      {tab === 'list' && (
        <>
          {/* Filters & Search Container */}
          <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl flex flex-wrap gap-3 items-center justify-between shadow-sm">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subscriptions by title or shelfmark..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 border border-[#E2E0DB] rounded-lg text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 border border-[#E2E0DB] rounded-lg text-xs outline-none bg-white text-gray-800 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="h-9 px-3 border border-[#E2E0DB] rounded-lg text-xs outline-none bg-white text-gray-800 font-medium"
              >
                <option value="">All Vendors</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-gray-500 font-semibold">
              Total: <span className="text-gray-900 font-bold">{serials.length}</span> subscription(s)
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
                    {selectedIds.length} of {filtered.length} subscription(s) selected
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
                  <p className="mt-2 text-xs font-medium">Loading subscriptions…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-16 text-center text-gray-500 space-y-2">
                  <p className="text-sm font-bold text-gray-700">No subscriptions found</p>
                  <p className="text-xs">Adjust your search parameters or register a new continuous resource.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-700 font-bold uppercase text-[11px] tracking-wider">
                        <th className="py-3.5 px-4 w-10 text-center border-r border-[#E2E0DB]">
                          <input
                            type="checkbox"
                            checked={filtered.length > 0 && selectedIds.length === filtered.length}
                            onChange={() => {
                              if (selectedIds.length === filtered.length) {
                                setSelectedIds([]);
                              } else {
                                setSelectedIds(filtered.map((r) => r.id));
                              }
                            }}
                            className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307] cursor-pointer"
                            title="Select all"
                          />
                        </th>
                        <th className="py-3.5 px-4 font-bold border-r border-[#E2E0DB] w-[48%]">Serial &amp; Subscription</th>
                        <th className="py-3.5 px-4 font-bold border-r border-[#E2E0DB] w-[32%]">Issues &amp; Status</th>
                        <th className="py-3.5 px-4 font-bold w-[20%] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEECE7]">
                      {paginatedSerials.map((s, idx) => {
                        const itemIndex = (page - 1) * PAGE_SIZE + idx + 1;
                        const isSel = selectedIds.includes(s.id);
                        const issueCount = s.issues?.length || 0;

                        return (
                          <tr
                            key={s.id}
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
                                    prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                                  );
                                }}
                                className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307] cursor-pointer"
                              />
                            </td>

                            {/* 1. Results / Serial Info */}
                            <td className="py-4 px-4 border-r border-[#EEECE7] align-top space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-gray-400 font-mono text-xs mt-0.5">{itemIndex}.</span>
                                <div className="flex-1 min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => openDetail(s.id)}
                                    className="font-bold text-gray-900 hover:text-[#A52307] text-sm leading-snug transition-colors block text-left"
                                  >
                                    {s.title}
                                  </button>
                                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1 flex-wrap">
                                    <span className="font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                                      {s.shelfmark ? `Shelfmark: ${s.shelfmark}` : `ID: ${s.id.slice(0, 8)}`}
                                    </span>
                                    {s.publisher && <span>Pub: {s.publisher}</span>}
                                    {s.vendor?.name && <span>Vendor: {s.vendor.name}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-gray-600 pt-1">
                                <span className="font-semibold text-gray-700 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E2E0DB]">
                                  Frequency: {s.periodicityCode || s.frequency || 'Regular'}
                                </span>
                                {s.startDate && (
                                  <span className="text-gray-500">Since: {fmtDate(s.startDate)}</span>
                                )}
                              </div>
                            </td>

                            {/* 2. Issues & Status */}
                            <td className="py-4 px-4 border-r border-[#EEECE7] align-top space-y-2.5">
                              <div>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                    s.status === 'ACTIVE'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : s.status === 'EXPIRED'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-red-50 text-red-800 border-red-200'
                                  }`}
                                >
                                  {s.status}
                                </span>
                              </div>

                              <div>
                                <button
                                  type="button"
                                  onClick={() => openDetail(s.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FAF8F5] hover:bg-gray-100 text-gray-800 border border-[#E2E0DB] transition-all cursor-pointer shadow-2xs"
                                >
                                  <Layers className="w-3.5 h-3.5 text-[#A52307]" />
                                  <span>{issueCount} {issueCount === 1 ? 'Issue Recorded' : 'Issues Recorded'}</span>
                                </button>
                              </div>
                            </td>

                            {/* 3. Actions */}
                            <td className="py-4 px-4 align-top text-center">
                              <div className="flex flex-col gap-1.5 items-center justify-center max-w-[140px] mx-auto">
                                <button
                                  type="button"
                                  onClick={() => openDetail(s.id)}
                                  className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white text-gray-800 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                                  title="Manage Issues"
                                >
                                  <Layers className="w-3.5 h-3.5 text-[#A52307]" />
                                  <span>Issues</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(s)}
                                  className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                                  title="Edit Subscription"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteSerial(s.id, s.title)}
                                  className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white text-red-600 hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                                  title="Delete Subscription"
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
                  Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} subscriptions
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
        </>
      )}

      {/* Detail / Receiving Desk */}
      {tab === 'detail' && (
        <div className="space-y-4">
          {detailLoading || !selectedSerial ? (
            <div className="bg-white border border-[#E2E0DB] rounded-xl p-16 text-center text-gray-500">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-xs font-medium">Loading subscription details…</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E2E0DB] rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-[#E2E0DB] pb-4 flex-wrap gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#A52307]">Issue Check-in Desk</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-0.5">{selectedSerial.title}</h3>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Periodicity: <strong>{selectedSerial.periodicityCode || selectedSerial.frequency || '—'}</strong></span>
                    <span>Vendor: <strong>{selectedSerial.vendor?.name || '—'}</strong></span>
                    <span>Status: <strong>{selectedSerial.status}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                  {selectedSerial.periodicityCode && selectedSerial.periodicityCode !== 'IRREGULAR' && (
                    <div className="flex items-center gap-1.5 border border-[#E2E0DB] rounded-lg px-2.5 py-1 bg-[#FAF8F5]">
                      <input
                        type="number"
                        min={1}
                        max={52}
                        value={predictCount}
                        onChange={(e) => setPredictCount(Math.max(1, Math.min(52, Number(e.target.value) || 1)))}
                        className="w-12 text-xs outline-none bg-transparent font-bold"
                      />
                      <button
                        type="button"
                        onClick={handlePredict}
                        disabled={predicting}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{predicting ? 'Predicting...' : 'Predict Next'}</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowIssueModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#A52307] hover:bg-red-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Issue</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#E2E0DB]">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-700 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4">Issue</th>
                      <th className="py-3 px-4">Expected Date</th>
                      <th className="py-3 px-4">Received Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {selectedSerial.issues.map((iss) => (
                      <tr key={iss.id} className="hover:bg-[#FAF8F5]/80">
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {iss.issueLabel}
                          {iss.isSupplement && <span className="ml-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">SUPP</span>}
                          {iss.isIndex && <span className="ml-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">INDEX</span>}
                        </td>
                        <td className="py-3.5 px-4 text-gray-700">{fmtDate(iss.expectedDate)}</td>
                        <td className="py-3.5 px-4 text-gray-600">{fmtDate(iss.receivedDate)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${statusBadgeClass(iss.status)}`}>
                            {iss.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
                              <DropdownMenuLabel>Issue Actions</DropdownMenuLabel>
                              {iss.status !== 'RECEIVED' && (
                                <DropdownMenuItem onClick={() => handleCheckIn(iss)} className="cursor-pointer font-medium">
                                  <FileCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                  <span>Check-in / Receive</span>
                                </DropdownMenuItem>
                              )}
                              {iss.status !== 'MISSING' && iss.status !== 'RECEIVED' && (
                                <DropdownMenuItem onClick={() => handleSetStatus(iss, 'MISSING')} className="text-red-600 focus:text-red-600 cursor-pointer">
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  <span>Mark Missing</span>
                                </DropdownMenuItem>
                              )}
                              {iss.status === 'EXPECTED' && (
                                <DropdownMenuItem onClick={() => handleSetStatus(iss, 'LATE')} className="text-amber-600 focus:text-amber-600 cursor-pointer">
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  <span>Mark Late</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openClaimHistory(iss.id)} className="cursor-pointer">
                                <History className="mr-2 h-4 w-4 text-gray-500" />
                                <span>Claim History</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {selectedSerial.issues.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                          No issues recorded yet. Click &quot;Add Issue&quot; or &quot;Predict Next&quot; to begin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Claims Desk */}
      {tab === 'claims' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl flex items-center justify-between flex-wrap gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase text-gray-600">Overdue by more than</label>
              <input
                type="number"
                min={0}
                value={daysOverdue}
                onChange={(e) => setDaysOverdue(Math.max(0, Number(e.target.value) || 0))}
                className="w-16 h-9 px-2 border border-[#E2E0DB] rounded-lg text-xs outline-none focus:border-[#A52307] bg-white font-bold"
              />
              <span className="text-xs text-gray-600">days</span>
            </div>

            <button
              type="button"
              onClick={loadClaimCandidates}
              className="px-3 py-1.5 border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Refresh Desk
            </button>
          </div>

          {claimsLoading ? (
            <div className="bg-white border border-[#E2E0DB] rounded-xl p-16 text-center text-gray-500">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-xs font-medium">Loading claim candidates…</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E2E0DB] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-700 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Subscription</th>
                    <th className="py-3 px-4">Issue</th>
                    <th className="py-3 px-4">Expected</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {claimCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF8F5]/80">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        <button type="button" onClick={() => openDetail(c.serial.id)} className="hover:text-[#A52307] hover:underline cursor-pointer">
                          {c.serial.title}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-semibold">{c.issueLabel}</td>
                      <td className="py-3.5 px-4 text-gray-600">{fmtDate(c.expectedDate)}</td>
                      <td className="py-3.5 px-4 text-gray-600">{c.serial.vendor?.name || '—'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
                            <DropdownMenuLabel>Claim Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleClaim(c.id, c.issueLabel)} className="cursor-pointer font-medium">
                              <Send className="mr-2 h-4 w-4 text-orange-600" />
                              <span>Dispatch Claim Notice</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openClaimHistory(c.id)} className="cursor-pointer">
                              <History className="mr-2 h-4 w-4 text-gray-500" />
                              <span>View Claim History</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {claimCandidates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 px-4 text-center text-gray-500">
                        No overdue issues found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full border border-[#E2E0DB] shadow-2xl p-6 font-sans text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#E2E0DB] pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingSerialId ? 'Edit Subscription' : 'New Subscription'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSerial} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Title*</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Shelfmark</label>
                  <input
                    type="text"
                    placeholder="e.g. PER/AL-BAYAN/14"
                    value={form.shelfmark}
                    onChange={(e) => setForm({ ...form, shelfmark: e.target.value })}
                    className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] font-mono text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Periodicity</label>
                  <select
                    value={form.periodicityCode}
                    onChange={(e) => setForm({ ...form, periodicityCode: e.target.value })}
                    className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                  >
                    {PERIODICITY_CODES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Publisher</label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Vendor</label>
                  <select
                    value={form.vendorId}
                    onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                    className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                  >
                    <option value="">— None —</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Location Code</label>
                  <input
                    type="text"
                    value={form.locationCode}
                    onChange={(e) => setForm({ ...form, locationCode: e.target.value })}
                    className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Cost ({form.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E0DB] rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E2E0DB] rounded-lg font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A52307] text-white rounded-lg font-bold hover:bg-red-800 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting ? 'Saving...' : editingSerialId ? 'Save Changes' : 'Register Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full border border-[#E2E0DB] shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-[#E2E0DB] pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Add New Issue</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIssue} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Issue Label*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vol. 14, Issue 9"
                  value={issueForm.issueLabel}
                  onChange={(e) => setIssueForm({ ...issueForm, issueLabel: e.target.value })}
                  className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Volume</label>
                  <input
                    type="text"
                    value={issueForm.volume}
                    onChange={(e) => setIssueForm({ ...issueForm, volume: e.target.value })}
                    className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Number</label>
                  <input
                    type="text"
                    value={issueForm.number}
                    onChange={(e) => setIssueForm({ ...issueForm, number: e.target.value })}
                    className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Expected Date</label>
                <input
                  type="date"
                  value={issueForm.expectedDate}
                  onChange={(e) => setIssueForm({ ...issueForm, expectedDate: e.target.value })}
                  className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={issueForm.isSupplement}
                    onChange={(e) => setIssueForm({ ...issueForm, isSupplement: e.target.checked })}
                    className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                  />
                  <span>Supplement</span>
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={issueForm.isIndex}
                    onChange={(e) => setIssueForm({ ...issueForm, isIndex: e.target.checked })}
                    className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                  />
                  <span>Index</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-[#E2E0DB] rounded-lg font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issueSubmitting}
                  className="px-5 py-2 bg-[#A52307] text-white rounded-lg font-bold hover:bg-red-800 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {issueSubmitting ? 'Saving...' : 'Add Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim History Modal */}
      {claimHistoryIssueId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#E2E0DB] shadow-2xl p-6 font-sans text-xs max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#E2E0DB] pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Claim History</h3>
              <button onClick={() => setClaimHistoryIssueId(null)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {claimHistory.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No claims filed for this issue.</p>
            ) : (
              <div className="space-y-3">
                {claimHistory.map((c) => (
                  <div key={c.id} className="border border-[#E2E0DB] rounded-lg p-3 bg-[#FAF8F5]">
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass(c.status)}`}>{c.status}</span>
                      <span className="text-gray-500">{fmtDate(c.claimedAt)}</span>
                    </div>
                    {c.notes && <p className="mt-1.5 text-gray-700">{c.notes}</p>}
                    {c.resolvedAt && <p className="mt-1 text-gray-500">Resolved: {fmtDate(c.resolvedAt)}</p>}
                    {c.status !== 'RESOLVED' && (
                      <div className="flex gap-2 mt-2">
                        {c.status === 'SENT' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateClaim(c.id, 'RESPONDED')}
                            className="px-2.5 py-1 border border-blue-300 bg-white text-blue-700 rounded text-[11px] font-semibold hover:bg-blue-50 cursor-pointer"
                          >
                            Mark Responded
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleUpdateClaim(c.id, 'RESOLVED')}
                          className="px-2.5 py-1 border border-emerald-300 bg-white text-emerald-700 rounded text-[11px] font-semibold hover:bg-emerald-50 cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Form Framework Modal */}
      {activeFrameworkForAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-[#E2E0DB] shadow-2xl p-6 font-sans text-xs max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">{activeFrameworkForAdd.name}</h3>
              <button onClick={() => setActiveFrameworkForAdd(null)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto pr-1">
              <DynamicFormRenderer
                framework={activeFrameworkForAdd}
                onSubmit={handleDynamicFormSubmit}
                onCancel={() => setActiveFrameworkForAdd(null)}
                submitLabel="Save Subscription"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
