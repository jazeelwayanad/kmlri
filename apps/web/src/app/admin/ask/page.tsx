'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Search, CheckCircle2, Clock, User, Mail, BookOpen, Send, HelpCircle } from 'lucide-react';
import { Badge, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';

interface AskTicket {
  id: string;
  patron: string;
  email: string;
  phone?: string;
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

export default function AdminAskLibrarianPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [tickets, setTickets] = useState<AskTicket[]>([
    {
      id: 'ASK-101',
      patron: 'Dr. Rashid Vattaparamba',
      email: 'rashid@kmlri.in',
      phone: '+91 98471 23456',
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

  const [selectedTicket, setSelectedTicket] = useState<AskTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newShelfmark, setNewShelfmark] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newPriority, setNewPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  const handleOpenReply = (ticket: AskTicket) => {
    setSelectedTicket(ticket);
    setReplyMessage(
      ticket.replyText ||
      `Dear ${ticket.patron},\n\nThank you for contacting the KMLRI Reference Desk regarding "${ticket.topic}".\n\n`
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
    setNotification(`Dispatched email reply to ${selectedTicket.email} and marked inquiry #${selectedTicket.id} as RESOLVED.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `ASK-${Date.now().toString().slice(-4)}`;
    const newEntry: AskTicket = {
      id: newId,
      patron: newName,
      email: newEmail,
      topic: newTopic,
      shelfmark: newShelfmark,
      question: newQuestion,
      status: 'OPEN',
      priority: newPriority,
      assignedTo: 'Reference Desk Queue',
      submittedAt: 'Just now',
    };

    setTickets([newEntry, ...tickets]);
    setIsNewModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewTopic('');
    setNewShelfmark('');
    setNewQuestion('');
    setNotification(`New Inquiry #${newId} logged.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = tickets.filter((t) => {
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
      <PageHeader
        eyebrow="Patron Reference Helpdesk"
        title="Ask-a-Librarian Management"
        description="Manage incoming scholarly research inquiries, codicological citations, shelfmark consultations, and response emails."
        actions={
          <Button variant="dark" icon={Plus} onClick={() => setIsNewModalOpen(true)}>
            Log Reference Ticket
          </Button>
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
        <StatCard label="Pending Inquiries" value={`${openCount} Open`} hint="Awaiting response" hintTone={openCount > 0 ? 'negative' : 'positive'} />
        <StatCard label="In Active Research" value={`${inProgressCount} Tickets`} hint="Assigned to cataloguers" hintTone="warning" />
        <StatCard label="Resolved Tickets" value={`${resolvedCount} Closed`} hint="Dispatched to scholars" hintTone="positive" />
        <StatCard label="Response SLA" value="< 24 Hours" hint="Target turnaround" hintTone="positive" />
      </div>

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
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p>No reference inquiries found.</p>
          </div>
        ) : (
          filtered.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow border-l-4 border-l-black">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {t.id}
                    </span>
                    <Badge variant={t.status === 'OPEN' ? 'warning' : t.status === 'IN_PROGRESS' ? 'info' : 'success'}>
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
                  <Button variant="dark" icon={Send} onClick={() => handleOpenReply(t)}>
                    {t.status === 'RESOLVED' ? 'View / Edit Reply' : 'Reply & Resolve'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Reply Modal */}
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
              <button type="button" onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">
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
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">Log In-Person or Phone Reference Inquiry</h2>
              <button type="button" onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">
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
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Dr. K. M. Sharif"
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
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
                  placeholder="Record research query..."
                  className="w-full p-2 border rounded border-gray-300"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
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
