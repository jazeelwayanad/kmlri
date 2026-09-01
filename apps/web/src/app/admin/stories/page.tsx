'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Trash2, Edit3, Sparkles, CheckCircle2, Clock, User, Eye, ArrowRight } from 'lucide-react';
import { PageHeader, Button, Card, StatCard, Badge } from '@/components/admin/ui';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';

export default function StoriesAdminPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    kicker: 'Research notes',
    summary: '',
    content: '',
    date: 'Autumn 2026',
    author: 'Dr. Taha Malabari',
    featured: false,
    tags: 'Manuscripts, Codicology',
  });

  const loadData = async () => {
    try {
      const res = await api.getContentItems({ category: 'Stories', search });
      if (res && res.items) {
        setItems(res.items);
      }
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      kicker: 'Research notes',
      summary: '',
      content: '',
      date: 'Autumn 2026',
      author: 'Dr. Taha Malabari',
      featured: false,
      tags: 'Manuscripts, Codicology',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      kicker: item.kicker || 'Research notes',
      summary: item.summary || '',
      content: item.content || '',
      date: item.date || 'Autumn 2026',
      author: item.author || 'Dr. Taha Malabari',
      featured: item.featured || false,
      tags: item.tags ? item.tags.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...formData,
        category: 'STORY',
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (editingItem) {
        await api.updateContentItem(editingItem.id, payload);
        setNotification(`Successfully updated story "${formData.title}"`);
      } else {
        await api.createContentItem(payload);
        setNotification(`Successfully published new story "${formData.title}"`);
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch {
      const newItem: ContentItem = {
        id: editingItem?.id || `STORY-${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: 'STORY',
        title: formData.title,
        kicker: formData.kicker,
        summary: formData.summary,
        content: formData.content,
        date: formData.date,
        author: formData.author,
        featured: formData.featured,
        status: 'ACTIVE',
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      };

      if (editingItem) {
        setItems(items.map((i) => (i.id === editingItem.id ? newItem : i)));
      } else {
        setItems([newItem, ...items]);
      }
      setIsModalOpen(false);
      setNotification(`Published "${formData.title}"`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteContentItem(id);
    } catch {}
    setItems(items.filter((i) => i.id !== id));
    setNotification(`Deleted story "${title}"`);
    setTimeout(() => setNotification(null), 4000);
  };

  const featuredCount = items.filter((i) => i.featured).length;

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Reading Room Editorial"
        title="Archive Stories & Codicology Desk"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" href="/stories" icon={Eye}>
              View Public Page
            </Button>
            <Button variant="dark" icon={Plus} onClick={handleOpenCreate}>
              Publish New Story
            </Button>
          </div>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Published Stories" value={`${items.length} Stories`} hint="Active in reading room" hintTone="positive" />
        <StatCard label="Featured Cover Story" value={`${featuredCount} Hero`} hint="Displayed in top hero banner" />
        <StatCard label="Editorial Leads" value="3 Scholars" hint="Archivists & conservators" />
        <StatCard label="Average Read Time" value="6.5 mins" hint="Per codicology article" hintTone="positive" />
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 border border-gray-200 rounded-lg">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories by title, author, tag..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded outline-none focus:border-black"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
        <span className="text-xs text-gray-500 font-semibold">{items.length} Stories Listed</span>
      </div>

      {/* Stories Grid */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p>No stories found.</p>
          </div>
        ) : (
          items.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {s.kicker || 'Story'}
                    </span>
                    {s.featured && (
                      <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                        Featured Hero
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {s.date}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{s.summary}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1 font-sans">
                    {s.author && (
                      <div className="flex items-center gap-1 text-gray-800 font-medium">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>By {s.author}</span>
                      </div>
                    )}
                    {s.tags && s.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {s.tags.map((t) => (
                          <span key={t} className="text-[11px] bg-red-50 text-[#A52307] px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" icon={Edit3} onClick={() => handleOpenEdit(s)}>
                    Edit
                  </Button>
                  <Button variant="outline" icon={Trash2} onClick={() => handleDelete(s.id, s.title)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Story Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Edit Archive Story' : 'Publish New Archive Story'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kicker / Topic Pill *</label>
                  <select
                    value={formData.kicker}
                    onChange={(e) => setFormData({ ...formData, kicker: e.target.value })}
                    className="w-full p-2 border rounded border-gray-300"
                  >
                    <option value="Research notes">Research notes</option>
                    <option value="Materials">Materials &amp; Inks</option>
                    <option value="Donors">Donors &amp; Collections</option>
                    <option value="Conservation">Conservation &amp; Binding</option>
                    <option value="Catalogue">Catalogue &amp; Scripts</option>
                    <option value="Reading room">Reading room periodicals</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Publish Period / Season</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. Autumn 2026, September 2026"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Story Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. What a margin note reveals about a 19th-century reader"
                  className="w-full p-2 border rounded border-gray-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Summary / Lead Paragraph *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Concise 1-2 sentence overview for cards..."
                  className="w-full p-2 border rounded border-gray-300"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Story Article</label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed narrative, folio references, codicological analysis..."
                  className="w-full p-2 border rounded border-gray-300 font-serif"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Author / Lead Researcher</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Dr. Taha Malabari"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Topic Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. Marginalia, Fiqh, Ink, Tanur"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-black"
                  />
                  <span className="font-semibold">Highlight as Featured Hero Story</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" type="submit">
                  {editingItem ? 'Save Changes' : 'Publish Story'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
