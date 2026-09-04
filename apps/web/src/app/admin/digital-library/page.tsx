'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { PageHeader, Card, StatCard, Badge } from '@/components/admin/ui';
import { api, BibliographicRecord } from '@/lib/api';
import { getRecordSlug } from '@/lib/slugs';

export default function DigitalLibraryAdminPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DIGITISED_FULL' | 'READING_ROOM_ONLY' | 'RESTRICTED'>('ALL');
  const [records, setRecords] = useState<BibliographicRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .searchCatalog({ limit: 100 })
      .then((res) => setRecords((res.data || []).filter((r: any) => (r.digitalFolios || []).length > 0)))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.accessLevel === filter;
    const matchesSearch =
      search === '' ||
      r.titleLatin.toLowerCase().includes(search.toLowerCase()) ||
      r.shelfmark.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openAccessCount = records.filter((r) => r.accessLevel === 'DIGITISED_FULL').length;
  const restrictedCount = records.filter((r) => r.accessLevel === 'RESTRICTED' || r.accessLevel === 'READING_ROOM_ONLY').length;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Digital Repository Assets"
        title="Digital Library"
        description="Catalogue records that have digitised folio images attached, and their access clearance level."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Digitised Records" value={`${records.length}`} hint="With at least one folio image" />
        <StatCard label="Digitised in Full" value={`${openAccessCount}`} hint="Publicly viewable" hintTone="positive" />
        <StatCard label="Reading Room / Restricted" value={`${restrictedCount}`} hint="Requires staff authorization" hintTone="warning" />
      </div>

      {/* Filters & Search */}
      <Card padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'DIGITISED_FULL', 'READING_ROOM_ONLY', 'RESTRICTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filter === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tab === 'ALL' ? 'All Digital Records' : tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or shelfmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
            />
          </div>
        </div>
      </Card>

      {/* Digital Assets Table */}
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading digitised records…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No digitised records found.</div>
        ) : (
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
                <th className="pb-3 pt-2 px-2 first:pl-2">Title &amp; Shelfmark</th>
                <th className="pb-3 pt-2 px-2">Format</th>
                <th className="pb-3 pt-2 px-2">Access Level</th>
                <th className="pb-3 pt-2 px-2">Folios Digitised</th>
                <th className="pb-3 pt-2 px-2 text-right last:pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3.5 px-2">
                    <div className="font-bold text-sm text-gray-900">{r.titleLatin}</div>
                    <div className="text-gray-500 text-[11px] font-mono">{r.shelfmark}</div>
                  </td>
                  <td className="py-3.5 px-2 text-gray-700 font-semibold">{r.format}</td>
                  <td className="py-3.5 px-2">
                    <Badge variant={r.accessLevel === 'DIGITISED_FULL' ? 'success' : r.accessLevel === 'RESTRICTED' ? 'danger' : 'warning'}>
                      {r.accessLevel}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-2 font-mono font-bold text-gray-900">{(r.digitalFolios || []).length}</td>
                  <td className="py-3.5 px-2 text-right">
                    <Link prefetch
                      href={`/admin/catalog/${getRecordSlug(r)}`}
                      className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-heritage-red transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Record</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
