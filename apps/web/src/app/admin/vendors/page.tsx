'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, CheckCircle2, ShieldAlert, X, Trash2 } from 'lucide-react';
import { PageHeader, Button, Card, Badge } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Vendor {
  id: string;
  name: string;
  type?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  name: '',
  type: '',
  contactPerson: '',
  email: '',
  phone: '',
  notes: '',
};

export default function VendorsAdminPage() {
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await api.getVendors();
      setVendors(data || []);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not load vendors from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const filtered = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.type || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.contactPerson || '').toLowerCase().includes(search.toLowerCase())
  );

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await api.createVendor({
        name: form.name,
        type: form.type || undefined,
        contactPerson: form.contactPerson || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        notes: form.notes || undefined,
      });
      setShowModal(false);
      setForm(emptyForm);
      notify('success', `Vendor "${form.name}" registered successfully.`);
      await loadVendors();
    } catch (err: any) {
      notify('error', err.message || 'Could not register the vendor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (v: Vendor) => {
    if (!confirm(`Deactivate vendor "${v.name}"?`)) return;
    try {
      await api.updateVendor(v.id, { status: v.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
      notify('success', `Vendor "${v.name}" ${v.status === 'ACTIVE' ? 'deactivated' : 'reactivated'}.`);
      await loadVendors();
    } catch (err: any) {
      notify('error', err.message || 'Could not update the vendor status.');
    }
  };

  const handleDelete = async (v: Vendor) => {
    if (!confirm(`Permanently remove vendor "${v.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteVendor(v.id);
      notify('success', `Vendor "${v.name}" removed.`);
      await loadVendors();
    } catch (err: any) {
      notify('error', err.message || 'Could not remove the vendor.');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Supplier Directory"
        title="Vendors & Publisher Partners"
        description="Maintain publisher records, book dealers, binderies, subscription agencies, and supplier contact details."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
            Register New Vendor
          </Button>
        }
      />

      {notification && (
        <div
          className={`p-4 rounded-lg text-sm font-semibold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
              : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Search Bar */}
      <Card className="flex justify-between items-center" padded={false}>
        <div className="p-4 flex justify-between items-center w-full">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendor name, supplier type, contact person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
            />
          </div>
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide shrink-0 ml-4">
            {filtered.length} Registered Vendors
          </span>
        </div>
      </Card>

      {/* Vendors Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading vendors…</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-14">
          <p className="text-base font-semibold text-gray-700">No vendors found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((v) => (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  {v.type && (
                    <span className="text-[11px] uppercase font-semibold text-heritage-red block">
                      {v.type}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{v.name}</h3>
                </div>
                <Badge variant={v.status === 'ACTIVE' ? 'success' : 'neutral'}>{v.status}</Badge>
              </div>

              <div className="text-xs space-y-1.5 text-gray-500 mt-3 pt-3 border-t border-gray-100">
                {v.contactPerson && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Contact:</span>
                    <span>{v.contactPerson}</span>
                  </div>
                )}
                {(v.email || v.phone) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {v.email && (
                      <>
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{v.email}</span>
                      </>
                    )}
                    {v.email && v.phone && <span className="text-gray-300">|</span>}
                    {v.phone && (
                      <>
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{v.phone}</span>
                      </>
                    )}
                  </div>
                )}
                {v.notes && (
                  <div className="text-gray-600">
                    <span className="font-semibold text-gray-900">Notes:</span> {v.notes}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end items-center text-xs gap-2">
                <Button variant="outline" onClick={() => handleDeactivate(v)}>
                  {v.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(v)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                  title="Delete Vendor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Register Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Register New Vendor</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs font-sans max-h-[70vh] overflow-y-auto">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heritage Book Centre Calicut"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Supplier Type</label>
                <input
                  type="text"
                  placeholder="e.g. Malabar & Regional Books"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Contact Person</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-heritage-red text-white rounded text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Registering…' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
