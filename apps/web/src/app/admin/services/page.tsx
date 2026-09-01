'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  CheckCircle2, 
  Check, 
  Clock, 
  User, 
  Mail, 
  FileText, 
  Send, 
  Filter, 
  DoorOpen, 
  Download, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { Badge, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';

interface AskTicket {
  id: string;
  patron: string;
  email: string;
  phone?: string;
  affiliation?: string;
  topic: string;
  shelfmark?: string;
  question: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  assignedTo: string;
  submittedAt: string;
  replyText?: string;
  resolvedAt?: string;
}

interface ScanRequest {
  id: string;
  patron: string;
  email: string;
  title: string;
  shelfmark: string;
  folios: string;
  format: 'TIFF_RAW' | 'PDF_OCR' | 'JPEG_HIGH';
  status: 'PENDING' | 'IN_SCAN' | 'COMPLETED';
  date: string;
}

interface RoomBooking {
  id: string;
  roomName: string;
  patron: string;
  email: string;
  date: string;
  timeSlot: string;
  purpose: string;
  status: 'CONFIRMED' | 'PENDING_APPROVAL' | 'CANCELLED';
}

export default function ServicesAdminPage() {
  const [activeTab, setActiveTab] = useState<'ask' | 'scans' | 'rooms'>('ask');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Tickets state
  const [tickets, setTickets] = useState<AskTicket[]>([
    {
      id: 'ASK-101',
      patron: 'Dr. Rashid Vattaparamba',
      email: 'rashid@kmlri.in',
      phone: '+91 98471 23456',
      affiliation: 'Dept. of Arabic, University of Calicut',
      topic: 'Marginal annotations on 17th-century Fiqh codices',
      shelfmark: 'MS-1049 (Fatḥ al-Muʿīn annotated)',
      question: 'I am comparing the glosses on riverine agrarian fatwas in MS-1049 with the Tanur copies. Are there higher-resolution color plates or transcriptions available for folios 45b to 48a?',
      status: 'OPEN',
      priority: 'HIGH',
      assignedTo: 'Dr. Taha Malabari (Senior Archivist)',
      submittedAt: 'Today, 09:15 AM',
    },
    {
      id: 'ASK-102',
      patron: 'Fathima Maryam',
      email: 'fathima.m@jnu.ac.in',
      phone: '+91 94460 98765',
      affiliation: 'School of Historical Studies, JNU',
      topic: 'Scribe identification in Tuḥfat al-Mujāhidīn manuscripts',
      shelfmark: 'RB-0412',
      question: 'Is the colophon in copy RB-0412 written by the same scribe as the Ponnani Jum’ah Masjid repository manuscript?',
      status: 'IN_PROGRESS',
      priority: 'NORMAL',
      assignedTo: 'Mariam Farooqi (Paleography Specialist)',
      submittedAt: 'Yesterday, 03:30 PM',
    },
    {
      id: 'ASK-103',
      patron: 'Prof. Zakariyya Nadwi',
      email: 'zakariyya@aljamia.edu',
      phone: '+91 97455 11223',
      affiliation: 'Al-Jamia Al-Islamiya',
      topic: 'Permission for consulting restricted palm-leaf legal scrolls',
      shelfmark: 'PL-0089',
      question: 'Visiting KMLRI next Tuesday with two doctoral scholars. Can we request physical inspection of PL-0089 in the supervised rare book room?',
      status: 'RESOLVED',
      priority: 'URGENT',
      assignedTo: 'Chief Librarian Desk',
      submittedAt: '28 Aug 2026',
      replyText: 'Appointment confirmed for Tuesday 10:00 AM in Rare Manuscript Room 1 with Conservator supervision.',
      resolvedAt: '28 Aug 2026, 05:00 PM',
    },
    {
      id: 'ASK-104',
      patron: 'Hamza K. P.',
      email: 'hamza.scholar@gmail.com',
      topic: 'Arabi-Malayalam lithograph title lookup',
      shelfmark: 'PRINT-AML-019',
      question: 'Looking for the 1924 Tellicherry print edition of Safala Mala. Is it catalogued under periodicals or rare print?',
      status: 'OPEN',
      priority: 'NORMAL',
      assignedTo: 'Reference Desk Staff',
      submittedAt: 'Today, 11:20 AM',
    },
  ]);

  // Scans state
  const [scanRequests, setScanRequests] = useState<ScanRequest[]>([
    {
      id: 'SCN-201',
      patron: 'Dr. Rashid Vattaparamba',
      email: 'rashid@kmlri.in',
      title: 'Fatḥ al-Muʿīn with Marginalia',
      shelfmark: 'MS-1049',
      folios: 'Folios 45b–48a (8 exposures)',
      format: 'TIFF_RAW',
      status: 'IN_SCAN',
      date: '01 Sep 2026',
    },
    {
      id: 'SCN-202',
      patron: 'Aisha Al-Hadhrami',
      email: 'aisha.hadhrami@soas.ac.uk',
      title: 'Maritime Logs of Malabar Trade',
      shelfmark: 'MS-0892',
      folios: 'Complete codex (120 folios)',
      format: 'PDF_OCR',
      status: 'PENDING',
      date: '31 Aug 2026',
    },
  ]);

  // Room bookings state
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([
    {
      id: 'ROOM-401',
      roomName: 'Manuscript Research Carrel #2',
      patron: 'Prof. Zakariyya Nadwi',
      email: 'zakariyya@aljamia.edu',
      date: '02 Sep 2026',
      timeSlot: '10:00 AM - 02:00 PM',
      purpose: 'Palm-leaf scroll decipherment',
      status: 'CONFIRMED',
    },
    {
      id: 'ROOM-402',
      roomName: 'Digital Scholar Discussion Room A',
      patron: 'Malabar History Reading Group',
      email: 'history.club@kmlri.in',
      date: '03 Sep 2026',
      timeSlot: '02:00 PM - 05:00 PM',
      purpose: 'Seminar preparation & codicology workshop',
      status: 'PENDING_APPROVAL',
    },
  ]);

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<AskTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  // New ticket form state
  const [newPatronName, setNewPatronName] = useState('');
  const [newPatronEmail, setNewPatronEmail] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newShelfmark, setNewShelfmark] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newPriority, setNewPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  const handleOpenReply = (ticket: AskTicket) => {
    setSelectedTicket(ticket);
    setReplyMessage(
      ticket.replyText ||
      `Dear ${ticket.patron},\n\nThank you for reaching out to the KMLRI Reference Desk regarding "${ticket.topic}".\n\n`
    );
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setTickets(
      tickets.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              status: 'RESOLVED',
              replyText: replyMessage,
              resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
            }
          : t
      )
    );

    setSelectedTicket(null);
    setNotification(`Response successfully dispatched to ${selectedTicket.email} and ticket #${selectedTicket.id} marked as RESOLVED.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `ASK-${Date.now().toString().slice(-4)}`;
    const newEntry: AskTicket = {
      id: newId,
      patron: newPatronName,
      email: newPatronEmail,
      topic: newTopic,
      shelfmark: newShelfmark,
      question: newQuestion,
      status: 'OPEN',
      priority: newPriority,
      assignedTo: 'Reference Desk Queue',
      submittedAt: 'Just now',
    };

    setTickets([newEntry, ...tickets]);
    setIsNewTicketModalOpen(false);
    setNewPatronName('');
    setNewPatronEmail('');
    setNewTopic('');
    setNewShelfmark('');
    setNewQuestion('');
    setNotification(`New Reference Inquiry #${newId} logged successfully.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleScanStatusToggle = (id: string) => {
    setScanRequests(
      scanRequests.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === 'PENDING' ? 'IN_SCAN' : s.status === 'IN_SCAN' ? 'COMPLETED' : 'COMPLETED';
        return { ...s, status: nextStatus };
      })
    );
    setNotification(`Scan Request #${id} updated.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRoomApprove = (id: string) => {
    setRoomBookings(
      roomBookings.map((r) => (r.id === id ? { ...r, status: 'CONFIRMED' } : r))
    );
    setNotification(`Space booking #${id} confirmed and notification sent.`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.patron.toLowerCase().includes(search.toLowerCase()) ||
      t.topic.toLowerCase().includes(search.toLowerCase()) ||
      t.question.toLowerCase().includes(search.toLowerCase()) ||
      (t.shelfmark && t.shelfmark.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Patron Reference & Research Support"
        title="Ask-a-Librarian & Reference Support Desk"
        description="Manage scholar research inquiries, codicological citations, rare manuscript scan orders, research carrel allocations, and patron advisory queries."
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="dark"
              icon={Plus}
              onClick={() => setIsNewTicketModalOpen(true)}
            >
              Log Reference Ticket
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
        <StatCard
          label="Open Inquiries"
          value={`${openCount} Pending`}
          hint="Requires librarian reply"
          hintTone={openCount > 0 ? 'negative' : 'positive'}
        />
        <StatCard
          label="In Research Review"
          value={`${inProgressCount} Tickets`}
          hint="Assigned to paleographers"
          hintTone="warning"
        />
        <StatCard
          label="Reproduction Orders"
          value={`${scanRequests.filter((s) => s.status !== 'COMPLETED').length} Active`}
          hint="Digitisation lab queue"
        />
        <StatCard
          label="Resolved Inquiries"
          value={`${resolvedCount} Closed`}
          hint="Average reply: < 4 hrs"
          hintTone="positive"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('ask')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'ask'
              ? 'bg-black text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask-a-Librarian Queue ({openCount + inProgressCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'scans'
              ? 'bg-black text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reproduction &amp; Scan Orders ({scanRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-black text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Research Carrel Bookings ({roomBookings.length})</span>
        </button>
      </div>

      {/* 1. Ask-a-Librarian Section */}
      {activeTab === 'ask' && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-gray-500 uppercase tracking-wider">Status:</span>
              {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded border text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patron, topic, shelfmark..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded outline-none focus:border-black"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
                <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold">No reference tickets found for this filter.</p>
              </div>
            ) : (
              filteredTickets.map((t) => (
                <Card key={t.id} className="hover:shadow-md transition-shadow border-l-4 border-l-black">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {t.id}
                        </span>
                        <Badge
                          variant={
                            t.status === 'OPEN'
                              ? 'warning'
                              : t.status === 'IN_PROGRESS'
                              ? 'info'
                              : 'success'
                          }
                        >
                          {t.status}
                        </Badge>
                        {t.priority === 'URGENT' && (
                          <span className="text-[10px] uppercase font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-300">
                            Urgent
                          </span>
                        )}
                        {t.priority === 'HIGH' && (
                          <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                            High Priority
                          </span>
                        )}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {t.submittedAt}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900">{t.topic}</h3>

                      <div className="bg-[#FAF8F5] p-3 border border-gray-200 rounded text-xs text-gray-800 leading-relaxed font-serif">
                        <p className="italic">"{t.question}"</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-900">{t.patron}</span>
                          <span className="text-gray-400">({t.email})</span>
                        </div>
                        {t.shelfmark && (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#A52307] bg-red-50 px-2 py-0.5 border border-red-200 rounded">
                            <BookOpen className="w-3 h-3" />
                            <span>{t.shelfmark}</span>
                          </div>
                        )}
                        <div className="text-gray-500">
                          Assigned: <span className="font-medium text-gray-800">{t.assignedTo}</span>
                        </div>
                      </div>

                      {t.replyText && (
                        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
                          <strong>Resolved Response ({t.resolvedAt}):</strong> {t.replyText}
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col items-end gap-2 justify-end">
                      <Button
                        variant="dark"
                        icon={Send}
                        onClick={() => handleOpenReply(t)}
                      >
                        {t.status === 'RESOLVED' ? 'View / Edit Reply' : 'Reply & Resolve'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. Reproduction & Scan Orders Section */}
      {activeTab === 'scans' && (
        <Card className="overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">High-Resolution Manuscript Reproduction Orders</h3>
              <p className="text-xs text-gray-500">Orders submitted by visiting scholars for digital reading room downloads</p>
            </div>
            <span className="text-xs text-gray-400 uppercase font-semibold">{scanRequests.length} Orders in Queue</span>
          </div>

          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
                <th className="pb-3 pt-2 px-3">Order ID</th>
                <th className="pb-3 pt-2 px-3">Patron</th>
                <th className="pb-3 pt-2 px-3">Codex Title &amp; Shelfmark</th>
                <th className="pb-3 pt-2 px-3">Folio Range</th>
                <th className="pb-3 pt-2 px-3">Output Format</th>
                <th className="pb-3 pt-2 px-3">Status</th>
                <th className="pb-3 pt-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scanRequests.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-mono font-bold text-gray-900">{s.id}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-gray-900">{s.patron}</div>
                    <div className="text-gray-400 text-[11px]">{s.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-gray-900">{s.title}</div>
                    <span className="font-mono text-[11px] text-[#A52307]">{s.shelfmark}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-700">{s.folios}</td>
                  <td className="py-3 px-3">
                    <span className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-mono text-[11px]">
                      {s.format}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={s.status === 'COMPLETED' ? 'success' : s.status === 'IN_SCAN' ? 'info' : 'warning'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      variant="outline"
                      onClick={() => handleScanStatusToggle(s.id)}
                    >
                      {s.status === 'PENDING' ? 'Start Digitisation' : s.status === 'IN_SCAN' ? 'Mark Completed' : 'Download Bundle'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* 3. Research Carrels & Spaces Section */}
      {activeTab === 'rooms' && (
        <Card className="overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Study Carrels &amp; Research Discussion Spaces</h3>
              <p className="text-xs text-gray-500">Allocate supervised carrels for manuscript inspection and group discussions</p>
            </div>
            <span className="text-xs text-gray-400 uppercase font-semibold">{roomBookings.length} Bookings</span>
          </div>

          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
                <th className="pb-3 pt-2 px-3">Booking ID</th>
                <th className="pb-3 pt-2 px-3">Space / Carrel</th>
                <th className="pb-3 pt-2 px-3">Reserved By</th>
                <th className="pb-3 pt-2 px-3">Date &amp; Slot</th>
                <th className="pb-3 pt-2 px-3">Research Purpose</th>
                <th className="pb-3 pt-2 px-3">Status</th>
                <th className="pb-3 pt-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roomBookings.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-mono font-bold text-gray-900">{r.id}</td>
                  <td className="py-3 px-3 font-bold text-gray-900">{r.roomName}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-gray-900">{r.patron}</div>
                    <div className="text-gray-400 text-[11px]">{r.email}</div>
                  </td>
                  <td className="py-3 px-3 text-gray-700 font-semibold">{r.date} · {r.timeSlot}</td>
                  <td className="py-3 px-3 text-gray-600 italic">"{r.purpose}"</td>
                  <td className="py-3 px-3">
                    <Badge variant={r.status === 'CONFIRMED' ? 'success' : 'warning'}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {r.status === 'PENDING_APPROVAL' ? (
                      <Button variant="dark" onClick={() => handleRoomApprove(r.id)}>
                        Approve Slot
                      </Button>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-xs">✓ Slot Key Issued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Reply & Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#A52307]">
                  {selectedTicket.id} · Reference Response
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">{selectedTicket.topic}</h2>
                <p className="text-xs text-gray-500">Patron: {selectedTicket.patron} ({selectedTicket.email})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-3.5 border border-gray-200 rounded text-xs space-y-1.5 font-serif">
              <div className="font-bold text-gray-700 font-sans uppercase text-[10px] tracking-wider">Patron's Research Question:</div>
              <p className="text-gray-900 leading-relaxed italic">"{selectedTicket.question}"</p>
              {selectedTicket.shelfmark && (
                <div className="font-sans text-[11px] text-[#A52307] font-semibold pt-1">
                  Referenced Shelfmark: {selectedTicket.shelfmark}
                </div>
              )}
            </div>

            {/* Quick Templates */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-gray-500 font-semibold text-[11px]">Quick Insert:</span>
              <button
                type="button"
                onClick={() =>
                  setReplyMessage(
                    (prev) =>
                      prev +
                      `\nThe manuscript shelfmark is confirmed available in Reading Room Carrel 1. You may consult it Monday through Saturday between 09:00 and 17:00 with your research scholar membership card.`
                  )
                }
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-medium"
              >
                + Reading Room Available
              </button>
              <button
                type="button"
                onClick={() =>
                  setReplyMessage(
                    (prev) =>
                      prev +
                      `\nA high-resolution IIIF folio scan has been generated by the conservation lab and added to your Digital Reading Room repository account for unrestricted study.`
                  )
                }
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-medium"
              >
                + Digital Scan Dispatched
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Librarian's Official Written Response (Dispatched to Patron's Email) *
                </label>
                <textarea
                  required
                  rows={7}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-3 border rounded border-gray-300 text-sm font-sans outline-none focus:border-black"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Cancel
                </Button>
                <Button variant="dark" icon={Send} type="submit">
                  Dispatch Email &amp; Mark Resolved
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual New Ticket Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">Log In-Person or Phone Reference Inquiry</h2>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Patron Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatronName}
                    onChange={(e) => setNewPatronName(e.target.value)}
                    placeholder="e.g. Dr. K. M. Sharif"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newPatronEmail}
                    onChange={(e) => setNewPatronEmail(e.target.value)}
                    placeholder="e.g. sharif@univ.edu"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Inquiry Topic / Subject *</label>
                  <input
                    type="text"
                    required
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Arabi-Malayalam Trade Glosses"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Referenced Shelfmark (Optional)</label>
                  <input
                    type="text"
                    value={newShelfmark}
                    onChange={(e) => setNewShelfmark(e.target.value)}
                    placeholder="e.g. MS-1049, RB-089"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full p-2 border rounded border-gray-300"
                >
                  <option value="NORMAL">Normal Queue (Reply within 48h)</option>
                  <option value="HIGH">High Priority (Reply within 24h)</option>
                  <option value="URGENT">Urgent (Immediate Research Desk Action)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Inquiry / Question Text *</label>
                <textarea
                  required
                  rows={4}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Record the research questions, manuscripts requested, or citation queries..."
                  className="w-full p-2 border rounded border-gray-300"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button variant="outline" onClick={() => setIsNewTicketModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" type="submit">
                  Log Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
