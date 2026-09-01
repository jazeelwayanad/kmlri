'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  Plus, 
  Mail, 
  X, 
  Check, 
  FileText, 
  Paperclip, 
  Save, 
  Send, 
  Globe, 
  Star, 
  Award,
  Filter,
  Search
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

interface Application {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  appliedDate: string;
  proposalName: string;
  cvName: string;
  status: 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEWED' | 'SELECTED' | 'REJECTED';
  reviewerScore?: number;
  reviewerNotes?: string;
}

export default function ManageOpportunityDetailPage() {
  const params = useParams();
  const oppSlugOrId = params?.id as string;

  const [activeTab, setActiveTab] = useState<'candidates' | 'edit' | 'decisions'>('candidates');
  const [notification, setNotification] = useState<string | null>(null);

  // Opportunity State
  const [oppData, setOppData] = useState<any>({
    id: 'OPP-01',
    title: '2026–2027 Residential Research Fellowships in Malabar Studies',
    slug: 'residential-research-fellowships-malabar-studies-2026',
    kicker: 'Research Fellowships',
    excerpt: 'Stipendiary 6-month residential fellowships for postdoctoral and doctoral scholars.',
    programDescription: 'Fellows receive unrestricted access to rare manuscripts, conservation labs, and private collections, plus a monthly stipend.',
    criteria: 'Scholars holding or pursuing a PhD in Islamic Studies, Indian Ocean History, or South Asian Linguistics.',
    deadline: '30 November 2026',
    stipend: '₹45,000 / month + On-campus Housing',
    venue: 'KMLRI Research Wing, Calicut',
    capacity: 4,
    featured: true,
    status: 'PUBLISHED',
    enableApplication: true,
  });

  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'APP-101',
      name: 'Dr. Zayd Al-Hasan',
      email: 'zayd@ox.ac.uk',
      affiliation: 'University of Oxford (Faculty of Asian Studies)',
      appliedDate: '18 Aug 2026',
      proposalName: 'Proposal_Zayd_Ponnani_Seafaring_Contracts.pdf',
      cvName: 'CV_Zayd_AlHasan.pdf',
      status: 'SHORTLISTED',
      reviewerScore: 5,
      reviewerNotes: 'Exceptional archival proposal focusing on 18th-century maritime legal deeds.',
    },
    {
      id: 'APP-102',
      name: 'Maryam Siddiqa',
      email: 'maryam.s@aligarh.edu',
      affiliation: 'Aligarh Muslim University',
      appliedDate: '21 Aug 2026',
      proposalName: 'Proposal_Maryam_Arabi_Malayalam_Liturgy.pdf',
      cvName: 'CV_Maryam_Siddiqa.pdf',
      status: 'SELECTED',
      reviewerScore: 5,
      reviewerNotes: 'Strong paleography background with verified mastery of Arabic-Malayalam orthography.',
    },
    {
      id: 'APP-103',
      name: 'Muhammed Nihal',
      email: 'nihal@uoc.ac.in',
      affiliation: 'University of Calicut (MLIS)',
      appliedDate: '25 Aug 2026',
      proposalName: 'Proposal_Nihal_Metadata_Encoding.pdf',
      cvName: 'Resume_Nihal.pdf',
      status: 'UNDER_REVIEW',
      reviewerScore: 4,
      reviewerNotes: 'Solid MLIS credentials; recommended for internship or junior fellowship.',
    },
    {
      id: 'APP-104',
      name: 'Dr. John Mathew',
      email: 'jmathew@soas.ac.uk',
      affiliation: 'SOAS University of London',
      appliedDate: '28 Aug 2026',
      proposalName: 'Proposal_Mathew_Zamorin_Dutch_Treaties.pdf',
      cvName: 'CV_John_Mathew.pdf',
      status: 'INTERVIEWED',
      reviewerScore: 4,
      reviewerNotes: 'Interview conducted on 30 Aug. Awaiting final committee consensus.',
    },
  ]);

  const [searchCandidate, setSearchCandidate] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  // Candidate Dossier Modal
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);

  // Decision Broadcast Form State
  const [decisionType, setDecisionType] = useState<'OFFER' | 'SHORTLIST' | 'REGRET'>('OFFER');
  const [decisionSubject, setDecisionSubject] = useState('KMLRI Research Fellowship 2026–2027: Formal Offer of Selection');
  const [decisionBody, setDecisionBody] = useState(
    'Dear Candidate,\n\nOn behalf of the Academic Advisory Board of Kunhīn Musliyār Library & Research Institute, we are pleased to offer you the 2026–2027 Residential Research Fellowship in Malabar Studies.\n\nPlease review the attached fellowship agreement and return your confirmation by 15 November 2026.'
  );

  useEffect(() => {
    const slug = (oppSlugOrId || '').toLowerCase();
    if (slug.includes('internship') || slug.includes('metadata')) {
      setOppData({
        id: 'OPP-02',
        title: 'Archival Manuscript Digitisation & Metadata Internship (Winter 2026)',
        slug: 'manuscript-digitisation-metadata-internship-2026',
        kicker: 'Graduate Internship',
        excerpt: 'Paid 8-week internship for graduate students in library & information science.',
        programDescription: 'Hands-on exposure to IIIF ingestion, Dublin Core tagging, and archival handling of 18th-century paper manuscripts.',
        criteria: 'Enrolled in MLIS or archival studies program. Basic Arabic reading ability preferred.',
        deadline: '15 December 2026',
        stipend: '₹22,000 / month',
        venue: 'Conservation & Digitization Lab',
        capacity: 3,
        featured: false,
        status: 'PUBLISHED',
        enableApplication: true,
      });
    } else if (slug.includes('call-for-papers') || slug.includes('codicology')) {
      setOppData({
        id: 'OPP-03',
        title: 'Call for Papers: 3rd International Indian Ocean Codicology Symposium',
        slug: 'call-for-papers-indian-ocean-codicology-symposium',
        kicker: 'Call for Papers',
        excerpt: 'Submissions invited on scribal traditions, watermark chronologies, and littoral text transmission.',
        programDescription: 'Selected peer-reviewed papers will be published in the KMLRI Journal of Manuscript Studies.',
        criteria: 'Original research papers with primary source archival documentation.',
        deadline: '10 December 2026',
        stipend: 'Travel Grants & Publication',
        venue: 'Hybrid / KMLRI Auditorium',
        capacity: 30,
        featured: false,
        status: 'PUBLISHED',
        enableApplication: true,
      });
    }
  }, [oppSlugOrId]);

  const handleUpdateStatus = (id: string, newStatus: Application['status']) => {
    setApplications(
      applications.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate({ ...selectedCandidate, status: newStatus });
    }
    setNotification(`Applicant status updated to "${newStatus.replace(/_/g, ' ')}".`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveOppEdits = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Opportunity details & eligibility criteria updated successfully.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendDecision = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(`Decision notifications successfully dispatched.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredCandidates = applications.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchCandidate.toLowerCase()) ||
      a.email.toLowerCase().includes(searchCandidate.toLowerCase()) ||
      a.affiliation.toLowerCase().includes(searchCandidate.toLowerCase());

    const matchesStage = stageFilter === 'ALL' || a.status === stageFilter;

    return matchesSearch && matchesStage;
  });

  const selectedCount = applications.filter((a) => a.status === 'SELECTED').length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEWED').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      {/* Top Breadcrumb & Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Link
          href="/admin/website/opportunities"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#A52307] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Opportunities</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/opportunities/${oppData.slug}`}
            target="_blank"
            className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Public Page</span>
          </Link>
          <button
            type="button"
            onClick={() => alert('Exporting Candidate Applications Ledger (CSV)')}
            className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Applications CSV</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Opportunity Header Banner Card */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase bg-[#A52307] text-white px-2 py-0.5 rounded">
                {oppData.kicker}
              </span>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                {oppData.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {oppData.title}
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-1">
              /{oppData.slug} · ID: {oppData.id}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600 mt-2 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <Award className="w-3.5 h-3.5" />
                <span>{oppData.stipend}</span>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Deadline: {oppData.deadline}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{oppData.venue}</span>
              </span>
            </div>
          </div>

          {/* Quick Pipeline Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-[#FAF8F5] p-3 rounded border border-[#E2E0DB] text-center text-xs w-full md:w-auto">
            <div className="px-3 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Total Applicants</span>
              <span className="text-xl font-bold text-gray-900 mt-0.5 block">{applications.length}</span>
            </div>
            <div className="px-3 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Shortlisted</span>
              <span className="text-xl font-bold text-blue-700 mt-0.5 block">{shortlistedCount}</span>
            </div>
            <div className="px-3">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Selected</span>
              <span className="text-xl font-bold font-mono text-emerald-700 mt-0.5 block">
                {selectedCount} / {oppData.capacity} Seats
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E0DB] flex gap-2 flex-wrap">
        {[
          { key: 'candidates', label: `Applicant Review Pipeline (${applications.length})`, icon: Users },
          { key: 'edit', label: 'Edit Opportunity & Eligibility', icon: Edit3 },
          { key: 'decisions', label: 'Decision Letters & Notifications', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'border-[#A52307] text-[#A52307]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Applicant Review Pipeline */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates by name, email, university..."
                value={searchCandidate}
                onChange={(e) => setSearchCandidate(e.target.value)}
                className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
              >
                <option value="ALL">All Pipeline Stages</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEWED">Interviewed</option>
                <option value="SELECTED">Selected / Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Candidate &amp; University</th>
                  <th className="py-3 px-4">Research Proposal &amp; CV</th>
                  <th className="py-3 px-4">Score / Rating</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEECE7]">
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{c.id}</td>
                    <td className="py-3.5 px-4">
                      <strong className="text-gray-900 block text-sm">{c.name}</strong>
                      <span className="text-gray-600 font-semibold text-[11px] block">{c.affiliation}</span>
                      <span className="text-gray-400 font-mono text-[10px]">{c.email}</span>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <button
                        type="button"
                        onClick={() => alert(`Downloading Research Proposal: ${c.proposalName}`)}
                        className="block text-[#A52307] hover:underline font-bold text-[11px]"
                      >
                        📄 {c.proposalName}
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Downloading CV: ${c.cvName}`)}
                        className="block text-gray-600 hover:underline text-[10px] font-mono"
                      >
                        📎 {c.cvName}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      {c.reviewerScore ? (
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          {'★'.repeat(c.reviewerScore)}
                          <span className="text-gray-600 text-[10px] font-mono ml-1">({c.reviewerScore}/5)</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unrated</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{c.appliedDate}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateStatus(c.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border outline-none ${
                          c.status === 'SELECTED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : c.status === 'SHORTLISTED'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : c.status === 'INTERVIEWED'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : c.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEWED">Interviewed</option>
                        <option value="SELECTED">Selected / Accepted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCandidate(c)}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors"
                      >
                        Review Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Edit Opportunity Details */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveOppEdits} className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs font-sans">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Program Scope &amp; Fellowship Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">Edit eligibility criteria, stipend amounts, and deadline.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-gray-800 block mb-1">Opportunity Title</label>
              <input
                type="text"
                value={oppData.title}
                onChange={(e) => setOppData({ ...oppData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">URL Slug</label>
              <input
                type="text"
                value={oppData.slug}
                onChange={(e) => setOppData({ ...oppData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Program Type / Kicker</label>
              <input
                type="text"
                value={oppData.kicker}
                onChange={(e) => setOppData({ ...oppData, kicker: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Monthly Stipend / Grant</label>
              <input
                type="text"
                value={oppData.stipend}
                onChange={(e) => setOppData({ ...oppData, stipend: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Application Deadline</label>
              <input
                type="text"
                value={oppData.deadline}
                onChange={(e) => setOppData({ ...oppData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Seats / Available Positions</label>
              <input
                type="number"
                value={oppData.capacity}
                onChange={(e) => setOppData({ ...oppData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-800 block mb-1">Eligibility Criteria</label>
              <input
                type="text"
                value={oppData.criteria}
                onChange={(e) => setOppData({ ...oppData, criteria: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-800 block mb-1">Full Program Description &amp; Scope (Markdown)</label>
              <textarea
                rows={8}
                value={oppData.programDescription}
                onChange={(e) => setOppData({ ...oppData, programDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E0DB] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Opportunity Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Decision Letters */}
      {activeTab === 'decisions' && (
        <form onSubmit={handleSendDecision} className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs font-sans">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Send Candidate Decision Notifications</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Dispatch formal offer letters, interview invitations, or decision updates to candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'OFFER', label: 'Selection / Offer Letter', desc: `Send to ${selectedCount} selected candidates` },
              { id: 'SHORTLIST', label: 'Interview Invitation', desc: `Send to ${shortlistedCount} shortlisted candidates` },
              { id: 'REGRET', label: 'Regret Notice', desc: 'Send to unselected applicants' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDecisionType(d.id as any)}
                className={`p-3 border rounded text-left transition-colors cursor-pointer ${
                  decisionType === d.id ? 'border-black bg-[#FAF8F5] shadow-xs' : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <strong className="text-gray-900 block text-xs">{d.label}</strong>
                <span className="text-gray-500 text-[10px] mt-0.5 block">{d.desc}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="font-bold text-gray-800 block mb-1">Email Subject</label>
            <input
              type="text"
              value={decisionSubject}
              onChange={(e) => setDecisionSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none font-semibold"
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-800 block mb-1">Decision Letter Body</label>
            <textarea
              rows={6}
              value={decisionBody}
              onChange={(e) => setDecisionBody(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded font-sans text-xs text-gray-900 focus:border-[#A52307] outline-none"
              required
            />
          </div>

          <div className="pt-4 border-t border-[#E2E0DB] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Decision Letters</span>
            </button>
          </div>
        </form>
      )}

      {/* POPUP MODAL: Candidate Review Dossier */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <div>
                <span className="text-gray-500 font-mono text-[10px] block">{selectedCandidate.id}</span>
                <h3 className="font-bold text-gray-900 text-sm">{selectedCandidate.name} · Candidate Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="bg-[#FAF8F5] p-4 rounded border border-[#E2E0DB] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block text-[11px]">Affiliation:</span>
                  <strong className="text-gray-900">{selectedCandidate.affiliation}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Email:</span>
                  <strong className="text-gray-900 font-mono">{selectedCandidate.email}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Applied Date:</span>
                  <span className="text-gray-700 font-mono">{selectedCandidate.appliedDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Review Stage:</span>
                  <span className="font-bold text-[#A52307] uppercase">{selectedCandidate.status.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-gray-800 block">Submitted Files &amp; Proposal:</span>
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-white border border-gray-200 rounded flex justify-between items-center">
                    <div>
                      <strong className="text-gray-900 block">{selectedCandidate.proposalName}</strong>
                      <span className="text-gray-400 text-[10px]">Research Proposal · 5 Pages PDF</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading proposal ${selectedCandidate.proposalName}`)}
                      className="px-3 py-1 bg-black text-white rounded text-[10px] font-bold hover:bg-[#A52307]"
                    >
                      Download PDF
                    </button>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded flex justify-between items-center">
                    <div>
                      <strong className="text-gray-900 block">{selectedCandidate.cvName}</strong>
                      <span className="text-gray-400 text-[10px]">Curriculum Vitae</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading CV ${selectedCandidate.cvName}`)}
                      className="px-3 py-1 bg-black text-white rounded text-[10px] font-bold hover:bg-[#A52307]"
                    >
                      Download CV
                    </button>
                  </div>
                </div>
              </div>

              {selectedCandidate.reviewerNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
                  <strong className="block text-[11px] mb-0.5">Reviewer Assessment Notes:</strong>
                  <p>{selectedCandidate.reviewerNotes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-[#E2E0DB] flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700">Update Stage:</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedCandidate.id, 'SHORTLISTED')}
                    className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded font-bold hover:bg-blue-200"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedCandidate.id, 'SELECTED')}
                    className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold hover:bg-emerald-200"
                  >
                    Select Candidate
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-1.5 bg-black text-white rounded font-bold hover:bg-[#A52307]"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
