'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Briefcase,
  Newspaper,
  CheckCircle2,
  Clock,
  Inbox,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Bookmark,
  Users,
  Layers
} from 'lucide-react';
import { api } from '@/lib/api';

function formatTimeAgo(dateStr: string) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    totalRecords: number;
    activeLoans: number;
    overdueLoans: number;
    totalMembers: number;
    pendingHolds: number;
    todaysReturns: number;
  }>({
    totalRecords: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalMembers: 0,
    pendingHolds: 0,
    todaysReturns: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [rep, auditLogs, holds, circReport] = await Promise.all([
          api.getDashboardReports().catch(() => null),
          api.getAuditLogs(6).catch(() => []),
          api.getAllHolds().catch(() => []),
          api.getCirculationReports().catch(() => []),
        ]);

        const today = new Date();
        const isToday = (d?: string) => {
          if (!d) return false;
          const dt = new Date(d);
          return (
            dt.getDate() === today.getDate() &&
            dt.getMonth() === today.getMonth() &&
            dt.getFullYear() === today.getFullYear()
          );
        };

        const todaysReturnsCount = (circReport || []).filter((l: any) => isToday(l.returnedAt)).length;

        setData({
          totalRecords: rep?.kpis?.totalRecords || 0,
          activeLoans: rep?.kpis?.activeLoans || 0,
          overdueLoans: rep?.kpis?.overdueLoans || 0,
          totalMembers: rep?.kpis?.totalMembers || 0,
          pendingHolds: (holds || []).filter((h: any) => h.status === 'PENDING' || h.status === 'READY_FOR_PICKUP').length,
          todaysReturns: todaysReturnsCount,
        });

        setActivities(auditLogs || []);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const stats = [
    { value: loading ? '—' : `${data.totalRecords}`, label: 'Catalogue Records', accent: 'rgb(165,35,7)', href: '/admin/catalog' },
    { value: loading ? '—' : `${data.activeLoans}`, label: 'Active Loans', accent: 'rgb(20,20,20)', href: '/admin/circulation/desk' },
    { value: loading ? '—' : `${data.overdueLoans}`, label: 'Overdue Volumes', accent: data.overdueLoans > 0 ? 'rgb(165,35,7)' : 'rgb(20,20,20)', href: '/admin/circulation/overdues' },
    { value: loading ? '—' : `${data.totalMembers}`, label: 'Registered Members', accent: 'rgb(20,20,20)', href: '/admin/members' },
  ];

  const ops = [
    { icon: ArrowUpRight, label: 'Issue (Check-out)', href: '/admin/circulation/desk?tab=checkout' },
    { icon: ArrowDownLeft, label: 'Return (Check-in)', href: '/admin/circulation/desk?tab=checkin' },
    { icon: RotateCcw, label: 'Renewals Desk', href: '/admin/circulation/desk?tab=renewals' },
    { icon: Bookmark, label: 'Holds & Queue', href: '/admin/circulation/holds' },
    { icon: Users, label: 'Members Directory', href: '/admin/members' },
    { icon: Layers, label: 'Catalogue Records', href: '/admin/catalog' },
  ];

  return (
    <div className="font-sans text-[rgb(20,20,20)] max-w-[1240px] space-y-7 pb-12">
      {/* Dashboard Heading */}
      <div className="flex items-baseline justify-between flex-wrap gap-2 border-b border-[#E2E0DB] pb-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-tight">Librarian Console</h1>
          <p className="text-xs text-gray-500 mt-1">Live overview of circulation, cataloguing, and institution services.</p>
        </div>
        <span className="text-xs font-mono font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded">{today}</span>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <Link prefetch
            key={idx}
            href={s.href}
            className="bg-white border border-[#E2E0DB] p-5 flex flex-col gap-1 hover:shadow-xs transition-shadow rounded-[2px]"
            style={{ borderTop: `3px solid ${s.accent}` }}
          >
            <span className="text-3xl font-bold font-mono text-gray-900">{s.value}</span>
            <span className="text-xs font-bold text-gray-600">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* Quick Desk Operations */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Quick Desk Operations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ops.map((o, idx) => {
            const Icon = o.icon;
            return (
              <Link prefetch
                key={idx}
                href={o.href}
                className="bg-white border border-[#E2E0DB] p-4 flex flex-col items-center gap-2.5 text-xs text-gray-800 hover:border-[#A52307] hover:text-[#A52307] transition-all rounded-[2px] text-center font-bold group"
              >
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-[#A52307] transition-colors" />
                <span>{o.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Website Editorial Quick Links */}
      <div className="bg-white border border-[#E2E0DB] p-5 rounded-[2px] space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="text-[#A52307] font-bold">✦</span> Website &amp; Editorial Management
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Publish stories, news, events, and grant opportunities.</p>
          </div>
          <Link prefetch
            href="/admin/website/configuration"
            className="text-xs text-[#A52307] hover:underline font-bold"
          >
            Configure Website →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Stories & Articles', icon: BookOpen, href: '/admin/website/stories' },
            { label: 'News & Press', icon: Newspaper, href: '/admin/website/news' },
            { label: 'Events & Registration', icon: Calendar, href: '/admin/website/events' },
            { label: 'Fellowships & Grants', icon: Briefcase, href: '/admin/website/opportunities' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link prefetch
                key={idx}
                href={item.href}
                className="p-3 border border-gray-200 hover:border-black bg-[#FAF8F5] transition-all flex items-center gap-2.5 rounded-[2px] text-xs font-semibold text-gray-900 hover:text-[#A52307]"
              >
                <Icon className="w-4 h-4 text-[#A52307]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start text-xs font-sans">
        {/* Left Column: Recent Audit Activity */}
        <section className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-xs space-y-3">
          <div className="flex items-baseline justify-between border-b border-gray-100 pb-2.5">
            <h2 className="text-sm font-bold text-gray-900">Recent Desk Activity</h2>
            <Link prefetch href="/admin/system/audit-logs" className="text-xs text-[#A52307] hover:underline font-bold">
              Full Audit Log →
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <Inbox className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
              <span>No desk activity logged yet. Operations will appear here.</span>
            </div>
          ) : (
            <div className="divide-y divide-[#EEECE7]">
              {activities.map((a, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-gray-900 block truncate">{a.action || a.event || 'Operation'}</span>
                    <span className="text-[11px] text-gray-500 truncate block">{a.details || a.description || a.user?.fullName}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                    {formatTimeAgo(a.createdAt || a.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Attention & Alerts */}
        <section className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5">Attention &amp; Pending Tasks</h2>

          <div className="space-y-2.5">
            {data.overdueLoans > 0 && (
              <Link prefetch
                href="/admin/circulation/overdues"
                className="p-3 border-l-3 border-l-[#A52307] bg-red-50/50 border border-red-100 rounded-[2px] block hover:bg-red-50 transition-colors"
              >
                <strong className="text-gray-900 block font-bold">{data.overdueLoans} item(s) currently overdue</strong>
                <span className="text-[11px] text-gray-600">Circulation loans require follow-up or renewal.</span>
              </Link>
            )}

            {data.pendingHolds > 0 && (
              <Link prefetch
                href="/admin/circulation/holds"
                className="p-3 border-l-3 border-l-amber-600 bg-amber-50/50 border border-amber-100 rounded-[2px] block hover:bg-amber-50 transition-colors"
              >
                <strong className="text-gray-900 block font-bold">{data.pendingHolds} hold request(s) on shelf</strong>
                <span className="text-[11px] text-gray-600">Patron reservations awaiting collection or pickup scan.</span>
              </Link>
            )}

            {data.overdueLoans === 0 && data.pendingHolds === 0 && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-[2px] text-emerald-800 flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>All circulation loans and holds are currently up to date.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
