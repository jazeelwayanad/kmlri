'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper,
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
  Globe
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api, ContentItem } from '@/lib/api';
import { slugify } from '@/lib/slugs';
import { ImageUploadField } from '@/components/content/ImageUploadField';
import { RichTextEditor } from '@/components/content/RichTextEditor';
import { confirmDialog } from '@/lib/dialog';

export default function WebsiteNewsPage() {
  const [news, setNews] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await api.getContentItems({ category: 'News' });
      setNews(res.items);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err.message || 'Could not load news bulletins from the server.');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  // Modal State (Used for both Create and Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [kicker, setKicker] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Press & Media Desk');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [imageUrl, setImageUrl] = useState<string | undefined>('');
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingNewsId(null);
    setTitle('');
    setSlug('');
    setKicker('Press Release');
    setExcerpt('');
    setContent('');
    setAuthor('Press & Media Desk');
    setTags('Announcement, News');
    setFeatured(false);
    setStatus('ACTIVE');
    setImageUrl('');
    setShowModal(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingNewsId(item.id);
    setTitle(item.title);
    setSlug(item.slug);
    setKicker(item.kicker || 'Press Release');
    setExcerpt(item.summary);
    setContent(item.content || '');
    setAuthor(item.author || '');
    setTags((item.tags || []).join(', '));
    setFeatured(!!item.featured);
    setStatus(item.status === 'DRAFT' ? 'DRAFT' : item.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE');
    setImageUrl(item.imageUrl || '');
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingNewsId) {
      setSlug(slugify(val));
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: Partial<ContentItem> = {
      category: 'NEWS',
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
      if (editingNewsId) {
        await api.updateContentItem(editingNewsId, payload);
        setNotificationType('success');
        setNotification(`News item "${title}" updated successfully.`);
      } else {
        await api.createContentItem(payload);
        setNotificationType('success');
        setNotification(`News item "${title}" published successfully.`);
      }
      setShowModal(false);
      await loadNews();
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not save the news bulletin.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!(await confirmDialog({ message: `Are you sure you want to permanently delete news bulletin "${name}"?`, variant: 'danger' }))) return;
    try {
      await api.deleteContentItem(id);
      setNotificationType('success');
      setNotification(`News bulletin "${name}" deleted successfully.`);
      await loadNews();
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not delete this news bulletin.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = news.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.author || '').toLowerCase().includes(search.toLowerCase()) ||
      n.slug.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Website Management · Bulletin"
        title="News &amp; Press Announcements"
        description="Publish institutional bulletins, digitisation releases, acquisition notices, and research updates on the public website."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Publish News Bulletin
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
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total News Bulletins</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{news.length} Bulletins</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Featured Announcements</span>
          <span className="text-2xl font-bold text-[#A52307] mt-1 block">
            {news.filter((n) => n.featured).length} Featured
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Draft Bulletins</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">
            {news.filter((n) => n.status === 'DRAFT').length} Drafts
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search news by title, author, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">News Title &amp; Slug</th>
              <th className="py-3 px-4">Kicker</th>
              <th className="py-3 px-4">Author Desk</th>
              <th className="py-3 px-4">Tags</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                  Loading news bulletins...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                  No news bulletins found.
                </td>
              </tr>
            ) : filtered.map((n) => (
              <tr key={n.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3.5 px-4 max-w-sm">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {n.featured && (
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                        Featured
                      </span>
                    )}
                    <span className="font-bold text-gray-900 text-sm block line-clamp-1">{n.title}</span>
                  </div>
                  <span className="font-mono text-gray-400 text-[11px] block">/{n.slug}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {n.kicker || '—'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-gray-800">{n.author}</td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {(n.tags || []).map((t, idx) => (
                      <span key={idx} className="bg-[#FAF8F5] text-gray-600 border border-[#E2E0DB] px-1.5 py-0.5 rounded text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-gray-600 font-mono">{n.date}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    n.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {n.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <Link
                    href={`/news/${n.slug}`}
                    target="_blank"
                    className="p-1 text-gray-400 hover:text-black inline-block"
                    title="View Public Page"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditModal(n)}
                    className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id, n.title)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Delete News Bulletin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL: Create / Edit News */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center sticky top-0 bg-[#FAF8F5] z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-50 text-[#A52307] border border-red-100 flex items-center justify-center font-bold">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingNewsId ? 'Edit News Bulletin' : 'Publish News Bulletin'}
                  </h3>
                  <span className="text-[11px] text-gray-500">Public press announcement for the KMLRI website</span>
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

            <form onSubmit={handleSaveNews} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Bulletin Headline <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. KMLRI Ingests 400 Rare Arabi-Malayalam Manuscripts into IIIF Repository"
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
                    placeholder="kmlri-ingests-400-rare-manuscripts-iiif"
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
                    placeholder="e.g. Digitisation Update"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Author / Communications Desk</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Communications Desk"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Short Excerpt / Teaser</label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="A brief summary for news feed lists..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Full Bulletin Content</label>
                  <RichTextEditor value={content} onChange={setContent} placeholder="Write the full press release or announcement..." />
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
                    placeholder="IIIF, Digital Library, Manuscripts"
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
                  <span className="font-bold text-gray-800">Pin as Featured Announcement on Homepage</span>
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
                    {saving ? 'Saving…' : editingNewsId ? 'Save Changes' : 'Publish Bulletin'}
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
