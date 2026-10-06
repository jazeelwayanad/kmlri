'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  Check,
  X,
  Package,
  BookOpen,
  User,
  IndianRupee,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { PageHeader, StatCard } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AcquisitionRequest {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  estimatedPrice?: number;
  reason?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'ORDERED' | 'REJECTED';
  createdAt: string;
  user?: { fullName: string; membershipNumber: string };
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AcquisitionAdminPage() {
  const [requests, setRequests] = useState<AcquisitionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getAcquisitionRequests();
      setRequests(data || []);
    } catch {
      toast.error('Could not load acquisition requests from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (id: string, title: string, status: string) => {
    try {
      await api.updateAcquisitionStatus(id, status);
      toast.success(`Request "${title}" updated to ${status}.`);
      await loadRequests();
    } catch (err: any) {
      toast.error(err.message || 'Could not update the request.');
    }
  };

  const handleBulkStatus = async (selectedRows: AcquisitionRequest[], status: string) => {
    try {
      let successCount = 0;
      for (const req of selectedRows) {
        await api.updateAcquisitionStatus(req.id, status);
        successCount++;
      }
      toast.success(`Updated ${successCount} requests to ${status}.`);
      await loadRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed during bulk status update.');
    }
  };

  const columns = useMemo<ColumnDef<AcquisitionRequest>[]>(
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
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Proposed Title & Author" />,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-foreground">{req.title}</div>
              {req.author && <div className="text-muted-foreground text-xs">{req.author}</div>}
              {req.publisher && <div className="text-muted-foreground/70 text-[11px] italic">Pub: {req.publisher}</div>}
            </div>
          );
        },
      },
      {
        id: 'requester',
        accessorFn: (row) => row.user?.fullName || 'Staff',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Requested By" />,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <div>
              <div className="font-semibold text-foreground text-xs">{req.user?.fullName || 'Staff Reference Desk'}</div>
              {req.user?.membershipNumber && (
                <div className="text-muted-foreground font-mono text-[11px]">{req.user.membershipNumber}</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'estimatedPrice',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Est. Price" />,
        cell: ({ row }) => {
          const price = row.getValue('estimatedPrice') as number | undefined;
          return (
            <div className="font-mono font-bold text-foreground text-xs">
              {price ? `₹${price.toLocaleString('en-IN')}` : '—'}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge
              variant={
                status === 'ORDERED'
                  ? 'success'
                  : status === 'APPROVED'
                  ? 'default'
                  : status === 'REJECTED'
                  ? 'destructive'
                  : 'warning'
              }
            >
              {status}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted Date" />,
        cell: ({ row }) => (
          <div className="text-muted-foreground text-xs">{formatDate(row.getValue('createdAt'))}</div>
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
                  <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Recommendation</DropdownMenuLabel>
                  {r.status === 'SUBMITTED' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(r.id, r.title, 'APPROVED')}
                        className="cursor-pointer"
                      >
                        <Check className="mr-2 h-4 w-4 text-emerald-600" />
                        <span>Approve Title</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(r.id, r.title, 'REJECTED')}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <X className="mr-2 h-4 w-4" />
                        <span>Reject Request</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {r.status === 'APPROVED' && (
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(r.id, r.title, 'ORDERED')}
                      className="cursor-pointer font-semibold"
                    >
                      <Package className="mr-2 h-4 w-4 text-heritage-red" />
                      <span>Mark Ordered</span>
                    </DropdownMenuItem>
                  )}
                  {r.status !== 'SUBMITTED' && r.status !== 'APPROVED' && (
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(r.id, r.title, 'SUBMITTED')}
                      className="cursor-pointer"
                    >
                      <span>Re-open for Review</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  const submittedCount = requests.filter((r) => r.status === 'SUBMITTED').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const orderedCount = requests.filter((r) => r.status === 'ORDERED').length;
  const estimatedPending = requests
    .filter((r) => r.status === 'SUBMITTED')
    .reduce((acc, r) => acc + (r.estimatedPrice || 0), 0);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1280px]">
      <PageHeader
        eyebrow="Collection Development"
        title="Acquisition Recommendations"
        description="Review patron and staff purchase recommendations submitted through the member portal and reference desk."
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Awaiting Review"
          value={`${submittedCount} Titles`}
          hint={`~₹${estimatedPending.toLocaleString('en-IN')} estimated`}
          hintTone="warning"
        />
        <StatCard label="Approved" value={`${approvedCount} Titles`} hint="Ready to order" hintTone="neutral" />
        <StatCard label="Ordered" value={`${orderedCount} Titles`} hint="Awaiting delivery" hintTone="positive" />
        <StatCard label="Total Recommendations" value={`${requests.length}`} hint="All time" />
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={requests}
        searchKey="title"
        searchPlaceholder="Filter recommendation title or requester..."
        isLoading={loading}
        facetedFilters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Submitted', value: 'SUBMITTED' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Ordered', value: 'ORDERED' },
              { label: 'Rejected', value: 'REJECTED' },
            ],
          },
        ]}
        bulkActions={[
          {
            label: 'Bulk Approve',
            variant: 'default',
            onClick: (rows) => handleBulkStatus(rows, 'APPROVED'),
          },
          {
            label: 'Bulk Mark Ordered',
            variant: 'outline',
            onClick: (rows) => handleBulkStatus(rows, 'ORDERED'),
          },
          {
            label: 'Bulk Reject',
            variant: 'destructive',
            onClick: (rows) => handleBulkStatus(rows, 'REJECTED'),
          },
        ]}
      />
    </div>
  );
}
