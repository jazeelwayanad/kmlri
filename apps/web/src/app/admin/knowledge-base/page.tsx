'use client';

import { useState } from 'react';
import { Search, Plus, CheckCircle2, Edit2 } from 'lucide-react';
import { PageHeader, Button, Card, StatCard, Badge } from '@/components/admin/ui';

export default function KnowledgeBaseAdminPage() {
  const [filter, setFilter] = useState<'ALL' | 'CITATION' | 'MANUSCRIPT' | 'DATABASE' | 'FAQ'>('ALL');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const guides = [
    {
      id: 'KB-01',
      title: 'Chicago & Harvard Citation Manual for Classical Arabic Texts',
      category: 'CITATION',
      categoryLabel: 'Citation Guide',
      views: 3420,
      lastUpdated: '15 Aug 2026',
      author: 'Reference Desk',
      status: 'PUBLISHED',
    },
    {
      id: 'KB-02',
      title: 'Deciphering Arabi-Malayalam Orthography: Diacritics & Consonant Letters',
      category: 'MANUSCRIPT',
      categoryLabel: 'Manuscript Guide',
      views: 5890,
      lastUpdated: '20 Jul 2026',
      author: 'Dr. Taha Malabari',
      status: 'PUBLISHED',
    },
    {
      id: 'KB-03',
      title: 'How to Search Brill Middle Eastern Online & Index Islamicus via KMLRI Proxy',
      category: 'DATABASE',
      categoryLabel: 'Database Guide',
      views: 2110,
      lastUpdated: '01 Aug 2026',
      author: 'Digital Resource Librarian',
      status: 'PUBLISHED',
    },
    {
      id: 'KB-04',
      title: 'Patron Frequently Asked Questions: Borrowing Limits, Renewals & Wi-Fi Access',
      category: 'FAQ',
      categoryLabel: 'Patron FAQs',
      views: 12400,
      lastUpdated: '01 Sep 2026',
      author: 'Circulation Desk',
      status: 'PUBLISHED',
    },
  ];

  const filtered = guides.filter((g) => {
    const matchesFilter = filter === 'ALL' || g.category === filter;
    const matchesSearch =
      search === '' ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.author.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Research Aids & Tutorials"
        title="Knowledge Base & Research Guides"
        description="Curate subject bibliographies, citation style manuals, manuscript handling protocols, database search walkthroughs, and patron FAQs."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setNotification('Guide Authoring WYSIWYG editor opened.');
              setTimeout(() => setNotification(null), 3000);
            }}
          >
            Create New Guide
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Published Guides" value="24 Guides" hint="Across 6 academic topics" />
        <StatCard label="Total Guide Views" value="23.8k" hint="Scholarly consultations" hintTone="positive" />
        <StatCard label="Patron FAQs" value="32 Items" hint="Updated monthly" />
        <StatCard label="Subject LibGuides" value="8 Curated" hint="For thesis candidates" />
      </div>

      {/* Filters & Search */}
      <Card padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'CITATION', 'MANUSCRIPT', 'DATABASE', 'FAQ'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'ALL' ? 'All Guides' : tab === 'CITATION' ? 'Citation Manuals' : tab === 'MANUSCRIPT' ? 'Manuscript Studies' : tab === 'DATABASE' ? 'Database Guides' : 'FAQs'}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search guide titles, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
            />
          </div>
        </div>
      </Card>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((g) => (
          <Card key={g.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] uppercase font-semibold text-heritage-red">
                  {g.categoryLabel}
                </span>
                <span className="text-xs text-gray-400 font-mono">{g.views.toLocaleString()} Views</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{g.title}</h3>
              <p className="text-xs text-gray-500 mt-1">Author: {g.author} · Last Updated: {g.lastUpdated}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <Badge variant="success">{g.status}</Badge>
              <Button
                variant="outline"
                icon={Edit2}
                onClick={() => alert(`Editing Guide: "${g.title}"`)}
              >
                Edit Guide
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
