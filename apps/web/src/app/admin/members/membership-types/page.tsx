'use client';

import { useState, useEffect } from 'react';
import { KeyRound, Plus, CheckCircle2, ShieldAlert, Edit2, X, Trash2 } from 'lucide-react';
import { PageHeader, Button, Card } from '@/components/admin/ui';
import { api } from '@/lib/api';
import { confirmDialog } from '@/lib/dialog';

interface MembershipType {
  id: string;
  name: string;
  maxBorrowLimit: number;
  loanDurationDays: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  name: '',
  maxBorrowLimit: 5,
  loanDurationDays: 14,
  description: '',
};

export default function MembershipTypesAdminPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MembershipType | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getMembershipTypes();
      setMembershipTypes(data || []);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not load membership types from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (mt: MembershipType) => {
    setEditing(mt);
    setForm({
      name: mt.name,
      maxBorrowLimit: mt.maxBorrowLimit,
      loanDurationDays: mt.loanDurationDays,
      description: mt.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        maxBorrowLimit: Number(form.maxBorrowLimit),
        loanDurationDays: Number(form.loanDurationDays),
        description: form.description || undefined,
      };
      if (editing) {
        await api.updateMembershipType(editing.id, payload);
        notify('success', `Membership type "${form.name}" updated.`);
      } else {
        await api.createMembershipType(payload);
        notify('success', `Membership type "${form.name}" created.`);
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (err: any) {
      notify('error', err.message || 'Could not save the membership type.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mt: MembershipType) => {
    if (!(await confirmDialog({ message: `Delete membership type "${mt.name}"?`, variant: 'danger' }))) return;
    try {
      await api.deleteMembershipType(mt.id);
      notify('success', `Membership type "${mt.name}" deleted.`);
      await load();
    } catch (err: any) {
      notify('error', err.message || 'Could not delete the membership type.');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Administration · Patron Categories"
        title="Membership Types & Quotas"
        description="Define institutional membership tiers, concurrent checkout quotas, and loan durations."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Add Membership Type
          </Button>
        }
      />

      {notification && (
        <div
          className={`p-4 rounded-lg text-sm font-semibold flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
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

      {/* Grid of Membership Types */}
      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading membership types…</div>
      ) : membershipTypes.length === 0 ? (
        <Card className="text-center py-14">
          <p className="text-base font-semibold text-gray-700">No membership types found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {membershipTypes.map((mt) => (
            <Card key={mt.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
                    <KeyRound className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{mt.name}</h3>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-center text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Borrow Limit</span>
                  <span className="font-bold text-lg text-gray-900">{mt.maxBorrowLimit} Books</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Loan Duration</span>
                  <span className="font-bold text-lg text-gray-900">{mt.loanDurationDays} Days</span>
                </div>
              </div>

              {mt.description && (
                <div className="mt-3 text-xs text-gray-600">
                  <strong className="text-gray-900">Description:</strong> {mt.description}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(mt)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Tier Rules</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(mt)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                  title="Delete Membership Type"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">
                {editing ? `Edit "${editing.name}"` : 'Add Membership Type'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Membership Type Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Postgraduate & Research Scholar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Max Borrow Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxBorrowLimit}
                    onChange={(e) => setForm({ ...form, maxBorrowLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none focus:border-heritage-red"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Loan Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.loanDurationDays}
                    onChange={(e) => setForm({ ...form, loanDurationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none focus:border-heritage-red"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Membership Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
