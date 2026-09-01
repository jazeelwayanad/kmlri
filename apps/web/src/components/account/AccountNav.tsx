'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  User,
  BookOpen,
  BookmarkCheck,
  Receipt,
  FileText,
  ListOrdered,
  Bookmark,
  Search,
  Bell,
  Settings,
  GraduationCap,
  BookMarked,
  Sparkles,
  ChevronDown,
  Menu,
  BookCheck,
  FolderHeart
} from 'lucide-react';

export function AccountNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const mainCirculation = [
    { label: 'Dashboard', href: '/account', icon: LayoutDashboard, exact: true },
    { label: 'Profile & ID Pass', href: '/account/profile', icon: User },
    { label: 'My Loans', href: '/account/loans', icon: BookOpen, count: user?.loans?.length ?? 3 },
    { label: 'My Reservations', href: '/account/reservations', icon: BookmarkCheck, count: user?.reservations?.length ?? 1, badgeColor: 'bg-heritage-red text-white' },
    { label: 'My Fines', href: '/account/fines', icon: Receipt },
  ];

  const researchDiscovery = [
    { label: 'My Requests', href: '/account/requests', icon: FileText, count: 2 },
    { label: 'My Reading Lists', href: '/account/reading-lists', icon: ListOrdered, count: 2 },
    { label: 'Saved Resources', href: '/account/saved-resources', icon: FolderHeart, count: 3 },
    { label: 'Saved Searches', href: '/account/saved-searches', icon: Search, count: 3 },
    { label: 'Notifications', href: '/account/notifications', icon: Bell, count: 2, badgeColor: 'bg-heritage-red text-white' },
  ];

  const scholarSettings = [
    { label: 'Research Profile', href: '/account/settings/profile', icon: Settings },
    { label: 'Publications', href: '/account/settings/publications', icon: BookMarked },
    { label: 'Research Alerts', href: '/account/settings/alerts', icon: Sparkles },
    { label: 'Course Reading Lists', href: '/account/settings/courses', icon: GraduationCap },
  ];

  const allItems = [...mainCirculation, ...researchDiscovery, ...scholarSettings];
  const activeItem = allItems.find((i) => (i as any).exact ? pathname === i.href : pathname.startsWith(i.href)) || mainCirculation[0];

  return (
    <aside className="bg-white border-2 border-black p-3 sm:p-4 font-sans text-sm shadow-md rounded-sm">
      {/* Mobile Accordion Toggle Header */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full flex items-center justify-between p-2.5 bg-[#F7F4EF] border border-black rounded text-black font-bold"
        >
          <span className="flex items-center gap-2">
            <Menu className="w-4 h-4 text-heritage-red" />
            <span className="text-xs uppercase font-averia tracking-wider text-heritage-muted">Section:</span>
            <span className="text-sm font-amiri font-bold">{activeItem.label}</span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className={`space-y-4 mt-3 lg:mt-0 ${mobileExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Group 1: Circulation */}
        <div>
          <p className="font-averia text-[11px] uppercase tracking-widest text-heritage-muted font-bold px-3 py-1 mb-1">
            Circulation &amp; Identity
          </p>
          <div className="space-y-0.5">
            {mainCirculation.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileExpanded(false)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded transition-all text-left font-medium ${
                    isActive
                      ? 'bg-black text-paper font-bold shadow-sm'
                      : 'hover:bg-black/5 text-black hover:translate-x-0.5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-heritage-muted'}`} />
                    <span className="font-amiri text-[17px] leading-tight">{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-sans ${
                      isActive ? 'bg-white text-black' : item.badgeColor || 'bg-black/10 text-black'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Group 2: Research & Discovery */}
        <div className="pt-2 border-t border-gray-200">
          <p className="font-averia text-[11px] uppercase tracking-widest text-heritage-muted font-bold px-3 py-1 mb-1">
            Research &amp; Discovery
          </p>
          <div className="space-y-0.5">
            {researchDiscovery.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileExpanded(false)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded transition-all text-left font-medium ${
                    isActive
                      ? 'bg-black text-paper font-bold shadow-sm'
                      : 'hover:bg-black/5 text-black hover:translate-x-0.5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-heritage-muted'}`} />
                    <span className="font-amiri text-[17px] leading-tight">{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-sans ${
                      isActive ? 'bg-white text-black' : item.badgeColor || 'bg-black/10 text-black'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Group 3: Scholar Settings */}
        <div className="pt-2 border-t border-gray-200">
          <p className="font-averia text-[11px] uppercase tracking-widest text-heritage-muted font-bold px-3 py-1 mb-1">
            Scholar Settings
          </p>
          <div className="space-y-0.5">
            {scholarSettings.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileExpanded(false)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded transition-all text-left text-xs ${
                    isActive
                      ? 'bg-black text-paper font-bold shadow-sm'
                      : 'hover:bg-black/5 text-heritage-body hover:translate-x-0.5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-heritage-muted'}`} />
                  <span className="font-amiri text-[16px] leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
