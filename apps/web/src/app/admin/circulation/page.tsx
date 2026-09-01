'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  Bookmark, 
  Clock, 
  CreditCard, 
  Scan,
  CheckCircle2,
  AlertCircle,
  Settings2,
  BookOpen,
  Users,
  Activity,
  Printer
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function CirculationOverviewPage() {
  const stats = [
    { label: "Today's Loans", value: '128', change: '+12% from yesterday', color: 'text-[#A52307]', href: '/admin/circulation/desk' },
    { label: 'Returns Processed', value: '94', change: 'Normal return volume', color: 'text-emerald-700', href: '/admin/circulation/desk' },
    { label: 'Active Holds on Shelf', value: '22', change: '5 ready for pickup', color: 'text-amber-700', href: '/admin/circulation/holds' },
    { label: 'Overdue Volumes', value: '37', change: '₹1,250 accrued fines', color: 'text-[#A52307]', href: '/admin/circulation/overdues' },
  ];

  const quickLinks = [
    { 
      title: 'Check in & Check Out Desk', 
      desc: 'High-throughput dual-mode scanning station to issue books, process returns, and calculate fines.', 
      href: '/admin/circulation/desk', 
      icon: Scan,
      badge: 'Main Desk'
    },
    { 
      title: 'Holds & Shelf Reservations', 
      desc: 'Manage requested items, patron queue positions, and shelf pickup allocation.', 
      href: '/admin/circulation/holds', 
      icon: Bookmark,
      badge: '22 Active'
    },
    { 
      title: 'Loan Renewals Desk', 
      desc: 'Extend borrowing periods for eligible patrons and research fellows.', 
      href: '/admin/circulation/renewals', 
      icon: RotateCcw,
      badge: 'Self/Staff'
    },
    { 
      title: 'Overdue Items Tracker', 
      desc: 'Monitor overdue loans, trigger reminders, and track late returns with automatic fine calculation.', 
      href: '/admin/circulation/overdues', 
      icon: Clock,
      badge: '37 Overdue'
    },
    { 
      title: 'Fines & Cashier Register', 
      desc: 'Assess overdue charges, process UPI/cash fine payments, and issue receipts.', 
      href: '/admin/circulation/fines', 
      icon: CreditCard,
      badge: '₹1,250 Due'
    },
    { 
      title: 'Circulation Configuration', 
      desc: 'Configure default check-in/loan days, renewal limits, fines, and grace periods by member role.', 
      href: '/admin/circulation/configuration', 
      icon: Settings2,
      badge: 'Settings'
    },
  ];

  const recentActivities = [
    { id: 'ACT-101', type: 'CHECKOUT', title: 'Fatḥ al-Muʿīn (MS 0142-01)', patron: 'Rashid Vattaparamba (KMLRI-2026-0001)', time: '10 mins ago', desk: 'Staff Desk A' },
    { id: 'ACT-102', type: 'RETURN', title: 'Muḥyiddīn Mālā Print (AM 0311-01)', patron: 'Dr. Naseer (MEM-2231)', time: '25 mins ago', desk: 'Staff Desk B', fine: '₹0 (On Time)' },
    { id: 'ACT-103', type: 'RENEWAL', title: 'Tuḥfat al-Mujāhidīn (RB 0908-01)', patron: 'Prof. K. A. Najeeb (MEM-1004)', time: '1 hour ago', desk: 'Online OPAC (+14d)' },
    { id: 'ACT-104', type: 'FINE_PAID', title: 'Overdue Settlement #FIN-098', patron: 'S. Fathima (MEM-1187)', time: '2 hours ago', desk: 'Cashier Desk (₹80 UPI)' },
    { id: 'ACT-105', type: 'HOLD_READY', title: 'Bayān al-Fawāʾid (MS 0142)', patron: 'Dr. Tariq al-Omani (MEM-0942)', time: '3 hours ago', desk: 'Allocated to Hold Shelf A1' },
  ];

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Circulation"
        title="Circulation Overview"
        description="Centralized circulation operations workbench: issue loans, process check-ins, manage shelf holds, extend renewals, collect fines, and configure loan rules."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={Settings2} href="/admin/circulation/configuration">
              Rules Configuration
            </Button>
            <Button variant="primary" icon={Scan} href="/admin/circulation/desk">
              Open Check In / Check Out Desk
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className="bg-white border border-[#E2E0DB] p-5 rounded-[2px] hover:shadow-sm transition-shadow block"
          >
            <span className="text-[11px] font-bold uppercase text-gray-500 block">{s.label}</span>
            <span className={`text-3xl font-bold mt-1 block ${s.color}`}>{s.value}</span>
            <span className="text-[11px] text-gray-500 mt-1 block">{s.change}</span>
          </Link>
        ))}
      </div>

      {/* Circulation Sub-Modules Grid */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-gray-900">Circulation Modules &amp; Desks</h2>
          <span className="text-xs text-gray-500 font-mono">6 Operational Sub-Modules</span>
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
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded bg-[#FAF8F5] border border-[#E2E0DB] text-gray-700 group-hover:text-[#A52307] group-hover:bg-red-50 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {mod.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#A52307] transition-colors">{mod.title}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{mod.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EEECE7] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400">Manage Workflow</span>
                  <span className="text-[11px] font-bold text-[#A52307] group-hover:translate-x-0.5 transition-transform">
                    Open Module →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Real-time Circulation Activity Stream */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#A52307]" />
            <h3 className="text-base font-bold text-gray-900">Today's Live Circulation Feed</h3>
          </div>
          <Link href="/admin/circulation/desk" className="text-xs text-[#A52307] font-bold hover:underline">
            Go to Active Desk →
          </Link>
        </div>

        <div className="divide-y divide-[#EEECE7]">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  act.type === 'CHECKOUT' ? 'bg-amber-100 text-amber-900' :
                  act.type === 'RETURN' ? 'bg-emerald-100 text-emerald-900' :
                  act.type === 'RENEWAL' ? 'bg-blue-100 text-blue-900' :
                  act.type === 'FINE_PAID' ? 'bg-purple-100 text-purple-900' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {act.type.replace(/_/g, ' ')}
                </span>
                <div>
                  <strong className="text-gray-900 block">{act.title}</strong>
                  <span className="text-gray-500 text-[11px]">{act.patron} · {act.desk}</span>
                </div>
              </div>
              <div className="text-right sm:text-right font-mono text-gray-500 text-[11px]">
                {act.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
