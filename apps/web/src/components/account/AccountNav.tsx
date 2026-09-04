'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  User,
  BookOpen,
  BookmarkCheck,
  Receipt,
  FileText,
  ListOrdered,
  Search,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  CalendarClock
} from 'lucide-react';

export function AccountNav() {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const slug = (params?.slug as string) || user?.username || user?.id || 'patron';
  const basePath = `/${slug}`;

  const mainCirculation = [
    { label: 'Dashboard', href: basePath, icon: LayoutDashboard, exact: true },
    { label: 'Profile ', href: `${basePath}/profile`, icon: User },
    { label: 'Loans', href: `${basePath}/loans`, icon: BookOpen, count: user?.loans?.length },
    { label: 'Reservations', href: `${basePath}/reservations`, icon: BookmarkCheck, count: user?.reservations?.length, badgeColor: 'bg-heritage-red text-white' },
    { label: 'Bookings', href: `${basePath}/bookings`, icon: CalendarClock },
    { label: 'Fines', href: `${basePath}/fines`, icon: Receipt },
  ];

  const researchDiscovery: { label: string; href: string; icon: any; count?: number; badgeColor?: string }[] = [
    { label: 'Requests', href: `${basePath}/requests`, icon: FileText },
    { label: 'Reading Lists', href: `${basePath}/reading-lists`, icon: ListOrdered },
    { label: 'Saved Searches', href: `${basePath}/saved-searches`, icon: Search },
    { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
  ];

  const scholarSettings = [
    { label: 'Research Profile', href: `${basePath}/settings/profile`, icon: Settings },
  ];

  const allItems = [...mainCirculation, ...researchDiscovery, ...scholarSettings];
  const activeItem = allItems.find((i) => (i as any).exact ? pathname === i.href : pathname.startsWith(i.href)) || mainCirculation[0];

  return (
    <aside className="border-2 border-black bg-[#F8F5EF] p-3 sm:p-4 rounded-xs shadow-xs font-sans text-xs">

      {/* Mobile Accordion Toggle Header */}
      <div className="lg:hidden mb-2">
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full flex items-center justify-between p-2.5 bg-[#EAE6DE] border border-black rounded text-black font-bold text-xs"
        >
          <span className="flex items-center gap-2">
            <Menu className="w-4 h-4 text-heritage-red" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-600">Section:</span>
            <span className="font-sans font-bold">{activeItem.label}</span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className={`space-y-3 ${mobileExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Group 1: Circulation & Identity */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500 font-bold px-2 py-1 mb-1">
            Circulation &amp; Identity
          </p>
          <div className="space-y-0.5">
            {mainCirculation.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  prefetch
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileExpanded(false)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xs transition-colors text-left font-sans text-xs ${isActive
                      ? 'bg-black text-white font-semibold shadow-2xs'
                      : 'text-stone-800 hover:bg-black/5 font-medium'
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${isActive
                          ? 'bg-white text-black'
                          : item.href.includes('reservations')
                            ? 'bg-[#A52307] text-white'
                            : 'bg-[#DDD7CC] text-stone-800'
                        }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider line */}
        <div className="border-t border-stone-300/80 my-2" />

        {/* Group 2: Research & Discovery */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500 font-bold px-2 py-1 mb-1">
            Research &amp; Discovery
          </p>
          <div className="space-y-0.5">
            {researchDiscovery.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  prefetch
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileExpanded(false)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xs transition-colors text-left font-sans text-xs ${isActive
                      ? 'bg-black text-white font-semibold shadow-2xs'
                      : 'text-stone-800 hover:bg-black/5 font-medium'
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${isActive ? 'bg-white text-black' : 'bg-[#DDD7CC] text-stone-800'
                        }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider line */}
        <div className="border-t border-stone-300/80 my-2" />

        {/* Group 3: Scholar Settings */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500 font-bold px-2 py-1 mb-1">
            Scholar Settings
          </p>
          <div className="space-y-0.5">
            {scholarSettings.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  prefetch
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileExpanded(false)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xs transition-colors text-left font-sans text-xs ${isActive
                      ? 'bg-black text-white font-semibold shadow-2xs'
                      : 'text-stone-800 hover:bg-black/5 font-medium'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
