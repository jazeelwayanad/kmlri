'use client';

import { useState } from 'react';
import { 
  Newspaper, 
  Plus, 
  Search, 
  Image as ImageIcon, 
  CheckCircle2, 
  Trash2, 
  Star, 
  X, 
  Calendar
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function WebsiteNewsPage() {
  const [news, setNews] = useState([
    {
      id: 'NWS-01',
      title: 'KMLRI Ingests 400 Rare Arabi-Malayalam Manuscripts into IIIF Repository',
      slug: 'kmlri-ingests-400-rare-manuscripts-iiif',
      excerpt: 'Scholars globally can now consult high-resolution multispectral folios directly via the digital manuscript portal.',
      category: 'Institutional Announcement',
      author: 'Communications Desk',
      tags: ['IIIF', 'Digital Library', 'Manuscripts'],
      featured: true,
      status: 'PUBLISHED',
      publishedAt: '28 Aug 2026',
    },
    {
      id: 'NWS-02',
      title: 'Visiting Scholar Fellowship Applications Open for 2026–2027 Academic Year',
      slug: 'visiting-scholar-fellowships-2026-2027',
      excerpt: 'Four fully funded residential archival fellowships available for researchers in West Asian and Indian Ocean trade history.',
      category: 'Fellowships & Grants',
      author: 'Directorate of Research',
      tags: ['Fellowships', 'Research', 'Grants'],
      featured: false,
      status: 'PUBLISHED',
      publishedAt: '15 Aug 2026',
    },
  ]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Institutional Announcement');
  const [author, setAuthor] = useState('Press & Media Desk');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('PUBLISHED');
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

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    const newN = {
      id: `NWS-${Date.now().toString().slice(-4)}`,
      title,
      slug,
      excerpt,
      category,
      author,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      featured,
      status,
      publishedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setNews([newN, ...news]);
    setShowModal(false);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setTags('');
    setNotification(`News item "${title}" published.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete news item "${name}"?`)) {
      setNews(news.filter((n) => n.id !== id));
      setNotification(`News item "${name}" deleted.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = news.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Website Management · Media"
        title="News &amp; Press Releases"
        description="Publish institutional bulletins, archival acquisitions, research announcements, and press dispatches for the public website."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
            New News Post
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
            placeholder="Search news..."
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
              <th className="py-3 px-4">News Headline &amp; Slug</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Author Desk</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((n) => (
              <tr key={n.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 max-w-md">
                  <div className="flex items-center gap-1.5">
                    {n.featured && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Featured</span>
                      </span>
                    )}
                    <span className="font-bold text-sm text-gray-900 leading-tight block">
                      {n.title}
                    </span>
                  </div>
                  <span className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">{n.excerpt}</span>
                  <span className="font-mono text-[10px] text-gray-400">/{n.slug}</span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-gray-700">{n.category}</td>
                <td className="py-3.5 px-4 text-gray-600">{n.author}</td>
                <td className="py-3.5 px-4 text-gray-600">{n.publishedAt}</td>
                <td className="py-3.5 px-4">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    {n.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id, n.title)}
                    className="p-1 text-gray-400 hover:text-[#A52307]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create News Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Post News Article</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNews} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Headline / Title*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Manuscript Acquisitions Added..."
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
                  <label className="block font-bold text-gray-700 uppercase mb-1">Featured Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-[#FAF8F5] cursor-pointer hover:border-[#A52307]">
                    <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <span className="font-semibold text-gray-700">Click to upload news banner</span>
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Excerpt*</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Short summary for the homepage news ticker..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">News Body Content*</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Full press release text..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">News Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  >
                    <option value="Institutional Announcement">Institutional Announcement</option>
                    <option value="Fellowships & Grants">Fellowships &amp; Grants</option>
                    <option value="Symposium & Lectures">Symposium &amp; Lectures</option>
                    <option value="Archival Acquisitions">Archival Acquisitions</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Archives, Fellowship, IIIF"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div className="col-span-full flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featNws"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-[#A52307] focus:ring-[#A52307]"
                  />
                  <label htmlFor="featNws" className="font-bold text-gray-900 cursor-pointer">
                    Feature on Website Homepage
                  </label>
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
                  Publish News Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
