'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle2, ShieldAlert, X, Trash2 } from 'lucide-react';
import { PageHeader, Button, Card, Badge } from '@/components/admin/ui';
import { api } from '@/lib/api';
import { confirmDialog } from '@/lib/dialog';

interface ItemType {
  id: string;
  code: string;
  description: string;
  isSerial: boolean;
  loanDurationDays?: number | null;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = { code: '', description: '', isSerial: false, loanDurationDays: '' };

export default function ItemTypesAdminPage() {
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ItemType | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getItemTypes();
      setItemTypes(data || []);
    } catch (err: any) {
      notify('error', err.message || 'Could not load item types from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = itemTypes.filter(
    (it) =>
      it.description.toLowerCase().includes(search.toLowerCase()) ||
      it.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (it: ItemType) => {
    setEditing(it);
    setForm({
      code: it.code,
      description: it.description,
      isSerial: it.isSerial,
      loanDurationDays: it.loanDurationDays != null ? String(it.loanDurationDays) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        code: form.code,
        description: form.description,
        isSerial: form.isSerial,
        loanDurationDays: form.loanDurationDays ? parseInt(form.loanDurationDays, 10) : undefined,
      };
      if (editing) {
        await api.updateItemType(editing.id, payload);
        notify('success', `Item type "${form.description}" updated.`);
      } else {
        await api.createItemType(payload);
        notify('success', `Item type "${form.description}" created.`);
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (err: any) {
      notify('error', err.message || 'Could not save the item type.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (it: ItemType) => {
    if (!(await confirmDialog({ message: `Permanently remove item type "${it.description}"? This cannot be undone.`, variant: 'danger' }))) return;
    try {
      await api.deleteItemType(it.id);
      notify('success', `Item type "${it.description}" removed.`);
      await load();
    } catch (err: any) {
      notify('error', err.message || 'Could not remove the item type.');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Catalogue · Item Definitions"
        title="Item Types"
        description="Configure circulating item type definitions used on item copies, including default loan duration and serial designation."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Add Item Type
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

      <Card className="flex justify-between items-center" padded={false}>
        <div className="p-4 flex justify-between items-center w-full">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search item type name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
            />
          </div>
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide shrink-0 ml-4">
            {filtered.length} Item Types
          </span>
        </div>
      </Card>

      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading item types…</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-14">
          <p className="text-base font-semibold text-gray-700">No item types found.</p>
        </Card>
      ) : (
        <Card padded={false}>
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Loan Duration</th>
                <th className="py-3 px-4">Serial</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{it.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{it.description}</td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {it.loanDurationDays != null ? `${it.loanDurationDays} days` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={it.isSerial ? 'info' : 'neutral'}>{it.isSerial ? 'Serial' : 'Standard'}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="outline" onClick={() => openEdit(it)}>
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDelete(it)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        title="Delete Item Type"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">{editing ? 'Edit Item Type' : 'Add Item Type'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans max-h-[70vh] overflow-y-auto">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CIRCULATING_BOOK"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Circulating General Volume"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Loan Duration (days)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Leave blank if not circulating"
                    value={form.loanDurationDays}
                    onChange={(e) => setForm({ ...form, loanDurationDays: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                  />
                </div>
                <label className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    checked={form.isSerial}
                    onChange={(e) => setForm({ ...form, isSerial: e.target.checked })}
                  />
                  <span className="font-bold text-gray-800">Serial item type</span>
                </label>
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
                  {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Item Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
