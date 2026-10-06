'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Search, CheckCircle2 } from 'lucide-react';
import { PageHeader, Badge } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { api } from '@/lib/api';

interface Loan {
  id: string;
  dueDate: string;
  user: { fullName: string; membershipNumber: string; email: string; avatarUrl?: string };
  copy: { barcode: string; bibRecord: { titleLatin: string } };
}

function daysOverdue(dueDate: string) {
  return Math.ceil((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
}

export default function CirculationOverduesPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getActiveLoans()
      .then((data) => setLoans(data || []))
      .catch(() => setLoans([]))
      .finally(() => setLoading(false));
  }, []);

  const overdues = useMemo(() => {
    return loans
      .filter((l) => daysOverdue(l.dueDate) > 0)
      .map((l) => ({
        ...l,
        days: daysOverdue(l.dueDate),
        fine: daysOverdue(l.dueDate) * 5,
      }));
  }, [loans]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'copy.barcode',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Item Barcode" />,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-gray-900">
          {row.original.copy?.barcode}
        </span>
      ),
    },
    {
      accessorKey: 'copy.bibRecord.titleLatin',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Overdue Title" />,
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">
          {row.original.copy?.bibRecord?.titleLatin}
        </span>
      ),
    },
    {
      id: 'borrower',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Borrower & Contact" />,
      cell: ({ row }) => {
        const u = row.original.user;
        return (
          <div className="flex items-center gap-2.5">
            <UserAvatar src={u?.avatarUrl} name={u?.fullName} size="sm" />
            <div>
              <span className="font-bold text-gray-900 block">{u?.fullName}</span>
              <span className="font-mono text-[11px] text-gray-500">
                {u?.membershipNumber} · {u?.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" />,
      cell: ({ row }) => (
        <span className="font-mono text-red-700 font-bold">
          {new Date(row.original.dueDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      accessorKey: 'days',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Days Overdue" />,
      cell: ({ row }) => (
        <Badge variant="danger">
          {row.original.days} Days Late
        </Badge>
      ),
    },
    {
      accessorKey: 'fine',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Projected Fine" />,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-gray-900">
          ₹{row.original.fine}
        </span>
      ),
    },
  ], []);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation · Overdue Tracking"
        title="Overdue Items"
        description="Monitor unreturned library loans and their accrued overdue fines (₹5/day, assessed automatically on return)."
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Overdue Items</span>
          <span className="text-2xl font-bold text-heritage-red mt-1 block">{overdues.length} Volumes</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Projected Fines</span>
          <span className="text-2xl font-mono font-bold text-gray-900 mt-1 block">
            ₹{overdues.reduce((acc, cur) => acc + cur.fine, 0)}
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Severe Overdues (&gt;14d)</span>
          <span className="text-2xl font-bold text-heritage-red mt-1 block">
            {overdues.filter((o) => o.days > 14).length} Volumes
          </span>
        </div>
      </div>

      {/* Overdues TanStack Table */}
      <DataTable
        columns={columns}
        data={overdues}
        loading={loading}
        enableRowSelection
        searchPlaceholder="Search overdue items by title or barcode..."
        emptyTitle="No overdue items"
        emptyMessage="All active loans are currently within their permitted lending period."
      />
    </div>
  );
}
