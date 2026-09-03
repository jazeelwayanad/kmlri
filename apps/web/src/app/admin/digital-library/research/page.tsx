'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Card, PageHeader, StatCard } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Researcher {
  id: string;
  fullName: string;
  email: string;
  membershipNumber: string;
  role: string;
}

export default function ResearchAdminPage() {
  const [search, setSearch] = useState('');
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getUsers()
      .then((users) => setResearchers((users || []).filter((u: any) => u.role === 'FACULTY' || u.role === 'RESEARCHER')))
      .catch(() => setResearchers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = researchers.filter(
    (r) => r.fullName.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Academic Research Hub"
        title="Research Community Directory"
        description="Faculty and research-fellow members registered with the library. Manage their profiles from the Members section."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Faculty Members" value={`${researchers.filter((r) => r.role === 'FACULTY').length}`} hint="Registered library members" />
        <StatCard label="Research Fellows" value={`${researchers.filter((r) => r.role === 'RESEARCHER').length}`} hint="Registered library members" />
      </div>

      <Card padded={false} className="p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Faculty &amp; Fellow Directory</h3>
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading researchers…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No faculty or research fellow members found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <div key={r.id} className="p-5 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                <span className="text-[11px] uppercase font-semibold tracking-wide text-heritage-red block">{r.role}</span>
                <h4 className="text-xl font-bold text-gray-900 mt-0.5">{r.fullName}</h4>
                <p className="text-xs text-gray-500 mt-1">{r.email}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs font-mono text-gray-400">
                  Membership: <span className="text-gray-900 font-semibold">{r.membershipNumber}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
