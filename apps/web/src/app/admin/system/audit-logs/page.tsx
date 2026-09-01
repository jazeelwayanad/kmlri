'use client';

import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { PageHeader, Card, Button, Badge } from '@/components/admin/ui';

export default function AuditLogsAdminPage() {
  const [search, setSearch] = useState('');

  const logs = [
    { id: 'AUD-991', timestamp: 'Today 10:45 AM', actor: 'admin@kmlri.in (Super Admin)', action: 'ROLE_PERMISSION_UPDATED', entity: 'Role: Senior Manuscript Conservator', ip: '192.168.1.10', status: 'SUCCESS' },
    { id: 'AUD-992', timestamp: 'Today 10:30 AM', actor: 'librarian@kmlri.in (Circulation Desk)', action: 'CIRCULATION_ITEM_ISSUED', entity: 'Copy: MS0142-01 to Patron KMLRI-2026-0001', ip: '192.168.1.14', status: 'SUCCESS' },
    { id: 'AUD-993', timestamp: 'Today 09:12 AM', actor: 'admin@kmlri.in (Super Admin)', action: 'FINE_WAIVER_APPLIED', entity: 'Fine #FIN-804 (₹60 Waived for Research Trip)', ip: '192.168.1.10', status: 'SUCCESS' },
    { id: 'AUD-994', timestamp: 'Yesterday 04:50 PM', actor: 'system-backup-daemon', action: 'DATABASE_BACKUP_COMPLETED', entity: 'kmlri_db_2026_08_31.sql.gz (1.2 GB)', ip: '127.0.0.1', status: 'SUCCESS' },
    { id: 'AUD-995', timestamp: 'Yesterday 02:15 PM', actor: 'unknown_ip (185.220.101.5)', action: 'STAFF_LOGIN_FAILED', entity: 'Attempted login with email: root@kmlri.in', ip: '185.220.101.5', status: 'BLOCKED' },
  ];

  const filtered = logs.filter((l) =>
    l.actor.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Compliance"
        title="Institutional Audit Trails & Logs"
        description="Immutable system audit records tracking staff logins, catalog modifications, role capability edits, fee waivers, and security alerts."
        actions={
          <Button
            variant="dark"
            icon={Download}
            onClick={() => alert('Exporting full audit trail as encrypted CSV for institutional compliance inspection.')}
          >
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
            placeholder="Search by actor, action, entity or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
        <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
          {filtered.length} Audit Events Logged
        </span>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
              <th className="pb-3 pt-2 px-2 first:pl-2">Event ID &amp; Time</th>
              <th className="pb-3 pt-2 px-2">Staff Actor / Origin</th>
              <th className="pb-3 pt-2 px-2">Action Type</th>
              <th className="pb-3 pt-2 px-2">Target Entity / Details</th>
              <th className="pb-3 pt-2 px-2">IP Address</th>
              <th className="pb-3 pt-2 px-2 text-right last:pr-2">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3.5 px-2 font-mono text-gray-600">
                  <span className="font-bold text-gray-900">{l.id}</span>
                  <span className="text-gray-400 block text-[11px]">{l.timestamp}</span>
                </td>
                <td className="py-3.5 px-2 font-semibold text-gray-900">{l.actor}</td>
                <td className="py-3.5 px-2">
                  <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-bold">
                    {l.action}
                  </span>
                </td>
                <td className="py-3.5 px-2 text-gray-700 font-medium">{l.entity}</td>
                <td className="py-3.5 px-2 font-mono text-gray-500">{l.ip}</td>
                <td className="py-3.5 px-2 text-right">
                  <Badge variant={l.status === 'SUCCESS' ? 'success' : 'danger'}>{l.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
