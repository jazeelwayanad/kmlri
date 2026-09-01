'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, CheckCircle2, AlertCircle, Paperclip, Download, XCircle } from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

type ReproStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'REJECTED';

interface ReproductionRequest {
  id: string;
  userId: string;
  itemDescription: string;
  format?: string | null;
  purpose?: string | null;
  status: ReproStatus;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; fullName: string; membershipNumber: string };
}

const STATUS_LABEL: Record<ReproStatus, string> = {
  SUBMITTED: 'Submitted',
  IN_PROGRESS: 'In Progress',
  READY: 'Ready',
  DELIVERED: 'Delivered',
  REJECTED: 'Rejected',
};

const NEXT_STATUS: Partial<Record<ReproStatus, { status: ReproStatus; label: string }>> = {
  SUBMITTED: { status: 'IN_PROGRESS', label: 'Start Processing' },
  IN_PROGRESS: { status: 'READY', label: 'Mark Ready' },
  READY: { status: 'DELIVERED', label: 'Mark Delivered' },
};

export default function DocumentDeliveryPage() {
  const [docRequests, setDocRequests] = useState<ReproductionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadRequests = () => {
    setLoading(true);
    setError(null);
    api
      .getReproductionRequests()
      .then((data) => setDocRequests(data))
      .catch((err: any) => setError(err.message || 'Failed to load document delivery requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (id: string, status: ReproStatus, label: string) => {
    setUpdatingId(id);
    setError(null);
    try {
      await api.updateReproductionRequestStatus(id, status);
      setNotification(`Request #${id.slice(0, 8)} ${label.toLowerCase()}.`);
      loadRequests();
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to update request status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = docRequests.filter(
    (d) =>
      d.itemDescription.toLowerCase().includes(search.toLowerCase()) ||
      (d.user?.fullName || '').toLowerCase().includes(search.toLowerCase())
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

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
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

      {loading ? (
        <div className="text-center py-16 text-xs text-gray-500 font-semibold">Loading requests...</div>
      ) : (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Item &amp; Purpose</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.map((doc) => {
                const next = NEXT_STATUS[doc.status];
                return (
                  <tr key={doc.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{doc.id.slice(0, 8)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 block">{doc.itemDescription}</span>
                      {doc.purpose && <span className="text-gray-500 text-[11px]">{doc.purpose}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {doc.user ? `${doc.user.fullName} (${doc.user.membershipNumber})` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{doc.format || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        doc.status === 'READY' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {STATUS_LABEL[doc.status]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {next && (
                          <button
                            type="button"
                            disabled={updatingId === doc.id}
                            onClick={() => handleStatusChange(doc.id, next.status, next.label)}
                            className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors disabled:opacity-50"
                          >
                            {next.label}
                          </button>
                        )}
                        {doc.status !== 'DELIVERED' && doc.status !== 'REJECTED' && (
                          <button
                            type="button"
                            disabled={updatingId === doc.id}
                            onClick={() => handleStatusChange(doc.id, 'REJECTED', 'Rejected')}
                            className="px-2.5 py-1 border border-red-300 text-red-700 rounded text-[11px] font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-xs text-gray-500 font-semibold">No document delivery requests found.</div>
          )}
        </div>
      )}
    </div>
  );
}
