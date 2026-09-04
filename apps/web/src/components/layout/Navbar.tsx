'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { DEFAULT_NAV_ITEMS, type NavItem } from '@/lib/site-config-defaults';
import { Menu, X, ChevronDown } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, isStaff } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);

  useEffect(() => {
    let cancelled = false;
    api
      .getPublicWebsiteSettings()
      .then((settings) => {
        if (cancelled) return;
        const items = settings?.navItems as NavItem[] | undefined;
        if (Array.isArray(items) && items.length > 0) setNavLinks(items);
      })
      .catch(() => {
        // Keep the default nav links if the settings service is unreachable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="max-w-[1100px] mx-auto pt-6 sm:pt-12 md:pt-[70px] lg:pt-[90px] px-4 sm:px-5">
      <div className="flex items-center justify-between gap-4 min-h-[36px]">
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-6 lg:gap-[34px] font-averia text-[16px] lg:text-[17px] leading-none flex-wrap">
          {navLinks.map((item) => {
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
            className="p-1.5 border border-black rounded text-black hover:bg-black hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Right CTA Actions: Admin Desk + My Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isStaff && (
            <Link prefetch
              href="/admin"
              className="bg-heritage-red text-white h-[32px] sm:h-[36px] px-2.5 sm:px-4 flex items-center justify-center rounded-[5px] font-amiri font-bold text-[14px] sm:text-[17px] leading-none hover:bg-black transition-colors"
            >
              Admin Desk
            </Link>
          )}
          <Link prefetch
            href={user ? `/${user.username || user.id}` : '/login'}
            className="h-[32px] sm:h-[36px] px-2.5 sm:px-4 border-[1.5px] border-black flex items-center gap-2 justify-center font-amiri text-[14px] sm:text-[17px] font-semibold leading-none hover:bg-black hover:text-paper transition-colors group"
          >
            {user && (
              user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-black/40"
                />
              ) : (
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white group-hover:bg-paper group-hover:text-black flex items-center justify-center text-[10px] font-bold">
                  {user.fullName ? user.fullName[0] : 'U'}
                </span>
              )
            )}
            <span>My Account</span>
          </Link>
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
          <div className="absolute inset-y-0 right-0 w-[82%] max-w-[340px] bg-paper border-l border-black shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-black">
              <span className="font-averia text-xs uppercase tracking-widest text-heritage-muted font-bold">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 border border-black rounded text-black hover:bg-black hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
        </div>
      )}

      <div className="header-divider mt-4"></div>
    </header>
  );
}
