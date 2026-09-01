'use client';

import { useState, useEffect } from 'react';
import { Award, Search, Plus, Trash2, Edit3, CheckCircle2, Clock, Eye, DollarSign, Users } from 'lucide-react';
import { PageHeader, Button, Card, StatCard, Badge } from '@/components/admin/ui';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';

export default function OpportunitiesAdminPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    kicker: 'Fellowship',
    summary: '',
    content: '',
    deadline: '30 October 2026',
    stipend: '₹45,000 / month',
    capacity: 4,
    featured: false,
    tags: 'Manuscripts, Fellowship, Codicology',
  });

  const loadData = async () => {
    try {
      const res = await api.getContentItems({ category: 'Opportunities', search });
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
      kicker: 'Fellowship',
      summary: '',
      content: '',
      deadline: '30 October 2026',
      stipend: '₹45,000 / month',
      capacity: 4,
      featured: false,
      tags: 'Manuscripts, Fellowship, Codicology',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      kicker: item.kicker || 'Fellowship',
      summary: item.summary || '',
      content: item.content || '',
      deadline: item.deadline || '30 October 2026',
      stipend: item.stipend || '₹45,000 / month',
      capacity: item.capacity || 4,
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
        category: 'OPPORTUNITY',
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (editingItem) {
        await api.updateContentItem(editingItem.id, payload);
        setNotification(`Successfully updated opportunity "${formData.title}"`);
      } else {
        await api.createContentItem(payload);
        setNotification(`Successfully published opportunity "${formData.title}"`);
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch {
      const newItem: ContentItem = {
        id: editingItem?.id || `OPP-${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: 'OPPORTUNITY',
        title: formData.title,
        kicker: formData.kicker,
        summary: formData.summary,
        content: formData.content,
        deadline: formData.deadline,
        stipend: formData.stipend,
        capacity: formData.capacity,
        registered: editingItem?.registered || 0,
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
    setNotification(`Deleted "${title}"`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Grants, Fellowships & Residencies"
        title="Opportunities & Research Grants Desk"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" href="/opportunities" icon={Eye}>
              View Public Page
            </Button>
            <Button variant="dark" icon={Plus} onClick={handleOpenCreate}>
              Post Opportunity
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
        <StatCard label="Open Opportunities" value={`${items.length} Programs`} hint="Accepting proposals" hintTone="positive" />
        <StatCard label="Funded Fellowships" value="4 Seats" hint="₹45,000/mo stipend" hintTone="positive" />
        <StatCard label="Active Applications" value="28 Submissions" hint="In review committee" />
        <StatCard label="Next Deadline" value="30 Oct 2026" hint="Residential Fellowship" hintTone="warning" />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 border border-gray-200 rounded-lg">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fellowships & internships..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded outline-none focus:border-black"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
        <span className="text-xs text-gray-500 font-semibold">{items.length} Programs Open</span>
      </div>

      {/* Opportunities List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p>No opportunities found.</p>
          </div>
        ) : (
          items.map((o) => (
            <Card key={o.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {o.kicker || 'Opportunity'}
                    </span>
                    <span className="text-xs text-heritage-red flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" />
                      Deadline: {o.deadline}
                    </span>
                    {o.stipend && (
                      <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 rounded font-semibold">
                        {o.stipend}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{o.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{o.summary}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 font-sans">
                    <div className="flex items-center gap-1 text-gray-800">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>Quota: {o.capacity || 4} positions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" icon={Edit3} onClick={() => handleOpenEdit(o)}>
                    Edit
                  </Button>
                  <Button variant="outline" icon={Trash2} onClick={() => handleDelete(o.id, o.title)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Edit Opportunity Program' : 'Post New Opportunity'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Program Type *</label>
                  <select
                    value={formData.kicker}
                    onChange={(e) => setFormData({ ...formData, kicker: e.target.value })}
                    className="w-full p-2 border rounded border-gray-300"
                  >
                    <option value="Fellowship">Residential Research Fellowship</option>
                    <option value="Internship">Graduate Conservation Internship</option>
                    <option value="Call for Papers">Call for Papers / Symposium</option>
                    <option value="Assistantship">Cataloguing Assistantship</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Application Deadline *</label>
                  <input
                    type="text"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    placeholder="e.g. 30 October 2026"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Short-term research fellowships in manuscript studies"
                  className="w-full p-2 border rounded border-gray-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Overview Summary *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Concise overview for opportunity cards..."
                  className="w-full p-2 border rounded border-gray-300"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Eligibility &amp; Proposal Details</label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Eligibility criteria, submission guidelines, stipend details..."
                  className="w-full p-2 border rounded border-gray-300"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Stipend / Grant Amount</label>
                  <input
                    type="text"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    placeholder="e.g. ₹45,000 / month"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Position Quota / Slots</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" type="submit">
                  {editingItem ? 'Save Changes' : 'Publish Opportunity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
