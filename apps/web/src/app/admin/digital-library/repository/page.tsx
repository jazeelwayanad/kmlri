'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle2, AlertCircle, FileCheck, ArrowRight, X } from 'lucide-react';
import { Card, PageHeader, Button, Badge, BadgeVariant } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Submission {
  id: string;
  title: string;
  type: string;
  authorName: string;
  advisorName?: string;
  departmentName?: string;
  stage: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  doi?: string;
  createdAt: string;
}

const STAGE_ORDER = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const;
const NEXT_STAGE: Record<string, string> = { DRAFT: 'REVIEW', REVIEW: 'APPROVED', APPROVED: 'PUBLISHED' };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function RepositoryAdminPage() {
  const [filter, setFilter] = useState<'ALL' | typeof STAGE_ORDER[number]>('ALL');
  const [search, setSearch] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('THESIS');
  const [authorName, setAuthorName] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [doi, setDoi] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getRepositorySubmissions();
      setSubmissions(data || []);
    } catch {
      setNotification({ type: 'error', text: 'Could not load repository submissions from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdvanceStage = async (s: Submission) => {
    const next = NEXT_STAGE[s.stage];
    if (!next) return;
    setActingId(s.id);
    try {
      await api.updateRepositorySubmissionStage(s.id, next);
      setNotification({ type: 'success', text: `"${s.title}" moved to ${next}.` });
      await load();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not update stage.' });
    } finally {
      setActingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createRepositorySubmission({
        title,
        type,
        authorName,
        advisorName: advisorName || undefined,
        departmentName: departmentName || undefined,
        doi: doi || undefined,
      });
      setNotification({ type: 'success', text: `"${title}" deposited as a draft submission.` });
      setShowModal(false);
      setTitle('');
      setAuthorName('');
      setAdvisorName('');
      setDepartmentName('');
      setDoi('');
      await load();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not deposit this submission.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchesFilter = filter === 'ALL' || s.stage === filter;
    const matchesSearch =
      search === '' ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.authorName.toLowerCase().includes(search.toLowerCase()) ||
      (s.departmentName || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stageBadgeVariant: Record<string, BadgeVariant> = {
    PUBLISHED: 'success',
    APPROVED: 'info',
    REVIEW: 'warning',
    DRAFT: 'neutral',
    ARCHIVED: 'neutral',
  };

  const stageCounts = STAGE_ORDER.reduce((acc, s) => ({ ...acc, [s]: submissions.filter((x) => x.stage === s).length }), {} as Record<string, number>);

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Scholarly Output"
        title="Institutional Repository & Theses"
        description="Track academic submissions (theses, dissertations, faculty articles, datasets) through the publishing workflow."
        actions={
          <Button variant="dark" icon={Plus} onClick={() => setShowModal(true)}>
            Deposit Academic Work
          </Button>
        }
      />

      {notification && (
        <div
          className={`p-4 border rounded-lg text-sm font-semibold flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Workflow Stage Progress Banner */}
      <Card className="bg-gray-50">
        <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide block mb-2">Publishing Workflow</span>
        <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
          <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-700">1. Draft ({stageCounts.DRAFT || 0})</div>
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">2. Review ({stageCounts.REVIEW || 0})</div>
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-800">3. Approved ({stageCounts.APPROVED || 0})</div>
          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700">4. Published ({stageCounts.PUBLISHED || 0})</div>
          <div className="p-2 bg-gray-100 rounded-lg border border-gray-200 text-gray-500">5. Archived ({stageCounts.ARCHIVED || 0})</div>
        </div>
      </Card>

      {/* Filters & Search */}
      <Card className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-1 flex-wrap bg-gray-100 p-1 rounded-lg w-fit">
          {(['ALL', ...STAGE_ORDER] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                filter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'ALL' ? 'All Outputs' : tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search repository titles, authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
      </Card>

      {/* Submissions Table */}
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading submissions…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No repository submissions found.</div>
        ) : (
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-3 py-2.5">Title &amp; DOI</th>
                <th className="px-3 py-2.5">Type &amp; Dept</th>
                <th className="px-3 py-2.5">Author &amp; Advisor</th>
                <th className="px-3 py-2.5">Workflow Stage</th>
                <th className="px-3 py-2.5">Submitted</th>
                <th className="px-3 py-2.5 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-sm text-gray-900">{s.title}</div>
                    {s.doi && <div className="text-gray-400 text-[11px] font-mono">DOI: {s.doi}</div>}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-700 block w-max mb-1">{s.type}</span>
                    <span className="text-gray-500 text-[11px]">{s.departmentName || '—'}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-gray-900">{s.authorName}</div>
                    {s.advisorName && <div className="text-gray-500 text-[11px]">Advisor: {s.advisorName}</div>}
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge variant={stageBadgeVariant[s.stage] || 'neutral'}>{s.stage}</Badge>
                  </td>
                  <td className="px-3 py-3.5 text-gray-600">{formatDate(s.createdAt)}</td>
                  <td className="px-3 py-3.5 text-right space-x-2">
                    {s.stage === 'REVIEW' && (
                      <button
                        type="button"
                        disabled={actingId === s.id}
                        onClick={() => handleAdvanceStage(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[11px] font-semibold hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <FileCheck className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                    )}
                    {s.stage === 'APPROVED' && (
                      <button
                        type="button"
                        disabled={actingId === s.id}
                        onClick={() => handleAdvanceStage(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-heritage-red text-white rounded-lg text-[11px] font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>Publish</span>
                      </button>
                    )}
                    {s.stage === 'DRAFT' && (
                      <button
                        type="button"
                        disabled={actingId === s.id}
                        onClick={() => handleAdvanceStage(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-300 rounded-lg text-[11px] font-semibold hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <span>Send to Review</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Deposit Academic Work</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Title*</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-heritage-red text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-200 h-10 px-3 rounded outline-none text-xs bg-white">
                    <option value="THESIS">Thesis</option>
                    <option value="DISSERTATION">Dissertation</option>
                    <option value="FACULTY_PAPER">Faculty Paper</option>
                    <option value="DATASET">Dataset</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">DOI</label>
                  <input value={doi} onChange={(e) => setDoi(e.target.value)} className="w-full border border-gray-200 h-10 px-3 rounded outline-none text-xs" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Author*</label>
                <input required value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full border border-gray-200 h-10 px-3 rounded outline-none text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Advisor</label>
                  <input value={advisorName} onChange={(e) => setAdvisorName(e.target.value)} className="w-full border border-gray-200 h-10 px-3 rounded outline-none text-xs" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Department</label>
                  <input value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="w-full border border-gray-200 h-10 px-3 rounded outline-none text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded text-xs font-semibold text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-heritage-red text-white rounded text-xs font-bold hover:bg-red-800 disabled:opacity-50">
                  {submitting ? 'Depositing…' : 'Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
