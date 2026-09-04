'use client';

import { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: { fullName: string; membershipNumber: string; avatarUrl?: string } | null;
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function toCsv(logs: AuditLog[]): string {
  const header = ['Time', 'Actor', 'Action', 'Entity', 'Details'];
  const rows = logs.map((l) => [
    formatDateTime(l.createdAt),
    l.user ? `${l.user.fullName} (${l.user.membershipNumber})` : 'System',
    l.action,
    l.entity,
    (l.details || '').replace(/"/g, '""'),
  ]);
  return [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
}

export default function AuditLogsAdminPage() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAuditLogs(200)
      .then((data) => setLogs(data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(
    (l) =>
      (l.user?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleExport = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kmlri-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Compliance"
        title="Institutional Audit Trails & Logs"
        description="System audit records tracking circulation actions, catalog modifications, and other tracked operations."
        actions={
          <Button variant="dark" icon={Download} onClick={handleExport}>
            Export Audit Log (CSV)
          </Button>
        }
      />

      {/* Filter & Search */}
      <Card padded={false} className="p-4 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by actor, action, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
        <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">{filtered.length} Audit Events Logged</span>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading audit log…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No audit events recorded yet.</div>
        ) : (
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
                <th className="pb-3 pt-2 px-2 first:pl-2">Time</th>
                <th className="pb-3 pt-2 px-2">Actor</th>
                <th className="pb-3 pt-2 px-2">Action</th>
                <th className="pb-3 pt-2 px-2 last:pr-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3.5 px-2 font-mono text-gray-500 text-[11px] whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                  <td className="py-3.5 px-2 font-semibold text-gray-900 whitespace-nowrap">
                    {l.user ? (
                      <div className="flex items-center gap-2">
                        {l.user.avatarUrl ? (
                          <img
                            src={l.user.avatarUrl}
                            alt={l.user.fullName}
                            className="w-6 h-6 rounded-full object-cover border border-gray-300"
                          />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                            {l.user.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </span>
                        )}
                        <span>{l.user.fullName} <span className="text-gray-500 font-mono text-[11px] font-normal">({l.user.membershipNumber})</span></span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-gray-600 font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                        System
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-2">
                    <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-bold">{l.action}</span>
                  </td>
                  <td className="py-3.5 px-2 text-gray-700">{l.details || l.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
