'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, BibliographicRecord } from '@/lib/api';
import { 
  Library, 
  ArrowLeft, 
  Plus, 
  Barcode, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Tag, 
  FileText, 
  Globe, 
  Layers, 
  Share2, 
  QrCode,
  X
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function RecordDetailsPage() {
  const params = useParams();
  const recordId = params?.id as string;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Add Item Modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newBarcode, setNewBarcode] = useState('');
  const [newRfid, setNewRfid] = useState('');
  const [newLocation, setNewLocation] = useState('Manuscript Safe 3');
  const [newStatus, setNewStatus] = useState('AVAILABLE');

  useEffect(() => {
    async function loadRecord() {
      try {
        const data = await api.getCatalogItem(recordId);
        if (data && data.titleLatin) {
          setRecord(data);
          setLoading(false);
          return;
        }
      } catch {
        // Continue to slug matching
      }

      // Check fallback records
      const normalized = (recordId || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (normalized.includes('muhyiddin') || normalized.includes('am-0311')) {
        setRecord({
          id: recordId,
          titleLatin: 'Muḥyiddīn Mālā',
          titleArabic: 'محي الدين مالا',
          subtitle: 'Foundational 17th-century Arabi-Malayalam devotional poem',
          authors: ['Qāḍī Muḥammad b. ʿAbd al-ʿAzīz al-Kālikūtī'],
          shelfmark: 'AM 0311',
          callNumber: '894.812 QAD-M',
          isbn: 'N/A (Lithograph Edition)',
          format: 'ARABI_MALAYALAM_PRINT',
          language: 'Arabi-Malayalam',
          material: 'Machine-milled rag paper, black lithographic ink',
          extent: '32 folios, 19 x 13 cm',
          originDate: '1016 AH / 1607 CE',
          originPlace: 'Ponnāni / Calicut',
          provenance: 'Ponnāni Press Collection, deposited 1989',
          summary: 'The classical Arabi-Malayalam liturgical hymn celebrating Shaykh ʿAbd al-Qādir al-Jīlānī.',
          subjects: ['Sufi Poetry', 'Arabi-Malayalam Literature', 'Malabar Liturgy'],
          accessLevel: 'DIGITISED_FULL',
          iiifManifestUrl: 'https://api.kmlri.in/iiif/manifest/am-0311.json',
          items: [
            { id: 'item-201', copyNumber: 1, barcode: 'AM0311-01', rfidTag: 'E280117000000311', location: 'Rare Print Vault Shelf 2', status: 'AVAILABLE' },
            { id: 'item-202', copyNumber: 2, barcode: 'AM0311-02', rfidTag: 'E280117000000312', location: 'Reserve Stack', status: 'AVAILABLE' },
          ],
        });
      } else if (normalized.includes('tuhfat') || normalized.includes('rb-0908') || normalized.includes('mujahid')) {
        setRecord({
          id: recordId,
          titleLatin: 'Tuḥfat al-Mujāhidīn fī Baʿḍ Akhbār al-Purtuk͟hālīyīn',
          titleArabic: 'تحفة المجاهدين في بعض أخبار البرتغاليين',
          subtitle: '16th-century naval resistance chronicle against Portuguese maritime blockades',
          authors: ['Shaykh Zayn al-Dīn al-Makhdūm II'],
          shelfmark: 'RB 0908',
          callNumber: '954.83 ZAY-T',
          isbn: '978-81-948123-4-5',
          format: 'RARE_BOOK',
          language: 'Arabic with Latin commentary',
          material: 'Hand-sewn octavo with marbled endpapers',
          extent: '184 pages, 24 x 16 cm',
          originDate: '1833 CE (Latin Edition)',
          originPlace: 'Lisbon / London Orientalia Press',
          provenance: 'Purchased from Orientalia Auction, 1992',
          summary: 'The primary historical work chronicling the anti-colonial struggle along the Malabar Coast.',
          subjects: ['Malabar History', 'Portuguese Conflict', 'Indian Ocean Historiography'],
          accessLevel: 'READING_ROOM_ONLY',
          iiifManifestUrl: 'https://api.kmlri.in/iiif/manifest/rb-0908.json',
          items: [
            { id: 'item-301', copyNumber: 1, barcode: 'RB0908-01', rfidTag: 'E280117000000908', location: 'Rare Book Stack C', status: 'AVAILABLE' },
            { id: 'item-302', copyNumber: 2, barcode: 'RB0908-02', rfidTag: 'E280117000000909', location: 'Reading Room Reserve', status: 'AVAILABLE' },
            { id: 'item-303', copyNumber: 3, barcode: 'RB0908-03', rfidTag: 'E280117000000910', location: 'Reading Room Reserve', status: 'CHECKED_OUT', borrower: 'Prof. K. A. Najeeb (MEM-1004)', dueDate: '14 Sep 2026' },
          ],
        });
      } else {
        // Default Bayān al-Fawāʾid
        setRecord({
          id: recordId,
          titleLatin: 'Bayān al-Fawāʾid fī Sharḥ al-Qawāʿid',
          titleArabic: 'بيان الفوائد في شرح القواعد',
          subtitle: 'Comprehensive Malabar commentary on Shāfiʿī principles',
          authors: ['Aḥmad b. Muḥammad al-Ponnānī', 'Scribe: Zayn al-Dīn al-Kātib'],
          shelfmark: 'MS 0142',
          callNumber: '297.14 PON-B',
          isbn: 'N/A (Archival Manuscript)',
          format: 'MANUSCRIPT',
          language: 'Arabic with Arabi-Malayalam marginalia',
          material: 'Handmade Italian watermarked laid paper with Tre Lune watermark',
          extent: '186 folios, 21 lines per page, 26 x 19 cm',
          originDate: '1182 AH / 1768 CE',
          originPlace: 'Ponnāni Juma Masjid Ribāṭ',
          provenance: 'Acquired from Makhdūm family private repository in 1984',
          summary: 'An exceptional 18th-century manuscript treatise detailing maritime jurisprudence, coastal trade contracts, and customary endowment laws prevalent along the Malabar Coast.',
          subjects: ['Islamic Jurisprudence', 'Malabar Maritime Trade', 'Arabi-Malayalam Manuscripts', 'Waqf Endowments'],
          accessLevel: 'DIGITISED_FULL',
          iiifManifestUrl: 'https://api.kmlri.in/iiif/manifest/ms-0142.json',
          items: [
            { id: 'item-101', copyNumber: 1, barcode: 'MS0142-01', rfidTag: 'E280117000000214', location: 'Manuscript Vault Box 14', status: 'AVAILABLE' },
            { id: 'item-102', copyNumber: 2, barcode: 'MS0142-02', rfidTag: 'E280117000000215', location: 'Reading Room Reserve Desk', status: 'CHECKED_OUT', borrower: 'Dr. Naseer (MEM-2231)', dueDate: '10 Sep 2026' },
            { id: 'item-103', copyNumber: 3, barcode: 'MS0142-03', rfidTag: 'E280117000000216', location: 'Hold Shelf A1', status: 'RESERVED', holdFor: 'K. Ahmed (MEM-0942)' },
            { id: 'item-104', copyNumber: 4, barcode: 'MS0142-04', rfidTag: 'E280117000000217', location: 'Conservation Lab', status: 'DAMAGED_IN_CONSERVATION' },
          ],
        });
      }
      setLoading(false);
    }
    loadRecord();
  }, [recordId]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarcode) return;
    const newItem = {
      id: `item-${Date.now()}`,
      copyNumber: (record.items?.length || 0) + 1,
      barcode: newBarcode,
      rfidTag: newRfid || `RFID-${Date.now().toString().slice(-6)}`,
      location: newLocation,
      status: newStatus,
    };
    setRecord({
      ...record,
      items: [...(record.items || []), newItem],
    });
    setNotification(`Item Copy "${newBarcode}" added to record.`);
    setShowAddItemModal(false);
    setNewBarcode('');
    setNewRfid('');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStatusChange = (itemId: string, nextStatus: string) => {
    const updated = record.items.map((it: any) =>
      it.id === itemId ? { ...it, status: nextStatus } : it
    );
    setRecord({ ...record, items: updated });
    setNotification(`Item status updated to ${nextStatus}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  if (!record) return null;

  const items = record.items || [];
  const totalCount = items.length;
  const availableCount = items.filter((i: any) => i.status === 'AVAILABLE').length;
  const checkedOutCount = items.filter((i: any) => i.status === 'CHECKED_OUT').length;
  const reservedCount = items.filter((i: any) => i.status === 'RESERVED').length;
  const lostOrDamagedCount = items.filter((i: any) => i.status === 'DAMAGED_IN_CONSERVATION' || i.status === 'LOST').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      {/* Top Back Link */}
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
            onClick={() => window.print()}
            className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Catalogue Slip</span>
          </button>
          <Button variant="primary" icon={Plus} onClick={() => {
            setNewBarcode(`${record.shelfmark.replace(/\s+/g, '')}-0${(record.items?.length || 0) + 1}`);
            setShowAddItemModal(true);
          }}>
            Add Item Copy
          </Button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Record Title Banner */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5 rounded">
                {record.shelfmark}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#A52307] text-white px-2 py-0.5 rounded">
                {record.format}
              </span>
              <span className="text-[10px] font-semibold uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {record.accessLevel}
              </span>
            </div>
            <h1 className="font-amiri text-3xl font-bold text-gray-900 leading-tight">
              {record.titleLatin}
            </h1>
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
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Checked Out</span>
              <span className="text-xl font-bold text-blue-700 mt-0.5 block">{checkedOutCount}</span>
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
          <h3 className="font-bold text-gray-900 text-sm border-b border-[#E2E0DB] pb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#A52307]" />
            <span>Bibliographic Metadata</span>
          </h3>

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
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Date of Origin</span>
            <span className="text-gray-900 font-mono mt-0.5 block">{record.originDate || 'N/A'}</span>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] block">Place of Origin &amp; Scribe</span>
            <span className="text-gray-900 mt-0.5 block">{record.originPlace || 'N/A'}</span>
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
              <span>Physical &amp; Digital Item Copies ({items.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setNewBarcode(`${record.shelfmark.replace(/\s+/g, '')}-0${(record.items?.length || 0) + 1}`);
                setShowAddItemModal(true);
              }}
              className="text-xs font-bold text-[#A52307] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Item Copy</span>
            </button>
          </div>

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
              {items.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-3 font-mono font-bold text-gray-900">
                    Copy #{item.copyNumber}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-gray-900">
                    {item.barcode}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-gray-500 text-[11px]">
                    {item.rfidTag}
                  </td>
                  <td className="py-3.5 px-3 text-gray-700">
                    {item.location}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'CHECKED_OUT'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'RESERVED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    {item.borrower && (
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Due: {item.dueDate}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-[11px] bg-white text-gray-700 outline-none"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="CHECKED_OUT">Checked Out</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="DAMAGED_IN_CONSERVATION">In Conservation</option>
                      <option value="LOST">Lost</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
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
                <label className="block font-bold text-gray-700 uppercase mb-1">Shelf Location*</label>
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
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="CHECKED_OUT">Checked Out</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="DAMAGED_IN_CONSERVATION">In Conservation</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors"
                >
                  Add Item Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
