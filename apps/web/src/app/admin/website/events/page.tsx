'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Search,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Paperclip,
  Trash2,
  Star,
  X,
  Layers,
  Settings2,
  Edit3,
  Globe,
  ArrowRight
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api, ContentItem } from '@/lib/api';
import { slugify } from '@/lib/slugs';
import { ImageUploadField } from '@/components/content/ImageUploadField';
import { RichTextEditor } from '@/components/content/RichTextEditor';

export default function WebsiteEventsPage() {
  const [events, setEvents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getContentItems({ category: 'Events' });
      setEvents(res.items);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err.message || 'Could not load events from the server.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [kicker, setKicker] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM – 04:00 PM IST');
  const [location, setLocation] = useState('KMLRI Main Auditorium');
  const [capacity, setCapacity] = useState(100);
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [imageUrl, setImageUrl] = useState<string | undefined>('');
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingEventId(null);
    setTitle('');
    setSlug('');
    setKicker('Symposium');
    setExcerpt('');
    setDescription('');
    setDate('15–16 Nov 2026');
    setTime('10:00 AM – 04:30 PM IST');
    setLocation('KMLRI Auditorium');
    setCapacity(100);
    setFeatured(false);
    setTags('Manuscripts, History');
    setStatus('ACTIVE');
    setImageUrl('');
    setShowModal(true);
  };

  const openEditModal = (event: ContentItem) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setSlug(event.slug);
    setKicker(event.kicker || 'Symposium');
    setExcerpt(event.summary);
    setDescription(event.content || '');
    setDate(event.date || '');
    setTime(event.time || '');
    setLocation(event.venue || '');
    setCapacity(event.capacity || 0);
    setFeatured(!!event.featured);
    setTags((event.tags || []).join(', '));
    setStatus(event.status === 'DRAFT' ? 'DRAFT' : event.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE');
    setImageUrl(event.imageUrl || '');
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingEventId) {
      setSlug(slugify(val));
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: Partial<ContentItem> = {
      category: 'EVENT',
      title,
      slug: slug || slugify(title),
      kicker,
      summary: excerpt,
      content: description,
      date,
      time,
      venue: location,
      capacity: Number(capacity),
      featured,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status,
      imageUrl: imageUrl || undefined,
    };

    setSaving(true);
    try {
      if (editingEventId) {
        await api.updateContentItem(editingEventId, payload);
        setNotificationType('success');
        setNotification(`Event "${title}" updated successfully.`);
      } else {
        await api.createContentItem(payload);
        setNotificationType('success');
        setNotification(`Event "${title}" created successfully.`);
      }
      setShowModal(false);
      await loadEvents();
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not save the event.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete event "${name}"?`)) return;
    try {
      await api.deleteContentItem(id);
      setNotificationType('success');
      setNotification(`Event "${name}" deleted successfully.`);
      await loadEvents();
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not delete this event.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.venue || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.kicker || '').toLowerCase().includes(search.toLowerCase()) ||
      e.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Website Management · Programs"
        title="Events &amp; Symposia"
        description="Schedule academic conferences, paleography workshops, and public exhibitions. Click 'Manage Event' on any item to view registrations and attendees."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Schedule New Event
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
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Scheduled Events</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{events.length} Programs</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Attendee Registrations</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {events.reduce((acc, cur) => acc + (cur.registered || 0), 0)} Attendees
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Featured Highlights</span>
          <span className="text-2xl font-bold text-[#A52307] mt-1 block">
            {events.filter((e) => e.featured).length} Featured
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title, venue, kicker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Event Title &amp; Slug</th>
              <th className="py-3 px-4">Kicker</th>
              <th className="py-3 px-4">Date &amp; Timing</th>
              <th className="py-3 px-4">Venue</th>
              <th className="py-3 px-4">Capacity &amp; Registrations</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                  Loading events...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                  No events found.
                </td>
              </tr>
            ) : filtered.map((ev) => (
              <tr key={ev.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {ev.featured && (
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                        Featured
                      </span>
                    )}
                    <Link
                      href={`/admin/website/events/${ev.slug}`}
                      className="font-bold text-gray-900 text-sm hover:text-[#A52307] transition-colors block line-clamp-1"
                    >
                      {ev.title}
                    </Link>
                  </div>
                  <span className="font-mono text-gray-400 text-[11px] block">/{ev.slug}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {ev.kicker || '—'}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-gray-900 block">{ev.date}</span>
                  <span className="text-gray-500 text-[11px]">{ev.time}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-700">{ev.venue}</td>
                <td className="py-3.5 px-4">
                  <span className="font-mono font-bold text-gray-900">
                    {ev.registered || 0} / {ev.capacity || 0}
                  </span>
                  <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full ${
                        (ev.registered || 0) >= (ev.capacity || 0) ? 'bg-[#A52307]' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, ((ev.registered || 0) / (ev.capacity || 1)) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    ev.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ev.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <Link
                    href={`/admin/website/events/${ev.slug}`}
                    className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-bold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Manage Event</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditModal(ev)}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3 h-3 inline mr-1" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ev.id, ev.title)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL: Create / Edit Event */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center sticky top-0 bg-[#FAF8F5] z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-50 text-[#A52307] border border-red-100 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingEventId ? 'Edit Event Schedule' : 'Schedule New Event'}
                  </h3>
                  <span className="text-[11px] text-gray-500">Configure program dates, venue, capacity, and registration form</span>
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

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Event Title <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. International Colloquium on Indian Ocean Manuscript Cultures"
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
                    placeholder="international-colloquium-indian-ocean-manuscripts"
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
                    placeholder="e.g. Academic Symposium"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Dates of Event</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. 14–16 October 2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Time Schedule</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 09:30 AM – 05:30 PM IST"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. KMLRI Main Auditorium & Archival Gallery"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Seat Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Short Excerpt / Teaser</label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="A brief 1-2 sentence lead paragraph shown on event cards..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Full Program Schedule &amp; Description</label>
                  <RichTextEditor value={description} onChange={setDescription} placeholder="Write detailed session timings, keynote speaker names, and abstract submission deadlines..." />
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
                    placeholder="Symposium, Indian Ocean, Manuscripts"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
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
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                    />
                    <span className="font-bold text-gray-800">Pin as Featured</span>
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
                    {saving ? 'Saving…' : editingEventId ? 'Save Changes' : 'Schedule Event'}
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
