'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { BookmarkCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

function formatDate(d?: string) {
  if (!d) return 'To be confirmed';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyReservationsPage() {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const reservations = (user?.reservations || []) as any[];

  const handleCancelHold = async (id: string) => {
    setCancellingId(id);
    setMessage(null);
    try {
      await api.cancelHold(id);
      setMessage({ type: 'success', text: 'Hold reservation cancelled successfully.' });
      await refreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not cancel this reservation.' });
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
          Hold Reservations
        </h2>
        <p className="text-xs sm:text-sm text-heritage-muted mt-1">
          Archival materials retrieved from locked storage vaults and reserved for your physical consultation.
        </p>
      </div>

      <div className="double-rule"></div>

      {message && (
        <div
          className={`p-3 text-xs font-semibold rounded border flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-heritage-red border-heritage-red/30'
            }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {reservations.length > 0 ? (
        <div className="space-y-4">
          {reservations.map((resv) => (
            <div
              key={resv.id}
              className="bg-[#FAF8F5] border-2 border-black p-5 sm:p-6 rounded shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 border text-xs px-2.5 py-0.5 rounded font-bold ${resv.status === 'READY_FOR_PICKUP'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{resv.status === 'READY_FOR_PICKUP' ? 'Ready for Collection' : 'Pending — Awaiting Retrieval'}</span>
                  </span>
                  <span className="text-xs font-mono text-heritage-muted font-bold">{resv.bibRecord?.shelfmark}</span>
                </div>

                <h3 className="font-amiri text-2xl font-bold text-black m-0">
                  {resv.bibRecord?.titleLatin}
                  {resv.bibRecord?.titleArabic && <span className="text-heritage-muted ml-2">({resv.bibRecord.titleArabic})</span>}
                </h3>

                <div className="flex items-center gap-4 text-xs text-heritage-body flex-wrap pt-1">
                  <div className="flex items-center gap-1 text-heritage-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Held until: <strong className="text-black">{formatDate(resv.availableUntil)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start md:self-center">
                <Link prefetch
                  href="/services"
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded hover:bg-heritage-red hover:text-white  transition-colors"
                >
                  Plan Reading Room Visit →
                </Link>
                <button
                  type="button"
                  disabled={cancellingId === resv.id}
                  onClick={() => handleCancelHold(resv.id)}
                  className="px-3 py-2 border border-gray-400 text-xs font-semibold rounded hover:bg-red-50 hover:text-heritage-red hover:border-heritage-red transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cancellingId === resv.id ? 'Cancelling…' : 'Cancel Hold'}
                </button>
              </div>
            </div>
          ))}

          <div className="p-4 bg-white border border-[#D6CCBC] text-xs text-heritage-body space-y-1 rounded">
            <p className="font-bold text-black font-averia uppercase">Hold Shelf Policy:</p>
            <p>• Reserved manuscripts are kept on the hold shelf for up to 5 consecutive working days.</p>
            <p>• If you require extensions for prolonged codicological analysis, inform the Reference Librarian at the desk.</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded bg-[#FAF8F5]">
          <BookmarkCheck className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="font-amiri text-2xl font-bold text-black">No Active Reservations</p>
          <p className="text-xs text-heritage-muted max-w-sm mx-auto mt-1 mb-4">
            You do not have any materials currently held. Browse the catalog to reserve codices for consultation.
          </p>
          <Link prefetch
            href="/search"
            className="inline-block px-5 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors"
          >
            Search Catalog &amp; Place Hold →
          </Link>
        </div>
      )}
    </div>
  );
}
