'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Plus,
  Barcode,
  Printer,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  FileText,
  X,
} from 'lucide-react';
import { Button } from '@/components/admin/ui';

type CopyStatus = 'AVAILABLE' | 'ON_LOAN' | 'RESERVED' | 'IN_CONSERVATION' | 'LOST' | 'WITHDRAWN';

interface ItemCopy {
  id: string;
  copyNumber: number;
  barcode: string;
  rfidTag?: string | null;
  location: string;
  status: CopyStatus;
  loans?: { dueDate: string; user: { fullName: string; membershipNumber: string } }[];
}

const STATUS_OPTIONS: CopyStatus[] = ['AVAILABLE', 'ON_LOAN', 'RESERVED', 'IN_CONSERVATION', 'LOST', 'WITHDRAWN'];

export default function RecordDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params?.id as string;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Item Modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newBarcode, setNewBarcode] = useState('');
  const [newRfid, setNewRfid] = useState('');
  const [newLocation, setNewLocation] = useState('Main Reading Room - Shelf A1');
  const [newStatus, setNewStatus] = useState<CopyStatus>('AVAILABLE');
  const [savingItem, setSavingItem] = useState(false);

  // Edit Item Modal
  const [editingItem, setEditingItem] = useState<ItemCopy | null>(null);
  const [editBarcode, setEditBarcode] = useState('');
  const [editRfid, setEditRfid] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState<CopyStatus>('AVAILABLE');

  // Edit Record Modal
  const [showEditRecordModal, setShowEditRecordModal] = useState(false);
  const [editTitleLatin, setEditTitleLatin] = useState('');
  const [editTitleArabic, setEditTitleArabic] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editAuthors, setEditAuthors] = useState('');
  const [editShelfmark, setEditShelfmark] = useState('');
  const [editFormat, setEditFormat] = useState('MANUSCRIPT');
  const [editLanguage, setEditLanguage] = useState('Arabic');
  const [editMaterial, setEditMaterial] = useState('');
  const [editExtent, setEditExtent] = useState('');
  const [editPublicationYear, setEditPublicationYear] = useState('');
  const [editProvenance, setEditProvenance] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editSubjects, setEditSubjects] = useState('');
  const [editAccessLevel, setEditAccessLevel] = useState('DIGITISED_FULL');
  const [savingRecord, setSavingRecord] = useState(false);

  const loadRecord = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await api.getCatalogItem(recordId);
      setRecord(data);
    } catch {
      setRecord(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recordId) loadRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  // Open Edit Record Modal
  const handleOpenEditRecord = () => {
    if (!record) return;
    setEditTitleLatin(record.titleLatin || '');
    setEditTitleArabic(record.titleArabic || '');
    setEditSubtitle(record.subtitle || '');
    setEditAuthors(Array.isArray(record.authors) ? record.authors.join(', ') : record.authors || '');
    setEditShelfmark(record.shelfmark || '');
    setEditFormat(record.format || 'MANUSCRIPT');
    setEditLanguage(record.language || 'Arabic');
    setEditMaterial(record.material || '');
    setEditExtent(record.extent || '');
    setEditPublicationYear(record.publicationYear || '');
    setEditProvenance(record.provenance || '');
    setEditSummary(record.summary || '');
    setEditSubjects((record.subjects || []).join(', '));
    setEditAccessLevel(record.accessLevel || 'DIGITISED_FULL');
    setShowEditRecordModal(true);
  };

  const handleSaveRecordEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRecord(true);
    try {
      await api.updateCatalogItem(record.id, {
        titleLatin: editTitleLatin,
        titleArabic: editTitleArabic || undefined,
        subtitle: editSubtitle || undefined,
        authors: editAuthors.split(',').map((a) => a.trim()).filter(Boolean),
        shelfmark: editShelfmark,
        format: editFormat,
        language: editLanguage,
        material: editMaterial || undefined,
        extent: editExtent || undefined,
        publicationYear: editPublicationYear || undefined,
        provenance: editProvenance || undefined,
        summary: editSummary || undefined,
        subjects: editSubjects.split(',').map((s) => s.trim()).filter(Boolean),
        accessLevel: editAccessLevel,
      });
      setShowEditRecordModal(false);
      setNotification({ type: 'success', text: 'Bibliographic master record updated successfully.' });
      await loadRecord();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not update the record.' });
    } finally {
      setSavingRecord(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDeleteRecord = async () => {
    if (!confirm(`Are you sure you want to permanently delete catalogue record "${record.titleLatin}" and all associated item copies?`)) return;
    try {
      await api.deleteCatalogItem(record.id);
      setNotification({ type: 'success', text: 'Record deleted. Redirecting to catalogue holdings...' });
      setTimeout(() => router.push('/admin/catalog'), 1000);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not delete this record.' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Add Item Copy
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarcode) return;
    setSavingItem(true);
    try {
      await api.addCatalogCopy(record.id, { barcode: newBarcode, rfidTag: newRfid || undefined, location: newLocation, status: newStatus });
      setNotification({ type: 'success', text: `Item copy "${newBarcode}" added to record.` });
      setShowAddItemModal(false);
      setNewBarcode('');
      setNewRfid('');
      await loadRecord();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not add item copy.' });
    } finally {
      setSavingItem(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Open Edit Item Modal
  const handleOpenEditItem = (item: ItemCopy) => {
    setEditingItem(item);
    setEditBarcode(item.barcode);
    setEditRfid(item.rfidTag || '');
    setEditLocation(item.location);
    setEditStatus(item.status);
  };

  const handleSaveItemEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await api.updateCatalogCopy(record.id, editingItem.id, {
        barcode: editBarcode,
        rfidTag: editRfid || undefined,
        location: editLocation,
        status: editStatus,
      });
      setEditingItem(null);
      setNotification({ type: 'success', text: `Item copy "${editBarcode}" updated successfully.` });
      await loadRecord();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not update item copy.' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Delete Item Copy
  const handleDeleteItem = async (itemId: string, barcodeName: string) => {
    if (!confirm(`Are you sure you want to delete item copy "${barcodeName}"?`)) return;
    try {
      await api.deleteCatalogCopy(record.id, itemId);
      setNotification({ type: 'success', text: `Item copy "${barcodeName}" removed.` });
      await loadRecord();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not remove this item copy.' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 text-sm font-sans">Loading record...</div>;
  }

  if (notFound || !record) {
    return (
      <div className="p-12 text-center font-sans">
        <p className="text-lg font-bold text-gray-900 mb-2">Record not found</p>
        <Link href="/admin/catalog" className="text-[#A52307] font-semibold text-sm hover:underline">
          ← Back to Catalogue Holdings
        </Link>
      </div>
    );
  }

  const items: ItemCopy[] = record.copies || [];
  const totalCount = items.length;
  const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;
  const onLoanCount = items.filter((i) => i.status === 'ON_LOAN').length;
  const reservedCount = items.filter((i) => i.status === 'RESERVED').length;
  const lostOrDamagedCount = items.filter((i) => i.status === 'IN_CONSERVATION' || i.status === 'LOST').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      {/* Top Back Link & Header Controls */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Link
          href="/admin/catalog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#A52307] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue Holdings</span>
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleOpenEditRecord}
            className="px-3.5 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Record</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setNewBarcode(`${record.shelfmark.replace(/\s+/g, '')}-0${items.length + 1}`);
              setShowAddItemModal(true);
            }}
          >
            Add Item Copy
          </Button>
          <button
            type="button"
            onClick={handleDeleteRecord}
            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold hover:bg-red-700 hover:text-white transition-colors flex items-center gap-1.5"
            title="Delete this record"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Record</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 border rounded-xl text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Record Title Banner */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5 rounded">{record.shelfmark}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#A52307] text-white px-2 py-0.5 rounded">{record.format}</span>
              <span className="text-[10px] font-semibold uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{record.accessLevel}</span>
            </div>
            <h1 className="font-amiri text-3xl font-bold text-gray-900 leading-tight">{record.titleLatin}</h1>
            {record.titleArabic && (
              <p className="font-amiri text-lg text-gray-600 mt-0.5" dir="rtl">
                {record.titleArabic}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1 font-semibold">
              Authors: {Array.isArray(record.authors) ? record.authors.join(', ') : record.authors}
            </p>
          </div>

          {/* Item Availability Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#FAF8F5] p-3 rounded border border-[#E2E0DB] text-center text-xs w-full md:w-auto">
            <div className="px-2 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Total Items</span>
              <span className="text-xl font-bold text-gray-900 mt-0.5 block">{totalCount}</span>
            </div>
            <div className="px-2 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">Available</span>
              <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{availableCount}</span>
            </div>
            <div className="px-2 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-blue-700 block">On Loan</span>
              <span className="text-xl font-bold text-blue-700 mt-0.5 block">{onLoanCount}</span>
            </div>
            <div className="px-2 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-amber-700 block">Reserved</span>
              <span className="text-xl font-bold text-amber-700 mt-0.5 block">{reservedCount}</span>
            </div>
            <div className="px-2">
              <span className="text-[10px] font-bold uppercase text-red-700 block">Lost/Damaged</span>
              <span className="text-xl font-bold text-red-700 mt-0.5 block">{lostOrDamagedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Bibliographic Info + Items Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bibliographic Metadata */}
        <div className="lg:col-span-1 bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs font-sans">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#A52307]" />
              <span>Bibliographic Metadata</span>
            </h3>
            <button type="button" onClick={handleOpenEditRecord} className="text-[#A52307] hover:underline font-bold text-[11px] flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Call Number</span>
            <span className="font-mono font-bold text-gray-900 mt-0.5 block">{record.callNumber || 'N/A'}</span>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Language &amp; Script</span>
            <span className="text-gray-900 mt-0.5 block">{record.language}</span>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Material &amp; Paper Spec</span>
            <span className="text-gray-900 mt-0.5 block">{record.material || 'N/A'}</span>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Physical Extent</span>
            <span className="text-gray-900 mt-0.5 block">{record.extent || 'N/A'}</span>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Publication Year</span>
            <span className="text-gray-900 font-mono mt-0.5 block">{record.publicationYear || 'N/A'}</span>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Provenance</span>
            <span className="text-gray-900 mt-0.5 block">{record.provenance || 'N/A'}</span>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Subjects &amp; Keywords</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {(record.subjects || []).map((s: string, idx: number) => (
                <span key={idx} className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Summary &amp; Historical Context</span>
            <p className="text-gray-600 mt-1 leading-relaxed">{record.summary}</p>
          </div>
        </div>

        {/* Right Column: Associated Item Copies Management */}
        <div className="lg:col-span-2 bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-2">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Barcode className="w-4 h-4 text-[#A52307]" />
              <span>Physical Item Copies ({items.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setNewBarcode(`${record.shelfmark.replace(/\s+/g, '')}-0${items.length + 1}`);
                setShowAddItemModal(true);
              }}
              className="text-xs font-bold text-[#A52307] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Item Copy</span>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">No item copies attached to this record yet.</div>
          ) : (
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                  <th className="py-3 px-3">Copy #</th>
                  <th className="py-3 px-3">Barcode</th>
                  <th className="py-3 px-3">RFID Tag</th>
                  <th className="py-3 px-3">Shelf Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEECE7]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-3 font-mono font-bold text-gray-900">Copy #{item.copyNumber}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{item.barcode}</td>
                    <td className="py-3.5 px-3 font-mono text-gray-500 text-[11px]">{item.rfidTag || '—'}</td>
                    <td className="py-3.5 px-3 text-gray-700">{item.location}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'ON_LOAN'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'RESERVED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </span>
                      {item.loans && item.loans.length > 0 && (
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          {item.loans[0].user.fullName} · Due {new Date(item.loans[0].dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditItem(item)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors"
                        title="Edit Item Details"
                      >
                        <Edit3 className="w-3 h-3 inline mr-0.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id, item.barcode)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded inline-block align-middle"
                        title="Delete Item Copy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* POPUP MODAL: Add Item Copy */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Add Item Copy to Record</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Item Barcode*</label>
                <input
                  type="text"
                  required
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">RFID Tag Hex / ID</label>
                <input
                  type="text"
                  placeholder="Optional RFID tag identifier"
                  value={newRfid}
                  onChange={(e) => setNewRfid(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Holding Location*</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Availability Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as CopyStatus)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none text-xs bg-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddItemModal(false)} className="px-4 py-2 border border-gray-200 rounded text-xs font-semibold text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={savingItem} className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 disabled:opacity-50">
                  {savingItem ? 'Adding…' : 'Add Copy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Edit Item Copy */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Edit Item Copy (Copy #{editingItem.copyNumber})</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemEdit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Item Barcode*</label>
                <input
                  type="text"
                  required
                  value={editBarcode}
                  onChange={(e) => setEditBarcode(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">RFID Tag Hex / ID</label>
                <input
                  type="text"
                  value={editRfid}
                  onChange={(e) => setEditRfid(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Holding Location*</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Availability Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as CopyStatus)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none text-xs bg-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 border border-gray-200 rounded text-xs font-semibold text-gray-700">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800">
                  Save Item Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Edit Bibliographic Master Record */}
      {showEditRecordModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-[#A52307] font-bold uppercase tracking-wider">Catalogue Management</span>
                <h3 className="text-lg font-bold text-gray-900">Edit Bibliographic Master Record</h3>
              </div>
              <button type="button" onClick={() => setShowEditRecordModal(false)} className="text-gray-400 hover:text-gray-900 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecordEdits} className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Title Proper (Latin)*</label>
                  <input
                    type="text"
                    required
                    value={editTitleLatin}
                    onChange={(e) => setEditTitleLatin(e.target.value)}
                    className="w-full border border-gray-300 h-10 px-3 rounded text-xs font-bold text-gray-900 outline-none focus:border-[#A52307]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Title (Arabic Script)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editTitleArabic}
                    onChange={(e) => setEditTitleArabic(e.target.value)}
                    className="w-full border border-gray-300 h-10 px-3 rounded text-sm font-amiri text-gray-900 outline-none focus:border-[#A52307]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Authors (Comma separated)</label>
                  <input
                    type="text"
                    value={editAuthors}
                    onChange={(e) => setEditAuthors(e.target.value)}
                    className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Shelfmark</label>
                  <input
                    type="text"
                    value={editShelfmark}
                    onChange={(e) => setEditShelfmark(e.target.value)}
                    className="w-full border border-gray-300 h-10 px-3 rounded text-xs font-mono font-bold text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Language</label>
                  <input
                    type="text"
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Physical Extent</label>
                  <input
                    type="text"
                    value={editExtent}
                    onChange={(e) => setEditExtent(e.target.value)}
                    className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Publication Year</label>
                  <input
                    type="text"
                    value={editPublicationYear}
                    onChange={(e) => setEditPublicationYear(e.target.value)}
                    className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Provenance</label>
                  <input
                    type="text"
                    value={editProvenance}
                    onChange={(e) => setEditProvenance(e.target.value)}
                    className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Subjects (Comma separated)</label>
                  <input
                    type="text"
                    value={editSubjects}
                    onChange={(e) => setEditSubjects(e.target.value)}
                    className="w-full border border-gray-300 h-10 px-3 rounded text-xs text-gray-900 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase mb-1">Summary &amp; Historical Context</label>
                  <textarea
                    rows={4}
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditRecordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingRecord} className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow-md disabled:opacity-50">
                  {savingRecord ? 'Saving…' : 'Save Record Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
