'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Loan {
  id: string;
  dueDate: string;
  renewalCount: number;
  user: { fullName: string; membershipNumber: string };
  copy: { barcode: string; bibRecord: { titleLatin: string } };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const MAX_RENEWALS = 3;

export default function CirculationRenewalsPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .getActiveLoans()
      .then((data) => setLoans(data || []))
      .catch(() => setLoans([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRenew = async (id: string, title: string) => {
    setRenewingId(id);
    try {
      const res = await api.renewLoan(id);
      setNotification({ type: 'success', text: res.message || `Loan for "${title}" extended.` });
      load();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || `Could not renew loan for "${title}".` });
    } finally {
      setRenewingId(null);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const filtered = loans.filter(
    (l) =>
      l.copy.bibRecord.titleLatin.toLowerCase().includes(search.toLowerCase()) ||
      l.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.copy.barcode.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation · Loan Extensions"
        title="Loan Renewals Desk"
        description="Extend borrowing periods for eligible active loans (up to 3 renewals per loan, blocked while another patron holds the title)."
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

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search loans by title, barcode, or patron..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-xs">Loading active loans…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">No active loans found.</div>
        ) : (
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Item Barcode</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Borrower Details</th>
                <th className="py-3 px-4">Current Due Date</th>
                <th className="py-3 px-4">Renewals Used</th>
                <th className="py-3 px-4 text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{l.copy.barcode}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{l.copy.bibRecord.titleLatin}</td>
                  <td className="py-3.5 px-4 text-gray-700">
                    {l.user.fullName} <span className="font-mono text-[11px] text-gray-500">({l.user.membershipNumber})</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{formatDate(l.dueDate)}</td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {l.renewalCount} / {MAX_RENEWALS} Renewals
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      disabled={l.renewalCount >= MAX_RENEWALS || renewingId === l.id}
                      onClick={() => handleRenew(l.id, l.copy.bibRecord.titleLatin)}
                      className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{renewingId === l.id ? 'Renewing…' : 'Renew (+14d)'}</span>
                    </button>
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
