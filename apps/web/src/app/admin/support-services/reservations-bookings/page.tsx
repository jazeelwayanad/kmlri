'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, X } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Booking {
  id: string;
  type: string;
  resourceName: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'CONFIRMED' | 'CANCELLED';
  user: { fullName: string; membershipNumber: string };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReservationsAndBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getAllBookings();
      setBookings(data || []);
    } catch {
      setNotification('Could not load facility bookings from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.cancelBooking(id);
      setNotification('Booking cancelled.');
      await load();
    } catch (err: any) {
      setNotification(err.message || 'Could not cancel this booking.');
    } finally {
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const filtered = bookings.filter(
    (b) =>
      b.resourceName.toLowerCase().includes(search.toLowerCase()) ||
      b.user.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Support &amp; Services · Facilities Desk"
        title="Reservations &amp; Facility Bookings"
        description="Review reading desk, study room, and consultation bookings made by members through the self-service portal."
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
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-xs">Loading bookings…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">No facility bookings found.</div>
        ) : (
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Scholar / Patron</th>
                <th className="py-3 px-4">Facility &amp; Time Slot</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    {b.user.fullName}
                    <div className="text-gray-500 text-[11px] font-mono font-normal">{b.user.membershipNumber}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block">{b.resourceName}</span>
                    <span className="text-gray-500 text-[11px] font-mono">{formatDate(b.date)} · {b.timeSlot}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{b.notes || '—'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {b.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => handleCancel(b.id)}
                        className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 rounded text-[11px] font-semibold hover:bg-red-50 hover:text-heritage-red hover:border-heritage-red transition-colors inline-flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
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
