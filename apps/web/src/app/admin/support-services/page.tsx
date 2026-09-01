'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Check, 
  X,
  Mail,
  Send
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function SupportServicesAdminPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('tab') as any) || 'inquiries';
  const [activeTab, setActiveTab] = useState<'inquiries' | 'document_delivery' | 'carrel_bookings'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['inquiries', 'document_delivery', 'carrel_bookings'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);
  const [notification, setNotification] = useState<string | null>(null);

  // Inquiries State
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

  // Document Delivery State
  const [docRequests, setDocRequests] = useState([
    {
      id: 'DOC-201',
      patron: 'Prof. K. A. Najeeb (MEM-1004)',
      title: 'Tuḥfat al-Mujāhidīn (Latin Edition, 1833 Lithograph)',
      shelfmark: 'RB 0908',
      requestedPages: 'Folios 12–35 (Chapter on Portuguese maritime blockades)',
      format: 'High-Res OCR PDF',
      status: 'PROCESSING',
      date: '01 Sep 2026',
    },
  ]);

  // Carrel Bookings State
  const [bookings, setBookings] = useState([
    {
      id: 'CAR-301',
      patron: 'Rashid Vattaparamba (MEM-2026-0001)',
      facility: 'Manuscript Consultation Carrel #02',
      date: '02 Sep 2026',
      timeSlot: '09:30 AM – 01:30 PM',
      purpose: 'Foliated codicological examination of MS 0142',
      status: 'APPROVED',
    },
    {
      id: 'CAR-302',
      patron: 'Amina Sabeelul (MEM-2026-0002)',
      facility: 'Digital Microfilm Reader Station #01',
      date: '03 Sep 2026',
      timeSlot: '02:00 PM – 05:00 PM',
      purpose: 'Review of Al-Bayān periodical microfiches',
      status: 'PENDING_APPROVAL',
    },
  ]);

  const handleResolveInquiry = (id: string) => {
    setInquiries(inquiries.map((i) => i.id === id ? { ...i, status: 'ANSWERED' } : i));
    setNotification(`Inquiry #${id} marked as resolved and email dispatch recorded.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApproveBooking = (id: string) => {
    setBookings(bookings.map((b) => b.id === id ? { ...b, status: 'APPROVED' } : b));
    setNotification(`Carrel booking #${id} confirmed.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Support Desk"
        title="Support &amp; Research Services"
        description="Manage Ask-a-Librarian scholar inquiries, digital document delivery requests, and archival reading room carrel reservations."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-[#E2E0DB] flex gap-2 flex-wrap">
        {[
          { key: 'inquiries', label: `Ask-a-Librarian (${inquiries.filter(i=>i.status==='PENDING_REPLY').length} Pending)`, icon: MessageSquare },
          { key: 'document_delivery', label: `Document Delivery (${docRequests.length})`, icon: FileText },
          { key: 'carrel_bookings', label: `Carrel Bookings (${bookings.length})`, icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.key
                  ? 'border-[#A52307] text-[#A52307] bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Scholar Inquiries &amp; Consultations</h3>
          <div className="divide-y divide-[#EEECE7]">
            {inquiries.map((inq) => (
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
                      onClick={() => handleResolveInquiry(inq.id)}
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
      )}

      {/* Tab 2: Document Delivery */}
      {activeTab === 'document_delivery' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Document Delivery &amp; Inter-Library Loans</h3>
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Requested Item &amp; Folios</th>
                <th className="py-3 px-4">Scholar</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {docRequests.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{doc.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block">{doc.title} ({doc.shelfmark})</span>
                    <span className="text-gray-500 text-[11px]">{doc.requestedPages}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700">{doc.patron}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">{doc.format}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Carrel Bookings */}
      {activeTab === 'carrel_bookings' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Archival Carrel &amp; Reading Room Reservations</h3>
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Scholar / Patron</th>
                <th className="py-3 px-4">Facility &amp; Time Slot</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{b.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{b.patron}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block">{b.facility}</span>
                    <span className="text-gray-500 text-[11px] font-mono">{b.date} · {b.timeSlot}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{b.purpose}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {b.status === 'PENDING_APPROVAL' && (
                      <button
                        type="button"
                        onClick={() => handleApproveBooking(b.id)}
                        className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
