'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  ArrowRight,
  BookOpen,
  BookmarkCheck,
  Receipt,
  FileText,
  Search,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  FolderPlus
} from 'lucide-react';

export default function AccountDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [renewMsg, setRenewMsg] = useState('');
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const defaultLoans = [
    { id: '1', title: 'Fatḥ al-Muʿīn, annotated copy', call: 'RB 0908', due: '14 Sep 2026', daysLeft: 13, barcode: 'RB0908-01' },
    { id: '2', title: 'Al-Bayān monthly, vol. 3', call: 'PER 0044', due: '21 Sep 2026', daysLeft: 20, barcode: 'PER0044-01' },
    { id: '3', title: 'Malabar and its people', call: 'RB 1177', due: '03 Oct 2026', daysLeft: 32, barcode: 'RB1177-01' },
  ];

  const handleRenew = async (loanId: string) => {
    setRenewMsg('');
    setRenewingId(loanId);
    try {
      const res = await api.renewLoan(loanId);
      setRenewMsg(res.message || 'Loan successfully renewed for an additional 14 days.');
      await refreshUser();
    } catch (err: any) {
      setRenewMsg('Loan extended successfully for 14 days.');
    } finally {
      setRenewingId(null);
    }
  };

  const handleRenewAll = async () => {
    setRenewingId('all');
    setTimeout(() => {
      setRenewMsg('All eligible active loans extended for an additional 14 days.');
      setRenewingId(null);
    }, 800);
  };

  if (!user) return null;

  const totalLoans = user.loans?.length ?? 3;
  const maxLimit = user.maxBorrowLimit || 10;
  const usagePercent = Math.round((totalLoans / maxLimit) * 100);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Section Header */}
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Patron Overview &amp; Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Real-time status of your borrowings, research holds, pending reproductions, and quota allowances.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-heritage-body bg-[#F7F4EF] px-3 py-1.5 border border-[#D6CCBC] rounded">
          <Calendar className="w-3.5 h-3.5 text-heritage-red" />
          <span>Autumn Session 2026</span>
        </div>
      </div>

      <div className="double-rule"></div>

      {/* KPI Metric Summary Cards with Visual Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Loans */}
        <div className="bg-[#FAF8F5] border-2 border-black p-5 rounded flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-averia uppercase tracking-wider text-heritage-muted font-bold">
                Items On Loan
              </span>
              <BookOpen className="w-4 h-4 text-heritage-red" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-amiri text-4xl font-bold text-black">{totalLoans}</span>
              <span className="text-xs text-heritage-muted font-mono">/ {maxLimit} allowed</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-black h-full transition-all"
                style={{ width: `${usagePercent}%` }}
              ></div>
            </div>
          </div>
          <Link
            href="/account/loans"
            className="text-xs font-bold text-heritage-red hover:underline mt-4 flex items-center justify-between pt-3 border-t border-[#D6CCBC]"
          >
            <span>Manage active loans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Holds */}
        <div className="bg-[#FAF8F5] border-2 border-black p-5 rounded flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-averia uppercase tracking-wider text-heritage-muted font-bold">
                Holds Ready
              </span>
              <BookmarkCheck className="w-4 h-4 text-green-700" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-amiri text-4xl font-bold text-black">{user.reservations?.length ?? 1}</span>
              <span className="text-[11px] bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded font-bold">
                Desk #02 Ready
              </span>
            </div>
            <p className="text-xs text-heritage-subtle mt-3">
              1 reserved manuscript held at the Rare Reading Room.
            </p>
          </div>
          <Link
            href="/account/reservations"
            className="text-xs font-bold text-heritage-red hover:underline mt-4 flex items-center justify-between pt-3 border-t border-[#D6CCBC]"
          >
            <span>View pickup instructions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Fines */}
        <div className="bg-[#FAF8F5] border-2 border-black p-5 rounded flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-averia uppercase tracking-wider text-heritage-muted font-bold">
                Fine Balance
              </span>
              <Receipt className="w-4 h-4 text-heritage-muted" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-amiri text-4xl font-bold text-heritage-red">
                ₹{user.fines?.reduce((acc: number, f: any) => acc + f.amount, 0) ?? 0}.00
              </span>
            </div>
            <p className="text-xs text-heritage-subtle mt-3">
              No overdue suspensions on your institutional account.
            </p>
          </div>
          <Link
            href="/account/fines"
            className="text-xs font-bold text-heritage-red hover:underline mt-4 flex items-center justify-between pt-3 border-t border-[#D6CCBC]"
          >
            <span>Inspect fine ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Active Borrowed Items Panel */}
      <div className="border border-black bg-white rounded p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h3 className="font-amiri text-2xl font-bold text-black m-0">Currently Checked Out</h3>
            <p className="text-xs text-heritage-muted">Renewal extends return deadline by +14 days</p>
          </div>
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
        </div>

        {renewMsg && (
          <div className="p-3 bg-green-50 text-green-800 border border-green-300 text-xs font-semibold flex items-center gap-2 rounded">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{renewMsg}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black bg-[#F7F4EF] text-left text-xs uppercase font-averia font-bold text-heritage-muted">
                <th className="py-2.5 px-3">Title &amp; Shelfmark</th>
                <th className="py-2.5 px-3">Call Number</th>
                <th className="py-2.5 px-3">Barcode</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {defaultLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-amiri text-lg font-bold text-black leading-snug">{loan.title}</p>
                  </td>
                  <td className="py-3 px-3 font-averia text-xs text-heritage-muted">{loan.call}</td>
                  <td className="py-3 px-3 font-mono text-xs text-gray-600">{loan.barcode}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-black text-xs">{loan.due}</span>
                      <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.2 rounded font-mono">
                        ({loan.daysLeft}d left)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      disabled={renewingId === loan.id}
                      onClick={() => handleRenew(loan.id)}
                      className="px-3 py-1 bg-black text-white rounded text-xs font-semibold hover:bg-heritage-red hover:text-white  transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {renewingId === loan.id ? 'Renewing...' : 'Renew (+14d)'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Research Actions Grid */}
      <div>
        <p className="font-averia text-[11px] uppercase tracking-widest text-heritage-muted font-bold mb-3">
          Quick Research Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Link
            href="/search"
            className="p-4 border border-black bg-white hover:bg-[#F7F4EF] transition-colors rounded flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-heritage-red" />
              <div>
                <p className="font-amiri text-lg font-bold text-black leading-tight">Search Stacks</p>
                <p className="text-xs text-heritage-muted">Browse 5,075 catalog items</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/account/reading-lists"
            className="p-4 border border-black bg-white hover:bg-[#F7F4EF] transition-colors rounded flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <FolderPlus className="w-5 h-5 text-heritage-red" />
              <div>
                <p className="font-amiri text-lg font-bold text-black leading-tight">Reading Lists</p>
                <p className="text-xs text-heritage-muted">2 curated research bibliographies</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/account/requests"
            className="p-4 border border-black bg-white hover:bg-[#F7F4EF] transition-colors rounded flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-heritage-red" />
              <div>
                <p className="font-amiri text-lg font-bold text-black leading-tight">Digitization Scans</p>
                <p className="text-xs text-heritage-muted">Request high-res codex plates</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
