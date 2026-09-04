'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  ArrowRight,
  BookOpen,
  BookmarkCheck,
  Receipt,
  FileText,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  RefreshCw,
  FolderPlus,
  Inbox,
  AlertCircle,
} from 'lucide-react';

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysLeft(dueDate?: string) {
  if (!dueDate) return 0;
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function AccountDashboardPage() {
  const { user, refreshUser } = useAuth();
  const params = useParams();
  const slug = (params?.slug as string) || user?.username || user?.id || 'patron';
  const basePath = `/${slug}`;

  const [renewMsg, setRenewMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  useEffect(() => {
    refreshUser();
  }, []);

  if (!user) return null;

  // Real data from database
  const activeLoans = (user.loans || []).filter((l: any) => l.status === 'ACTIVE');
  const totalLoans = activeLoans.length;
  const maxLimit = user.maxBorrowLimit || 5;
  const usagePercent = maxLimit > 0 ? Math.min(100, Math.round((totalLoans / maxLimit) * 100)) : 0;

  const activeHolds = (user.reservations || []).filter(
    (r: any) => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP'
  );
  const readyHolds = activeHolds.filter((r: any) => r.status === 'READY_FOR_PICKUP');

  const unpaidFines = (user.fines || []).filter((f: any) => f.status === 'UNPAID');
  const totalFineAmount = unpaidFines.reduce((acc: number, f: any) => acc + (f.amount || 0), 0);

  const handleRenew = async (loanId: string) => {
    setRenewMsg(null);
    setRenewingId(loanId);
    try {
      const res = await api.renewLoan(loanId);
      setRenewMsg({
        type: 'success',
        text: res.message || `Loan successfully renewed. New due date: ${formatDate(res.newDueDate)}.`,
      });
      await refreshUser();
    } catch (err: any) {
      setRenewMsg({
        type: 'error',
        text: err.message || 'Could not renew this loan (renewal limit reached or reservation pending).',
      });
    } finally {
      setRenewingId(null);
      setTimeout(() => setRenewMsg(null), 5000);
    }
  };

  const handleRenewAll = async () => {
    if (activeLoans.length === 0) return;
    setRenewingId('all');
    setRenewMsg(null);
    let succeeded = 0;
    let failed = 0;

    for (const loan of activeLoans) {
      try {
        await api.renewLoan(loan.id);
        succeeded++;
      } catch {
        failed++;
      }
    }

    await refreshUser();
    setRenewingId(null);

    if (failed === 0) {
      setRenewMsg({ type: 'success', text: `Successfully renewed ${succeeded} loan(s).` });
    } else {
      setRenewMsg({
        type: failed === activeLoans.length ? 'error' : 'success',
        text: `Renewed ${succeeded} loan(s); ${failed} loan(s) could not be renewed.`,
      });
    }
    setTimeout(() => setRenewMsg(null), 5000);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Section Header */}
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-3xl sm:text-[34px] font-bold text-black m-0 leading-tight">
            Patron Overview &amp; Dashboard
          </h2>
        </div>
        
      </div>

      {/* Oxford Double-Line Divider Rule */}
      <div className="border-t-2 border-b border-black py-0.5 my-6 w-full" />

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Loans */}
        <div className="border-2 border-black bg-[#F8F5EF] p-5 rounded-xs flex flex-col justify-between shadow-xs min-h-[175px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Items On Loan
              </span>
              <BookOpen className="w-4 h-4 text-[#A52307]" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-black">{totalLoans}</span>
              <span className="text-xs text-stone-500 font-mono">/ {maxLimit} allowed</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#E5DFD4] h-1.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-black h-full transition-all"
                style={{ width: `${usagePercent}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="border-t border-stone-300 my-3" />
            <Link
              prefetch
              href={`${basePath}/loans`}
              className="text-xs font-bold text-[#A52307] hover:underline flex items-center justify-between"
            >
              <span>Manage active loans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Holds */}
        <div className="border-2 border-black bg-[#F8F5EF] p-5 rounded-xs flex flex-col justify-between shadow-xs min-h-[175px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Holds &amp; Reservations
              </span>
              <BookmarkCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-black">{activeHolds.length}</span>
              {readyHolds.length > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold font-mono">
                  {readyHolds.length} Ready
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {readyHolds.length > 0
                ? `${readyHolds.length} requested item(s) ready at circulation desk.`
                : activeHolds.length > 0
                  ? `${activeHolds.length} hold request(s) queued for vault retrieval.`
                  : 'No active holds or vault reservations pending.'}
            </p>
          </div>
          <div>
            <div className="border-t border-stone-300 my-3" />
            <Link
              prefetch
              href={`${basePath}/reservations`}
              className="text-xs font-bold text-[#A52307] hover:underline flex items-center justify-between"
            >
              <span>View hold queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Fines */}
        <div className="border-2 border-black bg-[#F8F5EF] p-5 rounded-xs flex flex-col justify-between shadow-xs min-h-[175px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Fine Balance
              </span>
              <Receipt className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#A52307]">
                ₹{totalFineAmount}.00
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {totalFineAmount === 0
                ? 'No overdue fines on your institutional account.'
                : 'Unpaid overdue penalties pending settlement at circulation desk.'}
            </p>
          </div>
          <div>
            <div className="border-t border-stone-300 my-3" />
            <Link
              prefetch
              href={`${basePath}/fines`}
              className="text-xs font-bold text-[#A52307] hover:underline flex items-center justify-between"
            >
              <span>Inspect fine ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Borrowed Items Panel */}
      <div className="border-2 border-black bg-[#F8F5EF] rounded-xs p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h3 className="font-amiri text-2xl font-bold text-black m-0">Currently Checked Out</h3>
            <p className="text-xs text-heritage-muted">Renewal extends return deadline by +14 days</p>
          </div>
          {activeLoans.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={renewingId !== null}
                onClick={handleRenewAll}
                className="px-3.5 py-1.5 border border-black rounded text-xs font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${renewingId === 'all' ? 'animate-spin' : ''}`} />
                <span>Renew All Active Loans</span>
              </button>
            </div>
          )}
        </div>

        {renewMsg && (
          <div
            className={`p-3 text-xs font-semibold flex items-center gap-2 rounded border ${renewMsg.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-300'
                : 'bg-red-50 text-red-800 border-red-300'
              }`}
          >
            {renewMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{renewMsg.text}</span>
          </div>
        )}

        {activeLoans.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-gray-300 rounded bg-[#FAF8F5] p-6">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-2 stroke-[1.5]" />
            <h4 className="font-bold text-gray-800 text-sm">No items currently on loan</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You do not have any borrowed volumes at this time. Search the catalogue to discover manuscripts, rare books, and prints.
            </p>
            <Link
              prefetch
              href="/search"
              className="mt-4 px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red transition-colors inline-flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Catalogue</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-stone-300 rounded-xs shadow-2xs">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-black bg-[#EAE6DE]/70 text-left text-[10px] uppercase font-mono font-bold text-stone-700 tracking-wider">
                  <th className="py-2.5 px-3">Title &amp; Shelfmark</th>
                  <th className="py-2.5 px-3">Call Number</th>
                  <th className="py-2.5 px-3">Barcode</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-sans">
                {activeLoans.map((loan: any) => {
                  const dl = daysLeft(loan.dueDate);
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-amiri text-lg font-bold text-black leading-snug">
                          {loan.copy?.bibRecord?.titleLatin || loan.title || 'Catalogue Item'}
                        </p>
                        {loan.copy?.bibRecord?.shelfmark && (
                          <span className="text-xs font-mono text-heritage-muted">
                            {loan.copy.bibRecord.shelfmark}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-averia text-xs text-heritage-muted">
                        {loan.copy?.bibRecord?.callNumber || loan.copy?.bibRecord?.shelfmark || '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-gray-600">
                        {loan.copy?.barcode || loan.barcode || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-black text-xs">{formatDate(loan.dueDate)}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${dl <= 0
                                ? 'bg-red-100 text-red-800'
                                : dl <= 3
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-green-50 text-green-700'
                              }`}
                          >
                            {dl <= 0 ? 'OVERDUE' : `(${dl}d left)`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          disabled={renewingId === loan.id}
                          onClick={() => handleRenew(loan.id)}
                          className="px-3 py-1 bg-black text-white rounded text-xs font-semibold hover:bg-heritage-red hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {renewingId === loan.id ? 'Renewing...' : 'Renew (+14d)'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Research Actions Grid */}
      <div>
        <p className="font-averia text-[11px] uppercase tracking-widest text-heritage-muted font-bold mb-3">
          Quick Research Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Link
            prefetch
            href="/search"
            className="p-4 border border-black bg-white hover:bg-[#F7F4EF] transition-colors rounded flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-heritage-red" />
              <div>
                <p className="font-amiri text-lg font-bold text-black leading-tight">Search Stacks</p>
                <p className="text-xs text-heritage-muted">Browse digital catalogue &amp; archives</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            prefetch
            href={`${basePath}/reading-lists`}
            className="p-4 border border-black bg-white hover:bg-[#F7F4EF] transition-colors rounded flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <FolderPlus className="w-5 h-5 text-heritage-red" />
              <div>
                <p className="font-amiri text-lg font-bold text-black leading-tight">Reading Lists</p>
                <p className="text-xs text-heritage-muted">Saved research bibliographies</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            prefetch
            href={`${basePath}/requests`}
            className="p-4 border border-black bg-white hover:bg-[#F7F4EF] transition-colors rounded flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-heritage-red" />
              <div>
                <p className="font-amiri text-lg font-bold text-black leading-tight">Acquisition Requests</p>
                <p className="text-xs text-heritage-muted">Recommend titles for acquisition</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
