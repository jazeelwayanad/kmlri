'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, isStaff } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Collections', href: '/collections' },
    { label: 'Services', href: '/services' },
    { label: 'News & Events', href: '/news' },
    { label: 'Stories', href: '/stories' },
    { label: 'Opportunities', href: '/opportunities' },
    { label: 'About', href: '/about' },
  ];

  return (
    <header className="max-w-[1100px] mx-auto pt-6 sm:pt-12 md:pt-[70px] lg:pt-[90px] px-4 sm:px-5">
      <div className="flex items-center justify-between gap-4 min-h-[36px]">
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-6 lg:gap-[34px] font-averia text-[16px] lg:text-[17px] leading-none flex-wrap">
          {navLinks.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'text-heritage-red font-bold' : 'text-black hover:text-heritage-red transition-colors'}
              >
                {item.label}
              </Link>
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
            <Link
              href="/admin"
              className="bg-heritage-red text-white h-[32px] sm:h-[36px] px-2.5 sm:px-4 flex items-center justify-center rounded-[5px] font-amiri font-bold text-[14px] sm:text-[17px] leading-none hover:bg-black transition-colors"
            >
              Admin Desk
            </Link>
          )}
          <Link
            href="/account"
            className="h-[32px] sm:h-[36px] px-3 sm:px-5 border-[1.5px] border-black flex items-center justify-center font-amiri text-[14px] sm:text-[17px] font-semibold leading-none hover:bg-black hover:text-paper transition-colors"
          >
            {user ? 'My Account' : 'My Account'}
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 pb-2 border-t border-black bg-paper">
          <nav className="flex flex-col gap-3 font-averia text-[18px]">
            {navLinks.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-1.5 px-2 rounded ${
                    active ? 'text-heritage-red font-bold bg-black/5' : 'text-black hover:text-heritage-red'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-gray-300 flex flex-col gap-2 text-sm font-amiri">
              <Link
                href="/faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 px-2 text-heritage-body hover:text-black"
              >
                FAQs &amp; Guidelines
              </Link>
              <Link
                href="/ask"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 px-2 text-heritage-body hover:text-black"
              >
                Ask Librarian / Reference Desk
              </Link>
            </div>
          </nav>
        </div>
      )}

      <div className="header-divider mt-4"></div>
    </header>
  );
}
