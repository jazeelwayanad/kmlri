'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Search, Download, ShieldCheck } from 'lucide-react';
import { PageHeader, Card, Button, Badge } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { UserAvatar } from '@/components/ui/UserAvatar';
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
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAuditLogs(200)
      .then((data) => setLogs(data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = (exportData?: AuditLog[]) => {
    const listToExport = exportData && exportData.length > 0 ? exportData : logs;
    const csv = toCsv(listToExport);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kmlri-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Timestamp" />,
      cell: ({ row }) => (
        <span className="font-mono text-gray-500 text-[11px] whitespace-nowrap">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actor',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Actor" />,
      cell: ({ row }) => {
        const l = row.original;
        if (l.user) {
          return (
            <div className="flex items-center gap-2">
              <UserAvatar src={l.user.avatarUrl} name={l.user.fullName} size="sm" />
              <div>
                <span className="font-bold text-gray-900 block text-xs">{l.user.fullName}</span>
                <span className="text-gray-500 font-mono text-[10px]">{l.user.membershipNumber}</span>
              </div>
            </div>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 text-gray-600 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            System
          </span>
        );
      },
    },
    {
      accessorKey: 'action',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Action & Entity" />,
      cell: ({ row }) => {
        const l = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="accent">{l.action}</Badge>
            <span className="text-gray-600 font-mono text-xs">on {l.entity}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'details',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Details & Changes" />,
      cell: ({ row }) => (
        <span className="text-gray-700 text-xs font-mono line-clamp-2 max-w-md">
          {row.original.details || '—'}
        </span>
      ),
    },
  ], []);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Compliance"
        title="Institutional Audit Trails &amp; Logs"
        description="System audit records tracking circulation actions, catalog modifications, and other tracked operations."
        actions={
          <Button variant="dark" icon={Download} onClick={() => handleExport()}>
            Export Audit Log (CSV)
          </Button>
        }
      />

      {/* TanStack Audit Logs Data Table */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        enableRowSelection
        searchKey="action"
        searchPlaceholder="Filter audit events by action..."
        emptyTitle="No audit events recorded"
        emptyMessage="No system audit logs found matching your search."
        bulkActions={[
          {
            label: "Export Selected (CSV)",
            icon: Download,
            variant: "outline",
            onClick: (selected) => handleExport(selected),
          },
        ]}
      />
    </div>
  );
}
