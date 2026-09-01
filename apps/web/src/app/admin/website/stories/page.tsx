'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Upload,
  Globe
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

interface Story {
  id: string;
  title: string;
  slug: string;
  kicker?: string;
  excerpt: string;
  content?: string;
  category: string;
  author: string;
  tags: string[];
  featured: boolean;
  status: 'PUBLISHED' | 'DRAFT';
  publishedAt: string;
  imageUrl?: string;
}

export default function WebsiteStoriesPage() {
  const [stories, setStories] = useState<Story[]>([
    {
      id: 'STY-01',
      title: 'Preserving the 18th Century Maritime Manuscripts of Ponnāni',
      slug: 'preserving-18th-century-maritime-manuscripts',
      kicker: 'Conservation Spotlight',
      excerpt: 'How digital restoration techniques and paper conservation are breathing new life into Malabar trading codices.',
      content: 'Detailed archival inquiry into maritime logs, fatwa manuscripts, and coastal trading contracts preserved in Makhdūm vaults.',
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
      kicker: 'Literary Traditions',
      excerpt: 'An inquiry into the hybrid linguistic register that linked Kerala with the Persian Gulf and Indian Ocean networks.',
      content: 'Exploration of poetic metrics, devotional qasidas, and oral chronicles composed in the Arabi-Malayalam script between the 17th and 20th centuries.',
      category: 'Literary History',
      author: 'Prof. K. A. Najeeb',
      tags: ['Arabi-Malayalam', 'Linguistics', 'Poetry'],
      featured: false,
      status: 'PUBLISHED',
      publishedAt: '12 Aug 2026',
    },
  ]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State (Used for both Create and Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [kicker, setKicker] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Conservation & Archives');
  const [author, setAuthor] = useState('Staff Researcher');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [imageUrl, setImageUrl] = useState('');

  const openCreateModal = () => {
    setEditingStoryId(null);
    setTitle('');
    setSlug('');
    setKicker('Feature Essay');
    setExcerpt('');
    setContent('');
    setCategory('Conservation & Archives');
    setAuthor('Editorial Staff');
    setTags('Manuscripts, History');
    setFeatured(false);
    setStatus('PUBLISHED');
    setImageUrl('');
    setShowModal(true);
  };

  const openEditModal = (story: Story) => {
    setEditingStoryId(story.id);
    setTitle(story.title);
    setSlug(story.slug);
    setKicker(story.kicker || 'Feature Essay');
    setExcerpt(story.excerpt);
    setContent(story.content || '');
    setCategory(story.category);
    setAuthor(story.author);
    setTags(story.tags.join(', '));
    setFeatured(story.featured);
    setStatus(story.status);
    setImageUrl(story.imageUrl || '');
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingStoryId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingStoryId) {
      // Update existing story
      setStories(
        stories.map((s) => {
          if (s.id === editingStoryId) {
            return {
              ...s,
              title,
              slug,
              kicker,
              excerpt,
              content,
              category,
              author,
              tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
              featured,
              status,
              imageUrl,
            };
          }
          return s;
        })
      );
      setNotification(`Story "${title}" updated successfully.`);
    } else {
      // Create new story
      const newStory: Story = {
        id: `STY-${Date.now().toString().slice(-4)}`,
        title,
        slug: slug || `story-${Date.now().toString().slice(-4)}`,
        kicker,
        excerpt,
        content,
        category,
        author,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured,
        status,
        publishedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        imageUrl,
      };
      setStories([newStory, ...stories]);
      setNotification(`Story "${title}" published successfully.`);
    }

    setShowModal(false);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete story "${name}"?`)) {
      setStories(stories.filter((s) => s.id !== id));
      setNotification(`Story "${name}" deleted successfully.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = stories.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.author.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      s.excerpt.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

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
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Published Stories</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{stories.length} Articles</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Featured on Homepage</span>
          <span className="text-2xl font-bold text-[#A52307] mt-1 block">
            {stories.filter((s) => s.featured).length} Featured
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Active Categories</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">2 Sections</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories by title, author, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Conservation & Archives">Conservation &amp; Archives</option>
            <option value="Literary History">Literary History</option>
            <option value="Exhibitions & Public Events">Exhibitions &amp; Public Events</option>
          </select>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Article Title &amp; Slug</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Tags</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3.5 px-4 max-w-sm">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {s.featured && (
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                        Featured
                      </span>
                    )}
                    <span className="font-bold text-gray-900 text-sm block line-clamp-1">{s.title}</span>
                  </div>
                  <span className="font-mono text-gray-400 text-[11px] block">/{s.slug}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {s.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-gray-800">{s.author}</td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {s.tags.map((t, idx) => (
                      <span key={idx} className="bg-[#FAF8F5] text-gray-600 border border-[#E2E0DB] px-1.5 py-0.5 rounded text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-gray-600 font-mono">{s.publishedAt}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    s.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <Link
                    href={`/stories/${s.slug}`}
                    target="_blank"
                    className="p-1 text-gray-400 hover:text-black inline-block"
                    title="View Public Page"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditModal(s)}
                    className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.title)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Delete Story"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  <label className="font-bold text-gray-800 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
                  >
                    <option value="Conservation & Archives">Conservation &amp; Archives</option>
                    <option value="Literary History">Literary History</option>
                    <option value="Exhibitions & Public Events">Exhibitions &amp; Public Events</option>
                  </select>
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
                  <label className="font-bold text-gray-800 block mb-1">Full Article Content (Rich Markdown with Image support)</label>
                  <textarea
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your article in markdown. Embed images with ![Caption](https://...)"
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Featured Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
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
                    className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow"
                  >
                    {editingStoryId ? 'Save Changes' : 'Publish Story'}
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
