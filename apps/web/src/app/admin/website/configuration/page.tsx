'use client';

import { useEffect, useState } from 'react';
import { 
  Globe, 
  Menu as MenuIcon, 
  Layout, 
  Settings2, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Edit3, 
  Link as LinkIcon,
  Tag
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

const PREFIX = 'website.';

const DEFAULT_HOMEPAGE_SECTIONS = [
  { id: 'sec-hero', name: 'Hero Banner & Universal Search', visible: true },
  { id: 'sec-curated', name: 'Curated Archival Collections Carousel', visible: true },
  { id: 'sec-stories', name: 'Featured Scholarly Stories', visible: true },
  { id: 'sec-iiif', name: 'Interactive IIIF Manuscript Viewer Showcase', visible: true },
  { id: 'sec-events', name: 'Upcoming Events & Symposiums', visible: true },
  { id: 'sec-news', name: 'Latest Bulletins & Press Dispatches', visible: true },
  { id: 'sec-fellowships', name: 'Fellowships & Open Opportunities', visible: true },
];

const DEFAULT_FOOTER_CONTACT = {
  address: 'Kunhīn Musliyār Library & Research Institute, Ponnāni Heritage Precinct, Malappuram District, Kerala 679577, India',
  email: 'curator@kmlri.in',
  phone: '+91 494 266 0142',
  hours: 'Mon–Sat: 08:30 AM – 06:00 PM (Reading Room & Archive)',
};

const DEFAULT_SOCIAL_LINKS = {
  twitter: 'https://twitter.com/kmlri_archives',
  github: 'https://github.com/kmlri-archives',
  orcid: 'https://orcid.org/0000-0002-1825-0097',
};

export default function WebsiteConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'homepage' | 'navbar' | 'footer' | 'content_types'>('homepage');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Homepage Sections Config
  const [homepageSections, setHomepageSections] = useState(DEFAULT_HOMEPAGE_SECTIONS);

  // Navbar Items Config — read-only reference list; no add/edit/delete wiring exists in this UI yet,
  // so (like Departments) it is left as a static display and not persisted to the settings store.
  const [navItems, setNavItems] = useState([
    { id: 'nav-1', label: 'Collections', href: '/collections', hasDropdown: true, children: ['Archival Manuscripts', 'Arabi-Malayalam Lithographs', 'Maritime Treaties'] },
    { id: 'nav-2', label: 'Research Stories', href: '/stories', hasDropdown: false },
    { id: 'nav-3', label: 'Events', href: '/events', hasDropdown: false },
    { id: 'nav-4', label: 'News', href: '/news', hasDropdown: false },
    { id: 'nav-5', label: 'Opportunities', href: '/opportunities', hasDropdown: false },
    { id: 'nav-6', label: 'About Institute', href: '/about', hasDropdown: true, children: ['History & Lineage', 'Faculty & Curators', 'Consultation Rules'] },
  ]);

  // Footer Config
  const [footerContact, setFooterContact] = useState(DEFAULT_FOOTER_CONTACT);

  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);

  // Content Types Configuration — static reference lists with no add/edit UI, left untouched.
  const [storyCategories, setStoryCategories] = useState(['Conservation & Archives', 'Literary History', 'Maritime Studies', 'Oral Traditions']);
  const [newsCategories, setNewsCategories] = useState(['Institutional Announcement', 'Fellowships & Grants', 'Symposium & Lectures', 'Archival Acquisitions']);
  const [eventTypes, setEventTypes] = useState(['International Symposium', 'Scholarly Workshop', 'Public Lecture', 'Archival Exhibition']);
  const [oppTypes, setOppTypes] = useState(['Residential Fellowship', 'Archival Internship', 'Travel Grant', 'Call for Papers']);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await api.getSettings(PREFIX);
        const map = new Map<string, any>(settings.map((s: any) => [s.key, s.value]));
        if (cancelled) return;
        const savedSections = map.get(`${PREFIX}homepageSections`) as Array<{ id: string; visible: boolean }> | undefined;
        setHomepageSections(
          savedSections
            ? savedSections
                .map((s) => DEFAULT_HOMEPAGE_SECTIONS.find((d) => d.id === s.id) && { ...DEFAULT_HOMEPAGE_SECTIONS.find((d) => d.id === s.id)!, visible: s.visible })
                .filter((s): s is { id: string; name: string; visible: boolean } => Boolean(s))
            : DEFAULT_HOMEPAGE_SECTIONS
        );
        setFooterContact({ ...DEFAULT_FOOTER_CONTACT, ...(map.get(`${PREFIX}footerContact`) ?? {}) });
        setSocialLinks({ ...DEFAULT_SOCIAL_LINKS, ...(map.get(`${PREFIX}socialLinks`) ?? {}) });
      } catch (err: any) {
        if (!cancelled) setNotification({ type: 'error', text: err.message || 'Failed to load website configuration.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSection = (id: string) => {
    setHomepageSections(
      homepageSections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s)
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= homepageSections.length) return;
    const items = [...homepageSections];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    setHomepageSections(items);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.setSettings([
        { key: `${PREFIX}homepageSections`, value: homepageSections.map((s) => ({ id: s.id, visible: s.visible })) },
        { key: `${PREFIX}footerContact`, value: footerContact },
        { key: `${PREFIX}socialLinks`, value: socialLinks },
      ]);
      setNotification({ type: 'success', text: 'Website layout & navigation configuration saved successfully.' });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to save website configuration.' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Website Management · Configuration"
        title="Website Configuration"
        description="Configure public website layout sections, header navigation items, footer contacts, and content taxonomy."
        actions={
          <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save Layout Settings'}
          </Button>
        }
      />

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${notification.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`} />
          <span>{notification.text}</span>
        </div>
      )}

      {loading && (
        <div className="p-4 text-xs text-gray-500">Loading website configuration…</div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#E2E0DB] flex gap-2 flex-wrap">
        {[
          { key: 'homepage', label: 'Homepage Management', icon: Layout },
          { key: 'navbar', label: 'Navbar & Navigation', icon: MenuIcon },
          { key: 'footer', label: 'Footer Management', icon: Globe },
          { key: 'content_types', label: 'Content Types & Categories', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.key
                  ? 'border-[#A52307] text-[#A52307] bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Homepage Management */}
      {activeTab === 'homepage' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Homepage Section Order &amp; Visibility</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Reorder or toggle modules rendered on the public front page (`kmlri.in`).
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {homepageSections.map((sec, idx) => (
              <div
                key={sec.id}
                className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#E2E0DB] rounded text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-400 text-[11px]">0{idx + 1}</span>
                  <span className="font-bold text-gray-900 text-sm">{sec.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                      sec.visible ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {sec.visible ? 'Visible' : 'Hidden'}
                  </button>
                  <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, 'up')}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === homepageSections.length - 1}
                      onClick={() => moveSection(idx, 'down')}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Navbar Management */}
      {activeTab === 'navbar' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Header Navbar Navigation Items</h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage menu links and dropdown items on the public header.</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Navigation item management is not yet connected.')}
              className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Nav Item</span>
            </button>
          </div>

          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Menu Label</th>
                <th className="py-3 px-4">Target URL</th>
                <th className="py-3 px-4">Dropdown Sub-Links</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {navItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{item.label}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">{item.href}</td>
                  <td className="py-3.5 px-4">
                    {item.hasDropdown ? (
                      <span className="text-gray-700 font-semibold">{item.children?.join(', ')}</span>
                    ) : (
                      <span className="text-gray-400">Direct Link</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button type="button" className="p-1 text-gray-400 hover:text-black">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 text-gray-400 hover:text-[#A52307]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Footer Management */}
      {activeTab === 'footer' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6 text-xs font-sans">
          <h3 className="text-base font-bold text-gray-900 border-b border-[#E2E0DB] pb-3">Institutional Footer &amp; Contact Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-full">
              <label className="block font-bold text-gray-700 uppercase mb-1">Physical Address</label>
              <textarea
                rows={2}
                value={footerContact.address}
                onChange={(e) => setFooterContact({ ...footerContact, address: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Curatorial Email</label>
              <input
                type="email"
                value={footerContact.email}
                onChange={(e) => setFooterContact({ ...footerContact, email: e.target.value })}
                className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Helpline Phone</label>
              <input
                type="text"
                value={footerContact.phone}
                onChange={(e) => setFooterContact({ ...footerContact, phone: e.target.value })}
                className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs font-mono"
              />
            </div>

            <div className="col-span-full">
              <label className="block font-bold text-gray-700 uppercase mb-1">Reading Room Hours</label>
              <input
                type="text"
                value={footerContact.hours}
                onChange={(e) => setFooterContact({ ...footerContact, hours: e.target.value })}
                className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Institutional Twitter / X</label>
              <input
                type="text"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">ORCID Institutional Registry</label>
              <input
                type="text"
                value={socialLinks.orcid}
                onChange={(e) => setSocialLinks({ ...socialLinks, orcid: e.target.value })}
                className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Content Types & Categories */}
      {activeTab === 'content_types' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
          {/* Story Categories */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-900 text-sm border-b border-[#E2E0DB] pb-2">Story Categories</h4>
            <div className="space-y-1.5">
              {storyCategories.map((c, i) => (
                <div key={i} className="p-2 bg-[#FAF8F5] border border-gray-200 rounded font-semibold text-gray-800">
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* News Categories */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-900 text-sm border-b border-[#E2E0DB] pb-2">News Categories</h4>
            <div className="space-y-1.5">
              {newsCategories.map((c, i) => (
                <div key={i} className="p-2 bg-[#FAF8F5] border border-gray-200 rounded font-semibold text-gray-800">
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Event Types */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-900 text-sm border-b border-[#E2E0DB] pb-2">Event Types</h4>
            <div className="space-y-1.5">
              {eventTypes.map((c, i) => (
                <div key={i} className="p-2 bg-[#FAF8F5] border border-gray-200 rounded font-semibold text-gray-800">
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity Types */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-900 text-sm border-b border-[#E2E0DB] pb-2">Opportunity Types</h4>
            <div className="space-y-1.5">
              {oppTypes.map((c, i) => (
                <div key={i} className="p-2 bg-[#FAF8F5] border border-gray-200 rounded font-semibold text-gray-800">
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
