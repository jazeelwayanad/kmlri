'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle2, ShieldAlert, X, Trash2, BookOpenCheck, Link2 } from 'lucide-react';
import { PageHeader, Button, Card, Badge } from '@/components/admin/ui';
import { api } from '@/lib/api';

const HEADING_TYPES = ['PERSONAL_NAME', 'CORPORATE_NAME', 'SUBJECT', 'SERIES', 'UNIFORM_TITLE'];

interface AuthorityRecord {
  id: string;
  headingType: string;
  heading: string;
  seeAlso: string;
  notes?: string | null;
  marcXml?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { headings: number };
}

interface UsageRow {
  headingId: string;
  tag: string;
  subfield?: string | null;
  bibRecord: { id: string; titleLatin: string; titleArabic?: string | null; shelfmark: string };
}

const emptyForm = { headingType: 'PERSONAL_NAME', heading: '', seeAlso: '', notes: '' };

export default function AuthoritiesAdminPage() {
  const [search, setSearch] = useState('');
  const [headingTypeFilter, setHeadingTypeFilter] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [records, setRecords] = useState<AuthorityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AuthorityRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Duplicate-warning flow
  const [duplicateWarning, setDuplicateWarning] = useState<AuthorityRecord | null>(null);

  // Usage panel
  const [usageFor, setUsageFor] = useState<AuthorityRecord | null>(null);
  const [usageRows, setUsageRows] = useState<UsageRow[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.searchAuthorities(search || undefined, headingTypeFilter || undefined);
      setRecords(data || []);
    } catch (err: any) {
      notify('error', err.message || 'Could not load authority records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, headingTypeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDuplicateWarning(null);
    setShowModal(true);
  };

  const openEdit = (r: AuthorityRecord) => {
    setEditing(r);
    let seeAlso: string[] = [];
    try {
      seeAlso = JSON.parse(r.seeAlso || '[]');
    } catch {
      seeAlso = [];
    }
    setForm({ headingType: r.headingType, heading: r.heading, seeAlso: seeAlso.join(', '), notes: r.notes || '' });
    setDuplicateWarning(null);
    setShowModal(true);
  };

  const submitForm = async (force: boolean) => {
    if (!form.heading.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        headingType: form.headingType,
        heading: form.heading,
        seeAlso: form.seeAlso
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        notes: form.notes || undefined,
      };
      if (editing) {
        await api.updateAuthority(editing.id, payload);
        notify('success', `Authority "${form.heading}" updated.`);
        setShowModal(false);
        setDuplicateWarning(null);
        await load();
      } else {
        const result = await api.createAuthority({ ...payload, force });
        if (result.duplicate) {
          setDuplicateWarning(result.existing);
        } else {
          notify('success', `Authority "${form.heading}" created.`);
          setShowModal(false);
          setDuplicateWarning(null);
          await load();
        }
      }
    } catch (err: any) {
      notify('error', err.message || 'Could not save the authority record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(false);
  };

  const handleForceCreate = () => {
    submitForm(true);
  };

  const handleDelete = async (r: AuthorityRecord) => {
    if (!confirm(`Permanently remove authority record "${r.heading}"? This cannot be undone.`)) return;
    try {
      await api.deleteAuthority(r.id);
      notify('success', `Authority "${r.heading}" removed.`);
      await load();
    } catch (err: any) {
      notify('error', err.message || 'Could not remove the authority record.');
    }
  };

  const openUsage = async (r: AuthorityRecord) => {
    setUsageFor(r);
    setLoadingUsage(true);
    try {
      const rows = await api.getAuthorityUsage(r.id);
      setUsageRows(rows || []);
    } catch (err: any) {
      notify('error', err.message || 'Could not load usage for this authority record.');
    } finally {
      setLoadingUsage(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Catalogue · Authority Control"
        title="Authority Records"
        description="Maintain controlled headings (personal names, corporate names, subjects, series, uniform titles) and see which bibliographic records resolve to them — the basis for authority-based cataloguing assistance."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            New Authority Record
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

      <Card padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search heading..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
            />
          </div>
          <select
            value={headingTypeFilter}
            onChange={(e) => setHeadingTypeFilter(e.target.value)}
            className="h-10 border border-gray-200 rounded-lg text-xs px-3 bg-white text-gray-900 font-medium"
          >
            <option value="">All Heading Types</option>
            {HEADING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide shrink-0">
            {records.length} Records
          </span>
        </div>
      </Card>

      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading authority records…</div>
      ) : records.length === 0 ? (
        <Card className="text-center py-14">
          <p className="text-base font-semibold text-gray-700">No authority records found.</p>
        </Card>
      ) : (
        <Card padded={false}>
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Heading</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Used By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{r.heading}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="info">{r.headingType.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => openUsage(r)}
                      className="inline-flex items-center gap-1 text-gray-700 hover:text-heritage-red font-semibold"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      {r._count?.headings ?? 0} record(s)
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="outline" onClick={() => openEdit(r)}>
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        title="Delete Authority Record"
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">{editing ? 'Edit Authority Record' : 'New Authority Record'}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setDuplicateWarning(null);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Possible duplicate heading
                </div>
                <p>
                  An authority record already exists for this heading: <strong>{duplicateWarning.heading}</strong> (
                  {duplicateWarning.headingType.replace(/_/g, ' ')}).
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setDuplicateWarning(null);
                    }}
                    className="px-3 py-1.5 border border-amber-300 rounded text-amber-800 font-semibold"
                  >
                    Use Existing Instead
                  </button>
                  <button
                    type="button"
                    onClick={handleForceCreate}
                    disabled={submitting}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700 disabled:opacity-50"
                  >
                    {submitting ? 'Creating…' : 'Create Anyway'}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans max-h-[70vh] overflow-y-auto">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Heading Type *</label>
                <select
                  value={form.headingType}
                  onChange={(e) => setForm({ ...form, headingType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red bg-white"
                >
                  {HEADING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Authorised/Preferred Heading *</label>
                <input
                  type="text"
                  required
                  value={form.heading}
                  onChange={(e) => setForm({ ...form, heading: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">See-Also / Variant Forms (comma separated)</label>
                <input
                  type="text"
                  value={form.seeAlso}
                  onChange={(e) => setForm({ ...form, seeAlso: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>

              {!duplicateWarning && (
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
                    {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Authority Record'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {usageFor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-heritage-red" />
                <h3 className="font-bold text-gray-900 text-sm">Usage: {usageFor.heading}</h3>
              </div>
              <button onClick={() => setUsageFor(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-xs font-sans max-h-[60vh] overflow-y-auto">
              {loadingUsage ? (
                <div className="text-center text-gray-500 py-6">Loading…</div>
              ) : usageRows.length === 0 ? (
                <div className="text-center text-gray-500 py-6">Not linked to any bibliographic records yet.</div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600 uppercase font-bold">
                      <th className="py-2 pr-2">Record</th>
                      <th className="py-2 pr-2">Shelfmark</th>
                      <th className="py-2 pr-2">MARC Tag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usageRows.map((row) => (
                      <tr key={row.headingId}>
                        <td className="py-2 pr-2 font-semibold text-gray-900">{row.bibRecord.titleLatin}</td>
                        <td className="py-2 pr-2 font-mono text-gray-600">{row.bibRecord.shelfmark}</td>
                        <td className="py-2 pr-2 font-mono text-gray-600">
                          {row.tag}
                          {row.subfield ? `$${row.subfield}` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
