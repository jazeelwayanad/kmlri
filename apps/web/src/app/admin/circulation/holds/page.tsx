'use client';

import { useState } from 'react';
import { Bookmark, Search, Plus, CheckCircle2, X } from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function CirculationHoldsPage() {
  const [holds, setHolds] = useState([
    { id: 'HLD-01', title: 'Bayān al-Fawāʾid', shelfmark: 'MS 0142', patron: 'K. Ahmed (MEM-0942)', requestDate: '28 Aug 2026', status: 'READY_ON_SHELF', shelf: 'Hold Shelf A1', expiryDate: '05 Sep 2026' },
    { id: 'HLD-02', title: 'Fatḥ al-Muʿīn Classical Copy', shelfmark: 'MS 0140', patron: 'Fatima Z. (MEM-1102)', requestDate: '30 Aug 2026', status: 'QUEUED', queuePos: 1, expiryDate: 'Pending Return' },
    { id: 'HLD-03', title: 'Tuḥfat al-Mujāhidīn (Latin Edition)', shelfmark: 'RB 0908', patron: 'Zaid K. (MEM-3301)', requestDate: '01 Sep 2026', status: 'QUEUED', queuePos: 2, expiryDate: 'Pending Return' },
    { id: 'HLD-04', title: 'Muḥyiddīn Mālā Print Edition', shelfmark: 'AM 0311', patron: 'Amina S. (MEM-2026-0002)', requestDate: '01 Sep 2026', status: 'READY_ON_SHELF', shelf: 'Hold Shelf B2', expiryDate: '07 Sep 2026' },
  ]);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleCancelHold = (id: string, title: string) => {
    if (confirm(`Cancel reservation for "${title}"?`)) {
      setHolds(holds.filter((h) => h.id !== id));
      setNotification(`Hold #${id} cancelled.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filtered = holds.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.patron.toLowerCase().includes(search.toLowerCase()) ||
    h.shelfmark.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation · Reservations Desk"
        title="Holds &amp; Reservations"
        description="Monitor active shelf reservations, hold queues, and pickup notifications for patron requested titles."
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
            placeholder="Search holds by title, patron, shelfmark..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Holds Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Hold Ref</th>
              <th className="py-3 px-4">Requested Item</th>
              <th className="py-3 px-4">Patron</th>
              <th className="py-3 px-4">Request Date</th>
              <th className="py-3 px-4">Shelf Status</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((h) => (
              <tr key={h.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{h.id}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-gray-900 block">{h.title}</span>
                  <span className="font-mono text-[11px] text-gray-500">{h.shelfmark}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-700">{h.patron}</td>
                <td className="py-3.5 px-4 text-gray-600">{h.requestDate}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    h.status === 'READY_ON_SHELF' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {h.status === 'READY_ON_SHELF' ? `Ready: ${h.shelf}` : `In Queue (#${h.queuePos})`}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-gray-700">{h.expiryDate}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleCancelHold(h.id, h.title)}
                    className="px-2.5 py-1 border border-gray-300 rounded text-gray-700 hover:text-red-700 hover:border-red-300 text-[11px] font-semibold"
                  >
                    Cancel Hold
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
