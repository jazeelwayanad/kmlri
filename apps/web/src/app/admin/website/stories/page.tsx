'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Tag, 
  CheckCircle2, 
  Eye, 
  Edit3, 
  Trash2, 
  Star, 
  Calendar,
  X,
  Upload
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function WebsiteStoriesPage() {
  const [stories, setStories] = useState([
    {
      id: 'STY-01',
      title: 'Preserving the 18th Century Maritime Manuscripts of Ponnāni',
      slug: 'preserving-18th-century-maritime-manuscripts',
      excerpt: 'How digital restoration techniques and paper conservation are breathing new life into Malabar trading codices.',
      category: 'Conservation & Archives',
      author: 'Dr. Fatima Zahra',
      tags: ['Manuscripts', 'Maritime History', 'Conservation'],
      featured: true,
      status: 'PUBLISHED',
      publishedAt: '24 Aug 2026',
    },
    {
      id: 'STY-02',
      title: 'The Poetics of Arabi-Malayalam: From Devotion to Chronicle',
      slug: 'poetics-of-arabi-malayalam',
      excerpt: 'An inquiry into the hybrid linguistic register that linked Kerala with the Persian Gulf and Indian Ocean networks.',
      category: 'Literary History',
      author: 'Prof. K. A. Najeeb',
      tags: ['Arabi-Malayalam', 'Linguistics', 'Poetry'],
      featured: false,
      status: 'PUBLISHED',
      publishedAt: '12 Aug 2026',
    },
  ]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Conservation & Archives');
  const [author, setAuthor] = useState('Staff Researcher');
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

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    const newS = {
      id: `STY-${Date.now().toString().slice(-4)}`,
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
    setStories([newS, ...stories]);
    setShowModal(false);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setTags('');
    setNotification(`Story "${title}" saved successfully.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete story "${name}"?`)) {
      setStories(stories.filter((s) => s.id !== id));
      setNotification(`Story "${name}" deleted.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = stories.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Website Management · Editorial"
        title="Stories Management"
        description="Curate and publish long-form research stories, archival discoveries, and scholarly essays for the public website."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
            New Story
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
            placeholder="Search stories by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Title &amp; Excerpt</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Tags</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 max-w-md">
                  <div className="flex items-center gap-1.5">
                    {s.featured && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Featured</span>
                      </span>
                    )}
                    <span className="font-amiri font-bold text-base text-gray-900 leading-tight block">
                      {s.title}
                    </span>
                  </div>
                  <span className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">{s.excerpt}</span>
                  <span className="font-mono text-[10px] text-gray-400">/{s.slug}</span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-gray-700">{s.category}</td>
                <td className="py-3.5 px-4 text-gray-600">{s.author}</td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {s.tags.map((t, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.title)}
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

      {/* Create Story Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Create Scholarly Story</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Story Title*</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter article title..."
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
                  <label className="block font-bold text-gray-700 uppercase mb-1">Featured Image / Banner</label>
                  <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-[#FAF8F5] cursor-pointer hover:border-[#A52307]">
                    <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <span className="font-semibold text-gray-700">Click to upload featured image</span>
                    <span className="text-gray-400 block text-[10px]">PNG, JPG, WEBP (Max 5MB)</span>
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Excerpt / Teaser*</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Short 2-sentence summary for previews..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Story Content (Rich Text)*</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-2 border-b border-gray-300 flex gap-2 text-xs">
                      <button type="button" className="px-2 py-0.5 bg-white border rounded font-bold">B</button>
                      <button type="button" className="px-2 py-0.5 bg-white border rounded italic font-serif">I</button>
                      <button type="button" className="px-2 py-0.5 bg-white border rounded">H2</button>
                      <button type="button" className="px-2 py-0.5 bg-white border rounded">H3</button>
                      <button type="button" className="px-2 py-0.5 bg-white border rounded flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Insert Image</span>
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      required
                      placeholder="Write your article body here in Markdown or formatted text..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full p-3 outline-none text-xs leading-relaxed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  >
                    <option value="Conservation & Archives">Conservation &amp; Archives</option>
                    <option value="Literary History">Literary History</option>
                    <option value="Maritime Studies">Maritime Studies</option>
                    <option value="Oral Traditions">Oral Traditions</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Author Name</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Manuscripts, Ponnani, Arabic"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Publication Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="col-span-full flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="feat"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-[#A52307] focus:ring-[#A52307]"
                  />
                  <label htmlFor="feat" className="font-bold text-gray-900 cursor-pointer">
                    Display as Featured Story on Website Homepage
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
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
