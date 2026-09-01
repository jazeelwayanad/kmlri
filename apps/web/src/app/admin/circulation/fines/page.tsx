'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, AlertCircle, ShieldOff } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Fine {
  id: string;
  amount: number;
  reason: string;
  status: 'UNPAID' | 'PAID' | 'WAIVED';
  createdAt: string;
  paidAt?: string;
  user: { fullName: string; membershipNumber: string };
  loan?: { copy: { bibRecord: { titleLatin: string; shelfmark: string } } } | null;
}

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CirculationFinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .getAllFines()
      .then((data) => setFines(data || []))
      .catch(() => setFines([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSettle = async (fine: Fine) => {
    setActingId(fine.id);
    try {
      await api.settleFine(fine.id);
      setNotification({ type: 'success', text: `Fine of ₹${fine.amount} for ${fine.user.fullName} marked as paid.` });
      load();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not settle this fine.' });
    } finally {
      setActingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleWaive = async (fine: Fine) => {
    if (!confirm(`Waive the ₹${fine.amount} fine for ${fine.user.fullName}?`)) return;
    setActingId(fine.id);
    try {
      await api.waiveFine(fine.id);
      setNotification({ type: 'success', text: `Fine of ₹${fine.amount} for ${fine.user.fullName} waived.` });
      load();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not waive this fine.' });
    } finally {
      setActingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = fines.filter((f) => {
    const matchesSearch =
      f.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      f.user.membershipNumber.toLowerCase().includes(search.toLowerCase()) ||
      (f.loan?.copy.bibRecord.titleLatin || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = fines.filter((f) => f.status === 'UNPAID').reduce((acc, cur) => acc + cur.amount, 0);
  const totalCollected = fines.filter((f) => f.status === 'PAID').reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation · Cashier Ledger"
        title="Fines &amp; Cashier Payments"
        description="Track overdue penalties assessed automatically at return, and settle or waive them at the circulation desk."
      />

      {notification && (
        <div
          className={`p-4 border rounded-xl text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Unpaid Balance</span>
          <span className="text-2xl font-mono font-bold text-[#A52307] mt-1 block">₹{totalOutstanding}</span>
          <span className="text-[11px] text-gray-500">Across active members</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Collections Recorded</span>
          <span className="text-2xl font-mono font-bold text-emerald-700 mt-1 block">₹{totalCollected}</span>
          <span className="text-[11px] text-emerald-600">Settled via Cashier Desk</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Fine Records</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{fines.length}</span>
          <span className="text-[11px] text-gray-500">
            {fines.filter((f) => f.status === 'PAID').length} settled · {fines.filter((f) => f.status === 'WAIVED').length} waived
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search fines by patron or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
        >
          <option value="ALL">All Fine Statuses</option>
          <option value="UNPAID">Unpaid Only</option>
          <option value="PAID">Settled Only</option>
          <option value="WAIVED">Waived Only</option>
        </select>
      </div>

      {/* Fines Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-xs">Loading fines…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">No fine records found.</div>
        ) : (
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Patron Details</th>
                <th className="py-3 px-4">Item &amp; Assessment Reason</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Cashier Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block">{f.user.fullName}</span>
                    <span className="font-mono text-[11px] text-gray-500">{f.user.membershipNumber}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-gray-900 block">{f.loan?.copy.bibRecord.titleLatin || '—'}</span>
                    <span className="text-gray-500 text-[11px]">{f.reason} · {formatDate(f.createdAt)}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900 text-sm">₹{f.amount}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        f.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : f.status === 'WAIVED' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {f.status === 'UNPAID' ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={actingId === f.id}
                          onClick={() => handleSettle(f)}
                          className="px-3 py-1.5 bg-[#A52307] text-white rounded text-[11px] font-bold hover:bg-red-700 transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Settle</span>
                        </button>
                        <button
                          type="button"
                          disabled={actingId === f.id}
                          onClick={() => handleWaive(f)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-[11px] font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <ShieldOff className="w-3.5 h-3.5" />
                          <span>Waive</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 font-semibold text-[11px]">
                        {f.status === 'PAID' ? `✓ Settled ${formatDate(f.paidAt)}` : '— Waived'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
