'use client';

import Link from 'next/link';
import {
  Globe,
  BookOpen,
  Newspaper,
  Calendar,
  Briefcase,
  Settings2,
  ArrowRight,
  Eye
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function WebsiteManagementOverviewPage() {
  const sections = [
    {
      title: 'Stories & Research Essays',
      desc: 'Long-form editorial articles, manuscript studies, and scholarly discoveries.',
      count: '12 Published',
      href: '/admin/website/stories',
      icon: BookOpen,
    },
    {
      title: 'News & Press Releases',
      desc: 'Institutional bulletins, archival acquisitions, and press dispatches.',
      count: '8 Bulletins',
      href: '/admin/website/news',
      icon: Newspaper,
    },
    {
      title: 'Events & Registration',
      desc: 'Symposiums, paleography workshops, and conferences with custom registration forms.',
      count: '4 Upcoming',
      href: '/admin/website/events',
      icon: Calendar,
    },
    {
      title: 'Opportunities & Fellowships',
      desc: 'Residential fellowships, internships, and research grant calls with application forms.',
      count: '2 Active Calls',
      href: '/admin/website/opportunities',
      icon: Briefcase,
    },
    {
      title: 'Website Configuration',
      desc: 'Configure homepage section layout, header navbar links, and footer contacts.',
      count: 'Layout & Taxonomy',
      href: '/admin/website/configuration',
      icon: Settings2,
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Website Management · Editorial Console"
        title="Public Website Management"
        description="Curate and publish public content for kmlri.in: research stories, news bulletins, academic events, fellowship applications, and website configuration."
        actions={
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Public Website ↗</span>
          </a>
        }
      />

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec, i) => {
          const Icon = sec.icon;
          return (
            <Link prefetch
              key={i}
              href={sec.href}
              className="bg-white border border-[#E2E0DB] p-6 rounded-[2px] hover:border-[#A52307] transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="w-10 h-10 rounded bg-[#FAF8F5] border border-[#E2E0DB] text-gray-800 group-hover:text-[#A52307] group-hover:bg-red-50 flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-[#A52307] transition-colors">{sec.title}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{sec.desc}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#EEECE7] flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700 font-mono text-[11px]">{sec.count}</span>
                <span className="font-bold text-[#A52307] flex items-center gap-1">
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
