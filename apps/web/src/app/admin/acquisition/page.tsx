'use client';

import { useState } from 'react';
import { Search, Plus, CheckCircle2, Check, ArrowRight } from 'lucide-react';
import { Badge, BadgeVariant, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';

export default function AcquisitionAdminPage() {
  const [filter, setFilter] = useState<'ALL' | 'REQUESTED' | 'APPROVED' | 'PO_SENT' | 'RECEIVED'>('ALL');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const acquisitionRequests = [
    {
      id: 'ACQ-401',
      title: 'Tārīk͟h al-Islām fī Malībār (Arabic Manuscript Copy)',
      author: 'Ahmad al-Hilli',
      suggestedBy: 'Dr. Taha Malabari (Faculty)',
      department: 'Historical Studies',
      estCost: 12000,
      status: 'REQUESTED',
      date: '29 Aug 2026',
      vendor: 'Dar al-Kutub Beirut',
      urgency: 'HIGH',
    },
    {
      id: 'ACQ-402',
      title: 'Early Islamic Epigraphy of South India',
      author: 'K. M. Bahauddin',
      suggestedBy: 'Rashid Vattaparamba (Researcher)',
      department: 'Archaeology & Epigraphy',
      estCost: 3500,
      status: 'APPROVED',
      date: '22 Aug 2026',
      vendor: 'Heritage Books Calicut',
      urgency: 'NORMAL',
    },
    {
      id: 'ACQ-403',
      title: 'Dictionary of Arabi-Malayalam Idioms',
      author: 'P. A. Seedan',
      suggestedBy: 'Prof. Zakariyya Nadwi',
      department: 'Linguistics',
      estCost: 1800,
      status: 'PO_SENT',
      date: '15 Aug 2026',
      vendor: 'Islamic Publishing House',
      urgency: 'NORMAL',
      poNumber: 'PO-2026-089',
    },
    {
      id: 'ACQ-404',
      title: 'Sufi Poetry of Medieval Kerala (Set of 3)',
      author: 'Qazi Muhammad Collection',
      suggestedBy: 'Library Acquisition Committee',
      department: 'Rare Collections',
      estCost: 8500,
      status: 'RECEIVED',
      date: '02 Aug 2026',
      vendor: 'Malabar Heritage Trust',
      urgency: 'HIGH',
      poNumber: 'PO-2026-074',
    },
  ];

  const filtered = acquisitionRequests.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch =
      search === '' ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.suggestedBy.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (id: string, title: string) => {
    setNotification(`Acquisition request #${id} ("${title}") has been approved. PO generated.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const statusBadgeVariant: Record<string, BadgeVariant> = {
    RECEIVED: 'success',
    PO_SENT: 'info',
    APPROVED: 'accent',
    REQUESTED: 'warning',
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Collection Development"
        title="Acquisition & Purchase Orders"
        description="Review patron purchase suggestions, approve departmental procurement requests, track budget utilization, and process receiving desks."
        actions={
          <Button
            variant="dark"
            icon={Plus}
            onClick={() => {
              setNotification('Purchase Request form opened.');
              setTimeout(() => setNotification(null), 3000);
            }}
          >
            New Acquisition Request
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Budget & KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Annual Budget Allocation" value="₹12,00,000" hint="FY 2026-2027" />
        <StatCard label="Committed & Spent" value="₹8,16,000" hint="68% of total budget" hintTone="negative" />
        <StatCard label="Pending Approvals" value="6 Titles" hint="₹42,500 estimated" hintTone="warning" />
        <StatCard label="Received for Cataloging" value="4 Titles" hint="Ready for accessioning" hintTone="positive" />
      </div>

      {/* Filters & Search */}
      <Card className="flex flex-col sm:flex-row gap-4 justify-between items-center" padded={false}>
        <div className="flex gap-2 flex-wrap p-4 sm:pr-0">
          {(['ALL', 'REQUESTED', 'APPROVED', 'PO_SENT', 'RECEIVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tab === 'ALL' ? 'All Requests' : tab === 'REQUESTED' ? 'New Reqs' : tab === 'APPROVED' ? 'Approved' : tab === 'PO_SENT' ? 'POs Dispatched' : 'Received'}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72 p-4 sm:pl-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search request by title, author, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] tracking-wide">
              <th className="pb-3 px-3 py-2">Req ID</th>
              <th className="pb-3 px-3 py-2">Proposed Title &amp; Author</th>
              <th className="pb-3 px-3 py-2">Requester &amp; Dept</th>
              <th className="pb-3 px-3 py-2">Vendor / Est. Cost</th>
              <th className="pb-3 px-3 py-2">Status</th>
              <th className="pb-3 px-3 py-2">PO Number</th>
              <th className="pb-3 px-3 py-2 text-right">Workflow Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{r.id}</td>
                <td className="py-3.5 px-3">
                  <div className="font-bold text-sm text-gray-900">{r.title}</div>
                  <div className="text-gray-500 text-[11px]">{r.author}</div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-gray-900">{r.suggestedBy}</div>
                  <div className="text-gray-500 text-[11px]">{r.department}</div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-bold text-gray-900">₹{r.estCost.toLocaleString()}</div>
                  <div className="text-gray-500 text-[11px]">{r.vendor}</div>
                </td>
                <td className="py-3.5 px-3">
                  <Badge variant={statusBadgeVariant[r.status] || 'neutral'}>{r.status}</Badge>
                </td>
                <td className="py-3.5 px-3 font-mono text-gray-600">{r.poNumber || '-'}</td>
                <td className="py-3.5 px-3 text-right space-x-2">
                  {r.status === 'REQUESTED' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(r.id, r.title)}
                      className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[11px] font-semibold hover:bg-heritage-red hover:text-white  transition-colors inline-flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve Request</span>
                    </button>
                  )}
                  {r.status === 'RECEIVED' && (
                    <button
                      type="button"
                      onClick={() => alert(`Redirecting "${r.title}" to Bibliographic Cataloging module with accession #ACC-2026-991.`)}
                      className="px-2.5 py-1 bg-heritage-red text-white rounded-lg text-[11px] font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>Catalog Item</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
