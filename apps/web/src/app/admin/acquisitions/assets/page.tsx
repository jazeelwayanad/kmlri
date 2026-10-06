'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  Boxes,
  Plus,
  QrCode,
  Wrench,
  Printer,
  Eye,
  Pencil,
  Trash2,
  ShieldCheck,
  Building2,
  Calendar,
  IndianRupee,
  MoreHorizontal,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { confirmDialog, alertDialog } from '@/lib/dialog';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
}

interface AssetMaintenance {
  id: string;
  description: string;
  cost?: number | null;
  performedBy?: string | null;
  performedAt: string;
}

interface AssetAudit {
  id: string;
  condition: 'GOOD' | 'FAIR' | 'DAMAGED' | 'MISSING';
  notes?: string | null;
  auditedBy?: string | null;
  auditedAt: string;
}

interface LibraryAsset {
  id: string;
  name: string;
  category?: string | null;
  serialNumber?: string | null;
  location?: string | null;
  status: 'ACTIVE' | 'IN_MAINTENANCE' | 'RETIRED' | 'LOST';
  purchaseDate?: string | null;
  purchaseCost?: number | null;
  notes?: string | null;
  departmentId?: string | null;
  department?: Department | null;
  createdAt: string;
  updatedAt: string;
  maintenanceLogs?: AssetMaintenance[];
  audits?: AssetAudit[];
}

const STATUS_LABELS: Record<LibraryAsset['status'], string> = {
  ACTIVE: 'Active',
  IN_MAINTENANCE: 'In Maintenance',
  RETIRED: 'Retired',
  LOST: 'Lost',
};

export default function AssetManagementPage() {
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Add / Edit Asset Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<LibraryAsset['status']>('ACTIVE');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState<number | ''>('');
  const [departmentId, setDepartmentId] = useState('');
  const [notes, setNotes] = useState('');

  // Selected Asset Details View Modal
  const [viewingAsset, setViewingAsset] = useState<LibraryAsset | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await api.getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
    (async () => {
      try {
        const data = await api.getDepartments();
        setDepartments(Array.isArray(data) ? data : []);
      } catch {
        setDepartments([]);
      }
    })();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('');
    setSerialNumber('');
    setLocation('');
    setStatus('ACTIVE');
    setPurchaseDate('');
    setPurchaseCost('');
    setDepartmentId('');
    setNotes('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEditModal = (a: LibraryAsset) => {
    setEditingId(a.id);
    setName(a.name);
    setCategory(a.category || '');
    setSerialNumber(a.serialNumber || '');
    setLocation(a.location || '');
    setStatus(a.status);
    setPurchaseDate(a.purchaseDate ? a.purchaseDate.slice(0, 10) : '');
    setPurchaseCost(a.purchaseCost ?? '');
    setDepartmentId(a.departmentId || '');
    setNotes(a.notes || '');
    setShowFormModal(true);
  };

  const handleSubmitAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Record<string, any> = {
      name,
      category: category || undefined,
      serialNumber: serialNumber || undefined,
      location: location || undefined,
      status,
      purchaseDate: purchaseDate || undefined,
      purchaseCost: purchaseCost === '' ? undefined : Number(purchaseCost),
      departmentId: departmentId || undefined,
      notes: notes || undefined,
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.updateAsset(editingId, payload);
        toast.success(`Asset "${name}" updated successfully.`);
      } else {
        await api.createAsset(payload);
        toast.success(`Asset "${name}" registered successfully.`);
      }
      setShowFormModal(false);
      resetForm();
      await loadAssets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsset = async (a: LibraryAsset) => {
    if (!(await confirmDialog({ message: `Delete asset "${a.name}"? This cannot be undone.`, variant: 'danger' }))) return;
    try {
      await api.deleteAsset(a.id);
      toast.success(`Asset "${a.name}" deleted.`);
      await loadAssets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete asset.');
    }
  };

  const openViewModal = async (a: LibraryAsset) => {
    setViewingAsset(a);
    setViewingLoading(true);
    try {
      const full = await api.getAsset(a.id);
      setViewingAsset(full);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load asset details.');
    } finally {
      setViewingLoading(false);
    }
  };

  const categories = useMemo(
    () => Array.from(new Set(assets.map((a) => a.category).filter(Boolean))) as string[],
    [assets]
  );

  const columns = useMemo<ColumnDef<LibraryAsset>[]>(
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
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Asset Name" />,
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="space-y-0.5 max-w-sm">
              <span className="font-bold text-foreground block text-sm">{a.name}</span>
              {a.serialNumber && (
                <span className="font-mono text-muted-foreground text-[11px]">SN: {a.serialNumber}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => {
          const cat = row.getValue('category') as string | null;
          return cat ? (
            <Badge variant="outline" className="text-[10px] uppercase font-bold">
              {cat}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        accessorKey: 'location',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Physical Location" />,
        cell: ({ row }) => (
          <span className="text-foreground font-semibold text-xs">{row.getValue('location') || '—'}</span>
        ),
      },
      {
        id: 'department',
        accessorFn: (row) => row.department?.name || '—',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.department?.name || '—'}</span>,
      },
      {
        accessorKey: 'purchaseCost',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Valuation" />,
        cell: ({ row }) => {
          const cost = row.getValue('purchaseCost') as number | undefined;
          return (
            <span className="font-mono font-bold text-foreground text-xs">
              {cost ? `₹${cost.toLocaleString('en-IN')}` : '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const status = row.getValue('status') as LibraryAsset['status'];
          return (
            <Badge
              variant={
                status === 'ACTIVE'
                  ? 'success'
                  : status === 'IN_MAINTENANCE'
                  ? 'warning'
                  : status === 'LOST'
                  ? 'destructive'
                  : 'neutral'
              }
            >
              {STATUS_LABELS[status] || status}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Asset Options</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => openViewModal(a)} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Specifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditModal(a)} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit Record</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => alertDialog(`Printing QR / Barcode Tag for ${a.name}`)}
                    className="cursor-pointer"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    <span>Print QR Tag</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteAsset(a)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Asset</span>
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

  const totalValuation = assets.reduce((acc, cur) => acc + (cur.purchaseCost || 0), 0);
  const activeCount = assets.filter((a) => a.status === 'ACTIVE').length;
  const maintenanceCount = assets.filter((a) => a.status === 'IN_MAINTENANCE').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1280px]">
      <PageHeader
        eyebrow="Asset Management · Institutional Registry"
        title="Asset Registry & Equipment"
        description="Comprehensive lifecycle inventory of all physical hardware, digitization systems, conservation equipment, IT servers, and climate-control assets."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/acquisitions/assets/maintenance">
                <Wrench className="w-4 h-4 mr-1.5" />
                Maintenance Orders
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/acquisitions/assets/audits">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Audits
              </Link>
            </Button>
            <Button variant="default" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Register New Asset
            </Button>
          </div>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">Total Registered Assets</span>
          <span className="text-2xl font-bold text-foreground mt-1 block">{assets.length} Units</span>
          <span className="text-[11px] text-muted-foreground">Active institutional hardware</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">Asset Portfolio Value</span>
          <span className="text-2xl font-mono font-bold text-foreground mt-1 block">
            ₹{(totalValuation / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">Total capital expenditure</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">Active Availability</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {assets.length > 0 ? Math.round((activeCount / assets.length) * 100) : 0}%
          </span>
          <span className="text-[11px] text-emerald-600">{activeCount} of {assets.length} active</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg">
          <span className="text-[11px] font-bold uppercase text-muted-foreground block">In Maintenance / Service</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{maintenanceCount}</span>
          <span className="text-[11px] text-amber-600">Units currently serviced</span>
        </div>
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={assets}
        searchKey="name"
        searchPlaceholder="Search assets by name, serial #, or location..."
        isLoading={loading}
        facetedFilters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Active', value: 'ACTIVE' },
              { label: 'In Maintenance', value: 'IN_MAINTENANCE' },
              { label: 'Retired', value: 'RETIRED' },
              { label: 'Lost', value: 'LOST' },
            ],
          },
          ...(categories.length > 0
            ? [
                {
                  columnId: 'category',
                  title: 'Category',
                  options: categories.map((c) => ({ label: c, value: c })),
                },
              ]
            : []),
        ]}
      />

      {/* Dialog: Register / Edit Asset */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Library Asset' : 'Register New Library Asset'}</DialogTitle>
            <DialogDescription>
              Enter institutional hardware, digitization, or lab equipment specifications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAsset} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="asset-name">
                  Asset Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="asset-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zeutschel OS 16000 High-Resolution Overhead Book Scanner"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asset-cat">Category</Label>
                <Input
                  id="asset-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Digitization Equipment"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asset-sn">Serial Number</Label>
                <Input
                  id="asset-sn"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-8829104-X"
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asset-loc">Location</Label>
                <Input
                  id="asset-loc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Conservation Lab Suite 3"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asset-status">Status</Label>
                <select
                  id="asset-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LibraryAsset['status'])}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="IN_MAINTENANCE">In Maintenance</option>
                  <option value="RETIRED">Retired</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              {departments.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="asset-dept">Department</Label>
                  <select
                    id="asset-dept"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground outline-none"
                  >
                    <option value="">Unassigned</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="asset-cost">Purchase Cost (₹)</Label>
                <Input
                  id="asset-cost"
                  type="number"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asset-pdate">Purchase Date</Label>
                <Input
                  id="asset-pdate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="asset-notes">Notes</Label>
                <textarea
                  id="asset-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this asset..."
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground outline-none resize-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Asset Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: View Asset Details */}
      <Dialog open={!!viewingAsset} onOpenChange={(open) => !open && setViewingAsset(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {viewingAsset && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingAsset.name}</DialogTitle>
                <DialogDescription>
                  Asset specifications, valuation details, and servicing history.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border border-border">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Category:</span>
                    <strong className="text-foreground">{viewingAsset.category || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Status:</span>
                    <Badge variant="success">{STATUS_LABELS[viewingAsset.status]}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Serial Number:</span>
                    <span className="font-mono font-bold text-foreground">{viewingAsset.serialNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Location:</span>
                    <span className="text-foreground font-semibold">{viewingAsset.location || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Department:</span>
                    <span className="text-foreground">{viewingAsset.department?.name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Purchase Valuation:</span>
                    <span className="font-mono font-bold text-foreground">
                      {viewingAsset.purchaseCost ? `₹${viewingAsset.purchaseCost.toLocaleString('en-IN')}` : '—'}
                    </span>
                  </div>
                  {viewingAsset.notes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-[11px]">Notes:</span>
                      <span className="text-foreground">{viewingAsset.notes}</span>
                    </div>
                  )}
                </div>

                {viewingLoading ? (
                  <LoadingState message="Loading logs…" minHeight="120px" size="md" />
                ) : (
                  <>
                    <div>
                      <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" /> Maintenance History
                      </h4>
                      {viewingAsset.maintenanceLogs && viewingAsset.maintenanceLogs.length > 0 ? (
                        <ul className="space-y-2">
                          {viewingAsset.maintenanceLogs.map((m) => (
                            <li key={m.id} className="border border-border rounded-lg p-2.5">
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-foreground">{m.description}</span>
                                {m.cost != null && (
                                  <span className="font-mono font-bold text-foreground">
                                    ₹{m.cost.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              <span className="text-muted-foreground text-[11px]">
                                {new Date(m.performedAt).toLocaleDateString()}
                                {m.performedBy ? ` · ${m.performedBy}` : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic">No maintenance logged yet.</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Audit History
                      </h4>
                      {viewingAsset.audits && viewingAsset.audits.length > 0 ? (
                        <ul className="space-y-2">
                          {viewingAsset.audits.map((au) => (
                            <li key={au.id} className="border border-border rounded-lg p-2.5">
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-foreground">{au.condition}</span>
                                <span className="text-muted-foreground text-[11px]">
                                  {new Date(au.auditedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {au.notes && <span className="text-muted-foreground block">{au.notes}</span>}
                              {au.auditedBy && (
                                <span className="text-muted-foreground/70 text-[11px]">by {au.auditedBy}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic">No audits logged yet.</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="flex justify-between items-center sm:justify-between pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alertDialog(`Printing Asset Tag sticker for ${viewingAsset.name}`)}
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print QR Tag
                </Button>
                <Button variant="default" size="sm" onClick={() => setViewingAsset(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
