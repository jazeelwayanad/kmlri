'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, BellRing, Trash2 } from 'lucide-react';
import { Badge, Card, PageHeader, StatCard } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Hold {
  id: string;
  status: 'PENDING' | 'READY_FOR_PICKUP' | 'CANCELLED' | 'FULFILLED' | 'EXPIRED';
  requestedAt: string;
  availableUntil?: string;
  user: { id: string; fullName: string; membershipNumber: string; avatarUrl?: string };
  bibRecord: { id: string; titleLatin: string; shelfmark: string };
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReservationsAdminPage() {
  const [filter, setFilter] = useState<'ALL' | 'READY_FOR_PICKUP' | 'PENDING'>('ALL');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHolds = async () => {
    setLoading(true);
    try {
      const data = await api.getAllHolds();
      setHolds(data || []);
    } catch {
      setNotification('Could not load reservations from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolds();
  }, []);

  const filtered = holds.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch =
      search === '' ||
      r.bibRecord.titleLatin.toLowerCase().includes(search.toLowerCase()) ||
      r.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.user.membershipNumber.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleMarkReady = async (id: string, patron: string) => {
    try {
      await api.markHoldReady(id);
      setNotification(`Hold marked ready for pickup. Notify ${patron} to collect it within 5 days.`);
      await loadHolds();
    } catch (err: any) {
      setNotification(err.message || 'Could not update this hold.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelHold(id);
      setNotification('Hold cancelled and item returned to the shelf.');
      await loadHolds();
    } catch (err: any) {
      setNotification(err.message || 'Could not cancel this hold.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const readyCount = holds.filter((r) => r.status === 'READY_FOR_PICKUP').length;
  const pendingCount = holds.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Circulation Holds Desk"
        title="Reservations & Item Holds"
        description="Manage patron reservation queues, mark items ready for pickup, and cancel stale holds."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Active Holds" value={`${holds.length}`} hint="In system queue" />
        <StatCard label="Ready For Pickup" value={`${readyCount}`} hint="On hold shelf" hintTone="positive" />
        <StatCard label="Pending" value={`${pendingCount}`} hint="Awaiting return or preparation" hintTone="warning" />
      </div>

      {/* Filter & Search */}
      <Card className="flex flex-col sm:flex-row gap-4 justify-between items-center" padded={false}>
        <div className="flex gap-2 p-4 sm:pr-0">
          {(['ALL', 'READY_FOR_PICKUP', 'PENDING'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tab === 'ALL' ? 'All Holds' : tab === 'READY_FOR_PICKUP' ? 'Ready for Pickup' : 'Pending'}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72 p-4 sm:pl-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search hold by title, patron, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
      </Card>

      {/* Holds Queue Table */}
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading reservations…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No reservations found.</div>
        ) : (
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] tracking-wide">
                <th className="pb-3 px-3 py-2">Title &amp; Shelfmark</th>
                <th className="pb-3 px-3 py-2">Requesting Patron</th>
                <th className="pb-3 px-3 py-2">Status</th>
                <th className="pb-3 px-3 py-2">Hold Expiry</th>
                <th className="pb-3 px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-sm text-gray-900">{r.bibRecord.titleLatin}</div>
                    <div className="text-gray-400 text-[11px]">{r.bibRecord.shelfmark} · Requested: {formatDate(r.requestedAt)}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      {r.user.avatarUrl ? (
                        <img
                          src={r.user.avatarUrl}
                          alt={r.user.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-gray-300 shadow-xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {r.user.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{r.user.fullName}</div>
                        <div className="text-gray-500 text-[11px] font-mono">{r.user.membershipNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge variant={r.status === 'READY_FOR_PICKUP' ? 'success' : 'warning'}>{r.status.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-gray-700">{r.availableUntil ? formatDate(r.availableUntil) : '—'}</td>
                  <td className="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                    {r.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleMarkReady(r.id, r.user.fullName)}
                        className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[11px] font-semibold hover:bg-heritage-red hover:text-white  transition-colors inline-flex items-center gap-1"
                      >
                        <BellRing className="w-3 h-3" />
                        <span>Mark Ready</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCancel(r.id)}
                      className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg text-[11px] font-semibold hover:bg-red-50 hover:text-heritage-red hover:border-heritage-red transition-colors inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
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
