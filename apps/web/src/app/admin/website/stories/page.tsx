'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  Image as ImageIcon,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  Star,
  Calendar,
  X,
  Upload,
  Globe,
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

export default function WebsiteStoriesPage() {
  const [stories, setStories] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const loadStories = async () => {
    setLoading(true);
    try {
      const res = await api.getContentItems({ category: 'Stories' });
      setStories(res.items);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err.message || 'Could not load stories from the server.');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  // Modal State (Used for both Create and Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [kicker, setKicker] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Staff Researcher');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [imageUrl, setImageUrl] = useState<string | undefined>('');
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingStoryId(null);
    setTitle('');
    setSlug('');
    setKicker('Feature Essay');
    setExcerpt('');
    setContent('');
    setAuthor('Editorial Staff');
    setTags('Manuscripts, History');
    setFeatured(false);
    setStatus('ACTIVE');
    setImageUrl('');
    setShowModal(true);
  };

  const openEditModal = (story: ContentItem) => {
    setEditingStoryId(story.id);
    setTitle(story.title);
    setSlug(story.slug);
    setKicker(story.kicker || 'Feature Essay');
    setExcerpt(story.summary);
    setContent(story.content || '');
    setAuthor(story.author || '');
    setTags((story.tags || []).join(', '));
    setFeatured(!!story.featured);
    setStatus(story.status === 'DRAFT' ? 'DRAFT' : story.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE');
    setImageUrl(story.imageUrl || '');
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingStoryId) {
      setSlug(slugify(val));
    }
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: Partial<ContentItem> = {
      category: 'STORY',
      title,
      slug: slug || slugify(title),
      kicker,
      summary: excerpt,
      content,
      author,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      featured,
      status,
      imageUrl: imageUrl || undefined,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    setSaving(true);
    try {
      if (editingStoryId) {
        await api.updateContentItem(editingStoryId, payload);
        setNotificationType('success');
        setNotification(`Story "${title}" updated successfully.`);
      } else {
        await api.createContentItem(payload);
        setNotificationType('success');
        setNotification(`Story "${title}" published successfully.`);
      }
      setShowModal(false);
      await loadStories();
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not save the story.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!(await confirmDialog({ message: `Are you sure you want to permanently delete story "${name}"?`, variant: 'danger' }))) return;
    try {
      await api.deleteContentItem(id);
      setNotificationType('success');
      setNotification(`Story "${name}" deleted successfully.`);
      await loadStories();
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not delete this story.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const columns: ColumnDef<ContentItem>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Article Title & Slug" />,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="max-w-sm">
            <div className="flex items-center gap-1.5 mb-0.5">
              {s.featured && (
                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                  Featured
                </span>
              )}
              <span className="font-bold text-gray-900 text-sm block line-clamp-1">{s.title}</span>
            </div>
            <span className="font-mono text-gray-400 text-[11px] block">/{s.slug}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'kicker',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kicker" />,
      cell: ({ row }) => (
        <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded">
          {row.original.kicker || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'author',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
      cell: ({ row }) => <span className="font-semibold text-gray-800">{row.original.author}</span>,
    },
    {
      accessorKey: 'tags',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tags" />,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.tags || []).map((t: string, idx: number) => (
            <span key={idx} className="bg-[#FAF8F5] text-gray-600 border border-[#E2E0DB] px-1.5 py-0.5 rounded text-[10px]">
              #{t}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => <span className="text-gray-600 font-mono text-xs">{row.original.date}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge variant={s === 'ACTIVE' ? 'success' : s === 'DRAFT' ? 'warning' : 'neutral'}>
            {s}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const s = row.original;
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
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Story Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link prefetch href={`/stories/${s.slug}`} target="_blank" className="cursor-pointer">
                    <Globe className="mr-2 h-4 w-4" />
                    <span>View Public Page</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditModal(s)} className="cursor-pointer">
                  <Edit3 className="mr-2 h-4 w-4" />
                  <span>Edit Story</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(s.id, s.title)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Story</span>
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
        eyebrow="Website Management · Editorial"
        title="Stories &amp; Feature Articles"
        description="Create, edit, publish, and manage long-form scholarly essays, conservation stories, and archival discoveries featured on the public website."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Write New Story
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
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Published Stories</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{stories.length} Articles</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Featured on Homepage</span>
          <span className="text-2xl font-bold text-heritage-red mt-1 block">
            {stories.filter((s) => s.featured).length} Featured
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Draft Stories</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">
            {stories.filter((s) => s.status === 'DRAFT').length} Drafts
          </span>
        </div>
      </div>

      {/* TanStack Stories Data Table */}
      <DataTable
        columns={columns}
        data={stories}
        loading={loading}
        enableRowSelection
        searchKey="title"
        searchPlaceholder="Filter stories by title..."
        emptyTitle="No stories found"
        emptyMessage="No essays or feature stories published yet. Create one with the button above."
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

      {/* POPUP MODAL: Create / Edit Story */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center sticky top-0 bg-[#FAF8F5] z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-50 text-[#A52307] border border-red-100 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingStoryId ? 'Edit Scholarly Story' : 'Create New Scholarly Story'}
                  </h3>
                  <span className="text-[11px] text-gray-500">Public reading room article with rich formatting</span>
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

            <form onSubmit={handleSaveStory} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Article Title <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Preserving the 18th Century Maritime Manuscripts of Ponnāni"
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
                    placeholder="preserving-18th-century-maritime-manuscripts"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Eyebrow / Kicker</label>
                  <input
                    type="text"
                    value={kicker}
                    onChange={(e) => setKicker(e.target.value)}
                    placeholder="e.g. Conservation Spotlight"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Author / Contributor</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Dr. Fatima Zahra"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Short Excerpt / Summary</label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="A brief 1-2 sentence lead paragraph shown on story cards..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Full Article Content</label>
                  <RichTextEditor value={content} onChange={setContent} placeholder="Write your article. Insert images with the toolbar." />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField value={imageUrl} onChange={setImageUrl} label="Featured Image" />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Manuscripts, Maritime, Conservation"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                  {tags.trim() && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.split(',').map((t) => t.trim()).filter(Boolean).map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-[#FAF8F5] text-gray-700 border border-[#E2E0DB] px-2 py-0.5 rounded text-[10px]">
                          #{t}
                          <button
                            type="button"
                            onClick={() =>
                              setTags(
                                tags
                                  .split(',')
                                  .map((x) => x.trim())
                                  .filter((x) => x && x !== t)
                                  .join(', '),
                              )
                            }
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Publication Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'DRAFT' | 'ARCHIVED')}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none bg-white"
                  >
                    <option value="ACTIVE">Active (Published)</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E0DB] flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                  />
                  <span className="font-bold text-gray-800">Pin as Featured Story on Homepage Hero</span>
                </label>

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
                    {saving ? 'Saving…' : editingStoryId ? 'Save Changes' : 'Publish Story'}
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
