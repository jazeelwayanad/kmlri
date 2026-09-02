'use client';

import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/notification-store';
import {
  LogOut,
  Menu,
  ChevronDown,
  User,
  Shield,
  History,
  Bell,
  ArrowRight,
  X,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

function currentSectionLabel(pathname: string) {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname === '/admin/profile') return 'My Profile';
  if (pathname === '/admin/notifications') return 'Notifications Hub';
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 2) {
    const segment = parts[parts.length - 1] || '';
    return segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return 'Dashboard';
}

export function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { quickNotifs, unreadCount, markRead, markAllRead, dismissNotif } = useNotifications();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { setDropdownOpen(false); setNotifOpen(false); }
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleLogout = () => { setDropdownOpen(false); logout(); router.push('/account'); };

  const getInitials = (name?: string) => {
    if (!name) return 'RA';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const activeLabel = currentSectionLabel(pathname);

  // Priority colour ring
  const priorityRing = (p: string) =>
    p === 'URGENT' ? 'bg-red-100 text-red-700' : p === 'HIGH' ? 'bg-amber-50 text-[#A52307]' : 'bg-gray-100 text-gray-600';

  return (
    <header className="h-16 bg-white border-b border-[#E2E0DB] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 font-sans select-none">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button type="button" onClick={onMenuClick}
            className="lg:hidden text-gray-900 p-1.5 -ml-1.5 rounded hover:bg-gray-100 cursor-pointer"
            aria-label="Open navigation">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="text-[15px] text-[#5A5854] font-medium truncate">Admin / {activeLabel}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* ── Notification Bell Dropdown ── */}
        <div className="relative" ref={notifRef}>
          <button type="button" onClick={() => setNotifOpen((p) => !p)} aria-label="Notifications"
            className="relative p-1.5 rounded-full text-[#5A5854] hover:text-[#A52307] hover:bg-gray-100 transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#A52307] border-2 border-white rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#E2E0DB] z-50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-[#FAF8F5] border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#A52307] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button type="button" onClick={markAllRead}
                    className="text-[11px] font-semibold text-[#A52307] hover:underline cursor-pointer">
                    Mark all read
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {quickNotifs.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-8">No notifications</p>
                )}
                {quickNotifs.map((n) => {
                  return (
                    <div key={n.id}
                      className={`flex items-start gap-3 px-3.5 py-3 group hover:bg-[#FAF8F5] transition-colors ${n.unread ? 'bg-amber-50/40' : ''}`}>
                      <Link href={n.href} onClick={() => { markRead(n.id); setNotifOpen(false); }}
                        className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${priorityRing(n.priority)}`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-2 items-baseline">
                            <span className={`text-xs font-bold truncate ${n.unread ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.desc}</p>
                        </div>
                      </Link>
                      {/* Dismiss ✕ */}
                      <button type="button" onClick={() => dismissNotif(n.id)}
                        className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-gray-700 cursor-pointer"
                        aria-label="Dismiss">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer link */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                <Link href="/admin/notifications" onClick={() => setNotifOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A52307] hover:underline">
                  <span>Open Notifications Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* View public site */}
        <a href="/" className="hidden sm:inline text-[14px] text-[#5A5854] hover:text-[#A52307] transition-colors">
          View public site ↗
        </a>

        {/* ── User Profile Dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button type="button" onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 p-1 rounded-full sm:rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="w-[30px] h-[30px] rounded-full bg-[#303030] text-white flex items-center justify-center text-[12px] font-bold">
              {getInitials(user?.fullName)}
            </span>
            <span className="hidden md:inline text-[13px] font-semibold text-gray-900 max-w-[130px] truncate">
              {user?.fullName || 'Rashida A.'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#E2E0DB] py-1 text-xs z-50 divide-y divide-gray-100">
              <div className="p-4 bg-[#FAF8F5] rounded-t-xl">
                <p className="font-bold text-sm text-gray-900 truncate">{user?.fullName || 'Rashida A.'}</p>
                <p className="text-[11px] text-gray-500 font-mono truncate">{user?.email || 'admin@kmlri.in'}</p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#A52307] text-white px-2 py-0.5 rounded mt-1.5">
                  {user?.role || 'SUPER_ADMIN'}
                </span>
              </div>

              <div className="py-1 font-medium">
                {[
                  { href: '/admin/profile', icon: User, label: 'Account & Credentials' },
                  { href: '/admin/notifications', icon: Bell, label: 'Notifications Hub' },
                  { href: '/admin/system/security', icon: Shield, label: 'Security & 2FA' },
                  { href: '/admin/system/audit-logs', icon: History, label: 'Session Audit Logs' },
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-[#FAF8F5] hover:text-[#A52307] transition-colors">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              <div className="p-1">
                <button type="button" onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors font-semibold cursor-pointer">
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
