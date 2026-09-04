'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  CalendarPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  FileText,
  Info,
  Building,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

interface DynamicBookingField {
  id: string;
  label: string;
  type: 'select' | 'text' | 'textarea' | 'checkbox';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}

interface BookingTypeConfig {
  id: string;
  name: string;
  description?: string;
  resources: string[];
}

interface BookingSystemConfig {
  types: BookingTypeConfig[];
  timeSlots: string[];
  customFields: DynamicBookingField[];
  requireVerification: boolean;
  instructions?: string;
}

interface Booking {
  id: string;
  type: string;
  resourceName: string;
  date: string;
  timeSlot: string;
  notes?: string;
  adminNote?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  customFieldValues?: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';
  createdAt: string;
}

const DEFAULT_CONFIG: BookingSystemConfig = {
  types: [
    {
      id: 'READING_DESK',
      name: 'Reading Desk',
      description: 'Individual study desks in the main reading room.',
      resources: ['Desk #01', 'Desk #02', 'Desk #03', 'Desk #04', 'Desk #05', 'Desk #06'],
    },
    {
      id: 'STUDY_ROOM',
      name: 'Specialized Study Room',
      description: 'Quiet research suites for archival and manuscript examination.',
      resources: ['Manuscript Research Lab', 'Archival Seminar Room A', 'Group Study Room B'],
    },
    {
      id: 'LIBRARIAN_CONSULTATION',
      name: 'Librarian Research Consultation',
      description: '1-on-1 reference desk consultation with an archivist.',
      resources: ['Reference Consultation Desk', 'Arabi-Malayalam Specialist Desk'],
    },
  ],
  timeSlots: ['09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'],
  customFields: [
    {
      id: 'research_purpose',
      label: 'Research Purpose',
      type: 'select',
      options: [
        'Doctoral / PhD Dissertation Research',
        'Academic Publication / Faculty Research',
        'Manuscript / Archival Reading',
        'Independent Historical Study',
        'General Coursework',
      ],
      required: true,
      placeholder: 'Select your purpose',
    },
    {
      id: 'equipment_needed',
      label: 'Special Equipment / Materials Requested',
      type: 'select',
      options: [
        'None / Standard Study',
        'Manuscript Illumination Lamp & Magnifier',
        'Microfilm / Microfiche Reader',
        'High-Resolution Digital Document Scanner',
        'Audio Recitation Listening Station',
      ],
      required: false,
      placeholder: 'Select equipment if required',
    },
  ],
  requireVerification: true,
  instructions:
    'All desk and room reservations are placed in PENDING status until verified by library staff. You will receive a verification note once reviewed.',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<BookingSystemConfig>(DEFAULT_CONFIG);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState(DEFAULT_CONFIG.types[0].id);
  const [resourceName, setResourceName] = useState(DEFAULT_CONFIG.types[0].resources[0]);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(DEFAULT_CONFIG.timeSlots[0]);
  const [notes, setNotes] = useState('');
  const [customFieldsState, setCustomFieldsState] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load dynamic config & user bookings
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedConfig, fetchedBookings] = await Promise.all([
        api.getBookingConfig().catch(() => DEFAULT_CONFIG),
        api.getBookings().catch(() => []),
      ]);

      if (fetchedConfig && fetchedConfig.types?.length > 0) {
        setConfig(fetchedConfig);
        setSelectedType(fetchedConfig.types[0].id);
        setResourceName(fetchedConfig.types[0].resources[0] || '');
        if (fetchedConfig.timeSlots?.length > 0) {
          setTimeSlot(fetchedConfig.timeSlots[0]);
        }
      }
      setBookings(fetchedBookings || []);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleTypeChange = (nextTypeId: string) => {
    setSelectedType(nextTypeId);
    const typeObj = config.types.find((t) => t.id === nextTypeId);
    if (typeObj && typeObj.resources?.length > 0) {
      setResourceName(typeObj.resources[0]);
    } else {
      setResourceName('');
    }
  };

  const handleCustomFieldChange = (fieldId: string, val: any) => {
    setCustomFieldsState((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setMessage({ type: 'error', text: 'Please choose a reservation date.' });
      return;
    }

    // Validate required custom fields
    for (const field of config.customFields || []) {
      if (field.required && !customFieldsState[field.id]) {
        setMessage({ type: 'error', text: `Please fill in required field: ${field.label}` });
        return;
      }
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await api.createBooking({
        type: selectedType,
        resourceName,
        date,
        timeSlot,
        notes: notes || undefined,
        customFieldValues: customFieldsState,
      });

      setMessage({
        type: 'success',
        text: 'Your booking request has been submitted and is currently PENDING verification by library staff.',
      });
      setNotes('');
      setCustomFieldsState({});

      // Reload bookings
      const updated = await api.getBookings();
      setBookings(updated || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not submit this booking request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelBooking(id, 'Cancelled by patron.');
      setMessage({ type: 'info', text: 'Booking has been cancelled.' });
      const updated = await api.getBookings();
      setBookings(updated || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not cancel this booking.' });
    }
  };

  if (!user) return null;

  const currentTypeObj = config.types.find((t) => t.id === selectedType) || config.types[0];

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'CONFIRMED') return b.status === 'APPROVED' || b.status === 'CONFIRMED';
    return b.status === statusFilter;
  });

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const approvedCount = bookings.filter((b) => b.status === 'APPROVED' || b.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6 font-sans max-w-[1000px]">
      <div>
        <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
          Reading Room &amp; Facility Bookings
        </h2>
        <p className="text-xs sm:text-sm text-heritage-muted mt-1">
          Reserve a reading desk, quiet study room, or 1-on-1 consultation slot with our research archivists.
        </p>
      </div>

      <div className="double-rule"></div>

      {config.instructions && (
        <div className="p-3.5 bg-[#FAF8F5] border border-[#E2E0DB] rounded text-xs text-gray-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-heritage-red flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{config.instructions}</div>
        </div>
      )}

      {message && (
        <div
          className={`p-3.5 text-xs font-semibold flex items-center gap-2 rounded border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : message.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-red-50 text-heritage-red border-heritage-red/30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : message.type === 'info' ? (
            <Info className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* New Booking Form */}
      <form onSubmit={handleSubmit} className="bg-white border-2 border-black rounded p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="font-amiri text-xl font-bold flex items-center gap-2">
          <CalendarPlus className="w-5 h-5 text-heritage-red" /> Request Facility Booking
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Facility Type */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-averia uppercase font-bold text-heritage-muted">Facility Category</span>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border border-black h-11 px-3 text-sm rounded outline-none bg-transparent font-medium"
            >
              {config.types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          {/* Specific Resource */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-averia uppercase font-bold text-heritage-muted">Specific Desk / Room</span>
            <select
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              className="border border-black h-11 px-3 text-sm rounded outline-none bg-transparent font-medium"
            >
              {currentTypeObj?.resources?.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          {/* Date Picker */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-averia uppercase font-bold text-heritage-muted">Date</span>
            <input
              type="date"
              required
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="border border-black h-11 px-3 text-sm rounded outline-none bg-transparent"
            />
          </label>

          {/* Time Slot */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-averia uppercase font-bold text-heritage-muted">Time Slot</span>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="border border-black h-11 px-3 text-sm rounded outline-none bg-transparent font-medium"
            >
              {config.timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          {/* Dynamic Custom Dropdown & Text Fields Configured by Admin */}
          {config.customFields?.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label className="text-xs font-averia uppercase font-bold text-heritage-muted flex items-center gap-1">
                <span>{field.label}</span>
                {field.required && <span className="text-heritage-red">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  value={customFieldsState[field.id] || ''}
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                  required={field.required}
                  className="border border-black h-11 px-3 text-sm rounded outline-none bg-transparent"
                >
                  <option value="">{field.placeholder || `Select ${field.label}...`}</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  rows={2}
                  value={customFieldsState[field.id] || ''}
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder || ''}
                  className="border border-black p-2.5 text-sm rounded outline-none bg-transparent"
                />
              ) : (
                <input
                  type="text"
                  value={customFieldsState[field.id] || ''}
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder || ''}
                  className="border border-black h-11 px-3 text-sm rounded outline-none bg-transparent"
                />
              )}
              {field.helpText && <span className="text-[11px] text-gray-500">{field.helpText}</span>}
            </div>
          ))}
        </div>

        {/* Notes */}
        <label className="flex flex-col gap-1.5 pt-1">
          <span className="text-xs font-averia uppercase font-bold text-heritage-muted">
            Special Notes / Manuscripts to examine (optional)
          </span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Requesting consultation for Arabi-Malayalam codex MS 0142"
            className="border border-black h-11 px-3 text-sm rounded outline-none bg-transparent"
          />
        </label>

        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
          <div className="text-[11px] text-gray-500">
            Booking requests will be reviewed by library administration.
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {submitting ? 'Submitting Request…' : 'Submit Booking for Verification'}
          </button>
        </div>
      </form>

      {/* Bookings History & Directory */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-amiri text-2xl font-bold">My Bookings</h3>

          {/* Status Filter Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: 'ALL', label: `All (${bookings.length})` },
              { key: 'PENDING', label: `Pending (${pendingCount})` },
              { key: 'CONFIRMED', label: `Approved (${approvedCount})` },
              { key: 'REJECTED', label: 'Declined' },
              { key: 'CANCELLED', label: 'Cancelled' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === f.key
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E2E0DB] rounded p-8 text-center text-heritage-muted text-sm animate-pulse">
            Loading your bookings…
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#E2E0DB] rounded p-8 text-center text-heritage-muted text-sm">
            No bookings found for the selected status.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((b) => {
              const typeName = config.types.find((t) => t.id === b.type)?.name || b.type;
              const isPending = b.status === 'PENDING';
              const isApproved = b.status === 'APPROVED' || b.status === 'CONFIRMED';
              const isRejected = b.status === 'REJECTED';
              const isCancelled = b.status === 'CANCELLED';

              return (
                <div
                  key={b.id}
                  className={`border rounded p-4 sm:p-5 shadow-xs bg-white transition-all ${
                    isPending
                      ? 'border-amber-400 bg-amber-50/20'
                      : isApproved
                      ? 'border-emerald-500'
                      : isRejected
                      ? 'border-red-300 bg-red-50/20'
                      : 'border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-amiri text-lg sm:text-xl font-bold text-black">{b.resourceName}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isRejected
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isPending
                            ? '⏳ Pending Verification'
                            : isApproved
                            ? '✓ Confirmed & Approved'
                            : isRejected
                            ? '✕ Declined'
                            : 'Cancelled'}
                        </span>
                      </div>

                      <div className="text-xs text-heritage-muted mt-1 flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800">{typeName}</span>
                        <span>·</span>
                        <span className="font-mono text-gray-700 font-bold">{formatDate(b.date)}</span>
                        <span>·</span>
                        <span className="font-mono text-gray-700 font-bold">{b.timeSlot}</span>
                      </div>
                    </div>

                    {(isPending || isApproved) && (
                      <button
                        type="button"
                        onClick={() => handleCancel(b.id)}
                        className="px-3 py-1.5 border border-gray-300 text-xs font-semibold rounded hover:bg-red-50 hover:text-heritage-red hover:border-heritage-red transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel Request
                      </button>
                    )}
                  </div>

                  {/* Dynamic Custom Field Values */}
                  {b.customFieldValues && Object.keys(b.customFieldValues).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(b.customFieldValues).map(([k, v]) => {
                        const fieldDef = config.customFields?.find((f) => f.id === k);
                        const label = fieldDef?.label || k;
                        return (
                          <div key={k} className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-500">{label}</span>
                            <span className="font-medium text-gray-900">{String(v)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Patron Notes */}
                  {b.notes && (
                    <div className="mt-2.5 text-xs text-gray-700 bg-[#FAF8F5] p-2 rounded">
                      <span className="font-bold text-gray-500">Patron Notes: </span>
                      {b.notes}
                    </div>
                  )}

                  {/* Admin Verification Note & Verification details */}
                  {b.adminNote && (
                    <div
                      className={`mt-2.5 p-2.5 rounded text-xs border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : isRejected
                          ? 'bg-red-50 text-red-900 border-red-200'
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Librarian Verification Note:</span>
                        {b.verifiedBy && <span className="font-normal text-[11px]">({b.verifiedBy})</span>}
                      </div>
                      <p className="m-0 leading-relaxed">{b.adminNote}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
