'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowLeft,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

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

const CONDITION_STYLES: Record<AssetAuditEntry['condition'], string> = {
  GOOD: 'bg-emerald-100 text-emerald-800',
  FAIR: 'bg-blue-100 text-blue-800',
  DAMAGED: 'bg-amber-100 text-amber-900 border border-amber-300',
  MISSING: 'bg-red-100 text-red-800',
};

export default function AssetAuditsPage() {
  const [audits, setAudits] = useState<AssetAuditEntry[]>([]);
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [condition, setCondition] = useState<AssetAuditEntry['condition']>('GOOD');
  const [notes, setNotes] = useState('');
  const [auditedBy, setAuditedBy] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [auditData, assetData] = await Promise.all([api.getAllAssetAudits(), api.getAssets()]);
      setAudits(Array.isArray(auditData) ? auditData : []);
      setAssets(Array.isArray(assetData) ? assetData : []);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load audits.');
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
    setErrorMessage(null);
    try {
      await api.addAssetAudit(selectedAssetId, {
        condition,
        notes: notes || undefined,
        auditedBy: auditedBy || undefined,
      });
      const assetName = assets.find((a) => a.id === selectedAssetId)?.name || 'Asset';
      setNotification(`Audit logged for "${assetName}".`);
      setShowModal(false);
      await loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to log audit.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = audits.filter(
    (a) =>
      a.asset.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.asset.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.auditedBy || '').toLowerCase().includes(search.toLowerCase())
  );

  const goodCount = audits.filter((a) => a.condition === 'GOOD').length;
  const flaggedCount = audits.filter((a) => a.condition === 'DAMAGED' || a.condition === 'MISSING').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Asset Management · Condition Audits"
        title="Physical Audits &amp; Condition Checks"
        description="Log periodic condition checks for institutional assets and review the audit trail across the whole collection."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={ArrowLeft} href="/admin/assets">
              All Assets
            </Button>
            <Button variant="primary" icon={Plus} onClick={openModal}>
              Log Audit
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
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Audits Logged</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{audits.length}</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Good Condition</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{goodCount}</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Damaged / Missing</span>
          <span className="text-2xl font-bold text-red-700 mt-1 block">{flaggedCount}</span>
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
            placeholder="Search audits by asset, category, auditor..."
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Audit Reconciliation Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-gray-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading audits...
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Audited By</th>
                <th className="py-3 px-4 text-right">Audited At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    No audits logged yet.
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {a.asset.name}
                    {a.asset.category && <span className="block text-gray-400 text-[10px] font-normal">{a.asset.category}</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${CONDITION_STYLES[a.condition]}`}>
                      {a.condition}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 max-w-xs">{a.notes || '—'}</td>
                  <td className="py-3.5 px-4 text-gray-600">{a.auditedBy || '—'}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-500 text-[11px]">
                    {new Date(a.auditedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* POPUP MODAL: Log Audit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-[#E2E0DB]">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Log Asset Condition Audit</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogAudit} className="p-6 space-y-4 text-xs font-sans">
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
                <label className="font-bold text-gray-800 block mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as AssetAuditEntry['condition'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
                >
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="MISSING">Missing</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Audited By</label>
                <input
                  type="text"
                  value={auditedBy}
                  onChange={(e) => setAuditedBy(e.target.value)}
                  placeholder="e.g. Aisha Rahmani"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observations about the asset's condition or location..."
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
                  disabled={saving || !selectedAssetId}
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
