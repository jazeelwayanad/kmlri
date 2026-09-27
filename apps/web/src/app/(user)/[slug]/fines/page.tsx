'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  FileText,
  ShieldCheck,
} from 'lucide-react';

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyFinesPage() {
  const { user, refreshUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID' | 'WAIVED'>('ALL');

  useEffect(() => {
    refreshUser();
  }, []);

  const fines = ((user as any)?.fines || []) as any[];

  const unpaidFines = fines.filter((f: any) => f.status === 'UNPAID');
  const paidFines = fines.filter((f: any) => f.status === 'PAID');
  const waivedFines = fines.filter((f: any) => f.status === 'WAIVED');

  const totalOutstanding = unpaidFines.reduce((acc: number, f: any) => acc + (f.amount || 0), 0);
  const totalPaid = paidFines.reduce((acc: number, f: any) => acc + (f.amount || 0), 0);

  const filteredFines = fines.filter((f: any) => {
    if (statusFilter === 'ALL') return true;
    return f.status === statusFilter;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-3xl sm:text-[34px] font-bold text-black m-0 leading-tight">
            Fines &amp; Fee Ledger
          </h2>
        </div>
      </div>

      {/* Oxford Double-Line Divider Rule */}
      <div className="border-t-2 border-b border-black py-0.5 my-6 w-full" />

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Outstanding Balance */}
        <div className="border border-black bg-[#F8F5EF] p-5 rounded-xs flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Current Outstanding Balance
              </span>
              <Receipt className="w-4 h-4 text-[#A52307]" />
            </div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-[#A52307] mt-1">
              ₹{totalOutstanding}.00
            </p>
          </div>
        </div>

        {/* Paid / Settled History */}
        <div className="border border-black bg-[#F8F5EF] p-5 rounded-xs flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Settled / Paid to Date
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-black mt-1">
              ₹{totalPaid}.00
            </p>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Status Filter Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: 'ALL', label: `All (${fines.length})` },
              { key: 'UNPAID', label: `Unpaid (${unpaidFines.length})` },
              { key: 'PAID', label: `Paid (${paidFines.length})` },
              ...(waivedFines.length > 0
                ? [{ key: 'WAIVED', label: `Waived (${waivedFines.length})` }]
                : []),
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === f.key
                    ? 'bg-black text-white'
                    : 'bg-[#EAE6DE] text-stone-700 hover:bg-[#DDD7CC]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredFines.length === 0 ? (
          <div className="border border-black bg-[#F8F5EF] rounded-xs p-8 text-center space-y-2">
            <Receipt className="w-10 h-10 text-stone-400 mx-auto stroke-[1.5]" />
            <h4 className="font-amiri font-bold text-lg text-black">No fines recorded</h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              No fines or fee assessments found under the selected filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-black rounded-xs shadow-xs">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-black bg-[#EAE6DE]/70 text-left text-[10px] uppercase font-mono font-bold text-stone-700 tracking-wider">
                  <th className="py-3 px-4">Item / Assessment</th>
                  <th className="py-3 px-4">Date Assessed</th>
                  <th className="py-3 px-4">Reason &amp; Note</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Settlement Info</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-sans">
                {filteredFines.map((f: any) => {
                  const isUnpaid = f.status === 'UNPAID';
                  const isPaid = f.status === 'PAID';
                  const isWaived = f.status === 'WAIVED';
                  const bookTitle = f.loan?.copy?.bibRecord?.titleLatin;
                  const shelfmark = f.loan?.copy?.bibRecord?.shelfmark;
                  const barcode = f.loan?.copy?.barcode;

                  return (
                    <tr key={f.id} className="hover:bg-[#FAF8F5] transition-colors">
                      {/* Item / Assessment */}
                      <td className="py-3.5 px-4 text-xs">
                        {bookTitle ? (
                          <div>
                            <span className="font-amiri font-bold text-base text-black block leading-snug">
                              {bookTitle}
                            </span>
                            <span className="font-mono text-[11px] text-stone-500">
                              {shelfmark ? `${shelfmark} · ` : ''}Barcode: {barcode || '—'}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium text-stone-900 block">Manual Assessment</span>
                            <span className="text-[11px] font-mono text-stone-500">Direct patron ledger entry</span>
                          </div>
                        )}
                      </td>

                      {/* Date Assessed */}
                      <td className="py-3.5 px-4 text-xs font-mono text-stone-700">
                        {formatDate(f.createdAt)}
                      </td>

                      {/* Reason & Note */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-semibold text-stone-900">{f.reason}</div>
                        {f.note && (
                          <div className="text-[11px] text-stone-600 bg-[#F5F2EB] border border-stone-200/80 px-2 py-0.5 rounded mt-1 inline-block italic font-serif">
                            &quot;{f.note}&quot;
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                            isUnpaid
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : isPaid
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-stone-200 text-stone-700 border border-stone-300'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>

                      {/* Settlement Info */}
                      <td className="py-3.5 px-4 text-xs text-stone-600 font-serif">
                        {isPaid ? (
                          <span className="text-emerald-800 font-medium">
                            Paid {formatDate(f.paidAt || f.updatedAt)}
                          </span>
                        ) : isWaived ? (
                          <span className="text-stone-500 italic">Waived by staff</span>
                        ) : (
                          <span className="text-amber-800 font-mono text-[11px]">Pending settlement</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono text-sm font-bold ${
                            isUnpaid ? 'text-[#A52307]' : 'text-stone-800'
                          }`}
                        >
                          ₹{f.amount}.00
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
