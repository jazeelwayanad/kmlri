'use client';

import { useState } from 'react';
import { Search, CheckCircle2, Clock, BellRing, Trash2 } from 'lucide-react';
import { Badge, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';

export default function ReservationsAdminPage() {
  const [filter, setFilter] = useState<'ALL' | 'READY' | 'QUEUED' | 'EXPIRED'>('ALL');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const reservations = [
    {
      id: 'RES-101',
      title: 'Bayān al-Fawāʾid (MS 0142)',
      patron: 'Rashid Vattaparamba',
      membershipNo: 'KMLRI-2026-0001',
      requestedDate: '28 Aug 2026',
      status: 'READY',
      shelfLocation: 'Hold Shelf B2',
      holdExpires: '04 Sep 2026 (3 days left)',
      queuePosition: 1,
    },
    {
      id: 'RES-102',
      title: 'Tuḥfat al-Mujāhidīn (RB 0908)',
      patron: 'Amina Sabeelul',
      membershipNo: 'KMLRI-2026-0002',
      requestedDate: '30 Aug 2026',
      status: 'READY',
      shelfLocation: 'Hold Shelf A1',
      holdExpires: '06 Sep 2026 (5 days left)',
      queuePosition: 1,
    },
    {
      id: 'RES-103',
      title: 'Arabi-Malayalam Manuscripts Vol. 2',
      patron: 'Prof. Zakariyya Nadwi',
      membershipNo: 'KMLRI-2026-0008',
      requestedDate: '01 Sep 2026',
      status: 'QUEUED',
      shelfLocation: 'Currently On Loan (Due 05 Sep)',
      holdExpires: 'Pending Return',
      queuePosition: 1,
    },
    {
      id: 'RES-104',
      title: 'Al-Irs͟hād Monthly Archives (1930)',
      patron: 'Fathima Maryam',
      membershipNo: 'KMLRI-2026-0015',
      requestedDate: '20 Aug 2026',
      status: 'EXPIRED',
      shelfLocation: 'Hold Shelf C4',
      holdExpires: 'Expired on 31 Aug 2026',
      queuePosition: 0,
    },
  ];

  const filtered = reservations.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch =
      search === '' ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.patron.toLowerCase().includes(search.toLowerCase()) ||
      r.membershipNo.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleNotifyPatron = (resId: string, patron: string) => {
    setNotification(`Notification dispatched via SMS & Email to ${patron} for reservation #${resId}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Circulation Holds Desk"
        title="Reservations & Item Holds"
        description="Manage patron reservation queues, shelf-hold allocations, pickup notifications, and automated hold sweeps."
        actions={
          <Button
            variant="dark"
            icon={Clock}
            onClick={() => {
              setNotification('Swept expired holds. 1 uncollected item returned to general collection stack.');
              setTimeout(() => setNotification(null), 4000);
            }}
          >
            Sweep Expired Holds
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Active Holds" value="28" hint="In system queue" />
        <StatCard label="Ready For Pickup" value="11" hint="On hold shelf" hintTone="positive" />
        <StatCard label="Queued On Loans" value="16" hint="Waiting for check-in" hintTone="warning" />
        <StatCard label="Expired Holds" value="1" hint="Needs re-shelving" hintTone="negative" />
      </div>

      {/* Filter & Search */}
      <Card className="flex flex-col sm:flex-row gap-4 justify-between items-center" padded={false}>
        <div className="flex gap-2 p-4 sm:pr-0">
          {(['ALL', 'READY', 'QUEUED', 'EXPIRED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tab === 'ALL' ? 'All Holds' : tab === 'READY' ? 'Ready for Pickup' : tab === 'QUEUED' ? 'Queued' : 'Expired'}
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
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] tracking-wide">
              <th className="pb-3 px-3 py-2">Hold ID</th>
              <th className="pb-3 px-3 py-2">Title &amp; Shelfmark</th>
              <th className="pb-3 px-3 py-2">Requesting Patron</th>
              <th className="pb-3 px-3 py-2">Shelf / Loan Status</th>
              <th className="pb-3 px-3 py-2">Hold Expiry</th>
              <th className="pb-3 px-3 py-2">Queue #</th>
              <th className="pb-3 px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{r.id}</td>
                <td className="py-3.5 px-3">
                  <div className="font-bold text-sm text-gray-900">{r.title}</div>
                  <div className="text-gray-400 text-[11px]">Requested: {r.requestedDate}</div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-gray-900">{r.patron}</div>
                  <div className="text-gray-500 text-[11px]">{r.membershipNo}</div>
                </td>
                <td className="py-3.5 px-3">
                  <Badge variant={r.status === 'READY' ? 'success' : r.status === 'QUEUED' ? 'warning' : 'danger'}>
                    {r.status === 'READY' ? `Ready: ${r.shelfLocation}` : r.shelfLocation}
                  </Badge>
                </td>
                <td className="py-3.5 px-3 font-semibold text-gray-700">{r.holdExpires}</td>
                <td className="py-3.5 px-3 font-bold font-mono text-gray-900">
                  {r.queuePosition > 0 ? `#${r.queuePosition}` : '-'}
                </td>
                <td className="py-3.5 px-3 text-right space-x-2">
                  {r.status === 'READY' && (
                    <button
                      type="button"
                      onClick={() => handleNotifyPatron(r.id, r.patron)}
                      className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[11px] font-semibold hover:bg-heritage-red hover:text-white  transition-colors inline-flex items-center gap-1"
                    >
                      <BellRing className="w-3 h-3" />
                      <span>Send Alert</span>
                    </button>
                  )}
                  {r.status === 'EXPIRED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setNotification(`Hold #${r.id} cancelled and returned to shelf.`);
                      }}
                      className="px-2.5 py-1 bg-heritage-red text-white rounded-lg text-[11px] font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Re-shelve Item</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
