export interface AdminNavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface AdminNavGroup {
  title?: string;
  items: AdminNavItem[];
}

export interface AdminNavSection {
  title: string;
  icon?: string;
  href?: string; // Optional standalone direct link (like Services & Aid or Programs & Milad)
  groups: AdminNavGroup[];
}

export interface AdminModule {
  id: string;
  label: string;
  icon: string;
  headerTitle: string;
  defaultHref: string;
  sections: AdminNavSection[];
}

export const ADMIN_MODULES: AdminModule[] = [
  {
    id: 'library',
    label: 'Library',
    icon: 'BookOpen',
    headerTitle: 'KMLRI LIBRARY',
    defaultHref: '/admin/circulation/desk',
    sections: [
      {
        title: 'Circulation',
        icon: 'ArrowLeftRight',
        groups: [
          {
            items: [
              { label: 'Circulation Desk', href: '/admin/circulation/desk' },
              { label: 'Holds', href: '/admin/circulation/holds' },
              { label: 'Overdues', href: '/admin/circulation/overdues' },
              { label: 'Fines & Payments', href: '/admin/circulation/fines' },
              { label: 'Circulation Policies', href: '/admin/circulation/configuration' },
            ],
          },
        ],
      },
      {
        title: 'Catalogue',
        icon: 'BookMarked',
        groups: [
          {
            items: [
              { label: 'Records', href: '/admin/catalog' },
              { label: 'Authorities', href: '/admin/catalog/authorities' },
              { label: 'Collections', href: '/admin/catalog/collections' },
              { label: 'Serials', href: '/admin/catalog/serials' },
              { label: 'Frameworks', href: '/admin/catalog/frameworks' },
              { label: 'Import & Exports', href: '/admin/catalog/configuration' },
            ],
          },
        ],
      },
      {
        title: 'Members',
        icon: 'Users',
        groups: [
          {
            items: [
              { label: 'All Members', href: '/admin/members' },
              { label: 'Access Policies & Clearances', href: '/admin/members/access-policies' },
            ],
          },
        ],
      },
      {
        title: 'Digital Library',
        icon: 'GraduationCap',
        groups: [
          {
            items: [
              { label: 'Overview', href: '/admin/digital-library' },
              { label: 'Institutional Repository', href: '/admin/digital-library/repository' },
              { label: 'Research Directory', href: '/admin/digital-library/research' },
            ],
          },
        ],
      },
      {
        title: 'Acquisitions & Assets',
        icon: 'Package',
        groups: [
          {
            items: [
              { label: 'Recommendations', href: '/admin/acquisitions/recommendations' },
              { label: 'Vendors & Partners', href: '/admin/acquisitions/vendors' },
              { label: 'Inventory & Shelf Auditing', href: '/admin/acquisitions/inventory' },
              { label: 'Asset Registry', href: '/admin/acquisitions/assets' },
              { label: 'Department Allocations', href: '/admin/acquisitions/assets/allocations' },
              { label: 'Physical Audits', href: '/admin/acquisitions/assets/audits' },
              { label: 'Maintenance Logs', href: '/admin/acquisitions/assets/maintenance' },
            ],
          },
        ],
      },
      {
        title: 'Support & Services',
        icon: 'HeartHandshake',
        groups: [
          {
            items: [
              { label: 'Overview', href: '/admin/support-services' },
              { label: 'Ask a Librarian', href: '/admin/support-services/ask' },
              { label: 'Reservations & Bookings', href: '/admin/support-services/reservations-bookings' },
              { label: 'Document Delivery', href: '/admin/support-services/document-delivery' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'website',
    label: 'Website',
    icon: 'Globe',
    headerTitle: 'WEBSITE CMS',
    defaultHref: '/admin/website/stories',
    sections: [
      {
        title: 'Content & Publishing',
        icon: 'FileText',
        groups: [
          {
            items: [
              { label: 'Stories', href: '/admin/website/stories' },
              { label: 'News & Announcements', href: '/admin/website/news' },
              { label: 'Events', href: '/admin/website/events' },
              { label: 'Opportunities', href: '/admin/website/opportunities' },
            ],
          },
        ],
      },
      {
        title: 'Layout & Pages',
        icon: 'LayoutTemplate',
        groups: [
          {
            items: [
              { label: 'Homepage, Navbar & Footer', href: '/admin/website/configuration' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    headerTitle: 'REPORTS & AUDITS',
    defaultHref: '/admin/circulation/reports',
    sections: [
      {
        title: 'Circulation & Operations',
        icon: 'TrendingUp',
        groups: [
          {
            items: [
              { label: 'Circulation Reports', href: '/admin/circulation/reports' },
              { label: 'Inventory & Auditing', href: '/admin/acquisitions/inventory' },
              { label: 'Physical Asset Audits', href: '/admin/acquisitions/assets/audits' },
            ],
          },
        ],
      },
      {
        title: 'System & Security',
        icon: 'ShieldCheck',
        groups: [
          {
            items: [
              { label: 'System Audit Logs', href: '/admin/system/audit-logs' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    headerTitle: 'SYSTEM ADMIN',
    defaultHref: '/admin/system/settings',
    sections: [
      {
        title: 'Administration',
        icon: 'Shield',
        groups: [
          {
            items: [
              { label: 'General Settings', href: '/admin/system/settings' },
              { label: 'Roles & Permissions', href: '/admin/system/roles' },
              { label: 'Departments & Programs', href: '/admin/system/departments' },
              { label: 'Notifications Hub', href: '/admin/notifications' },
            ],
          },
        ],
      },
      {
        title: 'Security & DevOps',
        icon: 'Sliders',
        groups: [
          {
            items: [
              { label: 'Security & Auth', href: '/admin/system/security' },
              { label: 'Integrations', href: '/admin/system/integrations' },
              { label: 'API Keys', href: '/admin/system/api' },
              { label: 'Backups', href: '/admin/system/backups' },
              { label: 'Languages', href: '/admin/system/languages' },
            ],
          },
        ],
      },
    ],
  },
];

// Flat export of all sections across all modules for backward compatibility
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = ADMIN_MODULES.flatMap((m) => m.sections);

// Flat export of all nav items
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_SECTIONS.flatMap((s) =>
  s.groups.flatMap((g) => g.items)
);

// Map a given pathname to its containing module ID
export function getModuleForPathname(pathname: string): string {
  if (pathname === '/admin') return 'library';
  if (pathname.startsWith('/admin/website')) return 'website';
  if (pathname.startsWith('/admin/circulation/reports')) return 'reports';
  if (pathname.startsWith('/admin/system') || pathname.startsWith('/admin/notifications')) return 'settings';
  if (pathname.startsWith('/admin/profile')) return 'settings';

  for (const module of ADMIN_MODULES) {
    const flatItems = module.sections.flatMap((s) => s.groups.flatMap((g) => g.items));
    if (flatItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))) {
      return module.id;
    }
  }
  return 'library';
}

const LABEL_OVERRIDES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/profile': 'My Profile',
};

export interface AdminBreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Builds a breadcrumb trail for the given admin pathname using the nav map
 * as the single source of truth.
 */
export function getAdminBreadcrumb(pathname: string): AdminBreadcrumbItem[] {
  const trail: AdminBreadcrumbItem[] = [{ label: 'Dashboard', href: '/admin' }];

  if (pathname === '/admin' || !pathname.startsWith('/admin')) return trail;

  if (LABEL_OVERRIDES[pathname]) {
    trail.push({ label: LABEL_OVERRIDES[pathname], href: pathname });
    return trail;
  }

  const exact = ADMIN_NAV_ITEMS.find((i) => i.href === pathname);
  const ancestor = !exact
    ? ADMIN_NAV_ITEMS.filter((i) => pathname.startsWith(`${i.href}/`)).sort(
        (a, b) => b.href.length - a.href.length
      )[0]
    : undefined;
  const matched = exact || ancestor;

  if (!matched) {
    const segment = pathname.split('/').filter(Boolean).pop() || '';
    trail.push({
      label: segment
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      href: pathname,
    });
    return trail;
  }

  const section = ADMIN_NAV_SECTIONS.find((s) =>
    s.groups.some((g) => g.items.some((i) => i.href === matched.href))
  );
  if (section) trail.push({ label: section.title, href: section.groups[0].items[0].href });
  trail.push({ label: matched.label, href: matched.href });

  if (exact === undefined && pathname !== matched.href) {
    const segment = pathname.slice(matched.href.length).split('/').filter(Boolean)[0] || '';
    if (segment) trail.push({ label: 'Details', href: pathname });
  }

  return trail;
}
