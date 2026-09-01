'use client';

import { useState } from 'react';
import { Archive, Search, Plus, CheckCircle2, FileCheck, ArrowRight, Eye, Clock } from 'lucide-react';
import { Card, PageHeader, Button, Badge, BadgeVariant } from '@/components/admin/ui';

export default function RepositoryAdminPage() {
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'>('ALL');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const submissions = [
    {
      id: 'REP-001',
      title: 'Transmission of Shāfiʿī Jurisprudence in 16th Century Malabar Coast',
      type: 'THESIS',
      author: 'Rashid Vattaparamba (PhD Scholar)',
      advisor: 'Prof. Zakariyya Nadwi',
      department: 'Department of Islamic Studies',
      stage: 'REVIEW',
      submittedDate: '28 Aug 2026',
      doi: '10.5281/zenodo.kmlri.2026.01',
    },
    {
      id: 'REP-002',
      title: 'Arabi-Malayalam Manuscripts: Orthography and Linguistic Dialectology',
      type: 'DISSERTATION',
      author: 'Fathima Maryam (MPhil)',
      advisor: 'Dr. Taha Malabari',
      department: 'Linguistics & Manuscripts',
      stage: 'APPROVED',
      submittedDate: '20 Aug 2026',
      doi: '10.5281/zenodo.kmlri.2026.02',
    },
    {
      id: 'REP-003',
      title: 'Maritime Trade Routes and Port Networks of Malabar: Medieval Inscriptions',
      type: 'FACULTY_PAPER',
      author: 'Dr. Taha Malabari (Associate Professor)',
      department: 'Historical Studies',
      stage: 'PUBLISHED',
      submittedDate: '10 Jul 2026',
      doi: '10.5281/zenodo.kmlri.2026.03',
    },
    {
      id: 'REP-004',
      title: 'Field Survey Dataset: 150 Palm-leaf & Paper Manuscripts in Ponnani',
      type: 'DATASET',
      author: 'KMLRI Conservation Team',
      department: 'Manuscript Conservation Lab',
      stage: 'PUBLISHED',
      submittedDate: '01 Jun 2026',
      doi: '10.5281/zenodo.kmlri.2026.04',
    },
  ];

  const filtered = submissions.filter((s) => {
    const matchesFilter = filter === 'ALL' || s.stage === filter;
    const matchesSearch =
      search === '' ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.author.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePublish = (id: string, title: string) => {
    setNotification(`Repository item #${id} ("${title}") officially published to KMLRI Institutional Repository.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const stageBadgeVariant: Record<string, BadgeVariant> = {
    PUBLISHED: 'success',
    APPROVED: 'accent',
    REVIEW: 'warning',
    DRAFT: 'neutral',
    ARCHIVED: 'neutral',
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Scholarly Output"
        title="Institutional Repository & Theses"
        description="Review academic submissions (Theses, Dissertations, Faculty Articles, Datasets) through the 5-stage institutional publishing workflow."
        actions={
          <Button
            variant="dark"
            icon={Plus}
            onClick={() => {
              setNotification('New Submission Deposit form opened.');
              setTimeout(() => setNotification(null), 3000);
            }}
          >
            Deposit Academic Work
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Workflow Stage Progress Banner */}
      <Card className="bg-gray-50">
        <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide block mb-2">
          Standard Institutional Publishing Workflow
        </span>
        <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
          <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-700">1. Draft (Deposit)</div>
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">2. Review (Editorial)</div>
          <div className="p-2 bg-heritage-red/10 rounded-lg border border-heritage-red/20 text-heritage-red">3. Approved</div>
          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700">4. Published (OPAC &amp; OAI-PMH)</div>
          <div className="p-2 bg-gray-100 rounded-lg border border-gray-200 text-gray-500">5. Archived</div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
          <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">Total Theses &amp; Dissertations</span>
          <div className="text-xl font-bold text-gray-900 mt-1">470</div>
          <div className="text-[11px] font-medium text-gray-400 mt-0.5">Full text open repository</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
          <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">Faculty Articles</span>
          <div className="text-xl font-bold text-gray-900 mt-1">310</div>
          <div className="text-[11px] font-medium text-gray-400 mt-0.5">Peer-reviewed publications</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
          <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">Pending Review</span>
          <div className="text-xl font-bold text-gray-900 mt-1">5 Submissions</div>
          <div className="text-[11px] font-medium text-amber-700 mt-0.5">Requires committee clearance</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
          <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">Open Datasets</span>
          <div className="text-xl font-bold text-gray-900 mt-1">28</div>
          <div className="text-[11px] font-medium text-emerald-600 mt-0.5">DOI &amp; Zenodo linked</div>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-1 flex-wrap bg-gray-100 p-1 rounded-lg w-fit">
          {(['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const).map((tab) => (
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
            placeholder="Search repository titles, authors, DOIs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
      </Card>

      {/* Submissions Table */}
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400">
              <th className="px-3 py-2.5">Title &amp; DOI</th>
              <th className="px-3 py-2.5">Type &amp; Dept</th>
              <th className="px-3 py-2.5">Author &amp; Advisor</th>
              <th className="px-3 py-2.5">Workflow Stage</th>
              <th className="px-3 py-2.5">Submission Date</th>
              <th className="px-3 py-2.5 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3.5">
                  <div className="font-semibold text-sm text-gray-900">{s.title}</div>
                  <div className="text-gray-400 text-[11px] font-mono">DOI: {s.doi}</div>
                </td>
                <td className="px-3 py-3.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-700 block w-max mb-1">
                    {s.type}
                  </span>
                  <span className="text-gray-500 text-[11px]">{s.department}</span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="font-semibold text-gray-900">{s.author}</div>
                  {s.advisor && <div className="text-gray-500 text-[11px]">Advisor: {s.advisor}</div>}
                </td>
                <td className="px-3 py-3.5">
                  <Badge variant={stageBadgeVariant[s.stage] || 'neutral'}>{s.stage}</Badge>
                </td>
                <td className="px-3 py-3.5 text-gray-600">{s.submittedDate}</td>
                <td className="px-3 py-3.5 text-right space-x-2">
                  {s.stage === 'REVIEW' && (
                    <button
                      type="button"
                      onClick={() => handlePublish(s.id, s.title)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[11px] font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <FileCheck className="w-3 h-3" />
                      <span>Review &amp; Approve</span>
                    </button>
                  )}
                  {s.stage === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handlePublish(s.id, s.title)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-heritage-red text-white rounded-lg text-[11px] font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>Publish to OPAC</span>
                    </button>
                  )}
                  {s.stage === 'PUBLISHED' && (
                    <button
                      type="button"
                      onClick={() => alert(`View published item #${s.id} in public OPAC`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-300 rounded-lg text-[11px] font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Live</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
