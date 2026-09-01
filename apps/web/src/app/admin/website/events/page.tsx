'use client';

import { useState } from 'react';
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
  Settings2
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function WebsiteEventsPage() {
  const [events, setEvents] = useState([
    {
      id: 'EVT-01',
      title: 'International Colloquium on Indian Ocean Manuscript Cultures',
      slug: 'international-colloquium-indian-ocean-manuscripts',
      excerpt: 'A three-day symposium convening manuscript conservators and maritime epigraphers.',
      description: 'The colloquium explores codicological networks linking Malabar with the Red Sea and Swahili Coast.',
      date: '14–16 October 2026',
      time: '09:30 AM – 05:30 PM IST',
      type: 'International Symposium',
      location: 'KMLRI Main Auditorium & Archival Gallery',
      capacity: 150,
      featured: true,
      status: 'PUBLISHED',
      enableRegistration: true,
      customFields: [
        { id: 'f1', label: 'Institutional Affiliation', type: 'text', required: true },
        { id: 'f2', label: 'Paper Abstract (PDF upload)', type: 'file', required: true },
        { id: 'f3', label: 'Meal Preference', type: 'select', options: ['Standard', 'Vegetarian'], required: false },
      ],
      registrations: [
        { id: 'REG-101', name: 'Dr. Tariq al-Omani', email: 'tariq@squ.edu.om', affiliation: 'Sultan Qaboos University', attachmentName: 'Abstract_Tariq_Malabar_Oman.pdf', status: 'CONFIRMED' },
        { id: 'REG-102', name: 'Prof. Ananya Sen', email: 'asen@jnu.ac.in', affiliation: 'Jawaharlal Nehru University', attachmentName: 'Paper_Sen_Maritime_Epigraphy.pdf', status: 'CONFIRMED' },
      ],
    },
    {
      id: 'EVT-02',
      title: 'Workshop: Reading 17th Century Arabi-Malayalam Paleography',
      slug: 'workshop-reading-arabi-malayalam-paleography',
      excerpt: 'Hands-on training in deciphering regional script ligatures and archival orthography.',
      description: 'Intensive archival seminar for post-graduate students in Kerala history.',
      date: '05 November 2026',
      time: '10:00 AM – 04:00 PM IST',
      type: 'Scholarly Workshop',
      location: 'Seminar Hall B',
      capacity: 35,
      featured: false,
      status: 'PUBLISHED',
      enableRegistration: true,
      customFields: [
        { id: 'f1', label: 'University Student ID', type: 'text', required: true },
        { id: 'f2', label: 'Recommendation Letter', type: 'file', required: false },
      ],
      registrations: [
        { id: 'REG-201', name: 'Muhammed Nihal', email: 'nihal@uoc.ac.in', affiliation: 'University of Calicut', attachmentName: 'ID_Card_Scan.pdf', status: 'CONFIRMED' },
      ],
    },
  ]);

  const [search, setSearch] = useState('');
  const [selectedEventForRoster, setSelectedEventForRoster] = useState<any | null>(null);
  
  // Modal for new event
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM – 04:00 PM');
  const [type, setType] = useState('International Symposium');
  const [location, setLocation] = useState('KMLRI Auditorium');
  const [capacity, setCapacity] = useState(100);
  const [featured, setFeatured] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [customFields, setCustomFields] = useState<any[]>([
    { id: 'f1', label: 'Institutional Affiliation', type: 'text', required: true },
    { id: 'f2', label: 'Statement of Interest / CV', type: 'file', required: true },
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
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

  const handleAddField = () => {
    if (!newFieldLabel) return;
    setCustomFields([
      ...customFields,
      { id: `f-${Date.now()}`, label: newFieldLabel, type: newFieldType, required: newFieldRequired },
    ]);
    setNewFieldLabel('');
  };

  const handleRemoveField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newE = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      title,
      slug,
      excerpt,
      description,
      date,
      time,
      type,
      location,
      capacity: Number(capacity),
      featured,
      status: 'PUBLISHED',
      enableRegistration,
      customFields,
      registrations: [],
    };
    setEvents([newE, ...events]);
    setShowModal(false);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setDescription('');
    setDate('');
    setNotification(`Event "${title}" published with registration form configuration.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Website Management · Academic Programs"
        title="Events &amp; Symposiums Management"
        description="Schedule academic conferences, workshops, and lectures. Build custom registration forms with file attachments and manage attendee rosters."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
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

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title or type..."
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
              <th className="py-3 px-4">Event Title &amp; Schedule</th>
              <th className="py-3 px-4">Type &amp; Venue</th>
              <th className="py-3 px-4">Capacity &amp; Reg.</th>
              <th className="py-3 px-4">Custom Fields</th>
              <th className="py-3 px-4 text-right">Roster &amp; Desk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((evt) => (
              <tr key={evt.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 max-w-sm">
                  <div className="flex items-center gap-1.5">
                    {evt.featured && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Featured</span>
                      </span>
                    )}
                    <span className="font-bold text-sm text-gray-900 leading-tight block">
                      {evt.title}
                    </span>
                  </div>
                  <span className="text-gray-500 text-[11px] flex items-center gap-1 mt-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#A52307]" />
                    <span>{evt.date} · {evt.time}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-gray-800 block">{evt.type}</span>
                  <span className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{evt.location}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                  {evt.registrations.length} / {evt.capacity} Registered
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-gray-600 text-xs">
                    {evt.customFields.length} Form Fields ({evt.customFields.filter(f=>f.type==='file').length} Attachments)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedEventForRoster(evt)}
                    className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Attendees ({evt.registrations.length})</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Registrations Roster Drawer */}
      {selectedEventForRoster && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A52307]">Registration Roster</p>
              <h3 className="font-bold text-gray-900 text-lg">{selectedEventForRoster.title}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{selectedEventForRoster.date} · {selectedEventForRoster.location}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => alert('Exporting registrations list CSV')}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventForRoster(null)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close Roster
              </button>
            </div>
          </div>

          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Reg #</th>
                <th className="py-3 px-4">Attendee Name &amp; Email</th>
                <th className="py-3 px-4">Affiliation / Institution</th>
                <th className="py-3 px-4">Uploaded Attachment</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {selectedEventForRoster.registrations.map((r: any) => (
                <tr key={r.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{r.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block">{r.name}</span>
                    <span className="text-gray-500 text-[11px]">{r.email}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700">{r.affiliation}</td>
                  <td className="py-3.5 px-4">
                    {r.attachmentName ? (
                      <button
                        type="button"
                        onClick={() => alert(`Downloading submitted file: ${r.attachmentName}`)}
                        className="inline-flex items-center gap-1 text-[#A52307] font-semibold hover:underline font-mono text-[11px]"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{r.attachmentName}</span>
                      </button>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Schedule Academic Event</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Event Title*</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs font-semibold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Event Date(s)*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14–16 October 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Time Schedule</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  >
                    <option value="International Symposium">International Symposium</option>
                    <option value="Scholarly Workshop">Scholarly Workshop</option>
                    <option value="Public Lecture">Public Lecture</option>
                    <option value="Archival Exhibition">Archival Exhibition</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Location / Venue</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Maximum Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Excerpt / Brief Summary</label>
                  <textarea
                    rows={2}
                    required
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Detailed Description &amp; Program</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                  />
                </div>

                {/* Dynamic Registration Builder Block */}
                <div className="col-span-full bg-[#FAF8F5] p-4 border border-[#E2E0DB] rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-gray-900 block text-sm">Public Registration Form</strong>
                      <span className="text-gray-500 text-[11px]">Enable online attendee registration with custom field attachments</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={enableRegistration}
                        onChange={(e) => setEnableRegistration(e.target.checked)}
                        className="rounded text-[#A52307]"
                      />
                      <span>Enable Registration</span>
                    </label>
                  </div>

                  {enableRegistration && (
                    <div className="space-y-3 pt-2 border-t border-[#E2E0DB]">
                      <p className="font-bold text-gray-700 uppercase text-[10px]">Configured Form Fields</p>
                      <div className="space-y-1.5">
                        {customFields.map((f) => (
                          <div key={f.id} className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{f.label}</span>
                              <span className="text-[10px] text-gray-400 uppercase">({f.type})</span>
                              {f.required && (
                                <span className="text-[10px] text-[#A52307] font-bold">Required</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveField(f.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Custom Field row */}
                      <div className="flex gap-2 pt-2 flex-wrap sm:flex-nowrap">
                        <input
                          type="text"
                          placeholder="Field label (e.g. Abstract PDF, Designation)"
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                          className="flex-1 border border-gray-300 h-9 px-2.5 rounded text-xs outline-none bg-white"
                        />
                        <select
                          value={newFieldType}
                          onChange={(e) => setNewFieldType(e.target.value)}
                          className="border border-gray-300 h-9 px-2 rounded text-xs bg-white"
                        >
                          <option value="text">Text Input</option>
                          <option value="textarea">Long Text</option>
                          <option value="file">File Attachment</option>
                        </select>
                        <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={newFieldRequired}
                            onChange={(e) => setNewFieldRequired(e.target.checked)}
                          />
                          <span>Required</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddField}
                          className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307] whitespace-nowrap"
                        >
                          + Add Field
                        </button>
                      </div>
                    </div>
                  )}
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
                  Publish Event Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
