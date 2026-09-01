'use client';

import { useState } from 'react';
import { Boxes, Search, Scan, CheckCircle2, AlertTriangle, Play, RefreshCw, Printer, ArrowRight } from 'lucide-react';
import { Badge, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';

export default function InventoryAdminPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'scan' | 'discrepancies' | 'withdrawn'>('sessions');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const inventorySessions = [
    {
      id: 'INV-2026-01',
      name: 'Manuscript Vault Annual Stocktake',
      section: 'Vault Section A-F',
      totalExpected: 1240,
      scannedCount: 1238,
      missingCount: 2,
      misplacedCount: 4,
      status: 'IN_PROGRESS',
      startDate: '25 Aug 2026',
    },
    {
      id: 'INV-2026-02',
      name: 'Rare Book Reading Room Audit',
      section: 'Reading Room Racks 1-12',
      totalExpected: 2100,
      scannedCount: 2100,
      missingCount: 0,
      misplacedCount: 0,
      status: 'COMPLETED',
      startDate: '10 Aug 2026',
    },
  ];

  const discrepancies = [
    {
      barcode: 'MS0142-02',
      title: 'Bayān al-Fawāʾid (Duplicate Folio)',
      shelfmark: 'MS 0142',
      expectedShelf: 'Vault Rack 3, Shelf B',
      currentLocation: 'Misplaced in Rare Books Rack 1',
      status: 'MISPLACED',
      reportedDate: '29 Aug 2026',
    },
    {
      barcode: 'RB0411-01',
      title: 'Voyage to Cochin (1884 Translation)',
      shelfmark: 'RB 0411',
      expectedShelf: 'Rare Book Stack 2',
      currentLocation: 'Unaccounted / Missing from stack',
      status: 'MISSING',
      reportedDate: '26 Aug 2026',
    },
  ];

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    setScannedItems([barcodeInput, ...scannedItems]);
    setNotification(`Scanned copy [${barcodeInput}] verified against shelf inventory.`);
    setBarcodeInput('');
    setTimeout(() => setNotification(null), 3000);
  };

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'sessions', label: 'Audit Sessions' },
    { key: 'scan', label: 'Rapid Shelf Scanner' },
    { key: 'discrepancies', label: 'Discrepancies & Missing (6)' },
  ];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Stock Verification & Shelf Control"
        title="Inventory & Shelf Auditing"
        description="Conduct inventory stocktaking sessions, scan shelf barcodes & RFID tags, identify misplaced copies, and generate reconciliation reports."
        actions={
          <Button
            variant="primary"
            icon={Play}
            onClick={() => {
              setNotification('New Inventory Audit Session initialized.');
              setTimeout(() => setNotification(null), 3000);
            }}
          >
            Start New Audit Session
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatCard label="Total Physical Copies" value="6,240" hint="Registered in catalog" />
        <StatCard label="Audited This Year" value="99.2%" hint="6,190 verified copies" hintTone="positive" />
        <StatCard label="Misplaced Items" value="4 Items" hint="Found on wrong shelves" hintTone="warning" />
        <StatCard label="Missing / Lost" value="2 Items" hint="Under active investigation" hintTone="negative" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sessions' && (
        <Card className="overflow-x-auto" padded={false}>
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] tracking-wide">
                <th className="py-3 px-5 font-semibold">Session ID</th>
                <th className="py-3 px-3 font-semibold">Session Name &amp; Stacks</th>
                <th className="py-3 px-3 font-semibold">Progress</th>
                <th className="py-3 px-3 font-semibold">Scanned / Expected</th>
                <th className="py-3 px-3 font-semibold">Discrepancies</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventorySessions.map((s) => {
                const percent = Math.round((s.scannedCount / s.totalExpected) * 100);
                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3.5 px-5 font-mono font-semibold text-gray-900">{s.id}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-sm text-gray-900">{s.name}</div>
                      <div className="text-gray-400 text-[11px]">{s.section} · Started {s.startDate}</div>
                    </td>
                    <td className="py-3.5 px-3 w-36">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gray-900 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">{percent}% Completed</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-gray-900">
                      {s.scannedCount} / {s.totalExpected}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-heritage-red font-semibold">{s.missingCount} Missing</span> ·{' '}
                      <span className="text-amber-700 font-semibold">{s.misplacedCount} Misplaced</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant={s.status === 'COMPLETED' ? 'success' : 'warning'}>{s.status}</Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Button variant="dark" onClick={() => setActiveTab('scan')}>
                        Resume Scan
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'scan' && (
        <Card className="space-y-6">
          <form onSubmit={handleScanSubmit} className="max-w-xl">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Continuous Shelf Scanner (Barcode or RFID Tag)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Scan copy barcode (e.g. MS0142-01)..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-9 pr-3 border border-gray-200 h-10 text-sm rounded-lg outline-none font-mono focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
                  autoFocus
                />
              </div>
              <Button type="submit" variant="dark">
                Verify
              </Button>
            </div>
          </form>

          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-900">Scanned in Current Session ({scannedItems.length})</h4>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
              {scannedItems.length === 0 ? (
                <span className="text-gray-400 font-sans italic">Ready for barcode scanner input...</span>
              ) : (
                scannedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-gray-700 bg-white p-1.5 rounded border border-gray-200">
                    <span>{item}</span>
                    <span className="text-emerald-700 font-sans font-semibold text-[10px]">SHELF VERIFIED</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'discrepancies' && (
        <Card className="overflow-x-auto" padded={false}>
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] tracking-wide">
                <th className="py-3 px-5 font-semibold">Barcode &amp; Shelfmark</th>
                <th className="py-3 px-3 font-semibold">Item Title</th>
                <th className="py-3 px-3 font-semibold">Expected Shelf</th>
                <th className="py-3 px-3 font-semibold">Detected Status</th>
                <th className="py-3 px-5 font-semibold text-right">Resolution</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((d) => (
                <tr key={d.barcode} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3.5 px-5 font-mono font-semibold text-gray-900">{d.barcode}</td>
                  <td className="py-3.5 px-3 font-semibold text-sm text-gray-900">{d.title}</td>
                  <td className="py-3.5 px-3 text-gray-500">{d.expectedShelf}</td>
                  <td className="py-3.5 px-3">
                    <Badge variant={d.status === 'MISSING' ? 'danger' : 'warning'}>
                      {d.status}: {d.currentLocation}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Button variant="dark" onClick={() => alert(`Marked ${d.barcode} as reconciled on expected shelf.`)}>
                      Resolve Shelfmark
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
