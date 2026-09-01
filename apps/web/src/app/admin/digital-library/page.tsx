'use client';

import { useState } from 'react';
import { Search, Plus, CheckCircle2 } from 'lucide-react';
import { PageHeader, Button, Card, StatCard } from '@/components/admin/ui';

export default function DigitalLibraryAdminPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OPEN_ACCESS' | 'CAMPUS_ONLY' | 'RESTRICTED'>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const digitalAssets = [
    {
      id: 'DIG-001',
      title: 'Bayān al-Fawāʾid (High-Resolution Foliated TIFF Scan)',
      format: 'TIFF / PDF (300 DPI)',
      size: '420 MB',
      accessTier: 'OPEN_ACCESS',
      license: 'CC BY-NC 4.0',
      downloadRules: 'Full PDF Allowed',
      printRules: 'Allowed',
      concurrentLimit: 'Unlimited',
      embargoUntil: 'None',
      downloadsCount: 1420,
    },
    {
      id: 'DIG-002',
      title: 'Muḥyiddīn Mālā (1898 Lithograph Digital Facsimile)',
      format: 'PDF / OCR Text',
      size: '85 MB',
      accessTier: 'OPEN_ACCESS',
      license: 'Public Domain',
      downloadRules: 'Full PDF Allowed',
      printRules: 'Allowed',
      concurrentLimit: 'Unlimited',
      embargoUntil: 'None',
      downloadsCount: 3100,
    },
    {
      id: 'DIG-003',
      title: 'Malabar Maritime Trade Treaties (Restricted Archival Scan)',
      format: 'Raw Encrypted TIFF',
      size: '1.2 GB',
      accessTier: 'RESTRICTED',
      license: 'Institutional Research Only',
      downloadRules: 'Watermarked View Only',
      printRules: 'Disabled',
      concurrentLimit: '3 Active Readers',
      embargoUntil: 'None',
      downloadsCount: 88,
    },
    {
      id: 'DIG-004',
      title: 'KMLRI PhD Dissertation 2026: Sufism in Malabar',
      format: 'PDF',
      size: '14 MB',
      accessTier: 'CAMPUS_ONLY',
      license: 'Author Copyright Protected',
      downloadRules: 'Chapter Wise Only',
      printRules: 'Up to 20%',
      concurrentLimit: '5 Users',
      embargoUntil: '01 Jan 2027 (Embargoed)',
      downloadsCount: 34,
    },
  ];

  const filtered = digitalAssets.filter((a) => {
    const matchesFilter = filter === 'ALL' || a.accessTier === filter;
    const matchesSearch =
      search === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.format.toLowerCase().includes(search.toLowerCase()) ||
      a.license.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Digital Repository Assets"
        title="Digital Library & DRM Controls"
        description="Configure digital master files, Dublin Core metadata, access clearance tiers, watermarking, print permissions, and embargo schedules."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setNotification('Digital Asset Ingestion pipeline opened.');
              setTimeout(() => setNotification(null), 3000);
            }}
          >
            Upload Digital Asset
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
        <StatCard label="Total Digitized Items" value="1,420" hint="Manuscripts & Rare Books" />
        <StatCard label="Storage Consumed" value="1.84 TB" hint="NVMe Cloud Storage" />
        <StatCard label="Open Access Items" value="1,180" hint="Publicly downloadable" hintTone="positive" />
        <StatCard label="Restricted / Embargoed" value="240" hint="Requires staff authorization" hintTone="negative" />
      </div>

      {/* Filters & Search */}
      <Card padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'OPEN_ACCESS', 'CAMPUS_ONLY', 'RESTRICTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'ALL' ? 'All Digital Files' : tab === 'OPEN_ACCESS' ? 'Open Access' : tab === 'CAMPUS_ONLY' ? 'Campus IP Only' : 'Restricted Archive'}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search digital files by title, license..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
            />
          </div>
        </div>
      </Card>

      {/* Digital Assets Table */}
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
              <th className="pb-3 pt-2 px-2 first:pl-2">Asset Title &amp; Format</th>
              <th className="pb-3 pt-2 px-2">Size &amp; Storage</th>
              <th className="pb-3 pt-2 px-2">Access Tier</th>
              <th className="pb-3 pt-2 px-2">DRM Download / Print Rules</th>
              <th className="pb-3 pt-2 px-2">Embargo Status</th>
              <th className="pb-3 pt-2 px-2">Downloads</th>
              <th className="pb-3 pt-2 px-2 text-right last:pr-2">Access Controls</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3.5 px-2">
                  <div className="font-bold text-sm text-gray-900">{a.title}</div>
                  <div className="text-gray-500 text-[11px] font-mono">{a.format} · License: {a.license}</div>
                </td>
                <td className="py-3.5 px-2 font-mono text-gray-700 font-semibold">{a.size}</td>
                <td className="py-3.5 px-2">
                  <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    a.accessTier === 'OPEN_ACCESS' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                    a.accessTier === 'CAMPUS_ONLY' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' :
                    'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                  }`}>
                    {a.accessTier}
                  </span>
                </td>
                <td className="py-3.5 px-2 text-gray-700">
                  <div>{a.downloadRules}</div>
                  <div className="text-[11px] text-gray-400">Print: {a.printRules} · Limit: {a.concurrentLimit}</div>
                </td>
                <td className="py-3.5 px-2">
                  <span className={a.embargoUntil !== 'None' ? 'text-heritage-red font-semibold' : 'text-gray-500'}>
                    {a.embargoUntil}
                  </span>
                </td>
                <td className="py-3.5 px-2 font-mono font-bold text-gray-900">{a.downloadsCount.toLocaleString()}</td>
                <td className="py-3.5 px-2 text-right">
                  <Button
                    variant="outline"
                    onClick={() => alert(`Configuring DRM parameters for "${a.title}"`)}
                  >
                    Edit Rules
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
