'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, CheckCircle2, Clock, User, Send, HelpCircle } from 'lucide-react';
import { Badge, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Question {
  id: string;
  name: string;
  email: string;
  subject?: string;
  question: string;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  answer?: string;
  answeredAt?: string;
  createdAt: string;
}

function formatDateTime(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AdminAskLibrarianPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'ANSWERED' | 'CLOSED'>('ALL');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState<Question | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [creating, setCreating] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.getReferenceQuestions();
      setQuestions(data || []);
    } catch {
      setNotification('Could not load reference questions from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleOpenReply = (ticket: Question) => {
    setSelectedTicket(ticket);
    setReplyMessage(ticket.answer || `Dear ${ticket.name},\n\nThank you for contacting the KMLRI Reference Desk${ticket.subject ? ` regarding "${ticket.subject}"` : ''}.\n\n`);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSending(true);
    try {
      await api.answerReferenceQuestion(selectedTicket.id, replyMessage);
      setNotification(`Reply saved for inquiry from ${selectedTicket.name} and marked ANSWERED.`);
      setSelectedTicket(null);
      await loadQuestions();
    } catch (err: any) {
      setNotification(err.message || 'Could not save the reply.');
    } finally {
      setSending(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.submitReferenceQuestion({ name: newName, email: newEmail, subject: newSubject, question: newQuestion });
      setIsNewModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewSubject('');
      setNewQuestion('');
      setNotification('New inquiry logged.');
      await loadQuestions();
    } catch (err: any) {
      setNotification(err.message || 'Could not log the inquiry.');
    } finally {
      setCreating(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = questions.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      t.question.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openCount = questions.filter((t) => t.status === 'OPEN').length;
  const answeredCount = questions.filter((t) => t.status === 'ANSWERED').length;
  const closedCount = questions.filter((t) => t.status === 'CLOSED').length;

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Patron Reference Helpdesk"
        title="Ask-a-Librarian Management"
        description="Manage incoming scholarly research inquiries and response emails."
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending Inquiries" value={`${openCount} Open`} hint="Awaiting response" hintTone={openCount > 0 ? 'negative' : 'positive'} />
        <StatCard label="Answered" value={`${answeredCount} Tickets`} hint="Reply sent to patron" hintTone="positive" />
        <StatCard label="Closed" value={`${closedCount} Tickets`} hint="Archived inquiries" hintTone="positive" />
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-gray-500 uppercase tracking-wider">Status:</span>
          {(['ALL', 'OPEN', 'ANSWERED', 'CLOSED'] as const).map((st) => (
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
            placeholder="Search patron, subject, question..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded outline-none focus:border-black"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">Loading inquiries…</div>
        ) : filtered.length === 0 ? (
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
                      {t.id.slice(0, 8)}
                    </span>
                    <Badge variant={t.status === 'OPEN' ? 'warning' : t.status === 'ANSWERED' ? 'info' : 'success'}>
                      {t.status}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {formatDateTime(t.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{t.subject || 'General Inquiry'}</h3>

                  <div className="bg-[#FAF8F5] p-3 border border-gray-200 rounded text-xs text-gray-800 leading-relaxed font-serif">
                    <p className="italic">&quot;{t.question}&quot;</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-900">{t.name}</span>
                      <span className="text-gray-400">({t.email})</span>
                    </div>
                  </div>

                  {t.answer && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
                      <strong>Response ({formatDateTime(t.answeredAt)}):</strong> {t.answer}
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col items-end gap-2 justify-end">
                  <Button variant="dark" icon={Send} onClick={() => handleOpenReply(t)}>
                    {t.status !== 'OPEN' ? 'View / Edit Reply' : 'Reply & Resolve'}
                  </Button>
                  {t.status !== 'CLOSED' && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          await api.closeReferenceQuestion(t.id);
                          await loadQuestions();
                        } catch (err: any) {
                          setNotification(err.message || 'Could not close ticket.');
                        }
                      }}
                    >
                      Close Ticket
                    </Button>
                  )}
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
                <span className="font-mono text-xs font-bold text-[#A52307]">Reference Response</span>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">{selectedTicket.subject || 'General Inquiry'}</h2>
                <p className="text-xs text-gray-500">Patron: {selectedTicket.name} ({selectedTicket.email})</p>
              </div>
              <button type="button" onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-3.5 border border-gray-200 rounded text-xs space-y-1.5 font-serif">
              <div className="font-bold text-gray-700 font-sans uppercase text-[10px] tracking-wider">Patron&apos;s Research Question:</div>
              <p className="text-gray-900 leading-relaxed italic">&quot;{selectedTicket.question}&quot;</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Librarian&apos;s Written Response
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
                  {sending ? 'Saving…' : 'Save Reply & Mark Answered'}
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

              <div>
                <label className="block font-semibold mb-1">Inquiry Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Arabi-Malayalam Trade Glosses"
                  className="w-full p-2 border rounded border-gray-300"
                />
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
                  {creating ? 'Logging…' : 'Log Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
