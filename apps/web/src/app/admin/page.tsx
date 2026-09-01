'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight,
  Search,
  BookOpen,
  Calendar,
  Briefcase,
  Newspaper,
  Shield,
  Layers
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.getDashboardReports();
        setData(res);
      } catch {
        setData({
          kpis: {
            totalRecords: 5075,
            totalCopies: 6240,
            availableCopies: 5890,
            activeLoans: 128,
            overdueLoans: 37,
            totalMembers: 890,
            pendingHolds: 22,
            unpaidFinesTotal: 1250,
          },
        });
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const stats = [
    { value: data?.kpis?.activeLoans || '128', label: "Today’s loans", accent: 'rgb(165,35,7)', href: '/admin/circulation' },
    { value: '94', label: 'Returns today', accent: 'rgb(20,20,20)', href: '/admin/circulation' },
    { value: data?.kpis?.overdueLoans || '37', label: 'Overdue items', accent: 'rgb(165,35,7)', href: '/admin/circulation' },
    { value: data?.kpis?.pendingHolds || '22', label: 'Active reservations', accent: 'rgb(20,20,20)', href: '/admin/circulation' },
    { value: '9', label: 'Pending member requests', accent: 'rgb(20,20,20)', href: '/admin/members' },
    { value: '142', label: 'Catalogue manuscripts', accent: 'rgb(20,20,20)', href: '/admin/catalog' },
    { value: '88', label: 'Arabi-Malayalam prints', accent: 'rgb(165,35,7)', href: '/admin/catalog' },
  ];

  const ops = [
    { glyph: '↦', label: 'Issue (Check-out)', href: '/admin/circulation' },
    { glyph: '↤', label: 'Return (Check-in)', href: '/admin/circulation' },
    { glyph: '↻', label: 'Renewals', href: '/admin/circulation' },
    { glyph: '☰', label: 'Holds & Queue', href: '/admin/circulation' },
    { glyph: '◎', label: 'Member Directory', href: '/admin/members' },
    { glyph: '▤', label: 'New Catalogue Record', href: '/admin/catalog' },
  ];

  const activity = [
    { type: 'Issue', text: 'Fatḥ al-Muʿīn, annotated copy issued to R. Naseer (MEM-2231)', time: '2 min ago' },
    { type: 'Return', text: 'Al-Bayān monthly, vol. 3 returned by S. Fathima (MEM-1187)', time: '11 min ago' },
    { type: 'Hold', text: 'Hold placed on Bayān al-Fawāʾid by K. Ahmed (MEM-0942)', time: '24 min ago' },
    { type: 'Fine', text: '₹40 overdue fine recorded for MEM-1655', time: '38 min ago' },
    { type: 'Return', text: 'Malabar and its people returned, condition noted', time: '1 hr ago' },
    { type: 'Issue', text: 'Muḥyiddīn Mālā issued to A. Rahman (MEM-2098)', time: '1 hr ago' },
  ];

  const alerts = [
    { text: '3 items overdue by more than 30 days', meta: 'Circulation', href: '/admin/circulation' },
    { text: '5 event registrations awaiting confirmation', meta: 'Website · Events', href: '/admin/website/events' },
    { text: '3 fellowship proposals under review', meta: 'Website · Opportunities', href: '/admin/website/opportunities' },
    { text: '9 membership renewals due this week', meta: 'Members', href: '/admin/members' },
  ];

  return (
    <div className="font-sans text-[rgb(20,20,20)] max-w-[1180px]">
      {/* Dashboard Heading */}
      <div className="flex items-baseline justify-between mb-1.5 flex-wrap gap-2">
        <h1 className="text-[28px] font-semibold m-0 text-gray-900 leading-tight">Dashboard</h1>
        <span className="text-[14px] text-[rgb(120,118,113)] font-normal">{today}</span>
      </div>
      <p className="text-[15px] text-[rgb(120,118,113)] m-0 mb-[26px]">
        Overview of today’s circulation, catalogue operations, and website publishing.
      </p>

      {/* KPI Stats Cards Grid (4-column layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-[34px]">
        {stats.map((s, idx) => (
          <Link
            key={idx}
            href={s.href}
            className="bg-white border border-[#E2E0DB] p-[20px_20px_18px] flex flex-col gap-1.5 hover:shadow-sm transition-shadow rounded-[2px]"
            style={{ borderTop: `3px solid ${s.accent}` }}
          >
            <span className="text-[30px] font-semibold leading-none text-gray-900">{s.value}</span>
            <span className="text-[14px] text-[rgb(120,118,113)]">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* Quick Operations Section */}
      <h2 className="text-[17px] font-semibold m-0 mb-[14px] text-gray-900">Quick circulation &amp; desk operations</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-[32px]">
        {ops.map((o, idx) => (
          <Link
            key={idx}
            href={o.href}
            className="bg-white border border-[#E2E0DB] p-[18px_10px] flex flex-col items-center gap-2 text-[13px] text-[rgb(20,20,20)] hover:border-[#A52307] hover:text-[#A52307] transition-colors rounded-[2px] text-center group cursor-pointer"
          >
            <span className="text-[20px] leading-none" aria-hidden="true">{o.glyph}</span>
            <span className="font-medium group-hover:text-[#A52307]">{o.label}</span>
          </Link>
        ))}
      </div>

      {/* Website Editorial & Programs Quick Links */}
      <div className="bg-white border border-[#E2E0DB] p-5 mb-[36px] rounded-[2px]">
        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <div>
            <h2 className="text-[17px] font-semibold m-0 text-gray-900 flex items-center gap-2">
              <span className="text-[#A52307] font-bold">✦</span> Website Management &amp; Programs
            </h2>
            <p className="text-[13px] text-[rgb(120,118,113)] m-0 mt-0.5">
              Publish research stories, news bulletins, schedule academic events with custom registration forms, and manage fellowship applications.
            </p>
          </div>
          <Link
            href="/admin/website/configuration"
            className="text-[13px] text-[#A52307] hover:underline font-semibold flex items-center gap-1"
          >
            Configure Website Layout →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <Link
            href="/admin/website/stories"
            className="p-3.5 border border-gray-200 hover:border-black bg-[#FAF8F5] transition-all flex flex-col gap-1 rounded-[2px] group"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#A52307] flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Stories</span>
            </span>
            <span className="text-[14px] font-semibold text-gray-900 group-hover:text-[#A52307]">Scholarly Articles</span>
          </Link>

          <Link
            href="/admin/website/news"
            className="p-3.5 border border-gray-200 hover:border-black bg-[#FAF8F5] transition-all flex flex-col gap-1 rounded-[2px] group"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#A52307] flex items-center gap-1">
              <Newspaper className="w-3.5 h-3.5" />
              <span>News</span>
            </span>
            <span className="text-[14px] font-semibold text-gray-900 group-hover:text-[#A52307]">Press Dispatches</span>
          </Link>

          <Link
            href="/admin/website/events"
            className="p-3.5 border border-gray-200 hover:border-black bg-[#FAF8F5] transition-all flex flex-col gap-1 rounded-[2px] group"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#A52307] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Events &amp; Reg.</span>
            </span>
            <span className="text-[14px] font-semibold text-gray-900 group-hover:text-[#A52307]">Colloquiums &amp; Rosters</span>
          </Link>

          <Link
            href="/admin/website/opportunities"
            className="p-3.5 border border-gray-200 hover:border-black bg-[#FAF8F5] transition-all flex flex-col gap-1 rounded-[2px] group"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#A52307] flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Opportunities</span>
            </span>
            <span className="text-[14px] font-semibold text-gray-900 group-hover:text-[#A52307]">Fellowships &amp; Grants</span>
          </Link>
        </div>
      </div>

      {/* Main 2-Column Content (1.4fr : 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left Column: Recent Activity */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[17px] font-semibold m-0 text-gray-900">Recent activity</h2>
            <Link href="/admin/circulation" className="text-[13px] text-[#A52307] hover:underline font-medium">
              View all circulation →
            </Link>
          </div>
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] divide-y divide-[#EEECE7]">
            {activity.map((a, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[80px_1fr_95px] sm:grid-cols-[90px_1fr_110px] gap-3.5 items-center p-[13px_18px]"
              >
                <span className="text-[11px] tracking-[0.05em] uppercase text-[#A52307] font-bold">
                  {a.type}
                </span>
                <span className="text-[14px] text-[rgb(20,20,20)] font-normal truncate sm:whitespace-normal">
                  {a.text}
                </span>
                <span className="text-[12px] text-[rgb(120,118,113)] text-right">
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Needs Attention */}
        <section>
          <h2 className="text-[17px] font-semibold m-0 mb-3 text-gray-900">Needs attention</h2>
          <div className="flex flex-col gap-2.5">
            {alerts.map((al, idx) => (
              <Link
                key={idx}
                href={al.href}
                className="bg-white border border-[#E2E0DB] border-l-[3px] border-l-[#A52307] p-[13px_16px] flex flex-col gap-0.5 hover:shadow-sm transition-shadow rounded-[2px]"
              >
                <span className="text-[14px] text-[rgb(20,20,20)] font-medium">{al.text}</span>
                <span className="text-[12px] text-[rgb(120,118,113)]">{al.meta}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
