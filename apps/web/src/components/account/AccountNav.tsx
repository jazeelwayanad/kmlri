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
  CalendarClock,
  MoreHorizontal,
  X,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  count?: number;
  badgeColor?: string;
}

export function AccountNav() {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  const slug = (params?.slug as string) || user?.username || user?.id || 'patron';
  const basePath = `/${slug}`;

  // Complete, clean list of navigation items without category grouping
  const navItems: NavItem[] = [
    { label: 'Dashboard', href: basePath, icon: LayoutDashboard, exact: true },
    { label: 'Profile', href: `${basePath}/profile`, icon: User },
    { label: 'Loans', href: `${basePath}/loans`, icon: BookOpen, count: user?.loans?.length },
    { label: 'Reservations', href: `${basePath}/reservations`, icon: BookmarkCheck, count: user?.reservations?.length, badgeColor: 'bg-heritage-red text-white' },
    { label: 'Bookings', href: `${basePath}/bookings`, icon: CalendarClock },
    { label: 'Fines', href: `${basePath}/fines`, icon: Receipt },
    { label: 'Requests', href: `${basePath}/requests`, icon: FileText },
    { label: 'Reading Lists', href: `${basePath}/reading-lists`, icon: ListOrdered },
    { label: 'Saved Searches', href: `${basePath}/saved-searches`, icon: Search },
    { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
    { label: 'Research Profile', href: `${basePath}/settings/profile`, icon: Settings },
  ];

  // Fixed top 3 tabs
  const top3Tabs: NavItem[] = [
    { label: 'Dashboard', href: basePath, icon: LayoutDashboard, exact: true },
    { label: 'Loans', href: `${basePath}/loans`, icon: BookOpen, count: user?.loans?.length },
    { label: 'Reservations', href: `${basePath}/reservations`, icon: BookmarkCheck, count: user?.reservations?.length },
  ];

  // Other tabs that can occupy the 4th tab when active (defaulting to Bookings)
  const defaultFourthTab: NavItem = { label: 'Bookings', href: `${basePath}/bookings`, icon: CalendarClock };
  const restTabs: NavItem[] = [
    defaultFourthTab,
    { label: 'Profile', href: `${basePath}/profile`, icon: User },
    { label: 'Fines', href: `${basePath}/fines`, icon: Receipt },
    { label: 'Requests', href: `${basePath}/requests`, icon: FileText },
    { label: 'Reading Lists', href: `${basePath}/reading-lists`, icon: ListOrdered },
    { label: 'Saved Searches', href: `${basePath}/saved-searches`, icon: Search },
    { label: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
    { label: 'Research Profile', href: `${basePath}/settings/profile`, icon: Settings },
  ];

  // If user is currently on any route outside top 3, show that selected route in the 4th slot
  const activeFromRest = restTabs.find((tab) =>
    tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
  );

  const fourthTab = activeFromRest || defaultFourthTab;

  const mobilePrimaryTabs: NavItem[] = [...top3Tabs, fourthTab];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Un-grouped, clean single vertical list)               */}
      {/* ========================================================================= */}
      <aside className="hidden lg:block border border-black bg-[#F8F5EF] p-3 sm:p-3.5 rounded-xs shadow-xs font-sans text-xs">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                prefetch
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xs transition-colors text-left font-sans text-xs ${
                  isActive
                    ? 'bg-black text-white font-semibold shadow-2xs'
                    : 'text-stone-800 hover:bg-black/5 font-medium'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ml-2 flex-shrink-0 ${
                      isActive
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
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom with dynamic 4th tab)     */}
      {/* ========================================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8F5EF]/95 backdrop-blur-md border-t border-black/15 shadow-2xl pb-[env(safe-area-inset-bottom,0px)]">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {mobilePrimaryTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

            return (
              <Link
                prefetch
                key={`${tab.href}-${idx}`}
                href={tab.href}
                onClick={() => setMoreDrawerOpen(false)}
                className="flex flex-col items-center justify-center py-1 group cursor-pointer relative"
              >
                {/* Icon Pill container */}
                <div
                  className={`px-4 py-1 rounded-full transition-all flex items-center justify-center relative ${
                    isActive ? 'bg-black text-white shadow-xs' : 'text-stone-700 group-hover:bg-black/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#A52307] text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center border border-white">
                      {tab.count}
                    </span>
                  )}
                </div>
                {/* Text Label */}
                <span
                  className={`text-[10px] mt-1 tracking-tight font-sans truncate max-w-[64px] text-center ${
                    isActive ? 'font-bold text-black' : 'font-medium text-stone-600'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* "More" Trigger Tab */}
          <button
            type="button"
            onClick={() => setMoreDrawerOpen(!moreDrawerOpen)}
            className="flex flex-col items-center justify-center py-1 group cursor-pointer"
          >
            <div
              className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
                moreDrawerOpen ? 'bg-black text-white shadow-xs' : 'text-stone-700 group-hover:bg-black/5'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight font-sans truncate text-center ${
                moreDrawerOpen ? 'font-bold text-black' : 'font-medium text-stone-600'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. MOBILE "MORE" BOTTOM SHEET / DRAWER                                    */}
      {/* ========================================================================= */}
      {moreDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
            onClick={() => setMoreDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative bg-[#FAF8F5] border-t-2 border-black rounded-t-2xl shadow-2xl p-5 max-h-[80vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-3">
              <div>
                
              </div>
              <button
                type="button"
                onClick={() => setMoreDrawerOpen(false)}
                className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-black cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of All Navigation Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-sans text-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

                return (
                  <Link
                    prefetch
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreDrawerOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isActive
                        ? 'bg-black text-white border-black font-semibold'
                        : 'bg-white text-stone-800 border-black/10 hover:border-black/30'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                      <span>{item.label}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                            isActive ? 'bg-white text-black' : 'bg-black/10 text-black'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/60' : 'text-stone-400'}`} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
