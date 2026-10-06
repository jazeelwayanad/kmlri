'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Search, CheckCircle2, Clock, BellRing, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge, PageHeader, StatCard } from '@/components/admin/ui';
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

interface Hold {
  id: string;
  status: 'PENDING' | 'READY_FOR_PICKUP' | 'CANCELLED' | 'FULFILLED' | 'EXPIRED';
  requestedAt: string;
  availableUntil?: string;
  user: { id: string; fullName: string; membershipNumber: string; avatarUrl?: string };
  bibRecord: { id: string; titleLatin: string; shelfmark: string };
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReservationsAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHolds = async () => {
    setLoading(true);
    try {
      const data = await api.getAllHolds();
      setHolds(data || []);
    } catch {
      setNotification('Could not load reservations from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolds();
  }, []);

  const handleMarkReady = async (id: string, patron: string) => {
    try {
      await api.markHoldReady(id);
      setNotification(`Hold marked ready for pickup. Notify ${patron} to collect it within 5 days.`);
      await loadHolds();
    } catch (err: any) {
      setNotification(err.message || 'Could not update this hold.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelHold(id);
      setNotification('Hold cancelled and item returned to the shelf.');
      await loadHolds();
    } catch (err: any) {
      setNotification(err.message || 'Could not cancel this hold.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const columns = useMemo<ColumnDef<Hold>[]>(() => [
    {
      accessorKey: 'bibRecord.titleLatin',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title & Shelfmark" />,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div>
            <div className="font-bold text-sm text-gray-900">{r.bibRecord.titleLatin}</div>
            <div className="text-gray-500 text-[11px]">{r.bibRecord.shelfmark} · Requested: {formatDate(r.requestedAt)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'user.fullName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Requesting Patron" />,
      cell: ({ row }) => {
        const u = row.original.user;
        return (
          <div className="flex items-center gap-2.5">
            <UserAvatar src={u?.avatarUrl} name={u?.fullName} size="sm" />
            <div>
              <div className="font-semibold text-gray-900">{u?.fullName}</div>
              <div className="text-gray-500 text-[11px] font-mono">{u?.membershipNumber}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge variant={s === 'READY_FOR_PICKUP' ? 'success' : s === 'PENDING' ? 'warning' : 'neutral'}>
            {s.replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'availableUntil',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hold Expiry" />,
      cell: ({ row }) => (
        <span className="font-semibold text-gray-700">
          {formatDate(row.original.availableUntil)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Hold Actions</DropdownMenuLabel>
                {r.status === 'PENDING' && (
                  <DropdownMenuItem onClick={() => handleMarkReady(r.id, r.user.fullName)} className="cursor-pointer">
                    <BellRing className="mr-2 h-4 w-4 text-emerald-600" />
                    <span>Mark Ready</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleCancel(r.id)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Cancel Hold</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], []);

  const readyCount = holds.filter((r) => r.status === 'READY_FOR_PICKUP').length;
  const pendingCount = holds.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation Holds Desk"
        title="Reservations &amp; Item Holds"
        description="Manage patron reservation queues, mark items ready for pickup, and cancel stale holds."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Active Holds" value={`${holds.length}`} hint="In system queue" />
        <StatCard label="Ready For Pickup" value={`${readyCount}`} hint="On hold shelf" hintTone="positive" />
        <StatCard label="Pending" value={`${pendingCount}`} hint="Awaiting return or preparation" hintTone="warning" />
      </div>

      {/* TanStack Holds Data Table */}
      <DataTable
        columns={columns}
        data={holds}
        loading={loading}
        enableRowSelection
        searchPlaceholder="Filter reservations by title or patron..."
        emptyTitle="No reservations found"
        emptyMessage="No patron holds currently in the reservation queue."
        facetedFilters={[
          {
            columnId: 'status',
            title: 'Hold Status',
            options: [
              { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Fulfilled', value: 'FULFILLED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ],
          },
        ]}
      />
    </div>
  );
}
