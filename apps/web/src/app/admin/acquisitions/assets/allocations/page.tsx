'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  Building2,
  Loader2,
} from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Department {
  id: string;
  name: string;
}

interface LibraryAsset {
  id: string;
  name: string;
  category?: string | null;
  serialNumber?: string | null;
  location?: string | null;
  status: string;
  departmentId?: string | null;
  department?: Department | null;
}

export default function AssetAllocationsPage() {
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [reassigning, setReassigning] = useState<LibraryAsset | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [assetsData, deptData] = await Promise.all([
        api.getAssets(),
        api.getDepartments().catch(() => []),
      ]);
      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReassignModal = (a: LibraryAsset) => {
    setReassigning(a);
    setSelectedDepartmentId(a.departmentId || '');
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigning) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      await api.updateAsset(reassigning.id, { departmentId: selectedDepartmentId || null });
      setNotification(
        selectedDepartmentId
          ? `"${reassigning.name}" assigned to ${departments.find((d) => d.id === selectedDepartmentId)?.name || 'department'}.`
          : `"${reassigning.name}" unassigned from its department.`
      );
      setReassigning(null);
      await loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update department assignment.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.serialNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.department?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const assignedCount = assets.filter((a) => a.departmentId).length;
  const unassignedCount = assets.length - assignedCount;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Asset Management · Department Assignment"
        title="Asset Allocations by Department"
        description="View and update which department each physical asset is currently assigned to. Reflects the current assignment only — the system does not retain a separate allocation history."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={ArrowLeft} href="/admin/acquisitions/assets">
              All Assets
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Assets</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{assets.length} Units</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Assigned to a Department</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{assignedCount} Units</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Unassigned</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{unassignedCount} Units</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by asset name, serial #, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Allocations Table */}
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
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Current Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    No assets found.
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-bold text-gray-900 block">{a.name}</span>
                    {a.serialNumber && <span className="font-mono text-gray-500 text-[11px]">{a.serialNumber}</span>}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{a.location || '—'}</td>
                  <td className="py-3.5 px-4">
                    {a.department ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {a.department.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                      {a.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => openReassignModal(a)}
                      className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1"
                    >
                      <Users className="w-3 h-3" />
                      <span>Reassign</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* POPUP MODAL: Reassign Department */}
      {reassigning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-[#E2E0DB]">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Reassign Asset to Department</h3>
              <button type="button" onClick={() => setReassigning(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassign} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Asset</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-800 font-semibold">
                  {reassigning.name}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Department</label>
                {departments.length > 0 ? (
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
                  >
                    <option value="">Unassigned</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-400 italic px-3 py-2 border border-gray-200 rounded bg-gray-50">
                    No departments configured yet.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setReassigning(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || departments.length === 0}
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
