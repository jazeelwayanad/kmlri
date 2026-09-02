'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Bookmark,
  Clock,
  CreditCard,
  CheckCircle2,
  Settings2,
  Activity,
} from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

function isToday(dateStr?: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function daysOverdue(dueDate: string) {
  return Math.ceil((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
}

function formatTime(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function CirculationOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [todaysLoans, setTodaysLoans] = useState(0);
  const [todaysReturns, setTodaysReturns] = useState(0);
  const [activeHoldsCount, setActiveHoldsCount] = useState(0);
  const [readyHoldsCount, setReadyHoldsCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [unpaidFinesTotal, setUnpaidFinesTotal] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [circReport, holds, loans, fines, auditLogs] = await Promise.all([
          api.getCirculationReports().catch(() => []),
          api.getAllHolds().catch(() => []),
          api.getActiveLoans().catch(() => []),
          api.getAllFines().catch(() => []),
          api.getAuditLogs(8).catch(() => []),
        ]);

        setTodaysLoans((circReport || []).filter((l: any) => isToday(l.issuedAt)).length);
        setTodaysReturns((circReport || []).filter((l: any) => isToday(l.returnedAt)).length);
        setActiveHoldsCount((holds || []).length);
        setReadyHoldsCount((holds || []).filter((h: any) => h.status === 'READY_FOR_PICKUP').length);
        setOverdueCount((loans || []).filter((l: any) => daysOverdue(l.dueDate) > 0).length);
        setUnpaidFinesTotal((fines || []).filter((f: any) => f.status === 'UNPAID').reduce((acc: number, f: any) => acc + f.amount, 0));
        setRecentActivity(auditLogs || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = [
    { label: "Today's Loans Issued", value: loading ? '—' : `${todaysLoans}`, hint: 'Checked out today', href: '/admin/circulation/check-out' },
    { label: 'Returns Processed Today', value: loading ? '—' : `${todaysReturns}`, hint: 'Checked in today', href: '/admin/circulation/check-in' },
    { label: 'Active Holds on Shelf', value: loading ? '—' : `${activeHoldsCount}`, hint: `${readyHoldsCount} ready for pickup`, href: '/admin/circulation/holds' },
    { label: 'Overdue Volumes', value: loading ? '—' : `${overdueCount}`, hint: `₹${unpaidFinesTotal} accrued fines`, href: '/admin/circulation/overdues' },
  ];

  const quickLinks = [
    { title: 'Check Out', desc: 'Look up a patron and issue items with the correct due date.', href: '/admin/circulation/check-out', icon: ArrowUpRight },
    { title: 'Check In', desc: 'Scan returns, log item condition, and assess overdue fines.', href: '/admin/circulation/check-in', icon: ArrowDownLeft },
    { title: 'Holds & Shelf Reservations', desc: 'Manage requested items, queue positions, and shelf pickup allocation.', href: '/admin/circulation/holds', icon: Bookmark },
    { title: 'Loan Renewals', desc: 'Extend borrowing periods for eligible active loans.', href: '/admin/circulation/renewals', icon: RotateCcw },
    { title: 'Overdue Items', desc: 'Monitor overdue loans and their accrued fines.', href: '/admin/circulation/overdues', icon: Clock },
    { title: 'Fines & Cashier Register', desc: 'Settle or waive overdue charges at the circulation desk.', href: '/admin/circulation/fines', icon: CreditCard },
    { title: 'Circulation Configuration', desc: 'Loan durations, renewal limits, and fine policy.', href: '/admin/circulation/configuration', icon: Settings2 },
  ];

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Circulation"
        title="Circulation Overview"
        description="Centralized circulation workbench: issue loans, process check-ins, manage shelf holds, extend renewals, collect fines, and configure loan rules."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={Settings2} href="/admin/circulation/configuration">
              Rules Configuration
            </Button>
            <Button variant="primary" icon={ArrowUpRight} href="/admin/circulation/check-out">
              Check Out
            </Button>
            <Button variant="primary" icon={ArrowDownLeft} href="/admin/circulation/check-in">
              Check In
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Link key={i} href={s.href} className="bg-white border border-[#E2E0DB] p-5 rounded-[2px] hover:shadow-sm transition-shadow block">
            <span className="text-[11px] font-bold uppercase text-gray-500 block">{s.label}</span>
            <span className="text-3xl font-bold mt-1 block text-gray-900">{s.value}</span>
            <span className="text-[11px] text-gray-500 mt-1 block">{s.hint}</span>
          </Link>
        ))}
      </div>

      {/* Circulation Sub-Modules Grid */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-gray-900">Circulation Modules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <Link
                key={i}
                href={mod.href}
                className="bg-white border border-[#E2E0DB] p-5 rounded-[2px] hover:border-[#A52307] transition-all flex flex-col justify-between group shadow-sm hover:shadow"
              >
                <div>
                  <div className="w-10 h-10 rounded bg-[#FAF8F5] border border-[#E2E0DB] text-gray-700 group-hover:text-[#A52307] group-hover:bg-red-50 flex items-center justify-center transition-colors mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#A52307] transition-colors">{mod.title}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{mod.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EEECE7] flex items-center justify-end">
                  <span className="text-[11px] font-bold text-[#A52307] group-hover:translate-x-0.5 transition-transform">Open →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Real Circulation Activity Feed */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#A52307]" />
            <h3 className="text-base font-bold text-gray-900">Recent Circulation Activity</h3>
          </div>
          <Link href="/admin/system/audit-logs" className="text-xs text-[#A52307] font-bold hover:underline">
            View Full Audit Log →
          </Link>
        </div>

        {loading ? (
          <div className="py-6 text-center text-gray-500 text-xs">Loading activity…</div>
        ) : recentActivity.length === 0 ? (
          <div className="py-6 text-center text-gray-500 text-xs">No circulation activity recorded yet.</div>
        ) : (
          <div className="divide-y divide-[#EEECE7]">
            {recentActivity.map((act) => (
              <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      act.action === 'ISSUE'
                        ? 'bg-amber-100 text-amber-900'
                        : act.action === 'RETURN'
                        ? 'bg-emerald-100 text-emerald-900'
                        : act.action === 'RENEW'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {act.action}
                  </span>
                  <div>
                    <strong className="text-gray-900 block">{act.details || act.entity}</strong>
                    {act.user && <span className="text-gray-500 text-[11px]">{act.user.fullName} ({act.user.membershipNumber})</span>}
                  </div>
                </div>
                <div className="text-right sm:text-right font-mono text-gray-500 text-[11px]">{formatTime(act.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
