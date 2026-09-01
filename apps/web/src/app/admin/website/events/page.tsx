'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
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

interface EventItem {
  id: string;
  title: string;
  slug: string;
  kicker?: string;
  excerpt: string;
  description?: string;
  date: string;
  time: string;
  type: string;
  location: string;
  capacity: number;
  featured: boolean;
  status: 'PUBLISHED' | 'DRAFT';
  enableRegistration: boolean;
  registeredCount: number;
  tags: string[];
}

export default function WebsiteEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 'EVT-01',
      title: 'International Colloquium on Indian Ocean Manuscript Cultures',
      slug: 'international-colloquium-indian-ocean-manuscripts',
      kicker: 'Academic Symposium',
      excerpt: 'A three-day symposium convening manuscript conservators and maritime epigraphers.',
      description: 'The colloquium explores codicological networks linking Malabar with the Red Sea, Hadramaut, and Swahili Coast from the 16th to early 20th centuries.',
      date: '14–16 October 2026',
      time: '09:30 AM – 05:30 PM IST',
      type: 'International Symposium',
      location: 'KMLRI Main Auditorium & Archival Gallery',
      capacity: 150,
      registeredCount: 142,
      featured: true,
      status: 'PUBLISHED',
      enableRegistration: true,
      tags: ['Symposium', 'Indian Ocean', 'Manuscripts'],
    },
    {
      id: 'EVT-02',
      title: 'Workshop: Reading 17th Century Arabi-Malayalam Paleography',
      slug: 'workshop-reading-arabi-malayalam-paleography',
      kicker: 'Conservation Lab Workshop',
      excerpt: 'Hands-on training in deciphering regional script ligatures and archival orthography.',
      description: 'Intensive laboratory and paleography seminar limited to 35 scholars and graduate students in Kerala history.',
      date: '05 November 2026',
      time: '10:00 AM – 04:00 PM IST',
      type: 'Scholarly Workshop',
      location: 'Seminar Hall B & Conservation Suite',
      capacity: 35,
      registeredCount: 35,
      featured: false,
      status: 'PUBLISHED',
      enableRegistration: true,
      tags: ['Workshop', 'Paleography', 'Arabi-Malayalam'],
    },
    {
      id: 'EVT-03',
      title: 'Exhibition: 100 Rare Inscriptions and Maritime Folios of Malabar',
      slug: 'exhibition-100-rare-inscriptions-malabar',
      kicker: 'Public Exhibition',
      excerpt: 'Curated public showcase displaying unique illuminated Quranic folios and royal decrees.',
      description: 'Public exhibition featuring rare items with interactive digital IIIF stations.',
      date: '01–15 October 2026',
      time: '10:00 AM – 07:00 PM Daily',
      type: 'Public Exhibition',
      location: 'KMLRI Gallery Hall A & B',
      capacity: 500,
      registeredCount: 320,
      featured: true,
      status: 'PUBLISHED',
      enableRegistration: true,
      tags: ['Exhibition', 'Public', 'Inscriptions'],
    },
  ]);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

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
  const [type, setType] = useState('International Symposium');
  const [location, setLocation] = useState('KMLRI Main Auditorium');
  const [capacity, setCapacity] = useState(100);
  const [featured, setFeatured] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  const openCreateModal = () => {
    setEditingEventId(null);
    setTitle('');
    setSlug('');
    setKicker('Symposium');
    setExcerpt('');
    setDescription('');
    setDate('15–16 Nov 2026');
    setTime('10:00 AM – 04:30 PM IST');
    setType('International Symposium');
    setLocation('KMLRI Auditorium');
    setCapacity(100);
    setFeatured(false);
    setEnableRegistration(true);
    setTags('Manuscripts, History');
    setStatus('PUBLISHED');
    setShowModal(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setSlug(event.slug);
    setKicker(event.kicker || 'Symposium');
    setExcerpt(event.excerpt);
    setDescription(event.description || '');
    setDate(event.date);
    setTime(event.time);
    setType(event.type);
    setLocation(event.location);
    setCapacity(event.capacity);
    setFeatured(event.featured);
    setEnableRegistration(event.enableRegistration);
    setTags(event.tags.join(', '));
    setStatus(event.status);
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingEventId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEventId) {
      // Update
      setEvents(
        events.map((ev) => {
          if (ev.id === editingEventId) {
            return {
              ...ev,
              title,
              slug,
              kicker,
              excerpt,
              description,
              date,
              time,
              type,
              location,
              capacity: Number(capacity),
              featured,
              enableRegistration,
              tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
              status,
            };
          }
          return ev;
        })
      );
      setNotification(`Event "${title}" updated successfully.`);
    } else {
      // Create
      const newEvent: EventItem = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        title,
        slug: slug || `event-${Date.now().toString().slice(-4)}`,
        kicker,
        excerpt,
        description,
        date,
        time,
        type,
        location,
        capacity: Number(capacity),
        registeredCount: 0,
        featured,
        enableRegistration,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
      };
      setEvents([newEvent, ...events]);
      setNotification(`Event "${title}" created successfully.`);
    }

    setShowModal(false);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete event "${name}"?`)) {
      setEvents(events.filter((e) => e.id !== id));
      setNotification(`Event "${name}" deleted successfully.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
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
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
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
            {events.reduce((acc, cur) => acc + cur.registeredCount, 0)} Attendees
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
            placeholder="Search events by title, venue, type..."
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
              <th className="py-3 px-4">Program Type</th>
              <th className="py-3 px-4">Date &amp; Timing</th>
              <th className="py-3 px-4">Venue</th>
              <th className="py-3 px-4">Capacity &amp; Registrations</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((ev) => (
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
                    {ev.type}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-gray-900 block">{ev.date}</span>
                  <span className="text-gray-500 text-[11px]">{ev.time}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-700">{ev.location}</td>
                <td className="py-3.5 px-4">
                  <span className="font-mono font-bold text-gray-900">
                    {ev.registeredCount} / {ev.capacity}
                  </span>
                  <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full ${
                        ev.registeredCount >= ev.capacity ? 'bg-[#A52307]' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, (ev.registeredCount / ev.capacity) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    ev.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
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
                  <label className="font-bold text-gray-800 block mb-1">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
                  >
                    <option value="International Symposium">International Symposium</option>
                    <option value="Scholarly Workshop">Scholarly Workshop</option>
                    <option value="Public Exhibition">Public Exhibition</option>
                    <option value="Memorial Lecture">Memorial Lecture</option>
                  </select>
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
                  <label className="font-bold text-gray-800 block mb-1">Full Program Schedule &amp; Description (Markdown)</label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write detailed session timings, keynote speaker names, and abstract submission deadlines..."
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Symposium, Indian Ocean, Manuscripts"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
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

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableRegistration}
                      onChange={(e) => setEnableRegistration(e.target.checked)}
                      className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                    />
                    <span className="font-bold text-gray-800">Enable Online Registration Form</span>
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
                    className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow"
                  >
                    {editingEventId ? 'Save Changes' : 'Schedule Event'}
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
