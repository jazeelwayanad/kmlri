'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  ShieldCheck,
  Search,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface LibraryAsset {
  id: string;
  name: string;
  category?: string | null;
  serialNumber?: string | null;
  location?: string | null;
}

interface AssetAuditEntry {
  id: string;
  assetId: string;
  condition: 'GOOD' | 'FAIR' | 'DAMAGED' | 'MISSING';
  notes?: string | null;
  auditedBy?: string | null;
  auditedAt: string;
  asset: { id: string; name: string; category?: string | null };
}

export default function AssetAuditsPage() {
  const [audits, setAudits] = useState<AssetAuditEntry[]>([]);
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [condition, setCondition] = useState<AssetAuditEntry['condition']>('GOOD');
  const [notes, setNotes] = useState('');
  const [auditedBy, setAuditedBy] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [auditData, assetData] = await Promise.all([api.getAllAssetAudits(), api.getAssets()]);
      setAudits(Array.isArray(auditData) ? auditData : []);
      setAssets(Array.isArray(assetData) ? assetData : []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load audits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const assetOptions = useMemo(
    () =>
      assets.filter(
        (a) =>
          a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
          (a.serialNumber || '').toLowerCase().includes(assetSearch.toLowerCase())
      ),
    [assets, assetSearch]
  );

  const openModal = () => {
    setSelectedAssetId('');
    setAssetSearch('');
    setCondition('GOOD');
    setNotes('');
    setAuditedBy('');
    setShowModal(true);
  };

  const handleLogAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;
    setSaving(true);
    try {
      await api.addAssetAudit(selectedAssetId, {
        condition,
        notes: notes || undefined,
        auditedBy: auditedBy || undefined,
      });
      const assetName = assets.find((a) => a.id === selectedAssetId)?.name || 'Asset';
      toast.success(`Audit logged for "${assetName}".`);
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log audit.');
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<AssetAuditEntry>[]>(
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
        id: 'assetName',
        accessorFn: (row) => row.asset?.name || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Asset" />,
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div>
              <span className="font-bold text-foreground block text-sm">{a.asset.name}</span>
              {a.asset.category && (
                <span className="text-muted-foreground text-xs">{a.asset.category}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'condition',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Condition" />,
        cell: ({ row }) => {
          const cond = row.getValue('condition') as AssetAuditEntry['condition'];
          return (
            <Badge
              variant={
                cond === 'GOOD'
                  ? 'success'
                  : cond === 'FAIR'
                  ? 'default'
                  : cond === 'DAMAGED'
                  ? 'warning'
                  : 'destructive'
              }
            >
              {cond}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        accessorKey: 'notes',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Notes" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs max-w-sm block truncate">
            {row.getValue('notes') || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'auditedBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Audited By" />,
        cell: ({ row }) => (
          <span className="text-foreground text-xs">{row.getValue('auditedBy') || 'Staff Inspector'}</span>
        ),
      },
      {
        accessorKey: 'auditedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Audited At" />,
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground text-xs">
            {new Date(row.getValue('auditedAt')).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
    ],
    []
  );

  const goodCount = audits.filter((a) => a.condition === 'GOOD').length;
  const flaggedCount = audits.filter((a) => a.condition === 'DAMAGED' || a.condition === 'MISSING').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1280px]">
      <PageHeader
        eyebrow="Asset Management · Condition Audits"
        title="Physical Audits & Condition Checks"
        description="Log periodic condition checks for institutional assets and review the audit trail across the whole collection."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/acquisitions/assets">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                All Assets
              </Link>
            </Button>
            <Button variant="default" onClick={openModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Log Audit
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">Total Audits Logged</span>
          <span className="text-2xl font-bold text-foreground mt-1 block">{audits.length}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">Good Condition</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{goodCount}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">Damaged / Missing</span>
          <span className="text-2xl font-bold text-destructive mt-1 block">{flaggedCount}</span>
        </div>
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={audits}
        searchKey="assetName"
        searchPlaceholder="Filter by asset name or notes..."
        isLoading={loading}
        facetedFilters={[
          {
            columnId: 'condition',
            title: 'Condition',
            options: [
              { label: 'Good', value: 'GOOD' },
              { label: 'Fair', value: 'FAIR' },
              { label: 'Damaged', value: 'DAMAGED' },
              { label: 'Missing', value: 'MISSING' },
            ],
          },
        ]}
      />

      {/* Dialog: Log Audit */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Asset Condition Audit</DialogTitle>
            <DialogDescription>
              Record physical condition status, damage observations, or missing inventory reports.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogAudit} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="audit-search">Search Asset</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  id="audit-search"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  placeholder="Search by name or serial number..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="audit-asset">
                Target Asset <span className="text-destructive">*</span>
              </Label>
              <select
                id="audit-asset"
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-xs bg-background text-foreground outline-none"
                required
              >
                <option value="">Select an asset...</option>
                {assetOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                    {a.serialNumber ? ` (${a.serialNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="audit-condition">Condition Assessment</Label>
              <select
                id="audit-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetAuditEntry['condition'])}
                className="w-full px-3 py-2 border border-input rounded-md text-xs bg-background text-foreground outline-none"
              >
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="DAMAGED">Damaged</option>
                <option value="MISSING">Missing</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="audit-by">Audited By</Label>
              <Input
                id="audit-by"
                value={auditedBy}
                onChange={(e) => setAuditedBy(e.target.value)}
                placeholder="e.g. Aisha Rahmani"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="audit-notes">Notes & Observations</Label>
              <textarea
                id="audit-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations about the asset's condition or location..."
                className="w-full px-3 py-2 border border-input rounded-md text-xs bg-background text-foreground outline-none resize-none"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !selectedAssetId}>
                {saving ? 'Saving...' : 'Log Audit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
