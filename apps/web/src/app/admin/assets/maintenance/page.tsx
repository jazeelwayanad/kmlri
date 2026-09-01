'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

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
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setLoadError(null);
    try {
      const [logData, assetData] = await Promise.all([api.getAllAssetMaintenance(), api.getAssets()]);
      setLogs(Array.isArray(logData) ? logData : []);
      setAssets(Array.isArray(assetData) ? assetData : []);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load maintenance logs.');
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
    setErrorMessage(null);
    try {
      await api.addAssetMaintenance(selectedAssetId, {
        description,
        cost: cost === '' ? undefined : Number(cost),
        performedBy: performedBy || undefined,
        performedAt: performedAt || undefined,
      });
      const assetName = assets.find((a) => a.id === selectedAssetId)?.name || 'Asset';
      setNotification(`Maintenance logged for "${assetName}". Its status has been set to In Maintenance.`);
      setShowModal(false);
      await loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to log maintenance.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = logs.filter(
    (l) =>
      l.asset.name.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      (l.performedBy || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalSpend = logs.reduce((acc, cur) => acc + (cur.cost || 0), 0);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Asset Management · Service Logs"
        title="Maintenance Logs"
        description="Track service, repair, and calibration work performed on institutional assets. Logging an entry automatically marks the asset as In Maintenance."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={ArrowLeft} href="/admin/assets">
              All Assets
            </Button>
            <Button variant="primary" icon={Plus} onClick={openModal}>
              Log Maintenance
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
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Maintenance Logs</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{logs.length}</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Assets Currently in Maintenance</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {new Set(logs.map((l) => l.assetId)).size}
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Recorded Spend</span>
          <span className="text-2xl font-mono font-bold text-gray-900 mt-1 block">
            ₹{totalSpend.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs by asset, description, technician..."
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-gray-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading maintenance logs...
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Cost (₹)</th>
                <th className="py-3 px-4 text-right">Performed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    No maintenance logged yet.
                  </td>
                </tr>
              )}
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block">{l.asset.name}</span>
                    {l.asset.category && <span className="text-gray-400 text-[10px]">{l.asset.category}</span>}
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 max-w-sm">{l.description}</td>
                  <td className="py-3.5 px-4 text-gray-600">{l.performedBy || '—'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                    {l.cost != null ? `₹${l.cost.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-500 text-[11px]">
                    {new Date(l.performedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* POPUP MODAL: Log Maintenance */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-[#E2E0DB]">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Log Maintenance / Service Entry</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogMaintenance} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Search Asset</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Search by name or serial number..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Asset <span className="text-red-600">*</span></label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
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

              <div>
                <label className="font-bold text-gray-800 block mb-1">Description <span className="text-red-600">*</span></label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of the work performed..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Performed At</label>
                  <input
                    type="date"
                    value={performedAt}
                    onChange={(e) => setPerformedAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Performed By / Vendor</label>
                <input
                  type="text"
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value)}
                  placeholder="e.g. Vertiv Technical Services"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedAssetId || !description.trim()}
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Log Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
