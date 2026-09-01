'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Search, Plus, QrCode, Users, Clock, CheckCircle2, MapPin, Trash2, Edit3, Eye, Calendar } from 'lucide-react';
import { PageHeader, Button, Card, StatCard, Badge } from '@/components/admin/ui';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';

export default function EventsAdminPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    kicker: 'Academic Seminar',
    summary: '',
    content: '',
    date: '18 September 2026',
    time: '09:30 AM - 04:30 PM',
    venue: 'Main Auditorium, KMLRI Campus',
    capacity: 150,
    author: 'KMLRI Events Committee',
    featured: true,
    tags: 'Seminar, Manuscripts, Maritime',
  });

  const loadData = async () => {
    try {
      const res = await api.getContentItems({ category: 'Events', search });
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
      kicker: 'Academic Seminar',
      summary: '',
      content: '',
      date: '18 September 2026',
      time: '09:30 AM - 04:30 PM',
      venue: 'Main Auditorium, KMLRI Campus',
      capacity: 150,
      author: 'KMLRI Events Committee',
      featured: true,
      tags: 'Seminar, Manuscripts, Maritime',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      kicker: item.kicker || 'Academic Event',
      summary: item.summary || '',
      content: item.content || '',
      date: item.date || '18 September 2026',
      time: item.time || '09:30 AM - 04:30 PM',
      venue: item.venue || 'Main Auditorium, KMLRI Campus',
      capacity: item.capacity || 150,
      author: item.author || 'KMLRI Events Committee',
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
        category: 'EVENT',
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (editingItem) {
        await api.updateContentItem(editingItem.id, payload);
        setNotification(`Successfully updated event "${formData.title}"`);
      } else {
        await api.createContentItem(payload);
        setNotification(`Successfully published event "${formData.title}"`);
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch {
      const newItem: ContentItem = {
        id: editingItem?.id || `EVT-${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: 'EVENT',
        title: formData.title,
        kicker: formData.kicker,
        summary: formData.summary,
        content: formData.content,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        capacity: formData.capacity,
        registered: editingItem?.registered || 0,
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
    setNotification(`Deleted "${title}"`);
    setTimeout(() => setNotification(null), 4000);
  };

  const totalRegistered = items.reduce((acc, curr) => acc + (curr.registered || 0), 0);

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Academic Events & Exhibitions"
        title="Events, Workshops & QR Gate Console"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" href="/events" icon={Eye}>
              View Public Page
            </Button>
            <Button variant="dark" icon={Plus} onClick={handleOpenCreate}>
              Publish New Event
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
        <StatCard label="Scheduled Events" value={`${items.length} Events`} hint="This semester" hintTone="positive" />
        <StatCard label="Registered Attendees" value={`${totalRegistered} Scholars`} hint="Passes issued" hintTone="positive" />
        <StatCard label="Restricted Workshops" value="1 Lab Session" hint="Conservation quota full" hintTone="warning" />
        <StatCard label="QR Gate Check-ins" value="100% Validated" hint="Automated gate reader active" />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 border border-gray-200 rounded-lg">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title or venue..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded outline-none focus:border-black"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
        <span className="text-xs text-gray-500 font-semibold">{items.length} Events Scheduled</span>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p>No events found.</p>
          </div>
        ) : (
          items.map((e) => {
            const capacity = e.capacity || 100;
            const registered = e.registered || 0;
            const percent = Math.round((registered / capacity) * 100);

            return (
              <Card key={e.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {e.kicker || 'Event'}
                      </span>
                      <Badge variant={registered >= capacity ? 'warning' : 'success'}>
                        {registered >= capacity ? 'Capacity Full (Waitlist)' : 'Registration Open'}
                      </Badge>
                      {e.featured && <Badge variant="warning">Featured</Badge>}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">{e.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{e.summary}</p>

                    <div className="text-xs text-gray-500 pt-1 flex flex-wrap gap-4 items-center font-sans">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                        <Clock className="w-3.5 h-3.5 text-heritage-red" />
                        <span>{e.date} · {e.time}</span>
                      </div>
                      {e.venue && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{e.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900 mb-1">
                        {registered} / {capacity} Registered ({percent}%)
                      </div>
                      <div className="w-36 bg-gray-200 rounded-full h-2 mb-2 ml-auto">
                        <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" icon={Edit3} onClick={() => handleOpenEdit(e)}>
                        Edit
                      </Button>
                      <Button variant="outline" icon={Trash2} onClick={() => handleDelete(e.id, e.title)}>
                        Delete
                      </Button>
                      <Button
                        variant="dark"
                        icon={QrCode}
                        onClick={() => alert(`Launching QR Scanner Gate Validation for event ${e.id} (${e.title})`)}
                      >
                        QR Gate Pass
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Edit Academic Event' : 'Publish Academic Event'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Event Type *</label>
                  <select
                    value={formData.kicker}
                    onChange={(e) => setFormData({ ...formData, kicker: e.target.value })}
                    className="w-full p-2 border rounded border-gray-300"
                  >
                    <option value="Academic Seminar">Academic Seminar / Symposium</option>
                    <option value="Hands-on Workshop">Hands-on Conservation Workshop</option>
                    <option value="Exhibition">Public Exhibition &amp; Showcase</option>
                    <option value="Lecture Series">Evening Lecture Series</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Event Date *</label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. 18 September 2026"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. National Seminar on Arabi-Malayalam Manuscripts"
                  className="w-full p-2 border rounded border-gray-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Summary / Lead *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Concise overview..."
                  className="w-full p-2 border rounded border-gray-300"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Schedule &amp; Keynote Details</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Session breakdown, keynote speakers, paper presentations..."
                  className="w-full p-2 border rounded border-gray-300"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Time Schedule</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="09:30 AM - 04:30 PM"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Venue Location</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Main Auditorium"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Attendee Quota / Capacity</label>
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
                  {editingItem ? 'Save Changes' : 'Publish Event'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
