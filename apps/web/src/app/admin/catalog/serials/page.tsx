'use client';

import { useState, useEffect } from 'react';
import {
  BookMarked,
  Search,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  FileCheck,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface SerialIssue {
  id: string;
  serialId: string;
  issueLabel: string;
  expectedDate?: string | null;
  receivedDate?: string | null;
  status: 'EXPECTED' | 'RECEIVED' | 'MISSING' | 'CLAIMED';
  createdAt: string;
}

interface Serial {
  id: string;
  title: string;
  shelfmark?: string | null;
  frequency?: string | null;
  publisher?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  issues: SerialIssue[];
}

export default function CatalogueSerialsPage() {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedSerialId, setSelectedSerialId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSerialId, setEditingSerialId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newShelfmark, setNewShelfmark] = useState('');
  const [newFrequency, setNewFrequency] = useState('Monthly');
  const [newPublisher, setNewPublisher] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  // New Issue Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueLabel, setIssueLabel] = useState('');
  const [issueExpectedDate, setIssueExpectedDate] = useState('');
  const [issueSubmitting, setIssueSubmitting] = useState(false);

  const loadSerials = (q?: string) => {
    setLoading(true);
    setError(null);
    api
      .getSerials(q)
      .then((data) => setSerials(data))
      .catch((err: any) => setError(err.message || 'Failed to load serials'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSerials();
  }, []);

  const selectedSerial = serials.find((s) => s.id === selectedSerialId) || null;

  const openCreateModal = () => {
    setEditingSerialId(null);
    setNewTitle('');
    setNewShelfmark('');
    setNewFrequency('Monthly');
    setNewPublisher('');
    setNewNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (s: Serial) => {
    setEditingSerialId(s.id);
    setNewTitle(s.title);
    setNewShelfmark(s.shelfmark || '');
    setNewFrequency(s.frequency || 'Monthly');
    setNewPublisher(s.publisher || '');
    setNewNotes(s.notes || '');
    setShowAddModal(true);
  };

  const handleSubmitSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: newTitle,
        shelfmark: newShelfmark || undefined,
        frequency: newFrequency || undefined,
        publisher: newPublisher || undefined,
        notes: newNotes || undefined,
      };
      if (editingSerialId) {
        await api.updateSerial(editingSerialId, payload);
        setNotification(`Serial publication "${newTitle}" updated.`);
      } else {
        await api.createSerial(payload);
        setNotification(`Serial publication "${newTitle}" registered.`);
      }
      setShowAddModal(false);
      setEditingSerialId(null);
      loadSerials();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save serial');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSerial = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete serial "${title}"?`)) return;
    setError(null);
    try {
      await api.deleteSerial(id);
      setNotification(`Serial "${title}" deleted.`);
      if (selectedSerialId === id) setSelectedSerialId(null);
      loadSerials();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete serial');
    }
  };

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSerial) return;
    setIssueSubmitting(true);
    setError(null);
    try {
      await api.addSerialIssue(selectedSerial.id, {
        issueLabel,
        expectedDate: issueExpectedDate || undefined,
      });
      setShowIssueModal(false);
      setIssueLabel('');
      setIssueExpectedDate('');
      loadSerials();
      setNotification(`Issue "${issueLabel}" added to holdings.`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to add issue');
    } finally {
      setIssueSubmitting(false);
    }
  };

  const handleCheckIn = async (issue: SerialIssue) => {
    setError(null);
    try {
      await api.checkInSerialIssue(issue.id);
      setNotification(`Issue "${issue.issueLabel}" checked in.`);
      loadSerials();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to check in issue');
    }
  };

  const handleMarkMissing = async (issue: SerialIssue) => {
    setError(null);
    try {
      await api.markSerialIssueMissing(issue.id);
      setNotification(`Issue "${issue.issueLabel}" marked missing.`);
      loadSerials();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to mark issue missing');
    }
  };

  const filtered = serials.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.shelfmark || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Periodicals &amp; Serials"
        title="Serials &amp; Periodicals Management"
        description="Track continuous publications, journal subscriptions, archival magazine holdings, and check in new incoming issues."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Add Serial
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search serials by title or shelfmark..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-gray-500 font-semibold">Loading serials...</div>
      ) : (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Serial Title &amp; Shelfmark</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Publisher / Press</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Holdings Desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4">
                    <span className="font-amiri font-bold text-base text-gray-900 block leading-tight">{s.title}</span>
                    <span className="font-mono text-[11px] text-gray-500">
                      {s.shelfmark ? `Shelfmark: ${s.shelfmark}` : `Ref: ${s.id.slice(0, 8)}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700">{s.frequency || '—'}</td>
                  <td className="py-3.5 px-4 text-gray-600">{s.publisher || '—'}</td>
                  <td className="py-3.5 px-4 text-gray-600 max-w-[220px] truncate">{s.notes || '—'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSerialId(s.id)}
                        className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Manage Issues ({s.issues.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(s)}
                        className="p-1.5 text-gray-400 hover:text-gray-900"
                        title="Edit Serial"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSerial(s.id, s.title)}
                        className="p-1.5 text-gray-400 hover:text-[#A52307]"
                        title="Delete Serial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-xs text-gray-500 font-semibold">No serials found.</div>
          )}
        </div>
      )}

      {/* Selected Serial Issue Management Drawer / Modal */}
      {selectedSerial && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A52307]">Issue Check-in Desk</p>
              <h3 className="font-amiri text-2xl font-bold text-gray-900 mt-0.5">{selectedSerial.title}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Showing the 10 most recent issues.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" icon={Plus} onClick={() => setShowIssueModal(true)}>
                Add New Issue
              </Button>
              <button
                type="button"
                onClick={() => setSelectedSerialId(null)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close Desk
              </button>
            </div>
          </div>

          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Issue</th>
                <th className="py-3 px-4">Expected Date</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {selectedSerial.issues.map((iss) => (
                <tr key={iss.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-4 font-bold text-gray-900">{iss.issueLabel}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {iss.expectedDate ? new Date(iss.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {iss.receivedDate ? new Date(iss.receivedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      iss.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' :
                      iss.status === 'MISSING' ? 'bg-red-100 text-red-800' :
                      iss.status === 'CLAIMED' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {iss.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {iss.status !== 'RECEIVED' && (
                        <button
                          type="button"
                          onClick={() => handleCheckIn(iss)}
                          className="px-2.5 py-1 border border-emerald-300 text-emerald-700 rounded text-[11px] font-semibold hover:bg-emerald-50 inline-flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Check In
                        </button>
                      )}
                      {iss.status !== 'MISSING' && iss.status !== 'RECEIVED' && (
                        <button
                          type="button"
                          onClick={() => handleMarkMissing(iss)}
                          className="px-2.5 py-1 border border-red-300 text-red-700 rounded text-[11px] font-semibold hover:bg-red-50 inline-flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Mark Missing
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {selectedSerial.issues.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-center text-gray-500">No issues recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Serial Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingSerialId ? 'Edit Serial Publication' : 'Add Serial Publication'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSerial} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Serial Title*</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Shelfmark</label>
                <input
                  type="text"
                  placeholder="e.g. PER/AL-BAYAN/14"
                  value={newShelfmark}
                  onChange={(e) => setNewShelfmark(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Frequency</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Bi-Annual">Bi-Annual</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Publisher</label>
                <input
                  type="text"
                  value={newPublisher}
                  onChange={(e) => setNewPublisher(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingSerialId ? 'Save Changes' : 'Register Serial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Add New Issue</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIssue} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Issue Label*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vol. 14, Issue 9"
                  value={issueLabel}
                  onChange={(e) => setIssueLabel(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Expected Date</label>
                <input
                  type="date"
                  value={issueExpectedDate}
                  onChange={(e) => setIssueExpectedDate(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issueSubmitting}
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {issueSubmitting ? 'Saving...' : 'Add Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
