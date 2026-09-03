'use client';

import Link from 'next/link';
import { HelpCircle, DoorOpen, FileText, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';

export default function SupportServicesOverviewPage() {
  const sections = [
    {
      title: 'Ask a Librarian',
      desc: 'Review and answer patron reference inquiries submitted through the public site.',
      href: '/admin/support-services/ask',
      icon: HelpCircle,
    },
    {
      title: 'Reservations & Facility Bookings',
      desc: 'Manage reading desk, study room, and consultation reservations made by members.',
      href: '/admin/support-services/reservations-bookings',
      icon: DoorOpen,
    },
    {
      title: 'Document Delivery',
      desc: 'Track scan and photocopy requests for manuscript and rare book reproductions.',
      href: '/admin/support-services/document-delivery',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Support & Services"
        title="Support Services Desk"
        description="Coordinate reference inquiries, facility bookings, and reproduction requests from one place."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm hover:shadow-md hover:border-[#A52307] transition-all group flex flex-col gap-3"
            >
              <Icon className="w-6 h-6 text-[#A52307]" />
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
              </div>
              <span className="text-[11px] font-bold text-[#A52307] flex items-center gap-1 mt-auto group-hover:gap-2 transition-all">
                Open <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
