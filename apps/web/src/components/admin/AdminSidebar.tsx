'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ADMIN_NAV_SECTIONS, ADMIN_NAV_ITEMS, type AdminNavItem } from '@/lib/admin-nav';

export function AdminSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const sections = ADMIN_NAV_SECTIONS;
  const allItems = ADMIN_NAV_ITEMS;

  const isItemActive = (item: AdminNavItem) => {
    // Exact-match roots that would otherwise swallow every route under them
    const rootHrefs = [
      '/admin/catalog',
      '/admin/members',
      '/admin/circulation',
      '/admin/acquisitions/assets',
      '/admin/support-services',
      '/admin/digital-library',
    ];
    if (rootHrefs.includes(item.href)) {
      if (pathname === item.href) return true;
      // Only treat as active if the current path is a sub-route not claimed by a sibling nav item
      const siblingHrefs = allItems.map((i) => i.href).filter((h) => h !== item.href && h.startsWith(`${item.href}/`));
      const isClaimedBySibling = siblingHrefs.some((h) => pathname === h || pathname.startsWith(`${h}/`));
      return pathname.startsWith(`${item.href}/`) && !isClaimedBySibling;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const getActiveSectionTitle = (currentPath: string) => {
    for (const section of sections) {
      const flatItems = section.groups.flatMap((g) => g.items);
      if (flatItems.some((item) => isItemActive(item))) return section.title;
    }
    return null;
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const activeSection = getActiveSectionTitle(pathname);
    return activeSection ? { [activeSection]: true } : {};
  });

  useEffect(() => {
    const activeSection = getActiveSectionTitle(pathname);
    if (activeSection) {
      setExpanded({ [activeSection]: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleSection = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
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

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-auto w-[264px] flex-shrink-0 bg-black text-white flex flex-col h-screen overflow-y-auto font-sans select-none transition-transform duration-200 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-[22px] flex-shrink-0 border-b border-[#262626]">
          <Link prefetch href="/" className="flex items-center gap-2">
            <span className="font-amiri text-[26px] font-bold text-white tracking-tight">kmlri</span>
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#A52307] border border-[#A52307] px-[7px] py-[2px] rounded-[3px]">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation Area */}
        <nav className="p-[14px_10px_24px] flex-1 space-y-1">
          {/* Dashboard (Standalone) */}
          <div className="mb-2">
            <Link prefetch
              href="/admin"
              onClick={onClose}
              className={`w-full text-left py-[9px] px-[14px] text-[13px] tracking-[0.04em] uppercase font-bold rounded-[4px] transition-all flex items-center justify-between ${pathname === '/admin'
                  ? 'bg-[#A52307] text-white shadow-sm ring-1 ring-white/10 hover:text-white hover:bg-[#A52307]/80'
                  : 'text-[#D2D2D2] hover:bg-[#1A1A1A] hover:text-white'
                }`}
            >
              <span>Dashboard</span>
              {pathname === '/admin' && <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
            </Link>
          </div>

          {/* Top-level Sections */}
          {sections.map((section) => {
            const isOpen = expanded[section.title] ?? false;
            const flatItems = section.groups.flatMap((g) => g.items);
            const hasActiveChild = flatItems.some((item) => isItemActive(item));

            return (
              <div key={section.title} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className={`w-full bg-transparent border-none cursor-pointer flex items-center justify-between gap-2 p-[9px_12px] text-[11px] tracking-[0.08em] uppercase font-bold text-left transition-colors rounded ${hasActiveChild ? 'text-white' : 'text-[#9C9C9C] hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {hasActiveChild && <span className="w-1.5 h-1.5 rounded-full bg-[#A52307] flex-shrink-0 inline-block" />}
                    <span className="truncate">{section.title}</span>
                  </div>
                  <span className="text-[10px] text-[#9C9C9C] flex-shrink-0">{isOpen ? '▾' : '▸'}</span>
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-2.5 mb-2 pl-1 pt-1">
                    {section.groups.map((group, gi) => (
                      <div key={group.title || gi} className="flex flex-col gap-0.5">
                        {group.title && (
                          <span className="text-[10px] tracking-[0.06em] uppercase font-bold text-[#6B6B6B] px-[20px] pt-1 pb-0.5">
                            {group.title}
                          </span>
                        )}
                        {group.items.map((item) => {
                          const active = isItemActive(item);
                          return (
                            <Link prefetch
                              key={item.href}
                              href={item.href}
                              onClick={onClose}
                              className={`w-full text-left cursor-pointer py-[7px] px-[14px] pl-[20px] text-[13px] rounded-[4px] transition-all flex items-center justify-between ${active
                                  ? 'bg-[#A52307] text-white font-semibold shadow-sm ring-1 ring-white/10 hover:text-white hover:bg-[#A52307]/80'
                                  : 'text-[#D2D2D2] hover:bg-[#1A1A1A] hover:text-white'
                                }`}
                            >
                              <span className="truncate">{item.label}</span>
                              {active && <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info Footer */}
        <Link prefetch
          href="/admin/profile"
          onClick={onClose}
          className="p-[16px_22px] border-t border-[#262626] flex items-center gap-2.5 bg-[#0A0A0A] hover:bg-[#141414] transition-colors cursor-pointer"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName || 'User'}
              className="w-[30px] h-[30px] rounded-full object-cover border border-white/20 flex-shrink-0"
            />
          ) : (
            <span className="w-[30px] h-[30px] rounded-full bg-[#303030] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0 border border-white/10">
              {getInitials(user?.fullName)}
            </span>
          )}
          <div className="flex flex-col leading-[1.3] min-w-0 flex-1">
            <span className="text-[13px] text-white font-semibold truncate">{user?.fullName || 'Rashida A.'}</span>
            <span className="text-[11px] text-[#9C9C9C] truncate">
              {user?.role === 'SUPER_ADMIN' ? 'Library Administrator' : user?.role || 'Library Administrator'}
            </span>
          </div>
        </Link>
      </aside>
    </>
  );
}
