'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function AdminSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const groupDefs = [
    {
      title: 'Circulation',
      items: [
        { label: 'Overview', href: '/admin/circulation', exact: true },
        { label: 'Check in & Check Out', href: '/admin/circulation/desk' },
        { label: 'Holds & Reservations', href: '/admin/circulation/holds' },
        { label: 'Renewals', href: '/admin/circulation/renewals' },
        { label: 'Overdues', href: '/admin/circulation/overdues' },
        { label: 'Fines', href: '/admin/circulation/fines' },
        { label: 'Configuration', href: '/admin/circulation/configuration' },
      ],
    },
    {
      title: 'Members',
      items: [
        { label: 'All Members', href: '/admin/members', exact: true },
        { label: 'Roles & Permissions', href: '/admin/members/roles' },
      ],
    },
    {
      title: 'Cataloging',
      items: [
        { label: 'Catalogues', href: '/admin/catalog', exact: true },
        { label: 'Collections', href: '/admin/catalog/collections' },
        { label: 'Serials', href: '/admin/catalog/serials' },
        { label: 'Digital Library', href: '/admin/catalog/digital-library' },
        { label: 'Configuration', href: '/admin/catalog/configuration' },
      ],
    },
    {
      title: 'Website Management',
      items: [
        { label: 'Overview', href: '/admin/website', exact: true },
        { label: 'Stories', href: '/admin/website/stories' },
        { label: 'News', href: '/admin/website/news' },
        { label: 'Events', href: '/admin/website/events' },
        { label: 'Opportunities', href: '/admin/website/opportunities' },
        { label: 'Configuration', href: '/admin/website/configuration' },
      ],
    },
    {
      title: 'Asset Management',
      items: [
        { label: 'All Assets', href: '/admin/assets', exact: true },
        { label: 'Maintenance & Service', href: '/admin/assets/maintenance' },
        { label: 'Allocations & Custody', href: '/admin/assets/allocations' },
        { label: 'Audits & Inventory', href: '/admin/assets/audits' },
      ],
    },
    {
      title: 'Support & Services',
      items: [
        { label: 'Ask a Librarian', href: '/admin/support-services/ask-a-librarian' },
        { label: 'Document Delivery', href: '/admin/support-services/document-delivery' },
        { label: 'Reservations & Bookings', href: '/admin/support-services/reservations-bookings' },
      ],
    },
  ];

  const isItemActive = (item: { label: string; href: string; exact?: boolean }) => {
    if (item.exact) {
      if (item.href === '/admin/catalog') {
        return pathname === '/admin/catalog' || (pathname.startsWith('/admin/catalog/') && !pathname.startsWith('/admin/catalog/collections') && !pathname.startsWith('/admin/catalog/serials') && !pathname.startsWith('/admin/catalog/digital-library') && !pathname.startsWith('/admin/catalog/configuration'));
      }
      if (item.href === '/admin/members') {
        return pathname === '/admin/members' || (pathname.startsWith('/admin/members/') && !pathname.startsWith('/admin/members/roles'));
      }
      if (item.href === '/admin/assets') {
        return pathname === '/admin/assets' || (pathname.startsWith('/admin/assets/') && !pathname.startsWith('/admin/assets/maintenance') && !pathname.startsWith('/admin/assets/allocations') && !pathname.startsWith('/admin/assets/audits'));
      }
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  // Determine active group based on current route
  const getActiveGroupTitle = (currentPath: string) => {
    if (currentPath === '/admin') return null;
    if (currentPath.startsWith('/admin/circulation')) return 'Circulation';
    if (currentPath.startsWith('/admin/members') || currentPath === '/admin/roles') return 'Members';
    if (
      currentPath.startsWith('/admin/catalog') ||
      currentPath.startsWith('/admin/digital-library')
    )
      return 'Cataloging';
    if (
      currentPath.startsWith('/admin/website') ||
      currentPath.startsWith('/admin/public-view') ||
      currentPath.startsWith('/admin/stories') ||
      currentPath.startsWith('/admin/news') ||
      currentPath.startsWith('/admin/events') ||
      currentPath.startsWith('/admin/opportunities')
    )
      return 'Website Management';
    if (currentPath.startsWith('/admin/assets') || currentPath.startsWith('/admin/inventory'))
      return 'Asset Management';
    if (
      currentPath.startsWith('/admin/support-services') ||
      currentPath.startsWith('/admin/services') ||
      currentPath.startsWith('/admin/ask')
    )
      return 'Support & Services';
    return null;
  };

  // State of expanded categories: ONLY the active category is expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const activeGroup = getActiveGroupTitle(pathname);
    return activeGroup ? { [activeGroup]: true } : {};
  });

  // Automatically update so ONLY the active category is expanded on navigation
  useEffect(() => {
    const activeGroup = getActiveGroupTitle(pathname);
    if (activeGroup) {
      setExpanded({
        [activeGroup]: true,
      });
    }
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setExpanded((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
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
        className={`fixed lg:sticky top-0 z-50 lg:z-auto w-[264px] flex-shrink-0 bg-black text-white flex flex-col h-screen overflow-y-auto font-sans select-none transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-[22px] flex-shrink-0 border-b border-[#262626]">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-amiri text-[26px] font-bold text-white tracking-tight">kmlri</span>
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#A52307] border border-[#A52307] px-[7px] py-[2px] rounded-[3px]">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation Area */}
        <nav className="p-[14px_10px_24px] flex-1 space-y-1">
          {/* 1. Dashboard (Standalone - No Sub-Fields) */}
          <div className="mb-2">
            <Link
              href="/admin"
              onClick={onClose}
              className={`w-full text-left py-[9px] px-[14px] text-[13px] tracking-[0.04em] uppercase font-bold rounded-[4px] transition-all flex items-center justify-between ${
                pathname === '/admin'
                  ? 'bg-[#A52307] text-white shadow-sm ring-1 ring-white/10 hover:text-white hover:bg-[#A52307]/80'
                  : 'text-[#D2D2D2] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <span>Dashboard</span>
              {pathname === '/admin' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              )}
            </Link>
          </div>

          {/* 2. Collapsible Navigation Groups */}
          {groupDefs.map((group) => {
            const isOpen = expanded[group.title] ?? false;
            const hasActiveChild = group.items.some((item) => isItemActive(item));

            return (
              <div key={group.title} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className={`w-full bg-transparent border-none cursor-pointer flex items-center justify-between gap-2 p-[9px_12px] text-[11px] tracking-[0.08em] uppercase font-bold text-left transition-colors rounded ${
                    hasActiveChild ? 'text-white' : 'text-[#9C9C9C] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {hasActiveChild && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A52307] flex-shrink-0 inline-block" />
                    )}
                    <span className="truncate">{group.title}</span>
                  </div>
                  <span className="text-[10px] text-[#9C9C9C] flex-shrink-0">
                    {isOpen ? '▾' : '▸'}
                  </span>
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-1 mb-1 pl-1">
                    {group.items.map((item) => {
                      const active = isItemActive(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`w-full text-left cursor-pointer py-[7.5px] px-[14px] pl-[20px] text-[13.5px] rounded-[4px] transition-all flex items-center justify-between ${
                            active
                              ? 'bg-[#A52307] text-white font-semibold shadow-sm ring-1 ring-white/10 hover:text-white hover:bg-[#A52307]/80'
                              : 'text-[#D2D2D2] hover:bg-[#1A1A1A] hover:text-white'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* 3. System Administration (Bottom Link) */}
          <div className="pt-2 mt-2 border-t border-[#262626]">
            <Link
              href="/admin/system/settings"
              onClick={onClose}
              className={`w-full text-left py-[8px] px-[12px] text-[11px] tracking-[0.08em] uppercase font-bold rounded-[4px] transition-all flex items-center justify-between ${
                pathname.startsWith('/admin/system')
                  ? 'bg-[#A52307] text-white shadow-sm ring-1 ring-white/10 hover:text-white hover:bg-[#A52307]/80'
                  : 'text-[#9C9C9C] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <span>System Administration</span>
              {pathname.startsWith('/admin/system') && (
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              )}
            </Link>
          </div>
        </nav>

        {/* User Info Footer */}
        <Link
          href="/admin/profile"
          onClick={onClose}
          className="p-[16px_22px] border-t border-[#262626] flex items-center gap-2.5 bg-[#0A0A0A] hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <span className="w-[30px] h-[30px] rounded-full bg-[#303030] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0 border border-white/10">
            {getInitials(user?.fullName)}
          </span>
          <div className="flex flex-col leading-[1.3] min-w-0 flex-1">
            <span className="text-[13px] text-white font-semibold truncate">
              {user?.fullName || 'Rashida A.'}
            </span>
            <span className="text-[11px] text-[#9C9C9C] truncate">
              {user?.role === 'SUPER_ADMIN' ? 'Library Administrator' : user?.role || 'Library Administrator'}
            </span>
          </div>
        </Link>
      </aside>
    </>
  );
}
