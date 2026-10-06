'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type ReproStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'REJECTED';

interface ReproductionRequest {
  id: string;
  userId: string;
  itemDescription: string;
  format?: string | null;
  purpose?: string | null;
  status: ReproStatus;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; fullName: string; membershipNumber: string; avatarUrl?: string };
}

const STATUS_LABEL: Record<ReproStatus, string> = {
  SUBMITTED: 'Submitted',
  IN_PROGRESS: 'In Progress',
  READY: 'Ready',
  DELIVERED: 'Delivered',
  REJECTED: 'Rejected',
};

const NEXT_STATUS: Partial<Record<ReproStatus, { status: ReproStatus; label: string }>> = {
  SUBMITTED: { status: 'IN_PROGRESS', label: 'Start Processing' },
  IN_PROGRESS: { status: 'READY', label: 'Mark Ready' },
  READY: { status: 'DELIVERED', label: 'Mark Delivered' },
};

export default function DocumentDeliveryPage() {
  const [docRequests, setDocRequests] = useState<ReproductionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRequests = () => {
    setLoading(true);
    api
      .getReproductionRequests()
      .then((data) => setDocRequests(data || []))
      .catch((err: any) => toast.error(err.message || 'Failed to load document delivery requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (id: string, status: ReproStatus, label: string) => {
    setUpdatingId(id);
    try {
      await api.updateReproductionRequestStatus(id, status);
      toast.success(`Request #${id.slice(0, 8)} marked as ${label.toLowerCase()}.`);
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update request status');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = useMemo<ColumnDef<ReproductionRequest>[]>(
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
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Request Ref" />,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-foreground text-xs">{row.original.id.slice(0, 8)}</span>
        ),
      },
      {
        accessorKey: 'itemDescription',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Item & Purpose" />,
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="space-y-0.5 max-w-sm">
              <span className="font-bold text-foreground block text-sm">{doc.itemDescription}</span>
              {doc.purpose && <span className="text-muted-foreground text-xs">{doc.purpose}</span>}
            </div>
          );
        },
      },
      {
        id: 'requester',
        accessorFn: (row) => row.user?.fullName || '—',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Requester" />,
        cell: ({ row }) => {
          const user = row.original.user;
          if (!user) return <span className="text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback className="text-[10px] font-bold">
                  {user.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-foreground text-xs">{user.fullName}</div>
                <div className="text-muted-foreground text-[11px] font-mono">{user.membershipNumber}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'format',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Format" />,
        cell: ({ row }) => <span className="font-mono text-muted-foreground text-xs">{row.getValue('format') || '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const status = row.getValue('status') as ReproStatus;
          return (
            <Badge
              variant={
                status === 'DELIVERED'
                  ? 'success'
                  : status === 'REJECTED'
                  ? 'destructive'
                  : status === 'READY'
                  ? 'default'
                  : 'warning'
              }
            >
              {STATUS_LABEL[status] || status}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const doc = row.original;
          const next = NEXT_STATUS[doc.status];
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={updatingId === doc.id}
                    className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Desk Actions</DropdownMenuLabel>
                  {next && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(doc.id, next.status, next.label)}
                      className="cursor-pointer font-medium"
                    >
                      <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                      <span>Advance: {next.label}</span>
                    </DropdownMenuItem>
                  )}
                  {doc.status !== 'DELIVERED' && doc.status !== 'REJECTED' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(doc.id, 'REJECTED', 'Rejected')}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        <span>Reject Request</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [updatingId]
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1280px]">
      <PageHeader
        eyebrow="Support & Services · Inter-Library Loan"
        title="Document Delivery & ILL"
        description="Fulfill digital folio scans, article reproductions, and Inter-Library Loan requests for affiliated scholars."
      />

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={docRequests}
        searchKey="itemDescription"
        searchPlaceholder="Filter requests by item description or requester..."
        isLoading={loading}
        facetedFilters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Submitted', value: 'SUBMITTED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Ready', value: 'READY' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Rejected', value: 'REJECTED' },
            ],
          },
        ]}
      />
    </div>
  );
}
