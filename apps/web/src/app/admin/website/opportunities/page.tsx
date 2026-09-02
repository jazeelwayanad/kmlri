'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Download,
  Trash2,
  Star,
  X,
  FileCheck,
  Edit3,
  Globe,
  Settings2
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api, ContentItem } from '@/lib/api';
import { slugify } from '@/lib/slugs';
import { ImageUploadField } from '@/components/content/ImageUploadField';
import { RichTextEditor } from '@/components/content/RichTextEditor';

export default function WebsiteOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.getContentItems({ category: 'Opportunities' });
      setOpportunities(res.items);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err.message || 'Could not load opportunities from the server.');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingOppId, setEditingOppId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [kicker, setKicker] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [deadline, setDeadline] = useState('');
  const [stipend, setStipend] = useState('');
  const [venue, setVenue] = useState('KMLRI Campus');
  const [capacity, setCapacity] = useState(4);
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [imageUrl, setImageUrl] = useState<string | undefined>('');
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingOppId(null);
    setTitle('');
    setSlug('');
    setKicker('Fellowship');
    setExcerpt('');
    setProgramDescription('');
    setEligibilityCriteria('');
    setDeadline('30 Nov 2026');
    setStipend('₹35,000 / month');
    setVenue('KMLRI Research Wing');
    setCapacity(3);
    setFeatured(false);
    setTags('Fellowship, Research');
    setStatus('ACTIVE');
    setImageUrl('');
    setRegistrationEnabled(false);
    setShowModal(true);
  };

  const openEditModal = (opp: ContentItem) => {
    setEditingOppId(opp.id);
    setTitle(opp.title);
    setSlug(opp.slug);
    setKicker(opp.kicker || 'Opportunity');
    setExcerpt(opp.summary);
    setProgramDescription(opp.content || '');
    setEligibilityCriteria(opp.eligibilityCriteria || '');
    setDeadline(opp.deadline || '');
    setStipend(opp.stipend || '');
    setVenue(opp.venue || 'KMLRI Campus');
    setCapacity(opp.capacity || 4);
    setFeatured(!!opp.featured);
    setTags((opp.tags || []).join(', '));
    setStatus(opp.status === 'DRAFT' ? 'DRAFT' : opp.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE');
    setImageUrl(opp.imageUrl || '');
    setRegistrationEnabled(!!opp.registrationEnabled);
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingOppId) {
      setSlug(slugify(val));
    }
  };

  const handleSaveOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: Partial<ContentItem> = {
      category: 'OPPORTUNITY',
      title,
      slug: slug || slugify(title),
      kicker,
      summary: excerpt,
      content: programDescription,
      eligibilityCriteria,
      deadline,
      date: deadline ? `Deadline: ${deadline}` : undefined,
      stipend,
      venue,
      capacity: Number(capacity),
      featured,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status,
      imageUrl: imageUrl || undefined,
      registrationEnabled,
    };

    setSaving(true);
    try {
      if (editingOppId) {
        await api.updateContentItem(editingOppId, payload);
        setNotificationType('success');
        setNotification(`Opportunity "${title}" updated successfully.`);
      } else {
        await api.createContentItem(payload);
        setNotificationType('success');
        setNotification(`Opportunity "${title}" published successfully.`);
      }
      setShowModal(false);
      await loadOpportunities();
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not save the opportunity.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete opportunity "${name}"?`)) return;
    try {
      await api.deleteContentItem(id);
      setNotificationType('success');
      setNotification(`Opportunity "${name}" deleted successfully.`);
      await loadOpportunities();
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not delete this opportunity.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = opportunities.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase()) ||
      o.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Website Management · Fellowships &amp; Placements"
        title="Opportunities &amp; Grants"
        description="Publish research fellowships, conservation internships, grants, and calls for papers. Click 'Manage Pipeline' to review applications."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Post New Opportunity
          </Button>
        }
      />

      {notification && (
        <div className={`p-4 border rounded-xl text-xs font-semibold flex items-center gap-2 ${
          notificationType === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notificationType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification}</span>
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Open Opportunities</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{opportunities.length} Programs</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Candidate Applications</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {opportunities.reduce((acc, cur) => acc + (cur.registered || 0), 0)} Applications
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Active Fellowships</span>
          <span className="text-2xl font-bold text-[#A52307] mt-1 block">
            {opportunities.filter((o) => o.featured).length} Featured
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities by title, slug, summary..."
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
              <th className="py-3 px-4">Opportunity Title &amp; Slug</th>
              <th className="py-3 px-4">Kicker &amp; Stipend</th>
              <th className="py-3 px-4">Application Deadline</th>
              <th className="py-3 px-4">Positions / Capacity</th>
              <th className="py-3 px-4">Applications Received</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                  Loading opportunities...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                  No opportunities found.
                </td>
              </tr>
            ) : filtered.map((opp) => (
              <tr key={opp.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3.5 px-4 max-w-sm">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {opp.featured && (
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                        Featured
                      </span>
                    )}
                    <Link
                      href={`/admin/website/opportunities/${opp.slug}`}
                      className="font-bold text-gray-900 text-sm hover:text-[#A52307] transition-colors block line-clamp-1"
                    >
                      {opp.title}
                    </Link>
                  </div>
                  <span className="font-mono text-gray-400 text-[11px] block">/{opp.slug}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-gray-900 block">{opp.kicker}</span>
                  <span className="text-emerald-700 font-semibold text-[11px]">{opp.stipend || 'Stipendiary'}</span>
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-gray-800">{opp.deadline}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{opp.capacity || 4} Seats</td>
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold font-mono">
                    {opp.registered || 0} Candidates
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    opp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {opp.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <Link
                    href={`/admin/website/opportunities/${opp.slug}`}
                    className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-bold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Manage Pipeline</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditModal(opp)}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3 h-3 inline mr-1" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(opp.id, opp.title)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Delete Opportunity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL: Create / Edit Opportunity */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center sticky top-0 bg-[#FAF8F5] z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-50 text-[#A52307] border border-red-100 flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingOppId ? 'Edit Opportunity Program' : 'Post New Opportunity'}
                  </h3>
                  <span className="text-[11px] text-gray-500">Fellowship, internship, or grant program details</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOpportunity} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Opportunity Title <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. 2026–2027 Residential Research Fellowships in Malabar Studies"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="residential-research-fellowships-malabar-studies-2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Category / Kicker</label>
                  <input
                    type="text"
                    value={kicker}
                    onChange={(e) => setKicker(e.target.value)}
                    placeholder="e.g. Research Fellowships"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Stipend / Honorarium</label>
                  <input
                    type="text"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    placeholder="e.g. ₹45,000 / month + On-campus Housing"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Application Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="e.g. 30 November 2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Positions / Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Location / Department</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. KMLRI Research Wing, Calicut"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Short Excerpt</label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief 1-2 sentence lead summary..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Program Scope &amp; Fellowship Details</label>
                  <RichTextEditor value={programDescription} onChange={setProgramDescription} placeholder="Describe fellowship tenure, research obligations, archive access, and deliverables..." />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Eligibility &amp; Submission Criteria</label>
                  <RichTextEditor value={eligibilityCriteria} onChange={setEligibilityCriteria} placeholder="Who can apply, required documents, submission format..." />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField value={imageUrl} onChange={setImageUrl} label="Featured Image" />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Fellowship, Fully Funded, Research, Stipend"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E0DB] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                    />
                    <span className="font-bold text-gray-800">Pin as Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={registrationEnabled}
                      onChange={(e) => setRegistrationEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                    />
                    <span className="font-bold text-gray-800">Enable Online Registration</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : editingOppId ? 'Save Changes' : 'Post Opportunity'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
