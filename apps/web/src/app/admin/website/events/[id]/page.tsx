'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  Plus, 
  Mail, 
  X, 
  Check, 
  FileText, 
  Paperclip,
  Save,
  Send,
  Globe,
  Search
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

interface Attendee {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  registrationDate: string;
  status: 'CONFIRMED' | 'ATTENDED' | 'CANCELLED';
  attachmentName?: string;
  mealPreference?: string;
}

export default function ManageEventDetailPage() {
  const params = useParams();
  const eventSlugOrId = params?.id as string;

  const [activeTab, setActiveTab] = useState<'attendees' | 'edit' | 'broadcast'>('attendees');
  const [notification, setNotification] = useState<string | null>(null);

  // Event State
  const [eventData, setEventData] = useState<any>({
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
    featured: true,
    status: 'PUBLISHED',
    enableRegistration: true,
  });

  const [attendees, setAttendees] = useState<Attendee[]>([
    {
      id: 'REG-101',
      name: 'Dr. Tariq al-Omani',
      email: 'tariq@squ.edu.om',
      affiliation: 'Sultan Qaboos University (Oman)',
      registrationDate: '20 Aug 2026',
      status: 'CONFIRMED',
      attachmentName: 'Abstract_Tariq_Malabar_Oman.pdf',
      mealPreference: 'Standard',
    },
    {
      id: 'REG-102',
      name: 'Prof. Ananya Sen',
      email: 'asen@jnu.ac.in',
      affiliation: 'Jawaharlal Nehru University',
      registrationDate: '22 Aug 2026',
      status: 'ATTENDED',
      attachmentName: 'Paper_Sen_Maritime_Epigraphy.pdf',
      mealPreference: 'Vegetarian',
    },
    {
      id: 'REG-103',
      name: 'Dr. Fatima Zahra',
      email: 'fatima.zahra@kmlri.in',
      affiliation: 'KMLRI Conservation Division',
      registrationDate: '25 Aug 2026',
      status: 'CONFIRMED',
      attachmentName: 'Conservation_Survey_Folios.pdf',
      mealPreference: 'Vegetarian',
    },
    {
      id: 'REG-104',
      name: 'Muhammed Nihal',
      email: 'nihal@uoc.ac.in',
      affiliation: 'University of Calicut (MLIS)',
      registrationDate: '28 Aug 2026',
      status: 'CONFIRMED',
      attachmentName: 'Student_ID_Scan.pdf',
      mealPreference: 'Standard',
    },
  ]);

  const [searchAttendee, setSearchAttendee] = useState('');
  const [attendeeFilter, setAttendeeFilter] = useState('ALL');

  // Add Attendee Modal
  const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false);
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [newAttendeeAffiliation, setNewAttendeeAffiliation] = useState('');

  // Broadcast Message State
  const [broadcastSubject, setBroadcastSubject] = useState('Colloquium Session Guidelines & Schedule Confirmation');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Dear Delegate,\n\nWe look forward to welcoming you to the International Colloquium on Indian Ocean Manuscript Cultures at KMLRI.\n\nPlease find the detailed session schedule attached and report to the Registration Desk at 09:00 AM on 14 October 2026.'
  );

  useEffect(() => {
    const slug = (eventSlugOrId || '').toLowerCase();
    if (slug.includes('paleography') || slug.includes('workshop')) {
      setEventData({
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
        featured: false,
        status: 'PUBLISHED',
        enableRegistration: true,
      });
    } else if (slug.includes('exhibition') || slug.includes('100-rare')) {
      setEventData({
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
        featured: true,
        status: 'PUBLISHED',
        enableRegistration: true,
      });
    }
  }, [eventSlugOrId]);

  const handleToggleCheckin = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ATTENDED' ? 'CONFIRMED' : 'ATTENDED';
    setAttendees(
      attendees.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );
    setNotification(`Attendee status updated to ${nextStatus}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttendeeName.trim()) return;

    const newA: Attendee = {
      id: `REG-${Date.now().toString().slice(-4)}`,
      name: newAttendeeName,
      email: newAttendeeEmail,
      affiliation: newAttendeeAffiliation || 'Independent Scholar',
      registrationDate: 'Today (Walk-in)',
      status: 'CONFIRMED',
      mealPreference: 'Standard',
    };

    setAttendees([...attendees, newA]);
    setShowAddAttendeeModal(false);
    setNewAttendeeName('');
    setNewAttendeeEmail('');
    setNewAttendeeAffiliation('');
    setNotification(`Attendee "${newA.name}" registered successfully.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveEventEdits = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Event settings and program description updated successfully.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(`Broadcast announcement successfully dispatched to ${attendees.length} confirmed delegates.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchAttendee.toLowerCase()) ||
      a.email.toLowerCase().includes(searchAttendee.toLowerCase()) ||
      a.affiliation.toLowerCase().includes(searchAttendee.toLowerCase());

    const matchesStatus = attendeeFilter === 'ALL' || a.status === attendeeFilter;

    return matchesSearch && matchesStatus;
  });

  const confirmedCount = attendees.filter((a) => a.status === 'CONFIRMED' || a.status === 'ATTENDED').length;
  const attendedCount = attendees.filter((a) => a.status === 'ATTENDED').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      {/* Top Breadcrumb & Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Link
          href="/admin/website/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#A52307] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/events/${eventData.slug}`}
            target="_blank"
            className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Public Page</span>
          </Link>
          <button
            type="button"
            onClick={() => alert('Exporting Attendee Roster (CSV)')}
            className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Event Header Banner Card */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase bg-[#A52307] text-white px-2 py-0.5 rounded">
                {eventData.type}
              </span>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                {eventData.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {eventData.title}
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-1">
              /{eventData.slug} · ID: {eventData.id}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600 mt-2 flex-wrap">
              <span className="flex items-center gap-1 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-[#A52307]" />
                <span>{eventData.date}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{eventData.time}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{eventData.location}</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-[#FAF8F5] p-3 rounded border border-[#E2E0DB] text-center text-xs w-full md:w-auto">
            <div className="px-3 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Registered</span>
              <span className="text-xl font-bold text-gray-900 mt-0.5 block">{confirmedCount} / {eventData.capacity}</span>
            </div>
            <div className="px-3 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Checked In</span>
              <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{attendedCount}</span>
            </div>
            <div className="px-3">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Fill Rate</span>
              <span className="text-xl font-bold font-mono text-[#A52307] mt-0.5 block">
                {Math.round((confirmedCount / eventData.capacity) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E0DB] flex gap-2 flex-wrap">
        {[
          { key: 'attendees', label: `Attendee Registrations (${attendees.length})`, icon: Users },
          { key: 'edit', label: 'Edit Event Program Details', icon: Edit3 },
          { key: 'broadcast', label: 'Broadcast & Delegate Email Blast', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'border-[#A52307] text-[#A52307]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Attendee Registrations & Check-ins */}
      {activeTab === 'attendees' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search attendees by name, email, university..."
                value={searchAttendee}
                onChange={(e) => setSearchAttendee(e.target.value)}
                className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={attendeeFilter}
                onChange={(e) => setAttendeeFilter(e.target.value)}
                className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ATTENDED">Checked In (Attended)</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                type="button"
                onClick={() => setShowAddAttendeeModal(true)}
                className="px-4 h-10 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Attendee</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Delegate Name &amp; Email</th>
                  <th className="py-3 px-4">Institutional Affiliation</th>
                  <th className="py-3 px-4">Abstract / Attachment</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEECE7]">
                {filteredAttendees.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{a.id}</td>
                    <td className="py-3.5 px-4">
                      <strong className="text-gray-900 block text-sm">{a.name}</strong>
                      <span className="text-gray-500 text-[11px] font-mono">{a.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-800 font-semibold">{a.affiliation}</td>
                    <td className="py-3.5 px-4">
                      {a.attachmentName ? (
                        <button
                          type="button"
                          onClick={() => alert(`Downloading attachment: ${a.attachmentName}`)}
                          className="inline-flex items-center gap-1 text-[11px] text-[#A52307] hover:underline font-bold"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>{a.attachmentName}</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{a.registrationDate}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          a.status === 'ATTENDED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : a.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {a.status === 'ATTENDED' ? '✓ Checked In' : a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCheckin(a.id, a.status)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                          a.status === 'ATTENDED'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-black text-white hover:bg-[#A52307]'
                        }`}
                      >
                        {a.status === 'ATTENDED' ? 'Undo Check-In' : 'Check In'}
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Printing delegate badge for ${a.name} (${a.affiliation})`)}
                        className="p-1 text-gray-400 hover:text-gray-900 inline-block"
                        title="Print Name Badge"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Edit Event Details */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveEventEdits} className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs font-sans">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Event Configuration &amp; Program Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">Edit event headline, dates, venue, and registration controls.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-gray-800 block mb-1">Event Title</label>
              <input
                type="text"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">URL Slug</label>
              <input
                type="text"
                value={eventData.slug}
                onChange={(e) => setEventData({ ...eventData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Program Type</label>
              <select
                value={eventData.type}
                onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
              >
                <option value="International Symposium">International Symposium</option>
                <option value="Scholarly Workshop">Scholarly Workshop</option>
                <option value="Public Exhibition">Public Exhibition</option>
                <option value="Memorial Lecture">Memorial Lecture</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Event Dates</label>
              <input
                type="text"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Timing / Hours</label>
              <input
                type="text"
                value={eventData.time}
                onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Venue Location</label>
              <input
                type="text"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Total Capacity</label>
              <input
                type="number"
                value={eventData.capacity}
                onChange={(e) => setEventData({ ...eventData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-800 block mb-1">Program Schedule &amp; Description (Markdown)</label>
              <textarea
                rows={8}
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E0DB] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Event Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Broadcast Email Blast */}
      {activeTab === 'broadcast' && (
        <form onSubmit={handleSendBroadcast} className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs font-sans">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Broadcast Announcement to Attendees</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Send an email bulletin to all {attendees.length} registered delegates regarding schedule updates or instructions.
            </p>
          </div>

          <div>
            <label className="font-bold text-gray-800 block mb-1">Email Subject</label>
            <input
              type="text"
              value={broadcastSubject}
              onChange={(e) => setBroadcastSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none font-semibold"
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-800 block mb-1">Message Body</label>
            <textarea
              rows={6}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded font-sans text-xs text-gray-900 focus:border-[#A52307] outline-none"
              required
            />
          </div>

          <div className="pt-4 border-t border-[#E2E0DB] flex justify-between items-center">
            <span className="text-gray-500 text-[11px]">
              Recipient count: <strong>{attendees.length} confirmed delegates</strong>
            </span>
            <button
              type="submit"
              className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Broadcast Email</span>
            </button>
          </div>
        </form>
      )}

      {/* POPUP MODAL: Add Walk-in Attendee */}
      {showAddAttendeeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-[#E2E0DB]">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Register Walk-in Attendee</h3>
              <button
                type="button"
                onClick={() => setShowAddAttendeeModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAttendee} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Full Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={newAttendeeName}
                  onChange={(e) => setNewAttendeeName(e.target.value)}
                  placeholder="e.g. Dr. Rashid Vattaparamba"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Email Address <span className="text-red-600">*</span></label>
                <input
                  type="email"
                  value={newAttendeeEmail}
                  onChange={(e) => setNewAttendeeEmail(e.target.value)}
                  placeholder="e.g. rashid@kmlri.in"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">University / Affiliation</label>
                <input
                  type="text"
                  value={newAttendeeAffiliation}
                  onChange={(e) => setNewAttendeeAffiliation(e.target.value)}
                  placeholder="e.g. University of Calicut"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setShowAddAttendeeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
