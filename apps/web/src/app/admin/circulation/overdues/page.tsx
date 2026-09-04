'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Loan {
  id: string;
  dueDate: string;
  user: { fullName: string; membershipNumber: string; email: string; avatarUrl?: string };
  copy: { barcode: string; bibRecord: { titleLatin: string } };
}

function daysOverdue(dueDate: string) {
  return Math.ceil((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
}

export default function CirculationOverduesPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .getActiveLoans()
      .then((data) => setLoans(data || []))
      .catch(() => setLoans([]))
      .finally(() => setLoading(false));
  }, []);

  const overdues = loans
    .filter((l) => daysOverdue(l.dueDate) > 0)
    .map((l) => ({ ...l, days: daysOverdue(l.dueDate), fine: daysOverdue(l.dueDate) * 5 }));

  const filtered = overdues.filter(
    (o) =>
      o.copy.bibRecord.titleLatin.toLowerCase().includes(search.toLowerCase()) ||
      o.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.copy.barcode.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation · Overdue Tracking"
        title="Overdue Items"
        description="Monitor unreturned library loans and their accrued overdue fines (₹5/day, assessed automatically on return)."
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Overdue Items</span>
          <span className="text-2xl font-bold text-[#A52307] mt-1 block">{overdues.length} Volumes</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Projected Fines</span>
          <span className="text-2xl font-mono font-bold text-gray-900 mt-1 block">₹{overdues.reduce((acc, cur) => acc + cur.fine, 0)}</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Severe Overdues (&gt;14d)</span>
          <span className="text-2xl font-bold text-[#A52307] mt-1 block">{overdues.filter((o) => o.days > 14).length} Volumes</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search overdue records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Overdues Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-xs">Loading overdue loans…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No overdue items right now.
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Item Barcode</th>
                <th className="py-3 px-4">Overdue Title</th>
                <th className="py-3 px-4">Borrower &amp; Contact</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Days Overdue</th>
                <th className="py-3 px-4">Projected Fine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{o.copy.barcode}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{o.copy.bibRecord.titleLatin}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      {o.user.avatarUrl ? (
                        <img
                          src={o.user.avatarUrl}
                          alt={o.user.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-gray-300 shadow-xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {o.user.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block">{o.user.fullName}</span>
                        <span className="font-mono text-[11px] text-gray-500">{o.user.membershipNumber} · {o.user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-red-700 font-bold">{new Date(o.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="py-3.5 px-4 font-bold text-[#A52307]">{o.days} Days Late</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">₹{o.fine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
