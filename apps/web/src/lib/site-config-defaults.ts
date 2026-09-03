/**
 * Single source of truth for the public site's navbar/footer content,
 * used both as the admin configuration form's starting state and as the
 * public Navbar/Footer's fallback when no admin override has been saved
 * yet (via `website.navItems` / `website.footerContact` / `website.socialLinks`
 * in the settings store, served publicly at GET /public-settings/website).
 */

export interface NavChild {
  id: string;
  label: string;
  href: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavChild[];
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'nav-collections', label: 'Collections', href: '/collections' },
  { id: 'nav-services', label: 'Services', href: '/services' },
  { id: 'nav-news', label: 'News & Events', href: '/news' },
  { id: 'nav-stories', label: 'Stories', href: '/stories' },
  { id: 'nav-opportunities', label: 'Opportunities', href: '/opportunities' },
  { id: 'nav-about', label: 'About', href: '/about' },
];

export interface FooterContact {
  address: string;
  email: string;
  phone: string;
  hours: string;
}

export const DEFAULT_FOOTER_CONTACT: FooterContact = {
  address: 'Near Sabeelul Hidaya Islamic College, Vadhee Hidaya, Vattaparamba, Parappur PO, Kottakkal, Malappuram, Kerala - 676503',
  email: 'info@kmlri.in',
  phone: '+91 97452 34786',
  hours: 'Mon–Sat: 08:30 AM – 06:00 PM (Reading Room & Archive)',
};

export interface SocialLinks {
  twitter: string;
  github: string;
  orcid: string;
}

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  twitter: '',
  github: '',
  orcid: '',
};

export interface HomepageSection {
  id: string;
  name: string;
  visible: boolean;
}

/**
 * The five actual toggleable/reorderable blocks on the public homepage
 * (between the always-present Navbar and Footer). Each `id` here must
 * match a case in the `sectionsById` map in `app/page.tsx`.
 */
export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  { id: 'sec-hero', name: 'Hero Banner & Universal Search', visible: true },
  { id: 'sec-whatson', name: "What's On — Events, News, Stories & Opportunities", visible: true },
  { id: 'sec-collections', name: 'Browse the Collections', visible: true },
  { id: 'sec-archive', name: 'From the Archive — Featured Item', visible: true },
  { id: 'sec-services', name: 'Services & Support Grid', visible: true },
];

/**
 * Merges a saved `website.homepageSections` value with the current default
 * list: known ids keep their saved order/visibility, ids that no longer
 * exist (e.g. from a renamed/retired section) are dropped, and any new
 * default section missing from the saved value is appended. This keeps a
 * stale or partial saved value from ever hiding sections that should exist.
 */
export function resolveHomepageSections(saved: Array<{ id: string; visible: boolean }> | undefined): HomepageSection[] {
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_HOMEPAGE_SECTIONS;

  const defaultsById = new Map(DEFAULT_HOMEPAGE_SECTIONS.map((s) => [s.id, s]));
  const visibilityById = new Map(saved.map((s) => [s.id, s.visible]));

  const orderedKnownIds = saved.map((s) => s.id).filter((id) => defaultsById.has(id));
  const missingIds = DEFAULT_HOMEPAGE_SECTIONS.map((s) => s.id).filter((id) => !orderedKnownIds.includes(id));

  const resolved = [...orderedKnownIds, ...missingIds].map((id) => {
    const def = defaultsById.get(id)!;
    return { ...def, visible: visibilityById.has(id) ? visibilityById.get(id)! : def.visible };
  });

  return resolved.length > 0 ? resolved : DEFAULT_HOMEPAGE_SECTIONS;
}
