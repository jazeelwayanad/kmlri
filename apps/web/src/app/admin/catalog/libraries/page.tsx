'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, CheckCircle2, ShieldAlert, X, Trash2 } from 'lucide-react';
import { PageHeader, Button, Card, Badge } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Library {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = { code: '', name: '', address: '', phone: '', email: '' };

export default function LibrariesAdminPage() {
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Library | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getLibraries();
      setLibraries(data || []);
    } catch (err: any) {
      notify('error', err.message || 'Could not load libraries from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = libraries.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (l: Library) => {
    setEditing(l);
    setForm({ code: l.code, name: l.name, address: l.address || '', phone: l.phone || '', email: l.email || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        code: form.code,
        name: form.name,
        address: form.address || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
      };
      if (editing) {
        await api.updateLibrary(editing.id, payload);
        notify('success', `Library "${form.name}" updated.`);
      } else {
        await api.createLibrary(payload);
        notify('success', `Library "${form.name}" created.`);
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (err: any) {
      notify('error', err.message || 'Could not save the library.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (l: Library) => {
    try {
      await api.updateLibrary(l.id, { isActive: !l.isActive });
      notify('success', `Library "${l.name}" ${l.isActive ? 'deactivated' : 'reactivated'}.`);
      await load();
    } catch (err: any) {
      notify('error', err.message || 'Could not update the library status.');
    }
  };

  const handleDelete = async (l: Library) => {
    if (!confirm(`Permanently remove library "${l.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteLibrary(l.id);
      notify('success', `Library "${l.name}" removed.`);
      await load();
    } catch (err: any) {
      notify('error', err.message || 'Could not remove the library.');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Catalogue · Branches"
        title="Libraries & Branches"
        description="Maintain the library branch registry used as home/current holding locations for item copies and serial subscriptions."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Add Library
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
              placeholder="Search library name or branch code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
            />
          </div>
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide shrink-0 ml-4">
            {filtered.length} Branches
          </span>
        </div>
      </Card>

      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading libraries…</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-14">
          <p className="text-base font-semibold text-gray-700">No libraries found.</p>
        </Card>
      ) : (
        <Card padded={false}>
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{l.code}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-900">{l.name}</div>
                    {l.address && <div className="text-gray-500">{l.address}</div>}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <div className="flex flex-col gap-0.5">
                      {l.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {l.email}
                        </span>
                      )}
                      {l.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" /> {l.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={l.isActive ? 'success' : 'neutral'}>{l.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="outline" onClick={() => openEdit(l)}>
                        Edit
                      </Button>
                      <Button variant="outline" onClick={() => handleToggleActive(l)}>
                        {l.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDelete(l)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        title="Delete Library"
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
              <h3 className="font-bold text-gray-900 text-sm">{editing ? 'Edit Library' : 'Add Library'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAIN"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Library"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                  {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
