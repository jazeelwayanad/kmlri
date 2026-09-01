'use client';

import { useState } from 'react';
import { Clock, Search, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function CirculationOverduesPage() {
  const [overdues, setOverdues] = useState([
    { id: 'OVD-01', barcode: 'MS0142-01', title: 'Fatḥ al-Muʿīn, annotated classical copy', borrower: 'Dr. Naseer', membershipNumber: 'MEM-2231', email: 'naseer@kmlri.in', dueDate: '24 Aug 2026', daysOverdue: 8, fineAccrued: 80 },
    { id: 'OVD-02', barcode: 'RB0411-01', title: 'Malabar Maritime Inscriptions', borrower: 'S. Fathima', membershipNumber: 'MEM-1187', email: 'fathima@kmlri.in', dueDate: '28 Aug 2026', daysOverdue: 4, fineAccrued: 40 },
    { id: 'OVD-03', barcode: 'AM0311-01', title: 'Muḥyiddīn Mālā (Rare Print)', borrower: 'A. Rahman', membershipNumber: 'MEM-2098', email: 'rahman@kmlri.in', dueDate: '15 Aug 2026', daysOverdue: 17, fineAccrued: 170 },
  ]);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSendReminder = (patron: string) => {
    setNotification(`Automated overdue reminder notice dispatched to ${patron}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = overdues.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.borrower.toLowerCase().includes(search.toLowerCase()) ||
    o.barcode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation · Overdue Tracking"
        title="Overdue Items"
        description="Monitor unreturned library loans, overdue fine accumulations, and dispatch automated patron reminders."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Overdue Items</span>
          <span className="text-2xl font-bold text-[#A52307] mt-1 block">{overdues.length} Volumes</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Accrued Fines</span>
          <span className="text-2xl font-mono font-bold text-gray-900 mt-1 block">
            ₹{overdues.reduce((acc, cur) => acc + cur.fineAccrued, 0)}
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Severe Overdues (&gt;14d)</span>
          <span className="text-2xl font-bold text-[#A52307] mt-1 block">
            {overdues.filter((o) => o.daysOverdue > 14).length} Volumes
          </span>
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
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Item Barcode</th>
              <th className="py-3 px-4">Overdue Title</th>
              <th className="py-3 px-4">Borrower &amp; Contact</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Days Overdue</th>
              <th className="py-3 px-4">Accrued Fine</th>
              <th className="py-3 px-4 text-right">Reminder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{o.barcode}</td>
                <td className="py-3.5 px-4 font-semibold text-gray-900">{o.title}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-gray-900 block">{o.borrower}</span>
                  <span className="font-mono text-[11px] text-gray-500">{o.membershipNumber} · {o.email}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-red-700 font-bold">{o.dueDate}</td>
                <td className="py-3.5 px-4 font-bold text-[#A52307]">{o.daysOverdue} Days Late</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">₹{o.fineAccrued}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleSendReminder(o.borrower)}
                    className="px-2.5 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-[#A52307] hover:text-white hover:border-[#A52307] transition-colors text-[11px] font-semibold inline-flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Send Notice</span>
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
