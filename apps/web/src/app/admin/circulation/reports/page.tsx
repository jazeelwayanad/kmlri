'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface CirculationReportLoan {
  id: string;
  issuedAt: string;
  dueDate: string;
  returnedAt?: string | null;
  status: string;
  user?: { fullName: string; membershipNumber: string };
  copy?: {
    barcode: string;
    bibRecord?: { titleLatin: string; shelfmark?: string };
  };
}

export default function AdminReportsPage() {
  const [loans, setLoans] = useState<CirculationReportLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const res = await api.getCirculationReports();
        setLoans(res || []);
      } catch (err: any) {
        toast.error('Failed to load circulation audit reports.');
        setLoans([]);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const exportCSV = () => {
    if (loans.length === 0) return;
    const headers = [
      'Loan ID',
      'Patron Name',
      'Membership No',
      'Title',
      'Shelfmark',
      'Barcode',
      'Issued Date',
      'Due Date',
      'Status',
    ];
    const rows = loans.map((l) => [
      l.id,
      `"${l.user?.fullName || ''}"`,
      l.user?.membershipNumber || '',
      `"${l.copy?.bibRecord?.titleLatin || ''}"`,
      l.copy?.bibRecord?.shelfmark || '',
      l.copy?.barcode || '',
      new Date(l.issuedAt).toLocaleDateString('en-IN'),
      new Date(l.dueDate).toLocaleDateString('en-IN'),
      l.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kmlri_circulation_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo<ColumnDef<CirculationReportLoan>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'title',
        accessorFn: (row) => row.copy?.bibRecord?.titleLatin || 'Untitled',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title & Shelfmark" />,
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="space-y-0.5 max-w-sm">
              <div className="font-bold text-foreground text-sm">{l.copy?.bibRecord?.titleLatin || '—'}</div>
              <div className="text-muted-foreground font-mono text-xs">{l.copy?.bibRecord?.shelfmark || '—'}</div>
            </div>
          );
        },
      },
      {
        id: 'barcode',
        accessorFn: (row) => row.copy?.barcode || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Barcode" />,
        cell: ({ row }) => (
          <span className="font-mono text-foreground font-bold text-xs">{row.original.copy?.barcode || '—'}</span>
        ),
      },
      {
        id: 'patron',
        accessorFn: (row) => row.user?.fullName || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Patron Name & ID" />,
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div>
              <div className="font-semibold text-foreground text-xs">{l.user?.fullName || '—'}</div>
              <div className="text-muted-foreground text-[11px] font-mono">{l.user?.membershipNumber}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'issuedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Issued Date" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {new Date(row.getValue('issuedAt')).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" />,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-foreground text-xs">
            {new Date(row.getValue('dueDate')).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge
              variant={
                status === 'ACTIVE'
                  ? 'success'
                  : status === 'RETURNED'
                  ? 'default'
                  : status === 'OVERDUE'
                  ? 'destructive'
                  : 'neutral'
              }
            >
              {status}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1280px]">
      <PageHeader
        eyebrow="Auditing & Analytics"
        title="Circulation Reports"
        description="Auditing, turnover history, and full-fidelity circulation audit trail."
        actions={
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={exportCSV}
              disabled={loans.length === 0}
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              disabled={loans.length === 0}
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print Report
            </Button>
          </div>
        }
      />

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={loans}
        searchKey="title"
        searchPlaceholder="Search loans by title, barcode, or patron..."
        isLoading={loading}
        facetedFilters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Returned', value: 'RETURNED' },
              { label: 'Overdue', value: 'OVERDUE' },
            ],
          },
        ]}
      />
    </div>
  );
}
