'use client';

import { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Paperclip, 
  Download, 
  Trash2, 
  Star, 
  X,
  FileCheck
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function WebsiteOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([
    {
      id: 'OPP-01',
      title: '2026–2027 Residential Research Fellowships in Malabar Studies',
      slug: 'residential-research-fellowships-malabar-studies-2026',
      excerpt: 'Stipendiary 6-month residential fellowships for postdoctoral and doctoral scholars.',
      programDescription: 'Fellows receive unrestricted access to rare manuscripts, conservation labs, and private collections, plus a monthly stipend.',
      criteria: 'Scholars holding or pursuing a PhD in Islamic Studies, Indian Ocean History, or South Asian Linguistics.',
      deadline: '30 November 2026',
      featured: true,
      status: 'PUBLISHED',
      enableApplication: true,
      customFields: [
        { id: 'f1', label: 'Research Proposal (Max 5 pages PDF)', type: 'file', required: true },
        { id: 'f2', label: 'Curriculum Vitae (PDF)', type: 'file', required: true },
        { id: 'f3', label: 'Primary Language Proficiency', type: 'text', required: true },
      ],
      applications: [
        { id: 'APP-101', name: 'Dr. Zayd Al-Hasan', email: 'zayd@ox.ac.uk', affiliation: 'University of Oxford', proposalFile: 'Proposal_Zayd_Ponnani_Seafaring.pdf', cvFile: 'CV_Zayd.pdf', status: 'UNDER_REVIEW' },
        { id: 'APP-102', name: 'Maryam Siddiqa', email: 'maryam.s@aligarh.edu', affiliation: 'AMU Aligarh', proposalFile: 'Proposal_Maryam_Arabi_Malayalam_Liturgy.pdf', cvFile: 'CV_Maryam.pdf', status: 'SHORTLISTED' },
      ],
    },
    {
      id: 'OPP-02',
      title: 'Archival Manuscript Digitisation & Metadata Internship (Winter 2026)',
      slug: 'manuscript-digitisation-metadata-internship-2026',
      excerpt: 'Paid 8-week internship for graduate students in library & information science.',
      programDescription: 'Hands-on exposure to IIIF ingestion, Dublin Core tagging, and archival handling of 18th-century paper manuscripts.',
      criteria: 'Enrolled in MLIS or archival studies program. Basic Arabic reading ability preferred.',
      deadline: '15 December 2026',
      featured: false,
      status: 'PUBLISHED',
      enableApplication: true,
      customFields: [
        { id: 'f1', label: 'Resume / CV', type: 'file', required: true },
        { id: 'f2', label: 'Statement of Motivation', type: 'file', required: true },
      ],
      applications: [
        { id: 'APP-201', name: 'Suhail K. P.', email: 'suhail@uoc.ac.in', affiliation: 'Calicut University MLIS', proposalFile: 'Motivation_Suhail.pdf', cvFile: 'Resume_Suhail.pdf', status: 'UNDER_REVIEW' },
      ],
    },
  ]);

  const [search, setSearch] = useState('');
  const [selectedOppForReview, setSelectedOppForReview] = useState<any | null>(null);
  
  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [criteria, setCriteria] = useState('');
  const [deadline, setDeadline] = useState('');
  const [featured, setFeatured] = useState(false);
  const [enableApplication, setEnableApplication] = useState(true);
  const [customFields, setCustomFields] = useState<any[]>([
    { id: 'f1', label: 'Research Proposal / Statement (PDF)', type: 'file', required: true },
    { id: 'f2', label: 'Curriculum Vitae (PDF)', type: 'file', required: true },
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('file');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleAddField = () => {
    if (!newFieldLabel) return;
    setCustomFields([
      ...customFields,
      { id: `f-${Date.now()}`, label: newFieldLabel, type: newFieldType, required: newFieldRequired },
    ]);
    setNewFieldLabel('');
  };

  const handleRemoveField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    const newOpp = {
      id: `OPP-${Date.now().toString().slice(-4)}`,
      title,
      slug,
      excerpt,
      programDescription,
      criteria,
      deadline,
      featured,
      status: 'PUBLISHED',
      enableApplication,
      customFields,
      applications: [],
    };
    setOpportunities([newOpp, ...opportunities]);
    setShowModal(false);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setProgramDescription('');
    setCriteria('');
    setDeadline('');
    setNotification(`Opportunity "${title}" published.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStatusChange = (appId: string, nextStatus: string) => {
    if (!selectedOppForReview) return;
    const updatedApps = selectedOppForReview.applications.map((a: any) =>
      a.id === appId ? { ...a, status: nextStatus } : a
    );
    const updatedOpp = { ...selectedOppForReview, applications: updatedApps };
    setSelectedOppForReview(updatedOpp);
    setOpportunities(opportunities.map((o) => o.id === updatedOpp.id ? updatedOpp : o));
    setNotification(`Application #${appId} status updated to ${nextStatus}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const filtered = opportunities.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.criteria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Website Management · Fellowships &amp; Grants"
        title="Opportunities Management"
        description="Publish research fellowships, archival internships, and grant calls. Configure dynamic application forms with proposal/CV uploads and review applicants."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
            Post New Opportunity
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Opportunity Program</th>
              <th className="py-3 px-4">Application Deadline</th>
              <th className="py-3 px-4">Eligibility Summary</th>
              <th className="py-3 px-4">Applications Received</th>
              <th className="py-3 px-4 text-right">Review Desk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((opp) => (
              <tr key={opp.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 max-w-sm">
                  <div className="flex items-center gap-1.5">
                    {opp.featured && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Featured</span>
                      </span>
                    )}
                    <span className="font-bold text-sm text-gray-900 leading-tight block">
                      {opp.title}
                    </span>
                  </div>
                  <span className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">{opp.excerpt}</span>
                  <span className="font-mono text-[10px] text-gray-400">/{opp.slug}</span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{opp.deadline}</td>
                <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">{opp.criteria}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                  {opp.applications.length} Submissions
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedOppForReview(opp)}
                    className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Review Applicants ({opp.applications.length})</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Applications Review Drawer */}
      {selectedOppForReview && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A52307]">Application Review Desk</p>
              <h3 className="font-bold text-gray-900 text-lg">{selectedOppForReview.title}</h3>
              <p className="text-gray-500 text-xs mt-0.5">Deadline: {selectedOppForReview.deadline}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedOppForReview(null)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close Desk
              </button>
            </div>
          </div>

          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">App ID</th>
                <th className="py-3 px-4">Applicant Name &amp; Email</th>
                <th className="py-3 px-4">Affiliation</th>
                <th className="py-3 px-4">Submitted Documents</th>
                <th className="py-3 px-4">Review Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {selectedOppForReview.applications.map((app: any) => (
                <tr key={app.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{app.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block">{app.name}</span>
                    <span className="text-gray-500 text-[11px]">{app.email}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700">{app.affiliation}</td>
                  <td className="py-3.5 px-4 space-y-1">
                    {app.proposalFile && (
                      <button
                        type="button"
                        onClick={() => alert(`Downloading proposal: ${app.proposalFile}`)}
                        className="flex items-center gap-1 text-[#A52307] font-semibold hover:underline font-mono text-[11px]"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{app.proposalFile}</span>
                      </button>
                    )}
                    {app.cvFile && (
                      <button
                        type="button"
                        onClick={() => alert(`Downloading CV: ${app.cvFile}`)}
                        className="flex items-center gap-1 text-gray-700 font-semibold hover:underline font-mono text-[11px]"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{app.cvFile}</span>
                      </button>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-[11px] bg-white text-gray-800 outline-none font-bold"
                    >
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="ACCEPTED">Accepted / Awarded</option>
                      <option value="REJECTED">Declined</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Post Opportunity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Post Research Opportunity / Grant Call</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Program Title*</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs font-semibold text-gray-900"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">URL Slug*</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full border border-gray-200 h-9 px-3 rounded outline-none focus:border-[#A52307] font-mono text-xs text-gray-600 bg-gray-50"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Application Deadline*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30 November 2026"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Excerpt / Brief Summary</label>
                  <textarea
                    rows={2}
                    required
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Program Description &amp; Scope</label>
                  <textarea
                    rows={4}
                    required
                    value={programDescription}
                    onChange={(e) => setProgramDescription(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Eligibility &amp; Submission Criteria</label>
                  <textarea
                    rows={3}
                    required
                    value={criteria}
                    onChange={(e) => setCriteria(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                {/* Configurable Application Form */}
                <div className="col-span-full bg-[#FAF8F5] p-4 border border-[#E2E0DB] rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-gray-900 block text-sm">Online Application Form &amp; Document Uploads</strong>
                      <span className="text-gray-500 text-[11px]">Allow scholars to submit proposals, CVs, and references directly</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={enableApplication}
                        onChange={(e) => setEnableApplication(e.target.checked)}
                        className="rounded text-[#A52307]"
                      />
                      <span>Enable Applications</span>
                    </label>
                  </div>

                  {enableApplication && (
                    <div className="space-y-3 pt-2 border-t border-[#E2E0DB]">
                      <p className="font-bold text-gray-700 uppercase text-[10px]">Required Attachments &amp; Fields</p>
                      <div className="space-y-1.5">
                        {customFields.map((f) => (
                          <div key={f.id} className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{f.label}</span>
                              <span className="text-[10px] text-gray-400 uppercase">({f.type})</span>
                              {f.required && (
                                <span className="text-[10px] text-[#A52307] font-bold">Required</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveField(f.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Field */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Field / Document Name (e.g. Sample Translation, Cover Letter)"
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                          className="flex-1 border border-gray-300 h-9 px-2.5 rounded text-xs outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddField}
                          className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307]"
                        >
                          + Add Document Field
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
