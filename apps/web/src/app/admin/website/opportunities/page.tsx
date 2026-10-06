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
  Settings2,
  MoreHorizontal
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { api, ContentItem } from '@/lib/api';
import { slugify } from '@/lib/slugs';
import { LoadingTableRow } from '@/components/ui/LoadingSpinner';
import { ImageUploadField } from '@/components/content/ImageUploadField';
import { RichTextEditor } from '@/components/content/RichTextEditor';
import { confirmDialog } from '@/lib/dialog';

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
    if (!(await confirmDialog({ message: `Are you sure you want to permanently delete opportunity "${name}"?`, variant: 'danger' }))) return;
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

  const columns: ColumnDef<ContentItem>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opportunity Title & Slug" />,
      cell: ({ row }) => {
        const opp = row.original;
        return (
          <div className="max-w-sm">
            <div className="flex items-center gap-1.5 mb-0.5">
              {opp.featured && (
                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                  Featured
                </span>
              )}
              <Link
                prefetch
                href={`/admin/website/opportunities/${opp.slug}`}
                className="font-bold text-gray-900 text-sm hover:text-heritage-red transition-colors block line-clamp-1"
              >
                {opp.title}
              </Link>
            </div>
            <span className="font-mono text-gray-400 text-[11px] block">/{opp.slug}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'kicker',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kicker & Stipend" />,
      cell: ({ row }) => {
        const opp = row.original;
        return (
          <div>
            <span className="font-bold text-gray-900 block">{opp.kicker}</span>
            <span className="text-emerald-700 font-semibold text-[11px]">{opp.stipend || 'Stipendiary'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'deadline',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Application Deadline" />,
      cell: ({ row }) => <span className="font-mono font-semibold text-gray-800 text-xs">{row.original.deadline}</span>,
    },
    {
      accessorKey: 'capacity',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Positions / Capacity" />,
      cell: ({ row }) => <span className="font-mono font-bold text-gray-900 text-xs">{row.original.capacity || 4} Seats</span>,
    },
    {
      id: 'applications',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Applications Received" />,
      cell: ({ row }) => (
        <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold font-mono text-xs">
          {row.original.registered || 0} Candidates
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge variant={s === 'ACTIVE' ? 'success' : 'neutral'}>
            {s}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const opp = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Opportunity Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link prefetch href={`/admin/website/opportunities/${opp.slug}`} className="cursor-pointer font-medium">
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span>Manage Applications</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link prefetch href={`/opportunities/${opp.slug}`} target="_blank" className="cursor-pointer">
                    <Globe className="mr-2 h-4 w-4" />
                    <span>View Public Page</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditModal(opp)} className="cursor-pointer">
                  <Edit3 className="mr-2 h-4 w-4" />
                  <span>Edit Details</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(opp.id, opp.title)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Opportunity</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

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
        <div className={`p-4 border rounded-xl text-xs font-semibold flex items-center gap-2 ${notificationType === 'success'
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
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Open Opportunities</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{opportunities.length} Programs</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Candidate Applications</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {opportunities.reduce((acc, cur) => acc + (cur.registered || 0), 0)} Applications
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Active Fellowships</span>
          <span className="text-2xl font-bold text-heritage-red mt-1 block">
            {opportunities.filter((o) => o.featured).length} Featured
          </span>
        </div>
      </div>

      {/* TanStack Opportunities Data Table */}
      <DataTable
        columns={columns}
        data={opportunities}
        loading={loading}
        enableRowSelection
        searchKey="title"
        searchPlaceholder="Filter opportunities by title..."
        emptyTitle="No opportunities found"
        emptyMessage="No institutional opportunities posted yet. Create one with the button above."
        facetedFilters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Archived', value: 'ARCHIVED' },
            ],
          },
        ]}
      />

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
