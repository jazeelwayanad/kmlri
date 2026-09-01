'use client';

import { useState } from 'react';
import { Building2, Search, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function ReservationsAndBookingsPage() {
  const [bookings, setBookings] = useState([
    {
      id: 'CAR-301',
      patron: 'Rashid Vattaparamba (MEM-2026-0001)',
      facility: 'Manuscript Consultation Carrel #02',
      date: '02 Sep 2026',
      timeSlot: '09:30 AM – 01:30 PM',
      purpose: 'Foliated codicological examination of MS 0142',
      status: 'APPROVED',
    },
    {
      id: 'CAR-302',
      patron: 'Amina Sabeelul (MEM-2026-0002)',
      facility: 'Digital Microfilm Reader Station #01',
      date: '03 Sep 2026',
      timeSlot: '02:00 PM – 05:00 PM',
      purpose: 'Review of Al-Bayān periodical microfiches',
      status: 'PENDING_APPROVAL',
    },
    {
      id: 'CAR-303',
      patron: 'Prof. Ananya Sen (Visiting Fellow)',
      facility: 'Archival Seminar Room A',
      date: '05 Sep 2026',
      timeSlot: '10:00 AM – 01:00 PM',
      purpose: 'Research colloquium preparatory group work',
      status: 'APPROVED',
    },
  ]);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setBookings(bookings.map((b) => b.id === id ? { ...b, status: 'APPROVED' } : b));
    setNotification(`Booking #${id} confirmed.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = bookings.filter((b) =>
    b.facility.toLowerCase().includes(search.toLowerCase()) ||
    b.patron.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Support &amp; Services · Facilities Desk"
        title="Reservations &amp; Facility Bookings"
        description="Review and manage study carrel reservations, microfilm reading station allocations, and seminar room bookings."
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
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Booking Ref</th>
              <th className="py-3 px-4">Scholar / Patron</th>
              <th className="py-3 px-4">Facility &amp; Time Slot</th>
              <th className="py-3 px-4">Research Purpose</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Desk Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{b.id}</td>
                <td className="py-3.5 px-4 font-semibold text-gray-900">{b.patron}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-gray-900 block">{b.facility}</span>
                  <span className="text-gray-500 text-[11px] font-mono">{b.date} · {b.timeSlot}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-600">{b.purpose}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {b.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {b.status === 'PENDING_APPROVAL' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(b.id)}
                      className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
