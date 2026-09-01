'use client';

import { useState } from 'react';
import { RotateCcw, Search, CheckCircle2 } from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function CirculationRenewalsPage() {
  const [loans, setLoans] = useState([
    { id: 'LN-101', barcode: 'RB0908-01', title: 'Tuḥfat al-Mujāhidīn (Latin Edition)', patron: 'Rashid Vattaparamba (KMLRI-2026-0001)', dueDate: '10 Sep 2026', renewalsDone: 0, maxAllowed: 2 },
    { id: 'LN-102', barcode: 'PER0044-01', title: 'Al-Bayān monthly Arabic journal', patron: 'Amina Sabeelul (KMLRI-2026-0002)', dueDate: '08 Sep 2026', renewalsDone: 1, maxAllowed: 2 },
    { id: 'LN-103', barcode: 'MS0142-02', title: 'Bayān al-Fawāʾid commentary', patron: 'Dr. Tariq al-Omani (MEM-0942)', dueDate: '14 Sep 2026', renewalsDone: 0, maxAllowed: 3 },
  ]);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleRenew = (id: string, title: string) => {
    setLoans(loans.map((l) =>
      l.id === id ? { ...l, renewalsDone: l.renewalsDone + 1 } : l
    ));
    setNotification(`Loan for "${title}" extended for 14 days.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = loans.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.patron.toLowerCase().includes(search.toLowerCase()) ||
    l.barcode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation · Loan Extensions"
        title="Loan Renewals Desk"
        description="Extend borrowing periods for eligible active loans, research fellows, and faculty members."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
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
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{l.barcode}</td>
                <td className="py-3.5 px-4 font-semibold text-gray-900">{l.title}</td>
                <td className="py-3.5 px-4 text-gray-700">{l.patron}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{l.dueDate}</td>
                <td className="py-3.5 px-4 text-gray-600">{l.renewalsDone} / {l.maxAllowed} Renewals</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    disabled={l.renewalsDone >= l.maxAllowed}
                    onClick={() => handleRenew(l.id, l.title)}
                    className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Renew (+14d)</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
