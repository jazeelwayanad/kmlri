'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  Wrench,
  Plus,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
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
}

interface MaintenanceLog {
  id: string;
  assetId: string;
  description: string;
  cost?: number | null;
  performedBy?: string | null;
  performedAt: string;
  asset: { id: string; name: string; category?: string | null };
}

export default function AssetMaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [performedBy, setPerformedBy] = useState('');
  const [performedAt, setPerformedAt] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logData, assetData] = await Promise.all([api.getAllAssetMaintenance(), api.getAssets()]);
      setLogs(Array.isArray(logData) ? logData : []);
      setAssets(Array.isArray(assetData) ? assetData : []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load maintenance logs.');
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
    setDescription('');
    setCost('');
    setPerformedBy('');
    setPerformedAt('');
    setShowModal(true);
  };

  const handleLogMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !description.trim()) return;
    setSaving(true);
    try {
      await api.addAssetMaintenance(selectedAssetId, {
        description,
        cost: cost === '' ? undefined : Number(cost),
        performedBy: performedBy || undefined,
        performedAt: performedAt || undefined,
      });
      const assetName = assets.find((a) => a.id === selectedAssetId)?.name || 'Asset';
      toast.success(`Maintenance logged for "${assetName}". Status set to In Maintenance.`);
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log maintenance.');
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<MaintenanceLog>[]>(
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Asset Name" />,
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div>
              <span className="font-bold text-foreground block text-sm">{l.asset.name}</span>
              {l.asset.category && (
                <span className="text-muted-foreground text-xs">{l.asset.category}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Service Description" />,
        cell: ({ row }) => (
          <span className="text-foreground text-xs max-w-sm block">{row.getValue('description')}</span>
        ),
      },
      {
        accessorKey: 'performedBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Performed By / Vendor" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">{row.getValue('performedBy') || '—'}</span>
        ),
      },
      {
        accessorKey: 'cost',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cost (₹)" />,
        cell: ({ row }) => {
          const cost = row.getValue('cost') as number | undefined;
          return (
            <span className="font-mono font-bold text-foreground text-xs">
              {cost != null ? `₹${cost.toLocaleString('en-IN')}` : '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'performedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date Performed" />,
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground text-xs">
            {new Date(row.getValue('performedAt')).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
    ],
    []
  );

  const totalSpend = logs.reduce((acc, cur) => acc + (cur.cost || 0), 0);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1280px]">
      <PageHeader
        eyebrow="Asset Management · Service Logs"
        title="Maintenance Logs"
        description="Track service, repair, and calibration work performed on institutional assets. Logging an entry automatically marks the asset as In Maintenance."
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
              Log Maintenance
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">Total Maintenance Logs</span>
          <span className="text-2xl font-bold text-foreground mt-1 block">{logs.length}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">
            Assets Serviced
          </span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {new Set(logs.map((l) => l.assetId)).size} Units
          </span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">Total Recorded Spend</span>
          <span className="text-2xl font-mono font-bold text-foreground mt-1 block">
            ₹{totalSpend.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={logs}
        searchKey="assetName"
        searchPlaceholder="Filter maintenance logs by asset or description..."
        isLoading={loading}
      />

      {/* Dialog: Log Maintenance */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Maintenance / Service Entry</DialogTitle>
            <DialogDescription>
              Record maintenance, calibration, replacement parts, or servicing details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogMaintenance} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="maint-search">Search Asset</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  id="maint-search"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  placeholder="Search by name or serial number..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maint-asset">
                Target Asset <span className="text-destructive">*</span>
              </Label>
              <select
                id="maint-asset"
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
              <Label htmlFor="maint-desc">
                Description of Service <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="maint-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of the repair, replacement, or calibration work..."
                className="w-full px-3 py-2 border border-input rounded-md text-xs bg-background text-foreground outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="maint-cost">Cost (₹)</Label>
                <Input
                  id="maint-cost"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maint-date">Date Performed</Label>
                <Input
                  id="maint-date"
                  type="date"
                  value={performedAt}
                  onChange={(e) => setPerformedAt(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maint-vendor">Performed By / Vendor</Label>
              <Input
                id="maint-vendor"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder="e.g. Vertiv Technical Services"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !selectedAssetId || !description.trim()}>
                {saving ? 'Saving...' : 'Log Maintenance'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
