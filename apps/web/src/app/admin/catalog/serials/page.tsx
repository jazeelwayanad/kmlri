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
  Edit3,
  Trash2,
  AlertTriangle,
  Sparkles,
  Send,
  History,
  ArrowLeft,
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

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
      return 'bg-emerald-100 text-emerald-800';
    case 'MISSING':
      return 'bg-red-100 text-red-800';
    case 'LATE':
      return 'bg-amber-100 text-amber-800';
    case 'CLAIMED':
      return 'bg-orange-100 text-orange-800';
    case 'SUPPLEMENT':
    case 'INDEX':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

type Tab = 'list' | 'detail' | 'claims';

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

  const [selectedSerialId, setSelectedSerialId] = useState<string | null>(null);
  const [selectedSerial, setSelectedSerial] = useState<Serial | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSerialId, setEditingSerialId] = useState<string | null>(null);
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

  const loadSerials = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .getSerials({ q: search || undefined, status: statusFilter || undefined, vendorId: vendorFilter || undefined })
      .then((data) => setSerials(data))
      .catch((err: any) => setError(err.message || 'Failed to load serials'))
      .finally(() => setLoading(false));
  }, [search, statusFilter, vendorFilter]);

  useEffect(() => {
    loadSerials();
  }, [loadSerials]);

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

  // ---- Subscription CRUD ----

  const openCreateModal = () => {
    setEditingSerialId(null);
    setForm({ title: '', shelfmark: '', frequency: '', periodicityCode: 'MONTHLY', publisher: '', vendorId: '', locationCode: '', startDate: '', cost: '', currency: 'INR', notes: '' });
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
      startDate: s.startDate ? s.startDate.slice(0, 10) : '',
      cost: s.cost !== undefined && s.cost !== null ? String(s.cost) : '',
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
      const payload = {
        title: form.title,
        shelfmark: form.shelfmark || undefined,
        frequency: form.frequency || undefined,
        periodicityCode: form.periodicityCode || undefined,
        publisher: form.publisher || undefined,
        vendorId: form.vendorId || undefined,
        locationCode: form.locationCode || undefined,
        startDate: form.startDate || undefined,
        cost: form.cost ? Number(form.cost) : undefined,
        currency: form.currency || undefined,
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
      setEditingSerialId(null);
      loadSerials();
      if (selectedSerialId) loadDetail(selectedSerialId);
    } catch (err: any) {
      setError(err.message || 'Failed to save subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSerial = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete subscription "${title}"?`)) return;
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

  const openDetail = (id: string) => {
    setSelectedSerialId(id);
    setTab('detail');
  };

  // ---- Issues ----

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

  // ---- Claims ----

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
      (s.shelfmark || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Periodicals &amp; Subscriptions"
        title="Serials &amp; Subscriptions Management"
        description="Track continuous publications, subscription vendors, predict and receive incoming issues, and manage claims for overdue issues — Koha-style receiving workflow."
        actions={
          tab === 'list' ? (
            <Button variant="primary" icon={Plus} onClick={openCreateModal}>
              New Subscription
            </Button>
          ) : (
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => {
                setTab('list');
                setSelectedSerialId(null);
              }}
            >
              Back to Subscriptions
            </Button>
          )
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E2E0DB]">
        {(['list', 'claims'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              if (t === 'list') setSelectedSerialId(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${
              tab === t || (t === 'list' && tab === 'detail')
                ? 'border-[#A52307] text-[#A52307]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'list' ? 'Subscriptions' : 'Claims Desk'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <>
          {/* Filters */}
          <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-wrap gap-3 items-center">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search subscriptions by title or shelfmark..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="h-10 px-3 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
            >
              <option value="">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-16 text-xs text-gray-500 font-semibold">Loading subscriptions...</div>
          ) : (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                    <th className="py-3 px-4">Title &amp; Shelfmark</th>
                    <th className="py-3 px-4">Periodicity</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Holdings Desk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3.5 px-4">
                        <span className="font-amiri font-bold text-base text-gray-900 block leading-tight">{s.title}</span>
                        <span className="font-mono text-[11px] text-gray-500">
                          {s.shelfmark ? `Shelfmark: ${s.shelfmark}` : `Ref: ${s.id.slice(0, 8)}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700">{s.periodicityCode || s.frequency || '—'}</td>
                      <td className="py-3.5 px-4 text-gray-600">{s.vendor?.name || '—'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={s.status === 'ACTIVE' ? 'success' : s.status === 'EXPIRED' ? 'warning' : 'danger'}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDetail(s.id)}
                            className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Manage Issues ({s.issues.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-gray-400 hover:text-gray-900"
                            title="Edit Subscription"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSerial(s.id, s.title)}
                            className="p-1.5 text-gray-400 hover:text-[#A52307]"
                            title="Delete Subscription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-xs text-gray-500 font-semibold">No subscriptions found.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Detail / Receiving desk */}
      {tab === 'detail' && (
        <div className="space-y-4">
          {detailLoading || !selectedSerial ? (
            <div className="text-center py-16 text-xs text-gray-500 font-semibold">Loading subscription...</div>
          ) : (
            <>
              <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-[#E2E0DB] pb-3 flex-wrap gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#A52307]">Issue Check-in Desk</p>
                    <h3 className="font-amiri text-2xl font-bold text-gray-900 mt-0.5">{selectedSerial.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap gap-x-3">
                      <span>Periodicity: {selectedSerial.periodicityCode || selectedSerial.frequency || '—'}</span>
                      <span>Vendor: {selectedSerial.vendor?.name || '—'}</span>
                      <span>Status: {selectedSerial.status}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    {selectedSerial.periodicityCode && selectedSerial.periodicityCode !== 'IRREGULAR' && (
                      <div className="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1">
                        <input
                          type="number"
                          min={1}
                          max={52}
                          value={predictCount}
                          onChange={(e) => setPredictCount(Math.max(1, Math.min(52, Number(e.target.value) || 1)))}
                          className="w-12 text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={handlePredict}
                          disabled={predicting}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-semibold hover:bg-blue-700 inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {predicting ? 'Predicting...' : 'Predict Next'}
                        </button>
                      </div>
                    )}
                    <Button variant="primary" icon={Plus} onClick={() => setShowIssueModal(true)}>
                      Add Issue
                    </Button>
                  </div>
                </div>

                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-4">Issue</th>
                      <th className="py-3 px-4">Expected</th>
                      <th className="py-3 px-4">Received</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {selectedSerial.issues.map((iss) => (
                      <tr key={iss.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {iss.issueLabel}
                          {iss.isSupplement && <span className="ml-1.5 text-[9px] font-bold text-blue-700">SUPP</span>}
                          {iss.isIndex && <span className="ml-1.5 text-[9px] font-bold text-blue-700">INDEX</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{fmtDate(iss.expectedDate)}</td>
                        <td className="py-3 px-4 text-gray-600">{fmtDate(iss.receivedDate)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadgeClass(iss.status)}`}>{iss.status}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            {iss.status !== 'RECEIVED' && (
                              <button
                                type="button"
                                onClick={() => handleCheckIn(iss)}
                                className="px-2.5 py-1 border border-emerald-300 text-emerald-700 rounded text-[11px] font-semibold hover:bg-emerald-50 inline-flex items-center gap-1"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                Receive
                              </button>
                            )}
                            {iss.status !== 'MISSING' && iss.status !== 'RECEIVED' && (
                              <button
                                type="button"
                                onClick={() => handleSetStatus(iss, 'MISSING')}
                                className="px-2.5 py-1 border border-red-300 text-red-700 rounded text-[11px] font-semibold hover:bg-red-50 inline-flex items-center gap-1"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Missing
                              </button>
                            )}
                            {iss.status === 'EXPECTED' && (
                              <button
                                type="button"
                                onClick={() => handleSetStatus(iss, 'LATE')}
                                className="px-2.5 py-1 border border-amber-300 text-amber-700 rounded text-[11px] font-semibold hover:bg-amber-50 inline-flex items-center gap-1"
                              >
                                Late
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openClaimHistory(iss.id)}
                              className="px-2.5 py-1 border border-gray-300 text-gray-700 rounded text-[11px] font-semibold hover:bg-gray-50 inline-flex items-center gap-1"
                            >
                              <History className="w-3.5 h-3.5" />
                              History
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {selectedSerial.issues.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
                          No issues recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Claims Desk */}
      {tab === 'claims' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex items-center gap-3">
            <label className="text-xs font-bold uppercase text-gray-600">Overdue by more than</label>
            <input
              type="number"
              min={0}
              value={daysOverdue}
              onChange={(e) => setDaysOverdue(Math.max(0, Number(e.target.value) || 0))}
              className="w-16 h-9 px-2 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307]"
            />
            <span className="text-xs text-gray-600">days</span>
            <Button variant="outline" onClick={loadClaimCandidates}>
              Refresh
            </Button>
          </div>

          {claimsLoading ? (
            <div className="text-center py-16 text-xs text-gray-500 font-semibold">Loading claim candidates...</div>
          ) : (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                    <th className="py-3 px-4">Subscription</th>
                    <th className="py-3 px-4">Issue</th>
                    <th className="py-3 px-4">Expected</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {claimCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-bold text-gray-900">
                        <button type="button" onClick={() => openDetail(c.serial.id)} className="hover:text-[#A52307] hover:underline">
                          {c.serial.title}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{c.issueLabel}</td>
                      <td className="py-3 px-4 text-gray-600">{fmtDate(c.expectedDate)}</td>
                      <td className="py-3 px-4 text-gray-600">{c.serial.vendor?.name || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleClaim(c.id, c.issueLabel)}
                            className="px-2.5 py-1 border border-orange-300 text-orange-700 rounded text-[11px] font-semibold hover:bg-orange-50 inline-flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Claim
                          </button>
                          <button
                            type="button"
                            onClick={() => openClaimHistory(c.id)}
                            className="px-2.5 py-1 border border-gray-300 text-gray-700 rounded text-[11px] font-semibold hover:bg-gray-50 inline-flex items-center gap-1"
                          >
                            <History className="w-3.5 h-3.5" />
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {claimCandidates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingSerialId ? 'Edit Subscription' : 'New Subscription'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900">
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
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
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
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Periodicity</label>
                  <select
                    value={form.periodicityCode}
                    onChange={(e) => setForm({ ...form, periodicityCode: e.target.value })}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
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
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Vendor</label>
                  <select
                    value={form.vendorId}
                    onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
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
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Cost ({form.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Add New Issue</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-900">
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
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Volume</label>
                  <input
                    type="text"
                    value={issueForm.volume}
                    onChange={(e) => setIssueForm({ ...issueForm, volume: e.target.value })}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Number</label>
                  <input
                    type="text"
                    value={issueForm.number}
                    onChange={(e) => setIssueForm({ ...issueForm, number: e.target.value })}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Expected Date</label>
                <input
                  type="date"
                  value={issueForm.expectedDate}
                  onChange={(e) => setIssueForm({ ...issueForm, expectedDate: e.target.value })}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={issueForm.isSupplement}
                    onChange={(e) => setIssueForm({ ...issueForm, isSupplement: e.target.checked })}
                  />
                  Supplement
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={issueForm.isIndex}
                    onChange={(e) => setIssueForm({ ...issueForm, isIndex: e.target.checked })}
                  />
                  Index
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issueSubmitting}
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Claim History</h3>
              <button onClick={() => setClaimHistoryIssueId(null)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {claimHistory.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No claims filed for this issue.</p>
            ) : (
              <div className="space-y-3">
                {claimHistory.map((c) => (
                  <div key={c.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadgeClass(c.status)}`}>{c.status}</span>
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
                            className="px-2.5 py-1 border border-blue-300 text-blue-700 rounded text-[11px] font-semibold hover:bg-blue-50"
                          >
                            Mark Responded
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleUpdateClaim(c.id, 'RESOLVED')}
                          className="px-2.5 py-1 border border-emerald-300 text-emerald-700 rounded text-[11px] font-semibold hover:bg-emerald-50"
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
    </div>
  );
}
