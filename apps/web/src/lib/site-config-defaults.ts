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
  { id: 'nav-catalogue', label: 'Catalogue', href: '/search' },
  { id: 'nav-news', label: 'News & Events', href: '/news' },
  { id: 'nav-services', label: 'Services', href: '/services' },
  { id: 'nav-stories', label: 'Stories', href: '/stories' },
  { id: 'nav-opportunities', label: 'Opportunities', href: '/opportunities' },
  { id: 'nav-about', label: 'About', href: '/about' },
];

export interface FooterContact {
  address?: string;
  email?: string;
  phone?: string;
  hours?: string;
}

export const DEFAULT_FOOTER_CONTACT: FooterContact = {
  address: 'Near Sabeelul Hidaya Islamic College, Vadhee Hidaya, Vattaparamba, Parappur PO, Kottakkal, Malappuram, Kerala - 676503',
  email: 'info@kmlri.in',
  phone: '+91 97452 34786',
  hours: 'Mon–Sat: 08:30 AM – 06:00 PM (Reading Room & Archive)',
};

export interface SocialLinks {
  twitter?: string;
  github?: string;
  orcid?: string;
}

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  twitter: '',
  github: '',
  orcid: '',
};

export interface HomepageSection {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
}

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-hero',
    name: 'Hero Banner & Universal Search',
    description: 'Universal catalogue search bar, Arabic wordmark, and stack quick-links.',
    visible: true,
  },
  {
    id: 'sec-whatson',
    name: "What's On — Events, News, Stories & Opportunities",
    description: 'Interactive tabs highlighting latest stories, upcoming events, and opportunities.',
    visible: true,
  },
  {
    id: 'sec-collections',
    name: 'Browse the Collections',
    description: 'Archive format tiles for Manuscripts, Arabi-Malayalam, Rare Books, and Theses.',
    visible: true,
  },
  {
    id: 'sec-archive',
    name: 'From the Archive — Featured Item',
    description: 'Curated scholarly showcase with manuscript plate scan and story spotlight.',
    visible: true,
  },
  {
    id: 'sec-services',
    name: 'Services & Support Grid',
    description: 'Patron services, reading room access, reproduction, and librarian assistance.',
    visible: true,
  },
];

export function resolveHomepageSections(
  saved: Array<{ id: string; visible?: boolean; name?: string; description?: string }> | undefined
): HomepageSection[] {
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_HOMEPAGE_SECTIONS;

  const defaultsById = new Map(DEFAULT_HOMEPAGE_SECTIONS.map((s) => [s.id, s]));
  const visibilityById = new Map(saved.map((s) => [s.id, s.visible !== false]));

  const orderedKnownIds = saved.map((s) => s.id).filter((id) => defaultsById.has(id));
  const missingIds = DEFAULT_HOMEPAGE_SECTIONS.map((s) => s.id).filter((id) => !orderedKnownIds.includes(id));

  const resolved = [...orderedKnownIds, ...missingIds].map((id) => {
    const def = defaultsById.get(id)!;
    const savedItem = saved.find((s) => s.id === id);
    return {
      id,
      name: savedItem?.name || def.name,
      description: savedItem?.description || def.description,
      visible: visibilityById.has(id) ? visibilityById.get(id)! : def.visible,
    };
  });

  return resolved.length > 0 ? resolved : DEFAULT_HOMEPAGE_SECTIONS;
}

export interface SiteService {
  id?: string;
  name: string;
  note: string;
  action: string;
  href: string;
}

export const DEFAULT_SERVICES: SiteService[] = [
  { id: 'svc-reading-room', name: 'Reading Room', note: 'Open to researchers, Monday to Saturday, 9:00 to 17:00.', action: 'Plan a visit', href: '/services' },
  { id: 'svc-reproduction', name: 'Reproduction', note: 'Digital copies of catalogued items on request.', action: 'Request a scan', href: '/services' },
  { id: 'svc-reference', name: 'Reference Help', note: 'Ask a librarian about sources, scripts and citations.', action: 'Ask a question', href: '/ask' },
  { id: 'svc-membership', name: 'Membership', note: 'Borrowing and remote access for members of the institute.', action: 'Become a member', href: '/ask' },
];

export interface SiteHeroConfig {
  wordmarkUrl?: string;
  wordmarkAlt?: string;
  searchPlaceholder?: string;
  showAdvancedSearch?: boolean;
  showBrowseStacks?: boolean;
}

export const DEFAULT_HERO_CONFIG: SiteHeroConfig = {
  wordmarkUrl: '/assets/wordmark-arabic.svg',
  wordmarkAlt: 'كنجين مسليار — Kunhīn Musliyār Library & Research Institute',
  searchPlaceholder: 'Enter Keywords to Search',
  showAdvancedSearch: true,
  showBrowseStacks: true,
};
