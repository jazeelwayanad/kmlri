'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, FileDigit, Image as ImageIcon, MoreHorizontal, ExternalLink } from 'lucide-react';
import { PageHeader, StatCard } from '@/components/admin/ui';
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
import { api, BibliographicRecord } from '@/lib/api';
import { getRecordSlug } from '@/lib/slugs';
import { toast } from 'sonner';

export default function DigitalLibraryAdminPage() {
  const [records, setRecords] = useState<BibliographicRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .searchCatalog({ limit: 100 })
      .then((res) => setRecords((res.data || []).filter((r: any) => (r.digitalFolios || []).length > 0)))
      .catch((err) => {
        toast.error('Failed to load digital catalogue records.');
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openAccessCount = records.filter((r) => r.accessLevel === 'DIGITISED_FULL').length;
  const restrictedCount = records.filter(
    (r) => r.accessLevel === 'RESTRICTED' || r.accessLevel === 'READING_ROOM_ONLY'
  ).length;

  const columns = useMemo<ColumnDef<BibliographicRecord>[]>(
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
        accessorKey: 'titleLatin',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title & Shelfmark" />,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-foreground">{r.titleLatin}</div>
              <div className="text-muted-foreground text-xs font-mono">{r.shelfmark}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'format',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Format" />,
        cell: ({ row }) => <span className="font-semibold text-foreground text-xs">{row.getValue('format')}</span>,
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        accessorKey: 'accessLevel',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Access Level" />,
        cell: ({ row }) => {
          const level = row.getValue('accessLevel') as string;
          return (
            <Badge
              variant={
                level === 'DIGITISED_FULL'
                  ? 'success'
                  : level === 'RESTRICTED'
                  ? 'destructive'
                  : 'warning'
              }
            >
              {level.replace(/_/g, ' ')}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        id: 'folios',
        accessorFn: (row) => (row.digitalFolios || []).length,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Folios Digitised" />,
        cell: ({ row }) => {
          const count = (row.original.digitalFolios || []).length;
          return (
            <div className="flex items-center gap-1.5 font-mono font-bold text-foreground text-xs">
              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{count} folios</span>
            </div>
          );
        },
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
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Digital Asset</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link prefetch href={`/admin/catalog/${getRecordSlug(r)}`} className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View Record &amp; Folios</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link prefetch href={`/catalog/${getRecordSlug(r)}`} target="_blank" className="cursor-pointer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span>Open in OPAC Viewer</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1280px]">
      <PageHeader
        eyebrow="Digital Repository Assets"
        title="Digital Library"
        description="Catalogue records that have digitised folio images attached, and their access clearance level."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Digitised Records" value={`${records.length}`} hint="With at least one folio image" />
        <StatCard label="Digitised in Full" value={`${openAccessCount}`} hint="Publicly viewable" hintTone="positive" />
        <StatCard
          label="Reading Room / Restricted"
          value={`${restrictedCount}`}
          hint="Requires staff authorization"
          hintTone="warning"
        />
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={records}
        searchKey="titleLatin"
        searchPlaceholder="Filter by title or shelfmark..."
        isLoading={loading}
        facetedFilters={[
          {
            columnId: 'accessLevel',
            title: 'Access Level',
            options: [
              { label: 'Digitised Full', value: 'DIGITISED_FULL' },
              { label: 'Reading Room Only', value: 'READING_ROOM_ONLY' },
              { label: 'Restricted', value: 'RESTRICTED' },
            ],
          },
          {
            columnId: 'format',
            title: 'Format',
            options: [
              { label: 'Book', value: 'BOOK' },
              { label: 'Manuscript', value: 'MANUSCRIPT' },
              { label: 'Periodical', value: 'PERIODICAL' },
              { label: 'Document', value: 'DOCUMENT' },
            ],
          },
        ]}
      />
    </div>
  );
}
