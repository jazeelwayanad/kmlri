'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Boxes, Search, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Edit3, Save, X } from 'lucide-react';
import { Badge, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { api } from '@/lib/api';

type CopyStatus = 'AVAILABLE' | 'ON_LOAN' | 'RESERVED' | 'IN_CONSERVATION' | 'LOST' | 'WITHDRAWN';

interface ItemCopy {
  id: string;
  barcode: string;
  rfidTag?: string | null;
  location: string;
  status: CopyStatus;
  copyNumber: number;
}

interface BibRecord {
  id: string;
  titleLatin: string;
  shelfmark: string;
  copies: ItemCopy[];
}

interface CopyRow {
  bibRecordId: string;
  title: string;
  shelfmark: string;
  copy: ItemCopy;
}

const STATUS_OPTIONS: CopyStatus[] = ['AVAILABLE', 'ON_LOAN', 'RESERVED', 'IN_CONSERVATION', 'LOST', 'WITHDRAWN'];

const statusBadgeVariant = (status: CopyStatus) => {
  switch (status) {
    case 'AVAILABLE':
      return 'success' as const;
    case 'ON_LOAN':
    case 'RESERVED':
      return 'info' as const;
    case 'IN_CONSERVATION':
      return 'warning' as const;
    case 'LOST':
    case 'WITHDRAWN':
      return 'danger' as const;
    default:
      return 'neutral' as const;
  }
};

export default function InventoryAdminPage() {
  const [records, setRecords] = useState<BibRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [editingCopyId, setEditingCopyId] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState<CopyStatus>('AVAILABLE');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.searchCatalog({ limit: 100 });
      setRecords((res.data as unknown as BibRecord[]) || []);
    } catch {
      setError('Could not load holdings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const flattenedRows: CopyRow[] = useMemo(() => {
    const rows: CopyRow[] = [];
    records.forEach((rec) => {
      (rec.copies || []).forEach((c) => {
        rows.push({
          bibRecordId: rec.id,
          title: rec.titleLatin,
          shelfmark: rec.shelfmark,
          copy: c,
        });
      });
    });
    return rows;
  }, [records]);

  const counts = useMemo(() => {
    const total = flattenedRows.length;
    const available = flattenedRows.filter((r) => r.copy.status === 'AVAILABLE').length;
    const conservation = flattenedRows.filter((r) => r.copy.status === 'IN_CONSERVATION').length;
    const flagged = flattenedRows.filter((r) => r.copy.status === 'LOST' || r.copy.status === 'WITHDRAWN').length;
    return { total, available, conservation, flagged };
  }, [flattenedRows]);

  const startEdit = (row: CopyRow) => {
    setEditingCopyId(row.copy.id);
    setEditLocation(row.copy.location);
    setEditStatus(row.copy.status);
  };

  const cancelEdit = () => {
    setEditingCopyId(null);
  };

  const saveEdit = async (row: CopyRow) => {
    setSaving(true);
    try {
      await api.updateCatalogCopy(row.bibRecordId, row.copy.id, {
        location: editLocation,
        status: editStatus,
      });

      setRecords((prev) =>
        prev.map((rec) => {
          if (rec.id !== row.bibRecordId) return rec;
          return {
            ...rec,
            copies: (rec.copies || []).map((c) =>
              c.id === row.copy.id ? { ...c, location: editLocation, status: editStatus } : c
            ),
          };
        })
      );

      setNotification(`Holding copy #${row.copy.copyNumber} (${row.copy.barcode}) updated.`);
      setEditingCopyId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update item copy.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const columns = useMemo<ColumnDef<CopyRow>[]>(() => [
    {
      accessorKey: 'copy.barcode',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Barcode & Copy #" />,
      cell: ({ row }) => (
        <div className="font-mono font-semibold text-gray-900">
          {row.original.copy.barcode}
          <div className="text-gray-400 text-[11px] font-sans">Copy #{row.original.copy.copyNumber}</div>
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title & Shelfmark" />,
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-sm text-gray-900">{row.original.title}</div>
          <div className="text-gray-400 text-[11px] font-mono">{row.original.shelfmark}</div>
        </div>
      ),
    },
    {
      accessorKey: 'copy.location',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      cell: ({ row }) => {
        const isEditing = editingCopyId === row.original.copy.id;
        if (isEditing) {
          return (
            <input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full border border-gray-200 h-8 px-2 rounded text-xs outline-none focus:border-heritage-red bg-white"
            />
          );
        }
        return <span className="text-gray-700 text-xs">{row.original.copy.location}</span>;
      },
    },
    {
      accessorKey: 'copy.status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const isEditing = editingCopyId === row.original.copy.id;
        if (isEditing) {
          return (
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as CopyStatus)}
              className="w-full border border-gray-200 h-8 px-2 rounded text-xs outline-none focus:border-heritage-red bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          );
        }
        return (
          <Badge variant={statusBadgeVariant(row.original.copy.status)}>
            {row.original.copy.status.replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Shelf Check</div>,
      cell: ({ row }) => {
        const isEditing = editingCopyId === row.original.copy.id;
        if (isEditing) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button variant="dark" icon={Save} disabled={saving} onClick={() => saveEdit(row.original)}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" icon={X} disabled={saving} onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          );
        }
        return (
          <div className="text-right">
            <Button variant="outline" icon={Edit3} onClick={() => startEdit(row.original)}>
              Correct Entry
            </Button>
          </div>
        );
      },
    },
  ], [editingCopyId, editLocation, editStatus, saving]);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Acquisitions &amp; Holdings Desk"
        title="Physical Inventory &amp; Stocktake"
        description="Verify barcodes, monitor copies in conservation, mark missing items, and adjust stack room shelf locations."
        actions={
          <Button variant="outline" icon={RefreshCw} onClick={loadData}>
            Refresh Stocktake
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-heritage-red ring-1 ring-inset ring-red-600/20 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-heritage-red flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Holdings" value={counts.total} hint="Individual volume copies" />
        <StatCard
          label="Available Rate"
          value={counts.total ? `${Math.round((counts.available / counts.total) * 100)}%` : '—'}
          hint={`${counts.available} copies available`}
          hintTone="positive"
        />
        <StatCard label="In Conservation" value={counts.conservation} hint="Undergoing treatment" hintTone="warning" />
        <StatCard label="Lost / Withdrawn" value={counts.flagged} hint="Flagged copies" hintTone="negative" />
      </div>

      {/* TanStack Inventory Data Table */}
      <DataTable
        columns={columns}
        data={flattenedRows}
        loading={loading}
        enableRowSelection
        searchKey="title"
        searchPlaceholder="Filter inventory by title, barcode, location..."
        emptyTitle="No inventory copies found"
        emptyMessage="No individual copies registered in the catalogue."
        facetedFilters={[
          {
            columnId: 'copy.status',
            title: 'Copy Status',
            options: STATUS_OPTIONS.map((s) => ({
              label: s.replace(/_/g, ' '),
              value: s,
            })),
          },
        ]}
      />
    </div>
  );
}
