export interface AdminNavItem {
  label: string;
  href: string;
}

export interface AdminNavGroup {
  title?: string;
  items: AdminNavItem[];
}

export interface AdminNavSection {
  title: string;
  groups: AdminNavGroup[];
}

// Single source of truth for admin navigation. Every real page under
// apps/web/src/app/admin lives under exactly one of these pillars, and its
// URL is nested under that pillar's own path prefix (e.g. Circulation's
// "Holds" page lives at /admin/circulation/holds, not a bare /admin/*
// path) — no orphaned routes reachable only by typing a URL, no nav entry
// whose URL contradicts where it lives in the hierarchy, and no two nav
// entries pointing at duplicate implementations of the same feature.
// Legacy flat/duplicate routes were converted to redirects to their
// canonical, correctly-nested counterpart below. AdminSidebar renders
// this list; AdminHeader derives breadcrumbs from it.
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: 'Circulation',
    groups: [
      {
        items: [
          { label: 'Circulation Desk', href: '/admin/circulation/desk' },
          { label: 'Holds', href: '/admin/circulation/holds' },
          { label: 'Overdues', href: '/admin/circulation/overdues' },
          { label: 'Fines & Payments', href: '/admin/circulation/fines' },
        ],
      },
      {
        title: 'Reports & Configuration',
        items: [
          { label: 'Circulation Reports', href: '/admin/circulation/reports' },
          { label: 'Circulation Policies', href: '/admin/circulation/configuration' },
        ],
      },
    ],
  },
  {
    title: 'Catalogue',
    groups: [
      {
        items: [
          { label: 'Records', href: '/admin/catalog' },
          { label: 'Collections', href: '/admin/catalog/collections' },
          { label: 'Serials', href: '/admin/catalog/serials' },
        ],
      },
      {
        title: 'Configuration',
        items: [
          { label: 'Item Types', href: '/admin/catalog/item-types' },
          { label: 'Libraries & Branches', href: '/admin/catalog/libraries' },
          { label: 'Authority Records', href: '/admin/catalog/authorities' },
          { label: 'Authorised Values', href: '/admin/catalog/authorised-values' },
          { label: 'MARC Frameworks', href: '/admin/catalog/marc-frameworks' },
          { label: 'General Settings', href: '/admin/catalog/configuration' },
        ],
      },
    ],
  },
  {
    title: 'Members',
    groups: [
      {
        items: [{ label: 'All Members', href: '/admin/members' }],
      },
      {
        title: 'Configuration',
        items: [
          
          { label: 'Access Policies & Clearances', href: '/admin/members/access-policies' },
        ],
      },
    ],
  },
  {
    title: 'Digital Library & Research',
    groups: [
      {
        items: [
          { label: 'Digital Library', href: '/admin/digital-library' },
          { label: 'Institutional Repository & Theses', href: '/admin/digital-library/repository' },
          { label: 'Research Community Directory', href: '/admin/digital-library/research' },
        ],
      },
    ],
  },
  {
    title: 'Acquisitions & Assets',
    groups: [
      {
        items: [
          { label: 'Acquisition Recommendations', href: '/admin/acquisitions/recommendations' },
          { label: 'Vendors & Publisher Partners', href: '/admin/acquisitions/vendors' },
          { label: 'Inventory & Shelf Auditing', href: '/admin/acquisitions/inventory' },
        ],
      },
      {
        title: 'Asset Registry',
        items: [
          { label: 'Asset Registry & Equipment', href: '/admin/acquisitions/assets' },
          { label: 'Allocations by Department', href: '/admin/acquisitions/assets/allocations' },
          { label: 'Physical Audits', href: '/admin/acquisitions/assets/audits' },
          { label: 'Maintenance Logs', href: '/admin/acquisitions/assets/maintenance' },
        ],
      },
    ],
  },
  {
    title: 'Website Management',
    groups: [
      {
        items: [
          { label: 'Stories', href: '/admin/website/stories' },
          { label: 'News', href: '/admin/website/news' },
          { label: 'Events', href: '/admin/website/events' },
          { label: 'Opportunities', href: '/admin/website/opportunities' },
        ],
      },
      {
        title: 'Configuration',
        items: [{ label: 'Homepage, Navbar & Footer', href: '/admin/website/configuration' }],
      },
    ],
  },
  {
    title: 'Support & Services',
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
  {
    title: 'System Administration',
    groups: [
      {
        items: [
          { label: 'Roles & Permissions', href: '/admin/system/roles' },
          { label: 'Departments & Programs', href: '/admin/system/departments' },
          { label: 'Notifications Hub', href: '/admin/notifications' },
        ],
      },
      {
        title: 'Configuration',
        items: [
          { label: 'Settings', href: '/admin/system/settings' },
          { label: 'Audit Logs', href: '/admin/system/audit-logs' },
          { label: 'Security', href: '/admin/system/security' },
          { label: 'Integrations', href: '/admin/system/integrations' },
          { label: 'API Keys', href: '/admin/system/api' },
          { label: 'Backups', href: '/admin/system/backups' },
          { label: 'Languages', href: '/admin/system/languages' },
        ],
      },
    ],
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_SECTIONS.flatMap((s) =>
  s.groups.flatMap((g) => g.items)
);

// A few routes need a friendlier label than "Dashboard" or a title-cased
// URL segment, and don't have their own sidebar entry (e.g. detail pages,
// or entries whose canonical breadcrumb differs from the sidebar label).
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
 * above as the single source of truth, so the header trail always matches
 * where the sidebar says the page lives — instead of guessing a label from
 * the last URL segment.
 */
export function getAdminBreadcrumb(pathname: string): AdminBreadcrumbItem[] {
  const trail: AdminBreadcrumbItem[] = [{ label: 'Dashboard', href: '/admin' }];

  if (pathname === '/admin' || !pathname.startsWith('/admin')) return trail;

  if (LABEL_OVERRIDES[pathname]) {
    trail.push({ label: LABEL_OVERRIDES[pathname], href: pathname });
    return trail;
  }

  // Prefer an exact nav-item match; otherwise fall back to the closest
  // ancestor route so dynamic/detail pages (e.g. /admin/catalog/[id]) still
  // get a sensible trail back through their section.
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
    // We're on a detail/sub-page below the matched nav item (e.g. a record ID).
    const segment = pathname.slice(matched.href.length).split('/').filter(Boolean)[0] || '';
    if (segment) trail.push({ label: 'Details', href: pathname });
  }

  return trail;
}
