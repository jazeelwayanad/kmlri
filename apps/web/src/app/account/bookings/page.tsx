'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { CalendarPlus, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Booking {
  id: string;
  type: string;
  resourceName: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'CONFIRMED' | 'CANCELLED';
}

const TYPE_LABELS: Record<string, string> = {
  READING_DESK: 'Reading Desk',
  STUDY_ROOM: 'Study Room',
  LIBRARIAN_CONSULTATION: 'Librarian Consultation',
};

const RESOURCE_OPTIONS: Record<string, string[]> = {
  READING_DESK: ['Desk #01', 'Desk #02', 'Desk #03', 'Desk #04'],
  STUDY_ROOM: ['Manuscript Research Lab', 'Archival Seminar Room A', 'Group Study Room B'],
  LIBRARIAN_CONSULTATION: ['Reference Consultation'],
};

const TIME_SLOTS = ['09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00'];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [type, setType] = useState('READING_DESK');
  const [resourceName, setResourceName] = useState(RESOURCE_OPTIONS['READING_DESK'][0]);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getBookings();
      setBookings(data || []);
    } catch {
      // leave empty; page shows empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const handleTypeChange = (nextType: string) => {
    setType(nextType);
    setResourceName(RESOURCE_OPTIONS[nextType][0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await api.createBooking({ type, resourceName, date, timeSlot, notes: notes || undefined });
      setMessage({ type: 'success', text: 'Booking confirmed.' });
      setNotes('');
      await load();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not create this booking.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelBooking(id);
      await load();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not cancel this booking.' });
    }
  };

  if (!user) return null;

  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED');

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
          Reading Room &amp; Facility Bookings
        </h2>
        <p className="text-xs sm:text-sm text-heritage-muted mt-1">
          Reserve a reading desk, study room, or a consultation slot with the reference librarian.
        </p>
      </div>

      <div className="double-rule"></div>

      {message && (
        <div
          className={`p-3 text-xs font-semibold flex items-center gap-2 rounded border ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-heritage-red border-heritage-red/30'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-2 border-black bg-white rounded p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="font-amiri text-xl font-bold flex items-center gap-2">
          <CalendarPlus className="w-5 h-5 text-heritage-red" /> New Booking
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-averia uppercase font-bold text-heritage-muted">Booking Type</span>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border border-black h-11 px-3 text-sm rounded outline-none bg-white"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-averia uppercase font-bold text-heritage-muted">Resource</span>
            <select
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              className="border border-black h-11 px-3 text-sm rounded outline-none bg-white"
            >
              {RESOURCE_OPTIONS[type].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-averia uppercase font-bold text-heritage-muted">Date</span>
            <input
              type="date"
              required
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="border border-black h-11 px-3 text-sm rounded outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-averia uppercase font-bold text-heritage-muted">Time Slot</span>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="border border-black h-11 px-3 text-sm rounded outline-none bg-white"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-averia uppercase font-bold text-heritage-muted">Notes (optional)</span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Consulting MS 0142 folios"
            className="border border-black h-11 px-3 text-sm rounded outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red transition-colors disabled:opacity-50"
        >
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
      </form>

      {loading ? (
        <div className="border-2 border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">Loading your bookings…</div>
      ) : activeBookings.length === 0 ? (
        <div className="border-2 border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">No upcoming bookings.</div>
      ) : (
        <div className="space-y-3">
          {activeBookings.map((b) => (
            <div key={b.id} className="border-2 border-black bg-white rounded p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="font-amiri text-lg font-bold text-black block">{b.resourceName}</span>
                <span className="text-xs text-heritage-muted">
                  {TYPE_LABELS[b.type] || b.type} · {formatDate(b.date)} · {b.timeSlot}
                </span>
                {b.notes && <p className="text-xs text-heritage-body mt-1">{b.notes}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleCancel(b.id)}
                className="px-3 py-1.5 border border-gray-400 text-xs font-semibold rounded hover:bg-red-50 hover:text-heritage-red hover:border-heritage-red transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
