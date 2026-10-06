'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CreditCard, Search, CheckCircle2, AlertCircle, ShieldOff, MoreHorizontal } from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { api } from '@/lib/api';
import { confirmDialog } from '@/lib/dialog';

interface Fine {
  id: string;
  amount: number;
  reason: string;
  status: 'UNPAID' | 'PAID' | 'WAIVED';
  createdAt: string;
  paidAt?: string;
  user: { fullName: string; membershipNumber: string; avatarUrl?: string };
  loan?: { copy: { bibRecord: { titleLatin: string; shelfmark: string } } } | null;
}

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CirculationFinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .getAllFines()
      .then((data) => setFines(data || []))
      .catch(() => setFines([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSettle = async (fine: Fine) => {
    setActingId(fine.id);
    try {
      await api.settleFine(fine.id);
      setNotification({ type: 'success', text: `Fine of ₹${fine.amount} for ${fine.user.fullName} marked as paid.` });
      load();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not settle this fine.' });
    } finally {
      setActingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleWaive = async (fine: Fine) => {
    if (!(await confirmDialog({ message: `Waive the ₹${fine.amount} fine for ${fine.user.fullName}?`, tone: 'danger' }))) return;
    setActingId(fine.id);
    try {
      await api.waiveFine(fine.id);
      setNotification({ type: 'success', text: `Fine of ₹${fine.amount} for ${fine.user.fullName} waived.` });
      load();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not waive this fine.' });
    } finally {
      setActingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const columns = useMemo<ColumnDef<Fine>[]>(() => [
    {
      accessorKey: 'user.fullName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Patron Details" />,
      cell: ({ row }) => {
        const u = row.original.user;
        return (
          <div className="flex items-center gap-2.5">
            <UserAvatar src={u?.avatarUrl} name={u?.fullName} size="sm" />
            <div>
              <span className="font-bold text-gray-900 block">{u?.fullName}</span>
              <span className="font-mono text-[11px] text-gray-500">{u?.membershipNumber}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'loan.copy.bibRecord.titleLatin',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Item & Reason" />,
      cell: ({ row }) => {
        const f = row.original;
        return (
          <div>
            <span className="font-semibold text-gray-900 block">{f.loan?.copy.bibRecord.titleLatin || '—'}</span>
            <span className="text-gray-500 text-[11px]">{f.reason} · {formatDate(f.createdAt)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-gray-900 text-sm">
          ₹{row.original.amount}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge variant={s === 'PAID' ? 'success' : s === 'WAIVED' ? 'neutral' : 'danger'}>
            {s}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const f = row.original;
        if (f.status !== 'UNPAID') {
          return (
            <div className="text-right text-xs text-muted-foreground font-medium">
              {f.status === 'PAID' ? `Settled ${formatDate(f.paidAt)}` : 'Waived'}
            </div>
          );
        }
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={actingId === f.id}
                  className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Cashier Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleSettle(f)} className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4 text-emerald-600" />
                  <span>Settle Fine</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleWaive(f)} className="text-amber-700 focus:text-amber-700 cursor-pointer">
                  <ShieldOff className="mr-2 h-4 w-4" />
                  <span>Waive Fine</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [actingId]);

  const totalOutstanding = fines.filter((f) => f.status === 'UNPAID').reduce((acc, cur) => acc + cur.amount, 0);
  const totalCollected = fines.filter((f) => f.status === 'PAID').reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation · Cashier Ledger"
        title="Fines &amp; Cashier Payments"
        description="Track overdue penalties assessed automatically at return, and settle or waive them at the circulation desk."
      />

      {notification && (
        <div
          className={`p-4 border rounded-xl text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Unpaid Balance</span>
          <span className="text-2xl font-mono font-bold text-heritage-red mt-1 block">₹{totalOutstanding}</span>
          <span className="text-[11px] text-gray-500">Across active members</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Collections Recorded</span>
          <span className="text-2xl font-mono font-bold text-emerald-700 mt-1 block">₹{totalCollected}</span>
          <span className="text-[11px] text-emerald-600">Settled via Cashier Desk</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Fine Records</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{fines.length}</span>
          <span className="text-[11px] text-gray-500">
            {fines.filter((f) => f.status === 'PAID').length} settled · {fines.filter((f) => f.status === 'WAIVED').length} waived
          </span>
        </div>
      </div>

      {/* TanStack Fines Data Table */}
      <DataTable
        columns={columns}
        data={fines}
        loading={loading}
        enableRowSelection
        searchPlaceholder="Filter fines by patron, item, or reason..."
        emptyTitle="No fine records found"
        emptyMessage="No fines recorded matching your filter parameters."
        facetedFilters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Unpaid', value: 'UNPAID' },
              { label: 'Paid', value: 'PAID' },
              { label: 'Waived', value: 'WAIVED' },
            ],
          },
        ]}
      />
    </div>
  );
}
