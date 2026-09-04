'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  UserCheck,
  AlertCircle,
  Settings2,
  ListFilter,
  Check,
  Building,
  Layers,
  Save,
  FileText,
  Sliders,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { api } from '@/lib/api';

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
  user: {
    id: string;
    fullName: string;
    membershipNumber: string;
    email?: string;
    avatarUrl?: string;
  };
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

export default function ReservationsAndBookingsPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'fields_config'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [config, setConfig] = useState<BookingSystemConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [approveModalBooking, setApproveModalBooking] = useState<Booking | null>(null);
  const [approveNote, setApproveNote] = useState('');
  const [rejectModalBooking, setRejectModalBooking] = useState<Booking | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [editModalBooking, setEditModalBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [actionLoading, setActionLoading] = useState(false);

  // Field builder config state
  const [savingConfig, setSavingConfig] = useState(false);
  const [newResourceInput, setNewResourceInput] = useState<{ [key: string]: string }>({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bookingsData, configData] = await Promise.all([
        api.getAllBookings().catch(() => []),
        api.getBookingConfig().catch(() => DEFAULT_CONFIG),
      ]);
      setBookings(bookingsData || []);
      if (configData && configData.types) {
        setConfig(configData);
      }
    } catch {
      setNotification({ type: 'error', text: 'Could not load facility bookings from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Actions
  const handleApprove = async () => {
    if (!approveModalBooking) return;
    setActionLoading(true);
    try {
      await api.approveBooking(approveModalBooking.id, approveNote || undefined);
      showNotification('success', `Booking #${approveModalBooking.id.slice(0, 8)} approved successfully.`);
      setApproveModalBooking(null);
      setApproveNote('');
      await loadAll();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalBooking) return;
    if (!rejectNote.trim()) {
      showNotification('error', 'Please provide a reason / verification note for declining this booking.');
      return;
    }
    setActionLoading(true);
    try {
      await api.rejectBooking(rejectModalBooking.id, rejectNote);
      showNotification('success', `Booking #${rejectModalBooking.id.slice(0, 8)} declined.`);
      setRejectModalBooking(null);
      setRejectNote('');
      await loadAll();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to decline booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalBooking) return;
    setActionLoading(true);
    try {
      await api.updateBooking(editModalBooking.id, editForm);
      showNotification('success', `Booking #${editModalBooking.id.slice(0, 8)} updated.`);
      setEditModalBooking(null);
      await loadAll();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(id, 'Cancelled by facility admin.');
      showNotification('success', 'Booking cancelled.');
      await loadAll();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to cancel booking.');
    }
  };

  // Field Config Save
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await api.updateBookingConfig(config);
      showNotification('success', 'Dynamic booking fields & facility settings saved successfully.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Custom Fields Operations
  const handleAddCustomField = () => {
    const newField: DynamicBookingField = {
      id: `field_${Date.now()}`,
      label: 'New Dropdown Field',
      type: 'select',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false,
      placeholder: 'Select an option...',
    };
    setConfig({
      ...config,
      customFields: [...(config.customFields || []), newField],
    });
  };

  const handleRemoveCustomField = (index: number) => {
    const updated = [...(config.customFields || [])];
    updated.splice(index, 1);
    setConfig({ ...config, customFields: updated });
  };

  const handleUpdateCustomField = (index: number, updates: Partial<DynamicBookingField>) => {
    const updated = [...(config.customFields || [])];
    updated[index] = { ...updated[index], ...updates };
    setConfig({ ...config, customFields: updated });
  };

  // Facility Types & Resources Operations
  const handleAddType = () => {
    const newType: BookingTypeConfig = {
      id: `TYPE_${Date.now()}`,
      name: 'New Facility Type',
      description: 'Facility description',
      resources: ['Resource #1'],
    };
    setConfig({ ...config, types: [...config.types, newType] });
  };

  const handleRemoveType = (typeIndex: number) => {
    const updated = [...config.types];
    updated.splice(typeIndex, 1);
    setConfig({ ...config, types: updated });
  };

  const handleAddResourceToType = (typeIndex: number) => {
    const type = config.types[typeIndex];
    const resName = (newResourceInput[type.id] || '').trim();
    if (!resName) return;

    const updatedTypes = [...config.types];
    updatedTypes[typeIndex] = {
      ...type,
      resources: [...type.resources, resName],
    };
    setConfig({ ...config, types: updatedTypes });
    setNewResourceInput({ ...newResourceInput, [type.id]: '' });
  };

  const handleRemoveResourceFromType = (typeIndex: number, resIndex: number) => {
    const type = config.types[typeIndex];
    const updatedResources = [...type.resources];
    updatedResources.splice(resIndex, 1);
    const updatedTypes = [...config.types];
    updatedTypes[typeIndex] = { ...type, resources: updatedResources };
    setConfig({ ...config, types: updatedTypes });
  };

  // Filtering
  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.resourceName?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.membershipNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.notes?.toLowerCase().includes(search.toLowerCase()) ||
      b.adminNote?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'CONFIRMED' || statusFilter === 'APPROVED') {
      return b.status === 'APPROVED' || b.status === 'CONFIRMED';
    }
    return b.status === statusFilter;
  });

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const approvedCount = bookings.filter((b) => b.status === 'APPROVED' || b.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6 font-sans pb-16 max-w-[1280px]">
      <PageHeader
        eyebrow="Support &amp; Services · Facilities Desk"
        title="Facility Reservations &amp; Dynamic Bookings"
        description="Verify, approve, and manage reading room desks and study suites, with configurable custom dropdowns and field rules."
      />

      {notification && (
        <div
          className={`p-4 rounded border text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-red-50 text-heritage-red border-heritage-red/30'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-heritage-red flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-[#E2E0DB] rounded shadow-xs">
          <span className="text-[11px] font-averia uppercase font-bold text-gray-500 block">
            Pending Verification
          </span>
          <div className="text-2xl font-amiri font-bold text-amber-700 mt-1 flex items-center justify-between">
            <span>{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-900 font-sans px-2 py-0.5 rounded font-bold">
                Action Required
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 border border-[#E2E0DB] rounded shadow-xs">
          <span className="text-[11px] font-averia uppercase font-bold text-gray-500 block">
            Approved Bookings
          </span>
          <div className="text-2xl font-amiri font-bold text-emerald-700 mt-1">{approvedCount}</div>
        </div>

        <div className="bg-white p-4 border border-[#E2E0DB] rounded shadow-xs">
          <span className="text-[11px] font-averia uppercase font-bold text-gray-500 block">
            Total Requests
          </span>
          <div className="text-2xl font-amiri font-bold text-gray-900 mt-1">{bookings.length}</div>
        </div>

        <div className="bg-white p-4 border border-[#E2E0DB] rounded shadow-xs">
          <span className="text-[11px] font-averia uppercase font-bold text-gray-500 block">
            Configured Facilities
          </span>
          <div className="text-2xl font-amiri font-bold text-gray-900 mt-1">
            {config.types.reduce((acc, t) => acc + (t.resources?.length || 0), 0)} Units
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-[#E2E0DB] flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-[#A52307] text-[#A52307] bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Bookings Workbench &amp; Verification</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-amber-200 text-amber-900 rounded-full font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fields_config')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'fields_config'
              ? 'border-[#A52307] text-[#A52307] bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Form &amp; Dynamic Dropdown Builder</span>
        </button>
      </div>

      {/* TAB 1: BOOKINGS WORKBENCH */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-[#E2E0DB] p-4 rounded flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by scholar name, member #, resource, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
              />
            </div>

            {/* Status Filter Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ALL', label: `All (${bookings.length})` },
                { key: 'PENDING', label: `Pending (${pendingCount})` },
                { key: 'APPROVED', label: `Approved (${approvedCount})` },
                { key: 'REJECTED', label: 'Declined' },
                { key: 'CANCELLED', label: 'Cancelled' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
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

          {/* Bookings Table */}
          <div className="bg-white border border-[#E2E0DB] rounded overflow-x-auto shadow-sm">
            {loading ? (
              <div className="p-10 text-center text-gray-500 text-xs">Loading bookings…</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-gray-500 text-xs">
                No facility reservations found matching your criteria.
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold text-[11px]">
                    <th className="py-3 px-4">Scholar / Patron</th>
                    <th className="py-3 px-4">Facility &amp; Time Slot</th>
                    <th className="py-3 px-4">Dynamic Custom Fields</th>
                    <th className="py-3 px-4">Patron / Verification Notes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {filtered.map((b) => {
                    const isPending = b.status === 'PENDING';
                    const isApproved = b.status === 'APPROVED' || b.status === 'CONFIRMED';
                    const isRejected = b.status === 'REJECTED';
                    const isCancelled = b.status === 'CANCELLED';

                    const typeName = config.types.find((t) => t.id === b.type)?.name || b.type;

                    return (
                      <tr key={b.id} className={`hover:bg-[#FAF8F5] ${isPending ? 'bg-amber-50/20' : ''}`}>
                        {/* Patron Column */}
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          <div className="flex items-center gap-2.5">
                            {b.user?.avatarUrl ? (
                              <img
                                src={b.user.avatarUrl}
                                alt={b.user.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-gray-300 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                {b.user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900">{b.user?.fullName || 'Unknown Patron'}</div>
                              <div className="text-gray-500 text-[11px] font-mono font-normal">
                                {b.user?.membershipNumber} {b.user?.email ? `· ${b.user.email}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Facility & Date */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-gray-900 block text-[13px]">{b.resourceName}</span>
                          <span className="text-[11px] text-gray-500 block">{typeName}</span>
                          <span className="text-gray-700 text-[11px] font-mono font-bold mt-0.5 block">
                            {formatDate(b.date)} · {b.timeSlot}
                          </span>
                        </td>

                        {/* Custom Dropdown / Text Responses */}
                        <td className="py-3.5 px-4">
                          {b.customFieldValues && Object.keys(b.customFieldValues).length > 0 ? (
                            <div className="space-y-1">
                              {Object.entries(b.customFieldValues).map(([k, v]) => {
                                const fieldDef = config.customFields?.find((f) => f.id === k);
                                const label = fieldDef?.label || k;
                                return (
                                  <div key={k} className="text-[11px]">
                                    <span className="text-gray-400 font-bold">{label}: </span>
                                    <span className="font-medium text-gray-800">{String(v)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Standard Desk</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="py-3.5 px-4 max-w-[240px]">
                          {b.notes && (
                            <div className="text-[11px] text-gray-700">
                              <span className="font-bold text-gray-500">Patron: </span>
                              {b.notes}
                            </div>
                          )}
                          {b.adminNote && (
                            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded mt-1 border border-emerald-200">
                              <span className="font-bold">Staff Note: </span>
                              {b.adminNote}
                              {b.verifiedBy && (
                                <span className="block text-[10px] text-gray-500 mt-0.5">
                                  by {b.verifiedBy}
                                </span>
                              )}
                            </div>
                          )}
                          {!b.notes && !b.adminNote && <span className="text-gray-400">—</span>}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
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
                              ? '⏳ Pending Review'
                              : isApproved
                              ? '✓ Approved'
                              : isRejected
                              ? '✕ Declined'
                              : 'Cancelled'}
                          </span>
                        </td>

                        {/* Desk Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setApproveModalBooking(b);
                                    setApproveNote('');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                                  title="Verify & Approve"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectModalBooking(b);
                                    setRejectNote('');
                                  }}
                                  className="px-2 py-1 bg-white border border-red-300 text-red-700 rounded text-[11px] font-bold hover:bg-red-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  title="Decline Booking"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Decline</span>
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setEditModalBooking(b);
                                setEditForm({
                                  type: b.type,
                                  resourceName: b.resourceName,
                                  date: b.date ? new Date(b.date).toISOString().slice(0, 10) : '',
                                  timeSlot: b.timeSlot,
                                  status: b.status,
                                  notes: b.notes || '',
                                  adminNote: b.adminNote || '',
                                });
                              }}
                              className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded cursor-pointer"
                              title="Edit Booking Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {(isPending || isApproved) && (
                              <button
                                type="button"
                                onClick={() => handleCancelBooking(b.id)}
                                className="p-1 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                title="Cancel Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FORM & DYNAMIC DROPDOWN BUILDER */}
      {activeTab === 'fields_config' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E0DB] rounded p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Facility &amp; Booking Form Builder</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure facility categories, individual desks/rooms, time slots, and custom dynamic dropdown fields.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded hover:bg-[#A52307] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'Saving Settings…' : 'Save All Booking Config'}</span>
            </button>
          </div>

          {/* 1. Facility Categories & Resource Units */}
          <div className="bg-white border border-[#E2E0DB] rounded p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900">1. Facility Categories &amp; Physical Units</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Define types (e.g. Reading Desks, Archival Suites) and list the available desks/rooms under each.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddType}
                className="px-3 py-1.5 bg-gray-100 text-gray-800 text-xs font-bold rounded hover:bg-gray-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Facility Category</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {config.types.map((type, tIdx) => (
                <div key={type.id || tIdx} className="p-4 bg-[#FAF8F5] border border-[#E2E0DB] rounded space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-mono font-bold text-gray-400 text-xs">#{tIdx + 1}</span>
                      <input
                        type="text"
                        value={type.name}
                        onChange={(e) => {
                          const updated = [...config.types];
                          updated[tIdx].name = e.target.value;
                          setConfig({ ...config, types: updated });
                        }}
                        className="font-bold text-sm text-gray-900 bg-white border border-gray-300 rounded px-2.5 py-1 flex-1 max-w-sm"
                        placeholder="Category Name"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveType(tIdx)}
                      className="text-gray-400 hover:text-red-700 p-1"
                      title="Remove Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Resources under this category */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">
                      Configured Desks / Rooms / Units:
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {type.resources.map((res, rIdx) => (
                        <div
                          key={rIdx}
                          className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{res}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveResourceFromType(tIdx, rIdx)}
                            className="text-gray-400 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Resource Input */}
                    <div className="flex items-center gap-2 max-w-sm">
                      <input
                        type="text"
                        value={newResourceInput[type.id] || ''}
                        onChange={(e) =>
                          setNewResourceInput({ ...newResourceInput, [type.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddResourceToType(tIdx);
                          }
                        }}
                        placeholder="e.g. Desk #07 or Suite C"
                        className="bg-white border border-gray-300 h-8 px-2.5 rounded text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddResourceToType(tIdx)}
                        className="px-3 h-8 bg-black text-white text-xs font-bold rounded hover:bg-gray-800"
                      >
                        Add Unit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Dynamic Custom Dropdown & Text Fields Builder */}
          <div className="bg-white border border-[#E2E0DB] rounded p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  2. Dynamic Custom Dropdown &amp; Form Fields
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add custom dropdowns (e.g. Research Purpose, Materials Needed, Affiliation) shown to scholars on the booking form.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded hover:bg-[#A52307] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Dropdown / Field</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {(!config.customFields || config.customFields.length === 0) ? (
                <div className="p-6 text-center text-gray-400 text-xs bg-[#FAF8F5] border border-[#E2E0DB] rounded">
                  No custom fields configured. Click &quot;Add Custom Dropdown / Field&quot; above to create one.
                </div>
              ) : (
                config.customFields.map((field, fIdx) => (
                  <div key={field.id || fIdx} className="p-4 bg-[#FAF8F5] border border-[#E2E0DB] rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-gray-400 text-xs">Field #{fIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(fIdx)}
                        className="text-gray-400 hover:text-red-700 p-1"
                        title="Remove Field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Field Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleUpdateCustomField(fIdx, { label: e.target.value })}
                          className="w-full bg-white border border-gray-300 h-8 px-2.5 rounded text-xs font-bold"
                          placeholder="e.g. Research Purpose"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Field Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateCustomField(fIdx, { type: e.target.value as any })}
                          className="w-full bg-white border border-gray-300 h-8 px-2.5 rounded text-xs"
                        >
                          <option value="select">Dropdown Select (Multiple Options)</option>
                          <option value="text">Single Line Text</option>
                          <option value="textarea">Multi-line Text Box</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-4 pt-5">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-700">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => handleUpdateCustomField(fIdx, { required: e.target.checked })}
                            className="rounded text-black"
                          />
                          <span>Required Field</span>
                        </label>
                      </div>
                    </div>

                    {/* Options list for Dropdown Select */}
                    {field.type === 'select' && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Dropdown Select Options (one per line):
                        </label>
                        <textarea
                          rows={3}
                          value={field.options?.join('\n') || ''}
                          onChange={(e) => {
                            const lines = e.target.value
                              .split('\n')
                              .map((l) => l.trim())
                              .filter(Boolean);
                            handleUpdateCustomField(fIdx, { options: lines });
                          }}
                          placeholder="Doctoral Research&#10;Academic Publication&#10;Archival Reading"
                          className="w-full bg-white border border-gray-300 p-2.5 rounded text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Time Slots & Policy Notice */}
          <div className="bg-white border border-[#E2E0DB] rounded p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-900 border-b border-[#E2E0DB] pb-3">
              3. Time Slots &amp; Verification Policy Notice
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Configured Time Slots (one per line)
                </label>
                <textarea
                  rows={5}
                  value={config.timeSlots?.join('\n') || ''}
                  onChange={(e) => {
                    const lines = e.target.value
                      .split('\n')
                      .map((l) => l.trim())
                      .filter(Boolean);
                    setConfig({ ...config, timeSlots: lines });
                  }}
                  className="w-full bg-white border border-gray-300 p-2.5 rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Patron Instructions &amp; Policy Notice
                </label>
                <textarea
                  rows={5}
                  value={config.instructions || ''}
                  onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
                  placeholder="Instructions displayed on the user booking page..."
                  className="w-full bg-white border border-gray-300 p-2.5 rounded text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL MODAL */}
      {approveModalBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Verify &amp; Approve Facility Booking</span>
              </h3>
              <button
                type="button"
                onClick={() => setApproveModalBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded border border-[#E2E0DB] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Scholar:</span>
                <span className="font-bold text-gray-900">{approveModalBooking.user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Facility:</span>
                <span className="font-bold text-gray-900">{approveModalBooking.resourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Date &amp; Slot:</span>
                <span className="font-mono text-gray-900 font-bold">
                  {formatDate(approveModalBooking.date)} · {approveModalBooking.timeSlot}
                </span>
              </div>
              {approveModalBooking.notes && (
                <div className="pt-1 border-t border-gray-200 text-gray-700">
                  <span className="text-gray-500 font-bold">Patron Notes: </span>
                  {approveModalBooking.notes}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Librarian Verification Note / Desk Instructions (optional)
              </label>
              <textarea
                rows={3}
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="e.g. Approved. Assigned Desk #04 with microfilm reader access."
                className="w-full border border-gray-300 p-2.5 rounded text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setApproveModalBooking(null)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-5 py-2 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{actionLoading ? 'Approving…' : 'Confirm & Approve Booking'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectModalBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Decline / Reject Booking Request</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 p-3.5 rounded border border-red-200 text-xs text-red-900">
              Please enter the reason for declining. This verification note will be visible to the scholar in their portal.
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Reason / Note for Scholar <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. The Manuscript Room is reserved for a scheduled workshop during this slot. Please choose an afternoon slot."
                className="w-full border border-gray-300 p-2.5 rounded text-xs outline-none focus:border-red-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading || !rejectNote.trim()}
                className="px-5 py-2 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>{actionLoading ? 'Declining…' : 'Decline Booking'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-gray-700" />
                <span>Edit Facility Booking</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditModalBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex flex-col gap-1">
                <span className="font-bold text-gray-700 uppercase text-[10px]">Resource / Unit</span>
                <input
                  type="text"
                  value={editForm.resourceName || ''}
                  onChange={(e) => setEditForm({ ...editForm, resourceName: e.target.value })}
                  className="border border-gray-300 h-8 px-2.5 rounded"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-gray-700 uppercase text-[10px]">Status</span>
                <select
                  value={editForm.status || 'PENDING'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="border border-gray-300 h-8 px-2.5 rounded font-bold"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-gray-700 uppercase text-[10px]">Date</span>
                <input
                  type="date"
                  value={editForm.date || ''}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="border border-gray-300 h-8 px-2.5 rounded"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-gray-700 uppercase text-[10px]">Time Slot</span>
                <select
                  value={editForm.timeSlot || ''}
                  onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                  className="border border-gray-300 h-8 px-2.5 rounded"
                >
                  {config.timeSlots?.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 col-span-2">
                <span className="font-bold text-gray-700 uppercase text-[10px]">Librarian Verification Note</span>
                <textarea
                  rows={2}
                  value={editForm.adminNote || ''}
                  onChange={(e) => setEditForm({ ...editForm, adminNote: e.target.value })}
                  className="border border-gray-300 p-2 rounded"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditModalBooking(null)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307] flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{actionLoading ? 'Saving…' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
