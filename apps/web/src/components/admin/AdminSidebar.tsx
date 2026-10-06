'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  ADMIN_MODULES,
  getModuleForPathname,
  type AdminNavItem,
  type AdminNavSection,
} from '@/lib/admin-nav';
import {
  Home,
  BookOpen,
  Globe,
  BarChart3,
  Settings,
  Search,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Users,
  ArrowLeftRight,
  BookMarked,
  GraduationCap,
  Package,
  HeartHandshake,
  FileText,
  LayoutTemplate,
  TrendingUp,
  ShieldCheck,
  Shield,
  Sliders,
  X,
} from 'lucide-react';

// Icon map for dynamic module and section icons
const ICON_MAP: Record<string, any> = {
  Home,
  BookOpen,
  Globe,
  BarChart3,
  Settings,
  LayoutGrid,
  Users,
  ArrowLeftRight,
  BookMarked,
  GraduationCap,
  Package,
  HeartHandshake,
  FileText,
  LayoutTemplate,
  TrendingUp,
  ShieldCheck,
  Shield,
  Sliders,
};

function getIconComponent(iconName?: string) {
  if (!iconName) return LayoutGrid;
  return ICON_MAP[iconName] || LayoutGrid;
}

export function AdminSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Active module state (library, website, reports, settings)
  const currentModuleId = useMemo(() => getModuleForPathname(pathname), [pathname]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(currentModuleId);

  // Sync selected module when pathname changes
  useEffect(() => {
    setSelectedModuleId(currentModuleId);
  }, [currentModuleId]);

  const activeModule = useMemo(() => {
    return (
      ADMIN_MODULES.find((m) => m.id === selectedModuleId) || ADMIN_MODULES[0]
    );
  }, [selectedModuleId]);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  const isItemActive = (item: AdminNavItem) => {
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
      const allItems = ADMIN_MODULES.flatMap((m) =>
        m.sections.flatMap((s) => s.groups.flatMap((g) => g.items))
      );
      const siblingHrefs = allItems
        .map((i) => i.href)
        .filter((h) => h !== item.href && h.startsWith(`${item.href}/`));
      const isClaimedBySibling = siblingHrefs.some(
        (h) => pathname === h || pathname.startsWith(`${h}/`)
      );
      return pathname.startsWith(`${item.href}/`) && !isClaimedBySibling;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  // State to track expanded accordion sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Auto-expand the active section on route change
  useEffect(() => {
    const newExpanded: Record<string, boolean> = { ...expandedSections };
    for (const section of activeModule.sections) {
      const flatItems = section.groups.flatMap((g) => g.items);
      if (flatItems.some((item) => isItemActive(item))) {
        newExpanded[section.title] = true;
      }
    }
    setExpandedSections(newExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, activeModule]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: prev[sectionTitle] === undefined ? false : !prev[sectionTitle],
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

  // Filtered navigation items based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return activeModule.sections;
    const query = searchQuery.toLowerCase().trim();

    return activeModule.sections
      .map((section) => {
        const matchingGroups = section.groups
          .map((group) => ({
            ...group,
            items: group.items.filter((item) =>
              item.label.toLowerCase().includes(query)
            ),
          }))
          .filter((group) => group.items.length > 0);

        if (
          matchingGroups.length > 0 ||
          section.title.toLowerCase().includes(query)
        ) {
          return {
            ...section,
            groups:
              matchingGroups.length > 0
                ? matchingGroups
                : section.groups,
          };
        }
        return null;
      })
      .filter(Boolean) as AdminNavSection[];
  }, [activeModule, searchQuery]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Dual Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-30 flex h-screen flex-shrink-0 select-none font-sans transition-transform duration-200 ease-in-out [&_a]:text-inherit ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* ========================================================================= */}
        {/* TIER 1: PRIMARY SLIM ICON RAIL (Far-Left) */}
        {/* ========================================================================= */}
        <div className="w-[68px] sm:w-[72px] flex-shrink-0 bg-black border-r border-[#262626] flex flex-col items-center justify-between py-3 z-20">
          {/* Top Logo / Brand Emblem */}
          <div className="flex flex-col items-center gap-5 w-full">
            <Link
              prefetch
              href="/admin"
              onClick={onClose}
              className="flex flex-col items-center justify-center p-2 rounded-[4px] hover:bg-[#1A1A1A] hover:!text-white transition-colors group text-white"
              title="KMLRI Admin Dashboard"
            >
              <span className="font-amiri text-[22px] font-bold text-white tracking-tight leading-none group-hover:text-white transition-colors">
                kmlri
              </span>
              <span className="text-[9px] font-bold tracking-[0.08em] uppercase text-[#A52307] border border-[#A52307] px-[4px] py-[1px] rounded-[2px] mt-1 leading-none">
                ADM
              </span>
            </Link>

            {/* Primary Rail Navigation Items */}
            <div className="flex flex-col items-center gap-1.5 w-full px-1.5">
              {/* Home / Dashboard Direct Action */}
              <Link
                prefetch
                href="/admin"
                onClick={() => {
                  setSelectedModuleId('library');
                  if (onClose) onClose();
                }}
                className={`w-full flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-[4px] transition-all cursor-pointer ${
                  pathname === '/admin'
                    ? 'bg-[#A52307] !text-white hover:!text-white hover:bg-[#8D1E06] font-semibold shadow-sm'
                    : 'text-[#9C9C9C] hover:!text-white hover:bg-[#1A1A1A]'
                }`}
                title="Home Dashboard"
              >
                <Home className="w-[18px] h-[18px]" />
                <span className="text-[10px] font-medium tracking-tight">Home</span>
              </Link>

              {/* Module Nav Items */}
              {ADMIN_MODULES.map((module) => {
                const IconComponent = getIconComponent(module.icon);
                const isCurrentActive = selectedModuleId === module.id;

                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => {
                      setSelectedModuleId(module.id);
                      setSearchQuery('');
                      if (selectedModuleId !== module.id) {
                        router.push(module.defaultHref);
                      }
                    }}
                    className={`w-full flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-[4px] transition-all cursor-pointer relative ${
                      isCurrentActive
                        ? 'bg-[#A52307] !text-white hover:!text-white hover:bg-[#8D1E06] font-semibold shadow-sm'
                        : 'text-[#9C9C9C] hover:!text-white hover:bg-[#1A1A1A]'
                    }`}
                    title={module.label}
                  >
                    <IconComponent className="w-[18px] h-[18px]" />
                    <span className="text-[10px] font-medium tracking-tight">
                      {module.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Profile / Account Quick Access */}
          <div className="flex flex-col items-center gap-2 w-full px-1.5">
            <Link
              prefetch
              href="/admin/profile"
              onClick={onClose}
              className="flex items-center justify-center p-1 rounded-[4px] hover:bg-[#1A1A1A] hover:!text-white transition-colors group"
              title={user?.fullName || 'Profile Settings'}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'User'}
                  className="w-[28px] h-[28px] rounded-[4px] object-cover border border-white/20 group-hover:border-[#A52307] transition-colors"
                />
              ) : (
                <div className="w-[28px] h-[28px] rounded-[4px] bg-[#262626] text-white flex items-center justify-center text-[11px] font-bold border border-white/10 group-hover:border-[#A52307] transition-colors">
                  {getInitials(user?.fullName)}
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TIER 2: SECONDARY TREE NAVIGATION PANEL */}
        {/* ========================================================================= */}
        <div className="w-[236px] sm:w-[246px] flex-shrink-0 bg-[#0E0E0E] border-r border-[#262626] text-white flex flex-col h-screen overflow-hidden z-10">
          {/* Header Title with Active Module Name */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#262626] flex-shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-white truncate">
                {activeModule.headerTitle}
              </span>
              <span className="text-[10px] text-[#7A7A7A] uppercase tracking-wider font-semibold">
                Admin Console
              </span>
            </div>

            {/* Mobile close button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 text-[#9C9C9C] hover:text-white rounded-[3px] hover:bg-[#1A1A1A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Navigation Bar */}
          <div className="p-2.5 border-b border-[#262626] flex-shrink-0">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#7A7A7A] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search navigation..."
                className="w-full bg-[#181818] border border-[#2B2B2B] text-[12px] text-white pl-8 pr-7 py-1.5 rounded-[4px] outline-none placeholder:text-[#6E6E6E] focus:border-[#A52307] focus:ring-1 focus:ring-[#A52307]/20 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-[#7A7A7A] hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items Area with Accordions and Tree Guides */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-[#262626]">
            {/* Dashboard Quick Pill (Only in Library Module) */}
            {activeModule.id === 'library' && !searchQuery && (
              <div className="mb-1.5">
                <Link
                  prefetch
                  href="/admin"
                  onClick={onClose}
                  className={`w-full py-[8px] px-[12px] text-[12.5px] font-bold uppercase tracking-[0.04em] rounded-[4px] transition-all flex items-center justify-between ${
                    pathname === '/admin'
                      ? 'bg-[#A52307] !text-white hover:!text-white hover:bg-[#8D1E06] shadow-sm ring-1 ring-white/10'
                      : 'text-[#D2D2D2] hover:bg-[#1A1A1A] hover:!text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                  {pathname === '/admin' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  )}
                </Link>
              </div>
            )}

            {/* Render Sections */}
            {filteredSections.length === 0 ? (
              <div className="py-8 text-center text-[#7A7A7A] text-xs">
                No matching navigation found
              </div>
            ) : (
              filteredSections.map((section) => {
                const SectionIcon = getIconComponent(section.icon);
                const flatItems = section.groups.flatMap((g) => g.items);
                const hasActiveChild = flatItems.some((item) => isItemActive(item));

                // Always expand if actively searching
                const isExpanded =
                  searchQuery.trim().length > 0 ||
                  (expandedSections[section.title] ?? hasActiveChild);

                return (
                  <div key={section.title} className="mb-0.5">
                    {/* Section Header Accordion Trigger */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className={`w-full flex items-center justify-between py-[7px] px-[10px] rounded-[4px] text-[11px] font-bold tracking-[0.06em] uppercase transition-colors cursor-pointer ${
                        hasActiveChild
                          ? 'text-white'
                          : 'text-[#9C9C9C] hover:!text-white hover:bg-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <SectionIcon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            hasActiveChild ? 'text-[#A52307]' : 'text-[#7A7A7A]'
                          }`}
                        />
                        <span className="truncate">{section.title}</span>
                      </div>
                      <span className="text-[10px] text-[#7A7A7A] flex-shrink-0 ml-1">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>

                    {/* Accordion Sub-Items with Tree Guide Line */}
                    {isExpanded && (
                      <div className="relative ml-3 pl-3 my-0.5 border-l border-[#262626] space-y-0.5">
                        {section.groups.map((group, gi) => (
                          <div key={group.title || gi} className="space-y-0.5">
                            {group.title && (
                              <span className="block text-[10px] uppercase font-bold tracking-[0.06em] text-[#6B6B6B] px-[10px] pt-1 pb-0.5">
                                {group.title}
                              </span>
                            )}
                            {group.items.map((item) => {
                              const active = isItemActive(item);
                              return (
                                <Link
                                  prefetch
                                  key={item.href}
                                  href={item.href}
                                  onClick={onClose}
                                  className={`w-full py-[6px] px-[10px] text-[12.5px] rounded-[4px] transition-all flex items-center justify-between block truncate ${
                                    active
                                      ? 'bg-[#A52307] !text-white hover:!text-white hover:bg-[#8D1E06] font-semibold shadow-sm ring-1 ring-white/10'
                                      : 'text-[#D2D2D2] hover:bg-[#1A1A1A] hover:!text-white'
                                  }`}
                                >
                                  <span className="truncate text-inherit">{item.label}</span>
                                  {active && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 ml-1.5" />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer User Info Strip */}
          <div className="h-12 px-3 border-t border-[#262626] bg-[#0A0A0A] flex-shrink-0 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[#9C9C9C] truncate">
                {user?.role === 'SUPER_ADMIN' ? 'Library Administrator' : user?.role || 'Staff Online'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7A7A] border border-[#262626] px-1.5 py-0.5 rounded-[3px]">
              v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
