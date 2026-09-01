'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  LogOut, 
  Menu, 
  ChevronDown, 
  User, 
  Shield, 
  ExternalLink, 
  History,
  Bell
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

function currentSectionLabel(pathname: string) {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname === '/admin/profile') return 'My Profile';
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 2) {
    const segment = parts[parts.length - 1] || '';
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return 'Dashboard';
}

export function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.push('/account');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'RA';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const activeLabel = currentSectionLabel(pathname);

  return (
    <header className="h-16 bg-white border-b border-[#E2E0DB] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 font-sans select-none">
      {/* Left: Mobile Menu + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden text-gray-900 p-1.5 -ml-1.5 rounded hover:bg-gray-100 cursor-pointer"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="text-[15px] text-[#5A5854] font-medium truncate">
          Admin / {activeLabel}
        </span>
      </div>

      {/* Right: Notifications, Public Link & User Dropdown */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications Icon Button */}
        <Link
          href="/admin/notifications"
          aria-label="Notifications"
          className="bg-transparent border-none cursor-pointer text-[#5A5854] hover:text-[#A52307] relative p-1 transition-colors"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 01-3.4 0" />
          </svg>
          <span className="absolute top-[2px] right-[2px] w-[7px] height-[7px] bg-[#A52307] rounded-full"></span>
        </Link>

        {/* View Public Site Link */}
        <a
          href="/"
          className="hidden sm:inline text-[14px] text-[#5A5854] hover:text-[#A52307] transition-colors"
        >
          View public site ↗
        </a>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-full sm:rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="w-[30px] h-[30px] rounded-full bg-[#303030] text-white flex items-center justify-center text-[12px] font-bold">
              {getInitials(user?.fullName)}
            </span>
            <span className="hidden md:inline text-[13px] font-semibold text-gray-900 max-w-[130px] truncate">
              {user?.fullName || 'Rashida A.'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#E2E0DB] py-1 text-xs z-50 animate-in fade-in duration-150 divide-y divide-gray-100">
              <div className="p-4 bg-[#FAF8F5] rounded-t-xl">
                <p className="font-bold text-sm text-gray-900 truncate">
                  {user?.fullName || 'Rashida A.'}
                </p>
                <p className="text-[11px] text-gray-500 font-mono truncate">
                  {user?.email || 'admin@kmlri.in'}
                </p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#A52307] text-white px-2 py-0.5 rounded mt-1.5">
                  {user?.role || 'SUPER_ADMIN'}
                </span>
              </div>

              <div className="py-1 font-medium">
                <Link
                  href="/admin/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#A52307] transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>My Profile &amp; Edit Details</span>
                </Link>

                <Link
                  href="/admin/system/security"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#A52307] transition-colors"
                >
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>Security &amp; 2FA</span>
                </Link>

                <Link
                  href="/admin/system/audit-logs"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#A52307] transition-colors"
                >
                  <History className="w-4 h-4 text-gray-400" />
                  <span>Audit Logs</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#A52307] transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span>Patron OPAC View</span>
                </Link>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#A52307] hover:bg-red-50 transition-colors font-semibold text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
