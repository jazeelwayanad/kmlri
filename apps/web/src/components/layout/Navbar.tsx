'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { usePublicWebsiteSettings } from '@/lib/website-settings';
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  BookOpen,
  Shield,
  CalendarClock,
  Receipt,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isStaff, logout } = useAuth();
  const { navItems: navLinks } = usePublicWebsiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  return (
    <header className="max-w-[1100px] mx-auto pt-6 sm:pt-12 md:pt-[70px] lg:pt-[90px] px-4 sm:px-5">
      <div className="flex items-center justify-between gap-4 min-h-[36px]">
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-6 lg:gap-[34px] font-averia text-[16px] lg:text-[17px] leading-none flex-wrap">
          {mounted && navLinks.map((item) => {
            const active = isActive(item.href);
            const hasChildren = Boolean(item.children && item.children.length > 0);
            return (
              <div key={item.id} className={hasChildren ? 'relative group' : undefined}>
                <Link prefetch
                  href={item.href}
                  className={`flex items-center gap-1 ${active ? 'text-heritage-red font-bold' : 'text-black hover:text-heritage-red transition-colors'}`}
                >
                  {item.label}
                  {hasChildren && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>
                {hasChildren && (
                  <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-30">
                    <div className="bg-paper border border-black min-w-[220px] shadow-lg py-1.5">
                      {item.children!.map((child) => (
                        <Link prefetch
                          key={child.id}
                          href={child.href}
                          className="block px-4 py-2 text-[15px] text-black hover:bg-black hover:text-paper transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Mobile Menu Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-1.5 border border-black rounded text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Right CTA Actions: My Account with Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">

          {mounted && user ? (
            <div className="relative group">
              <Link prefetch
                href={`/${user.username || user.id}`}
                className="h-[32px] sm:h-[36px] px-2.5 sm:px-3.5 border-[1.5px] border-black flex items-center gap-2 justify-center font-amiri text-[14px] sm:text-[17px] font-semibold leading-none bg-paper text-black hover:bg-black hover:text-paper transition-colors"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-black/40"
                  />
                ) : (
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white group-hover:bg-paper group-hover:text-black flex items-center justify-center text-[10px] font-bold">
                    {user.fullName ? user.fullName[0] : 'U'}
                  </span>
                )}
                <span>My Account</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </Link>

              {/* Hover Dropdown Menu */}
              <div className="absolute right-0 top-full pt-1.5 hidden group-hover:block z-50">
                <div className="w-60 bg-paper border border-black shadow-2xl py-1 divide-y divide-black/10 font-sans text-xs">
                  {/* Patron Identity Header */}
                  <div className="px-3.5 py-2.5 bg-black/5">
                    <p className="font-bold text-black font-amiri text-base leading-tight truncate">
                      {user.fullName || 'Member Patron'}
                    </p>
                    <p className="text-[11px] text-stone-600 font-mono mt-0.5 truncate">
                      {user.membershipNumber ? `ID: ${user.membershipNumber}` : user.email}
                    </p>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1">
                    <Link prefetch
                      href={`/${user.username || user.id}`}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-black hover:bg-black hover:text-paper font-medium transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-stone-500" />
                      <span>Dashboard &amp; Account</span>
                    </Link>
                    <Link prefetch
                      href={`/${user.username || user.id}/profile`}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-black hover:bg-black hover:text-paper font-medium transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                      <span>Member Profile</span>
                    </Link>
                  
                   
                    <Link prefetch
                      href={`/${user.username || user.id}/fines`}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-black hover:bg-black hover:text-paper font-medium transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5 text-stone-500" />
                      <span>Fines &amp; Payments</span>
                    </Link>
                  </div>

                  {/* Admin Shortcut for Staff */}
                  {isStaff && (
                    <div className="py-1 bg-amber-50/50">
                      <Link prefetch
                        href="/admin"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[#A52307] hover:bg-[#A52307] hover:text-white font-semibold transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Desk</span>
                      </Link>
                    </div>
                  )}

                  {/* Log Out Action */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-700 hover:bg-red-700 hover:text-white font-semibold transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link prefetch
              href="/login"
              className="h-[32px] sm:h-[36px] px-2.5 sm:px-4 border-[1.5px] border-black flex items-center gap-2 justify-center font-amiri text-[14px] sm:text-[17px] font-semibold leading-none hover:bg-black hover:text-paper transition-colors"
            >
              <span>My Account</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          />
          <div className="absolute inset-y-0 right-0 w-[82%] max-w-[340px] bg-paper border-l border-black shadow-xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-black">
                <span className="font-averia text-xs uppercase tracking-widest text-heritage-muted font-bold">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-1.5 border border-black rounded text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Tile in Mobile Menu */}
              {user && (
                <div className="p-4 mx-4 mt-4 bg-black/5 border border-black/10 rounded flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-black font-amiri text-base truncate">
                      {user.fullName || 'Patron'}
                    </p>
                    <p className="text-[11px] text-stone-600 font-mono truncate">
                      {user.membershipNumber ? `ID: ${user.membershipNumber}` : user.email}
                    </p>
                  </div>
                  <Link prefetch
                    href={`/${user.username || user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1 bg-black text-white text-xs font-semibold rounded hover:bg-heritage-red transition-colors flex-shrink-0"
                  >
                    Account
                  </Link>
                </div>
              )}

              <nav className="flex flex-col gap-3 font-averia text-[18px] px-5 pt-4 pb-6">
                {navLinks.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <div key={item.id}>
                      <Link prefetch
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block py-1.5 px-2 rounded ${active ? 'text-heritage-red font-bold bg-black/5' : 'text-black hover:text-heritage-red'
                          }`}
                      >
                        {item.label}
                      </Link>
                      {item.children && item.children.length > 0 && (
                        <div className="pl-4 flex flex-col gap-1.5 mt-1 mb-1">
                          {item.children.map((child) => (
                            <Link prefetch
                              key={child.id}
                              href={child.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="py-1 px-2 text-[15px] text-heritage-body hover:text-heritage-red"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-gray-300 flex flex-col gap-2 text-sm font-amiri">
                  <Link prefetch
                    href="/faqs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1 px-2 text-heritage-body hover:text-black"
                  >
                    FAQs &amp; Guidelines
                  </Link>
                  <Link prefetch
                    href="/ask"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1 px-2 text-heritage-body hover:text-black"
                  >
                    Ask Librarian / Reference Desk
                  </Link>
                </div>
              </nav>
            </div>

            {/* Bottom Actions in Mobile Menu */}
            <div className="p-5 border-t border-black/10 bg-black/5">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-2 rounded hover:bg-red-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              ) : (
                <Link prefetch
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 bg-black text-white font-semibold text-xs flex items-center justify-center gap-2 rounded hover:bg-heritage-red transition-colors text-center"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="header-divider mt-4"></div>
    </header>
  );
}
