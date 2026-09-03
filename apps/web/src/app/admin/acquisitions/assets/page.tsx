'use client';

import { useEffect, useState } from 'react';
import {
  Boxes,
  Search,
  Plus,
  QrCode,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';
import { confirmDialog, alertDialog } from '@/lib/dialog';

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
  const [loadError, setLoadError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  const [viewingError, setViewingError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load assets.');
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
    setErrorMessage(null);
    try {
      if (editingId) {
        await api.updateAsset(editingId, payload);
        setNotification(`Asset "${name}" updated successfully.`);
      } else {
        await api.createAsset(payload);
        setNotification(`Asset "${name}" registered successfully.`);
      }
      setShowFormModal(false);
      resetForm();
      await loadAssets();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsset = async (a: LibraryAsset) => {
    if (!(await confirmDialog({ message: `Delete asset "${a.name}"? This cannot be undone.`, variant: 'danger' }))) return;
    setDeletingId(a.id);
    setErrorMessage(null);
    try {
      await api.deleteAsset(a.id);
      setNotification(`Asset "${a.name}" deleted.`);
      await loadAssets();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete asset.');
    } finally {
      setDeletingId(null);
    }
  };

  const openViewModal = async (a: LibraryAsset) => {
    setViewingAsset(a);
    setViewingError(null);
    setViewingLoading(true);
    try {
      const full = await api.getAsset(a.id);
      setViewingAsset(full);
    } catch (err: any) {
      setViewingError(err.message || 'Failed to load asset details.');
    } finally {
      setViewingLoading(false);
    }
  };

  const categories = Array.from(new Set(assets.map((a) => a.category).filter(Boolean))) as string[];

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      a.name.toLowerCase().includes(q) ||
      (a.serialNumber || '').toLowerCase().includes(q) ||
      (a.location || '').toLowerCase().includes(q) ||
      (a.category || '').toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValuation = assets.reduce((acc, cur) => acc + (cur.purchaseCost || 0), 0);
  const activeCount = assets.filter((a) => a.status === 'ACTIVE').length;
  const maintenanceCount = assets.filter((a) => a.status === 'IN_MAINTENANCE').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Asset Management · Institutional Registry"
        title="Asset Registry &amp; Equipment"
        description="Comprehensive lifecycle inventory of all physical hardware, digitization systems, conservation equipment, IT servers, and climate-control assets."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={Wrench} href="/admin/acquisitions/assets/maintenance">
              Maintenance Orders
            </Button>
            <Button variant="outline" icon={ShieldCheck} href="/admin/acquisitions/assets/audits">
              Audits
            </Button>
            <Button variant="primary" icon={Plus} onClick={openCreateModal}>
              Register New Asset
            </Button>
          </div>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Registered Assets</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{assets.length} Units</span>
          <span className="text-[11px] text-gray-500">Active institutional hardware</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Asset Portfolio Value</span>
          <span className="text-2xl font-mono font-bold text-gray-900 mt-1 block">
            ₹{(totalValuation / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold">Total capital expenditure</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Active Availability</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {assets.length > 0 ? Math.round((activeCount / assets.length) * 100) : 0}%
          </span>
          <span className="text-[11px] text-emerald-600">{activeCount} of {assets.length} active</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">In Maintenance / Service</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{maintenanceCount}</span>
          <span className="text-[11px] text-amber-700">Units currently serviced</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets by name, serial #, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_MAINTENANCE">In Maintenance</option>
            <option value="RETIRED">Retired</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-gray-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading assets...
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Physical Location</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Valuation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No assets found.
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-bold text-gray-900 block text-sm">{a.name}</span>
                    {a.serialNumber && (
                      <span className="font-mono text-gray-400 text-[10px]">SN: {a.serialNumber}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {a.category ? (
                      <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {a.category}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 font-semibold">{a.location || '—'}</td>
                  <td className="py-3.5 px-4 text-gray-600">{a.department?.name || '—'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                    {a.purchaseCost ? `₹${a.purchaseCost.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        a.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'IN_MAINTENANCE'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : a.status === 'LOST'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openViewModal(a)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(a)}
                      className="p-1.5 text-gray-400 hover:text-gray-900"
                      title="Edit Asset"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(a)}
                      disabled={deletingId === a.id}
                      className="p-1.5 text-gray-400 hover:text-red-700 disabled:opacity-50"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => alertDialog(`Printing QR / Barcode Tag for ${a.name}`)}
                      className="p-1.5 text-gray-400 hover:text-gray-900"
                      title="Print QR Tag"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* POPUP MODAL: Register / Edit Asset */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-50 text-[#A52307] border border-red-100 flex items-center justify-center font-bold">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingId ? 'Edit Library Asset' : 'Register New Library Asset'}
                  </h3>
                  <span className="text-[11px] text-gray-500">Enter institutional hardware and equipment specifications</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAsset} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Asset Name <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zeutschel OS 16000 High-Resolution Overhead Book Scanner"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Digitization Equipment"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-8829104-X"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Conservation Lab Suite 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LibraryAsset['status'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="IN_MAINTENANCE">In Maintenance</option>
                    <option value="RETIRED">Retired</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>

                {departments.length > 0 && (
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Department</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
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

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about this asset..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Asset Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: View Asset Details */}
      {viewingAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full overflow-hidden border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{viewingAsset.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingAsset(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans overflow-y-auto">
              {viewingError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{viewingError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded border border-[#E2E0DB]">
                <div>
                  <span className="text-gray-500 block text-[11px]">Category:</span>
                  <strong className="text-gray-900">{viewingAsset.category || '—'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Status:</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    {STATUS_LABELS[viewingAsset.status]}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Serial Number:</span>
                  <span className="font-mono font-bold text-gray-900">{viewingAsset.serialNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Location:</span>
                  <span className="text-gray-800 font-semibold">{viewingAsset.location || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Department:</span>
                  <span className="text-gray-800">{viewingAsset.department?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Purchase Valuation:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {viewingAsset.purchaseCost ? `₹${viewingAsset.purchaseCost.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Purchase Date:</span>
                  <span className="font-mono text-gray-900">
                    {viewingAsset.purchaseDate ? new Date(viewingAsset.purchaseDate).toLocaleDateString() : '—'}
                  </span>
                </div>
                {viewingAsset.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-[11px]">Notes:</span>
                    <span className="text-gray-800">{viewingAsset.notes}</span>
                  </div>
                )}
              </div>

              {viewingLoading ? (
                <div className="py-6 flex items-center justify-center text-gray-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading history...
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" /> Maintenance History
                    </h4>
                    {viewingAsset.maintenanceLogs && viewingAsset.maintenanceLogs.length > 0 ? (
                      <ul className="space-y-2">
                        {viewingAsset.maintenanceLogs.map((m) => (
                          <li key={m.id} className="border border-[#E2E0DB] rounded p-2.5">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-gray-900">{m.description}</span>
                              {m.cost != null && (
                                <span className="font-mono font-bold text-gray-900">₹{m.cost.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                            <span className="text-gray-500 text-[11px]">
                              {new Date(m.performedAt).toLocaleDateString()}
                              {m.performedBy ? ` · ${m.performedBy}` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 italic">No maintenance logged yet.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Audit History
                    </h4>
                    {viewingAsset.audits && viewingAsset.audits.length > 0 ? (
                      <ul className="space-y-2">
                        {viewingAsset.audits.map((au) => (
                          <li key={au.id} className="border border-[#E2E0DB] rounded p-2.5">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-gray-900">{au.condition}</span>
                              <span className="text-gray-500 text-[11px]">{new Date(au.auditedAt).toLocaleDateString()}</span>
                            </div>
                            {au.notes && <span className="text-gray-600 block">{au.notes}</span>}
                            {au.auditedBy && <span className="text-gray-400 text-[11px]">by {au.auditedBy}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 italic">No audits logged yet.</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => alertDialog(`Printing Asset Tag sticker for ${viewingAsset.name}`)}
                  className="px-3 py-1.5 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Barcode / QR Tag</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingAsset(null)}
                  className="px-4 py-1.5 bg-black text-white rounded font-bold hover:bg-[#A52307]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
