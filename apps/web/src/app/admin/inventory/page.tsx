'use client';

import { useState, useEffect, useMemo } from 'react';
import { Boxes, Search, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Edit3, Save, X } from 'lucide-react';
import { Badge, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';
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
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [editingCopyId, setEditingCopyId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<CopyStatus>('AVAILABLE');
  const [editLocation, setEditLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRecords = () => {
    setLoading(true);
    setError(null);
    api
      .searchCatalog({ limit: 200 })
      .then((res) => setRecords(res.data || []))
      .catch((err: any) => setError(err.message || 'Failed to load catalogue records'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const allCopies: CopyRow[] = useMemo(() => {
    return records.flatMap((r) =>
      (r.copies || []).map((c) => ({
        bibRecordId: r.id,
        title: r.titleLatin,
        shelfmark: r.shelfmark,
        copy: c,
      }))
    );
  }, [records]);

  const filtered = allCopies.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.title.toLowerCase().includes(q) ||
      row.shelfmark.toLowerCase().includes(q) ||
      row.copy.barcode.toLowerCase().includes(q) ||
      row.copy.location.toLowerCase().includes(q)
    );
  });

  const counts = useMemo(() => {
    const total = allCopies.length;
    const available = allCopies.filter((r) => r.copy.status === 'AVAILABLE').length;
    const flagged = allCopies.filter((r) => r.copy.status === 'LOST' || r.copy.status === 'WITHDRAWN').length;
    const conservation = allCopies.filter((r) => r.copy.status === 'IN_CONSERVATION').length;
    return { total, available, flagged, conservation };
  }, [allCopies]);

  const startEdit = (row: CopyRow) => {
    setEditingCopyId(row.copy.id);
    setEditStatus(row.copy.status);
    setEditLocation(row.copy.location);
  };

  const cancelEdit = () => {
    setEditingCopyId(null);
  };

  const saveEdit = async (row: CopyRow) => {
    setSaving(true);
    setError(null);
    try {
      await api.updateCatalogCopy(row.bibRecordId, row.copy.id, {
        status: editStatus,
        location: editLocation,
      });
      setNotification(`Copy [${row.copy.barcode}] updated — now ${editStatus.replace(/_/g, ' ')} at "${editLocation}".`);
      setEditingCopyId(null);
      loadRecords();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update item copy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Stock Verification & Shelf Control"
        title="Inventory & Shelf Auditing"
        description="Search real catalogue holdings by shelfmark, location, or barcode and correct a copy's status or location when a physical shelf check finds a mismatch."
        actions={
          <Button variant="outline" icon={RefreshCw} onClick={loadRecords}>
            Refresh
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatCard label="Total Physical Copies" value={counts.total.toLocaleString()} hint="Loaded from catalogue" />
        <StatCard
          label="Available"
          value={counts.total ? `${Math.round((counts.available / counts.total) * 100)}%` : '—'}
          hint={`${counts.available} copies available`}
          hintTone="positive"
        />
        <StatCard label="In Conservation" value={counts.conservation} hint="Undergoing treatment" hintTone="warning" />
        <StatCard label="Lost / Withdrawn" value={counts.flagged} hint="Flagged copies" hintTone="negative" />
      </div>

      {/* Search Bar */}
      <Card padded={false} className="p-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, shelfmark, barcode, or shelf location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-16 text-sm text-gray-500 font-semibold">Loading catalogue holdings...</div>
      ) : (
        <Card className="overflow-x-auto" padded={false}>
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] tracking-wide">
                <th className="py-3 px-5 font-semibold">Barcode &amp; Copy #</th>
                <th className="py-3 px-3 font-semibold">Title &amp; Shelfmark</th>
                <th className="py-3 px-3 font-semibold">Location</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Shelf Check</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isEditing = editingCopyId === row.copy.id;
                return (
                  <tr key={row.copy.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3.5 px-5 font-mono font-semibold text-gray-900">
                      {row.copy.barcode}
                      <div className="text-gray-400 text-[11px] font-sans">Copy #{row.copy.copyNumber}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-sm text-gray-900">{row.title}</div>
                      <div className="text-gray-400 text-[11px] font-mono">{row.shelfmark}</div>
                    </td>
                    <td className="py-3.5 px-3 w-56">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full border border-gray-200 h-8 px-2 rounded text-xs outline-none focus:border-heritage-red"
                        />
                      ) : (
                        <span className="text-gray-700">{row.copy.location}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 w-44">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as CopyStatus)}
                          className="w-full border border-gray-200 h-8 px-2 rounded text-xs outline-none focus:border-heritage-red"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge variant={statusBadgeVariant(row.copy.status)}>{row.copy.status.replace(/_/g, ' ')}</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {isEditing ? (
                        <div className="inline-flex gap-1.5">
                          <Button variant="dark" icon={Save} disabled={saving} onClick={() => saveEdit(row)}>
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button variant="outline" icon={X} disabled={saving} onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" icon={Edit3} onClick={() => startEdit(row)}>
                          Correct Entry
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-sm text-gray-500 font-semibold">No item copies match this search.</div>
          )}
        </Card>
      )}
    </div>
  );
}
