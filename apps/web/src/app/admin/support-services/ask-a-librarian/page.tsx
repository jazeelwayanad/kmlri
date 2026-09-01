'use client';

import { useState } from 'react';
import { MessageSquare, Search, Send, CheckCircle2 } from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function AskALibrarianPage() {
  const [inquiries, setInquiries] = useState([
    {
      id: 'INQ-101',
      patron: 'Dr. Tariq al-Omani (Sultan Qaboos Univ)',
      email: 'tariq@squ.edu.om',
      subject: 'Clarification regarding Arabi-Malayalam marginalia in MS 0142',
      details: 'Seeking high-resolution scans of folios 44b–46a containing coastal navigation terminology.',
      status: 'PENDING_REPLY',
      date: '01 Sep 2026, 09:30 AM',
    },
    {
      id: 'INQ-102',
      patron: 'Maryam Siddiqa (AMU Scholar)',
      email: 'maryam.s@aligarh.edu',
      subject: 'Permission for doctoral dissertation citation of Makhdūm correspondence',
      details: 'Requesting formal archival clearance and institutional citation DOI for research thesis.',
      status: 'ANSWERED',
      date: '31 Aug 2026, 03:15 PM',
    },
  ]);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleResolve = (id: string) => {
    setInquiries(inquiries.map((i) => i.id === id ? { ...i, status: 'ANSWERED' } : i));
    setNotification(`Inquiry #${id} marked as answered and response logged.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = inquiries.filter((i) =>
    i.subject.toLowerCase().includes(search.toLowerCase()) ||
    i.patron.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Support &amp; Services · Consultation Desk"
        title="Ask a Librarian"
        description="Review incoming research inquiries, archival manuscript consultation queries, and dispatch scholar responses."
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
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-base">Inquiries Queue ({filtered.length})</h3>
        <div className="divide-y divide-[#EEECE7]">
          {filtered.map((inq) => (
            <div key={inq.id} className="py-4 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-gray-900 mr-2">{inq.id}</span>
                  <span className="font-bold text-gray-900 text-sm">{inq.subject}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  inq.status === 'PENDING_REPLY' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {inq.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed bg-[#FAF8F5] p-3 rounded border border-[#E2E0DB]">
                {inq.details}
              </p>
              <div className="flex justify-between items-center text-gray-500 pt-1">
                <span>From: <strong className="text-gray-800">{inq.patron}</strong> ({inq.email}) · {inq.date}</span>
                {inq.status === 'PENDING_REPLY' && (
                  <button
                    type="button"
                    onClick={() => handleResolve(inq.id)}
                    className="px-3 py-1 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Dispatch Response</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
