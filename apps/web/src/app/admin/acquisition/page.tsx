'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Check, X, Package } from 'lucide-react';
import { Badge, BadgeVariant, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface AcquisitionRequest {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  estimatedPrice?: number;
  reason?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'ORDERED' | 'REJECTED';
  createdAt: string;
  user?: { fullName: string; membershipNumber: string };
}

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AcquisitionAdminPage() {
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'APPROVED' | 'ORDERED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [requests, setRequests] = useState<AcquisitionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getAcquisitionRequests();
      setRequests(data || []);
    } catch {
      setNotification('Could not load acquisition requests from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filtered = requests.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch =
      search === '' ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.author || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.user?.fullName || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = async (id: string, title: string, status: string) => {
    try {
      await api.updateAcquisitionStatus(id, status);
      setNotification(`Acquisition request "${title}" updated to ${status}.`);
      await loadRequests();
    } catch (err: any) {
      setNotification(err.message || 'Could not update the request.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const statusBadgeVariant: Record<string, BadgeVariant> = {
    ORDERED: 'success',
    APPROVED: 'accent',
    SUBMITTED: 'warning',
    REJECTED: 'danger',
  };

  const submittedCount = requests.filter((r) => r.status === 'SUBMITTED').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const orderedCount = requests.filter((r) => r.status === 'ORDERED').length;
  const estimatedPending = requests
    .filter((r) => r.status === 'SUBMITTED')
    .reduce((acc, r) => acc + (r.estimatedPrice || 0), 0);

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Collection Development"
        title="Acquisition Recommendations"
        description="Review patron and staff purchase recommendations submitted through the member portal and reference desk."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Awaiting Review" value={`${submittedCount} Titles`} hint={`~₹${estimatedPending.toLocaleString()} estimated`} hintTone="warning" />
        <StatCard label="Approved" value={`${approvedCount} Titles`} hint="Ready to order" hintTone="neutral" />
        <StatCard label="Ordered" value={`${orderedCount} Titles`} hint="Awaiting delivery" hintTone="positive" />
        <StatCard label="Total Recommendations" value={`${requests.length}`} hint="All time" />
      </div>

      {/* Filters & Search */}
      <Card className="flex flex-col sm:flex-row gap-4 justify-between items-center" padded={false}>
        <div className="flex gap-2 flex-wrap p-4 sm:pr-0">
          {(['ALL', 'SUBMITTED', 'APPROVED', 'ORDERED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tab === 'ALL' ? 'All Requests' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72 p-4 sm:pl-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search request by title, author, requester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading requests…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No acquisition requests found.</div>
        ) : (
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] tracking-wide">
                <th className="pb-3 px-3 py-2">Proposed Title &amp; Author</th>
                <th className="pb-3 px-3 py-2">Requested By</th>
                <th className="pb-3 px-3 py-2">Est. Price</th>
                <th className="pb-3 px-3 py-2">Status</th>
                <th className="pb-3 px-3 py-2">Submitted</th>
                <th className="pb-3 px-3 py-2 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-sm text-gray-900">{r.title}</div>
                    {r.author && <div className="text-gray-500 text-[11px]">{r.author}</div>}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-gray-900">{r.user?.fullName || 'Staff'}</div>
                    {r.user?.membershipNumber && <div className="text-gray-500 text-[11px]">{r.user.membershipNumber}</div>}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-gray-900">
                    {r.estimatedPrice ? `₹${r.estimatedPrice.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge variant={statusBadgeVariant[r.status] || 'neutral'}>{r.status}</Badge>
                  </td>
                  <td className="py-3.5 px-3 text-gray-600">{formatDate(r.createdAt)}</td>
                  <td className="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                    {r.status === 'SUBMITTED' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(r.id, r.title, 'APPROVED')}
                          className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[11px] font-semibold hover:bg-heritage-red hover:text-white transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(r.id, r.title, 'REJECTED')}
                          className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg text-[11px] font-semibold hover:bg-red-50 hover:text-heritage-red hover:border-heritage-red transition-colors inline-flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(r.id, r.title, 'ORDERED')}
                        className="px-2.5 py-1 bg-heritage-red text-white rounded-lg text-[11px] font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-1"
                      >
                        <Package className="w-3 h-3" />
                        <span>Mark Ordered</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
