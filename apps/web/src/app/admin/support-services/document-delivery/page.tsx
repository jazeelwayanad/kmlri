'use client';

import { useState } from 'react';
import { FileText, Search, CheckCircle2, Paperclip, Download } from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function DocumentDeliveryPage() {
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
    {
      id: 'DOC-202',
      patron: 'Dr. Tariq al-Omani (MEM-0942)',
      title: 'Bayān al-Fawāʾid Codex',
      shelfmark: 'MS 0142',
      requestedPages: 'Folios 44–48',
      format: 'Raw Encrypted TIFF',
      status: 'DELIVERED',
      date: '28 Aug 2026',
    },
  ]);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleComplete = (id: string) => {
    setDocRequests(docRequests.map((d) => d.id === id ? { ...d, status: 'DELIVERED' } : d));
    setNotification(`Document delivery request #${id} marked as delivered.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = docRequests.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.patron.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Support &amp; Services · Inter-Library Loan"
        title="Document Delivery &amp; ILL"
        description="Fulfill digital folio scans, article reproductions, and Inter-Library Loan requests for affiliated scholars."
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
            placeholder="Search document requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Request Ref</th>
              <th className="py-3 px-4">Requested Volume &amp; Folios</th>
              <th className="py-3 px-4">Scholar Details</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Desk Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{doc.id}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-gray-900 block">{doc.title} ({doc.shelfmark})</span>
                  <span className="text-gray-500 text-[11px]">{doc.requestedPages}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-700">{doc.patron}</td>
                <td className="py-3.5 px-4 font-mono text-gray-600">{doc.format}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    doc.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {doc.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => handleComplete(doc.id)}
                      className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors"
                    >
                      Mark Delivered
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
