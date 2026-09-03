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
  Tag,
  X
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';
import { confirmDialog } from '@/lib/dialog';
import {
  DEFAULT_NAV_ITEMS,
  DEFAULT_FOOTER_CONTACT,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_HOMEPAGE_SECTIONS,
  resolveHomepageSections,
  type NavItem,
  type NavChild,
} from '@/lib/site-config-defaults';

const PREFIX = 'website.';

let navChildIdCounter = 0;
const newNavChildId = () => `child-${Date.now()}-${navChildIdCounter++}`;

export default function WebsiteConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'homepage' | 'navbar' | 'footer' | 'content_types'>('homepage');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Homepage Sections Config
  const [homepageSections, setHomepageSections] = useState(DEFAULT_HOMEPAGE_SECTIONS);

  // Navbar Items Config — persisted to the settings store under
  // `website.navItems` and served live to the public site's Navbar.
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [editingNavId, setEditingNavId] = useState<string | null>(null);
  const [navForm, setNavForm] = useState<{ label: string; href: string; children: NavChild[] }>({
    label: '',
    href: '',
    children: [],
  });

  // Footer Config
  const [footerContact, setFooterContact] = useState(DEFAULT_FOOTER_CONTACT);

  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);

  // Content Types Configuration — persisted to the settings store under `website.*Categories`/`*Types`.
  const [storyCategories, setStoryCategories] = useState(['Conservation & Archives', 'Literary History', 'Maritime Studies', 'Oral Traditions']);
  const [newsCategories, setNewsCategories] = useState(['Institutional Announcement', 'Fellowships & Grants', 'Symposium & Lectures', 'Archival Acquisitions']);
  const [eventTypes, setEventTypes] = useState(['International Symposium', 'Scholarly Workshop', 'Public Lecture', 'Archival Exhibition']);
  const [oppTypes, setOppTypes] = useState(['Residential Fellowship', 'Archival Internship', 'Travel Grant', 'Call for Papers']);
  const [newStoryCategory, setNewStoryCategory] = useState('');
  const [newNewsCategory, setNewNewsCategory] = useState('');
  const [newEventType, setNewEventType] = useState('');
  const [newOppType, setNewOppType] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await api.getSettings(PREFIX);
        const map = new Map<string, any>(settings.map((s: any) => [s.key, s.value]));
        if (cancelled) return;
        const savedSections = map.get(`${PREFIX}homepageSections`) as Array<{ id: string; visible: boolean }> | undefined;
        setHomepageSections(resolveHomepageSections(savedSections));
        setFooterContact({ ...DEFAULT_FOOTER_CONTACT, ...(map.get(`${PREFIX}footerContact`) ?? {}) });
        setSocialLinks({ ...DEFAULT_SOCIAL_LINKS, ...(map.get(`${PREFIX}socialLinks`) ?? {}) });
        const savedNavItems = map.get(`${PREFIX}navItems`) as NavItem[] | undefined;
        if (Array.isArray(savedNavItems) && savedNavItems.length > 0) setNavItems(savedNavItems);
        const savedStoryCategories = map.get(`${PREFIX}storyCategories`);
        if (Array.isArray(savedStoryCategories)) setStoryCategories(savedStoryCategories);
        const savedNewsCategories = map.get(`${PREFIX}newsCategories`);
        if (Array.isArray(savedNewsCategories)) setNewsCategories(savedNewsCategories);
        const savedEventTypes = map.get(`${PREFIX}eventTypes`);
        if (Array.isArray(savedEventTypes)) setEventTypes(savedEventTypes);
        const savedOppTypes = map.get(`${PREFIX}oppTypes`);
        if (Array.isArray(savedOppTypes)) setOppTypes(savedOppTypes);
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

  const makeListHandlers = (
    list: string[],
    setList: (v: string[]) => void,
    newValue: string,
    setNewValue: (v: string) => void,
  ) => ({
    add: () => {
      const trimmed = newValue.trim();
      if (!trimmed || list.includes(trimmed)) return;
      setList([...list, trimmed]);
      setNewValue('');
    },
    remove: (index: number) => {
      setList(list.filter((_, i) => i !== index));
    },
  });

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
        { key: `${PREFIX}navItems`, value: navItems },
        { key: `${PREFIX}storyCategories`, value: storyCategories },
        { key: `${PREFIX}newsCategories`, value: newsCategories },
        { key: `${PREFIX}eventTypes`, value: eventTypes },
        { key: `${PREFIX}oppTypes`, value: oppTypes },
      ]);
      setNotification({ type: 'success', text: 'Website layout & navigation configuration saved successfully.' });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to save website configuration.' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const openAddNavModal = () => {
    setEditingNavId(null);
    setNavForm({ label: '', href: '', children: [] });
    setNavModalOpen(true);
  };

  const openEditNavModal = (item: NavItem) => {
    setEditingNavId(item.id);
    setNavForm({ label: item.label, href: item.href, children: item.children ? [...item.children] : [] });
    setNavModalOpen(true);
  };

  const closeNavModal = () => setNavModalOpen(false);

  const addNavChildRow = () => {
    setNavForm((f) => ({ ...f, children: [...f.children, { id: newNavChildId(), label: '', href: '' }] }));
  };

  const updateNavChildRow = (id: string, field: 'label' | 'href', value: string) => {
    setNavForm((f) => ({
      ...f,
      children: f.children.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const removeNavChildRow = (id: string) => {
    setNavForm((f) => ({ ...f, children: f.children.filter((c) => c.id !== id) }));
  };

  const saveNavItem = () => {
    const label = navForm.label.trim();
    const href = navForm.href.trim();
    if (!label || !href) return;
    const children = navForm.children
      .map((c) => ({ ...c, label: c.label.trim(), href: c.href.trim() }))
      .filter((c) => c.label && c.href);

    if (editingNavId) {
      setNavItems((items) =>
        items.map((it) => (it.id === editingNavId ? { ...it, label, href, children: children.length ? children : undefined } : it))
      );
    } else {
      setNavItems((items) => [
        ...items,
        { id: `nav-${Date.now()}`, label, href, children: children.length ? children : undefined },
      ]);
    }
    setNavModalOpen(false);
  };

  const deleteNavItem = async (item: NavItem) => {
    const ok = await confirmDialog({
      message: `Remove "${item.label}" from the public header navigation?`,
      variant: 'danger',
    });
    if (!ok) return;
    setNavItems((items) => items.filter((it) => it.id !== item.id));
  };

  const moveNavItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;
    setNavItems((items) => {
      const next = [...items];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
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
              onClick={openAddNavModal}
              className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Nav Item</span>
            </button>
          </div>

          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4 w-[64px]">Order</th>
                <th className="py-3 px-4">Menu Label</th>
                <th className="py-3 px-4">Target URL</th>
                <th className="py-3 px-4">Dropdown Sub-Links</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {navItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-gray-400">
                    No navigation items yet. Add one to populate the public header menu.
                  </td>
                </tr>
              )}
              {navItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveNavItem(idx, 'up')}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === navItems.length - 1}
                        onClick={() => moveNavItem(idx, 'down')}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{item.label}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">{item.href}</td>
                  <td className="py-3.5 px-4">
                    {item.children && item.children.length > 0 ? (
                      <span className="text-gray-700 font-semibold">{item.children.map((c) => c.label).join(', ')}</span>
                    ) : (
                      <span className="text-gray-400">Direct Link</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button type="button" onClick={() => openEditNavModal(item)} className="p-1 text-gray-400 hover:text-black">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => deleteNavItem(item)} className="p-1 text-gray-400 hover:text-[#A52307]">
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
          {[
            { title: 'Story Categories', list: storyCategories, ...makeListHandlers(storyCategories, setStoryCategories, newStoryCategory, setNewStoryCategory), newValue: newStoryCategory, setNewValue: setNewStoryCategory },
            { title: 'News Categories', list: newsCategories, ...makeListHandlers(newsCategories, setNewsCategories, newNewsCategory, setNewNewsCategory), newValue: newNewsCategory, setNewValue: setNewNewsCategory },
            { title: 'Event Types', list: eventTypes, ...makeListHandlers(eventTypes, setEventTypes, newEventType, setNewEventType), newValue: newEventType, setNewValue: setNewEventType },
            { title: 'Opportunity Types', list: oppTypes, ...makeListHandlers(oppTypes, setOppTypes, newOppType, setNewOppType), newValue: newOppType, setNewValue: setNewOppType },
          ].map((section) => (
            <div key={section.title} className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-3">
              <h4 className="font-bold text-gray-900 text-sm border-b border-[#E2E0DB] pb-2">{section.title}</h4>
              <div className="space-y-1.5">
                {section.list.map((c, i) => (
                  <div key={i} className="p-2 bg-[#FAF8F5] border border-gray-200 rounded font-semibold text-gray-800 flex items-center justify-between gap-2">
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => section.remove(i)}
                      className="text-gray-400 hover:text-heritage-red flex-shrink-0"
                      title={`Remove ${c}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {section.list.length === 0 && (
                  <p className="text-gray-400 italic p-2">No entries yet.</p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={section.newValue}
                  onChange={(e) => section.setNewValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      section.add();
                    }
                  }}
                  placeholder="Add new entry…"
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-[#A52307]"
                />
                <button
                  type="button"
                  onClick={section.add}
                  className="px-2.5 py-1.5 bg-black text-white rounded text-[11px] font-bold hover:bg-[#A52307] flex items-center gap-1 flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {navModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
          onClick={closeNavModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingNavId ? 'Edit Navigation Item' : 'Add Navigation Item'}
              </h3>
              <button type="button" onClick={closeNavModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Menu Label*</label>
                <input
                  type="text"
                  value={navForm.label}
                  onChange={(e) => setNavForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Collections"
                  className="w-full border border-gray-300 h-10 px-3 rounded-lg outline-none focus:border-black text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Target URL*</label>
                <input
                  type="text"
                  value={navForm.href}
                  onChange={(e) => setNavForm((f) => ({ ...f, href: e.target.value }))}
                  placeholder="/collections"
                  className="w-full border border-gray-300 h-10 px-3 rounded-lg outline-none focus:border-black text-xs font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-gray-700 uppercase">Dropdown Sub-Links</label>
                  <button
                    type="button"
                    onClick={addNavChildRow}
                    className="text-[11px] font-bold text-heritage-red hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add sub-link
                  </button>
                </div>
                {navForm.children.length === 0 && (
                  <p className="text-[11px] text-gray-400">No dropdown — this item links directly.</p>
                )}
                <div className="space-y-2">
                  {navForm.children.map((child) => (
                    <div key={child.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={child.label}
                        onChange={(e) => updateNavChildRow(child.id, 'label', e.target.value)}
                        placeholder="Sub-link label"
                        className="flex-1 border border-gray-300 h-9 px-2.5 rounded-lg outline-none focus:border-black text-xs"
                      />
                      <input
                        type="text"
                        value={child.href}
                        onChange={(e) => updateNavChildRow(child.id, 'href', e.target.value)}
                        placeholder="/target-url"
                        className="flex-1 border border-gray-300 h-9 px-2.5 rounded-lg outline-none focus:border-black text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeNavChildRow(child.id)}
                        className="p-1.5 text-gray-400 hover:text-heritage-red"
                        title="Remove sub-link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={closeNavModal}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg text-gray-700 border border-gray-300 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNavItem}
                disabled={!navForm.label.trim() || !navForm.href.trim()}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {editingNavId ? 'Save Changes' : 'Add Item'}
              </button>
            </div>

            <p className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
              Changes here are staged locally — click <strong>Save Layout Settings</strong> at the top of the page to publish them to the live site.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
