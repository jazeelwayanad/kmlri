'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { BookmarkCheck, CheckCircle2, MapPin, Calendar, Clock, AlertCircle, X } from 'lucide-react';

export default function MyReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([
    {
      id: 'resv-1',
      title: 'Bayān al-Fawāʾid (Manuscript MS 0142)',
      titleArabic: 'بيان الفوائد',
      call: 'MS-ARA-0142',
      pickup: 'Rare Reading Room — Desk #02',
      queuePos: 'Ready for Collection',
      expires: '05 Sep 2026',
      status: 'READY'
    }
  ]);
  const [cancelMsg, setCancelMsg] = useState('');

  const handleCancelHold = (id: string) => {
    setReservations(reservations.filter((r) => r.id !== id));
    setCancelMsg('Hold reservation cancelled successfully.');
    setTimeout(() => setCancelMsg(''), 3500);
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

      {cancelMsg && (
        <div className="p-3 bg-red-50 text-heritage-red border border-heritage-red/30 text-xs font-semibold rounded">
          {cancelMsg}
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
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 border border-green-300 text-xs px-2.5 py-0.5 rounded font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{resv.queuePos}</span>
                  </span>
                  <span className="text-xs font-mono text-heritage-muted font-bold">{resv.call}</span>
                </div>

                <h3 className="font-amiri text-2xl font-bold text-black m-0">
                  {resv.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-heritage-body flex-wrap pt-1">
                  <div className="flex items-center gap-1 text-black font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-heritage-red" />
                    <span>{resv.pickup}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1 text-heritage-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Held until: <strong className="text-black">{resv.expires}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start md:self-center">
                <Link
                  href="/services"
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded hover:bg-heritage-red hover:text-white  transition-colors"
                >
                  Plan Reading Room Visit →
                </Link>
                <button
                  type="button"
                  onClick={() => handleCancelHold(resv.id)}
                  className="px-3 py-2 border border-gray-400 text-xs font-semibold rounded hover:bg-red-50 hover:text-heritage-red hover:border-heritage-red transition-colors cursor-pointer"
                >
                  Cancel Hold
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
          <Link
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
