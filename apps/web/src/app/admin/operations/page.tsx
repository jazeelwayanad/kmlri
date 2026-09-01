'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  BookOpenCheck,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Bookmark,
  Search,
  AlertCircle,
  CheckCircle2,
  Scan,
  Radio,
  UserCheck,
  Clock,
  Boxes,
  ShoppingBag,
  Printer
} from 'lucide-react';
import { Badge, PageHeader, Button, StatCard, Card } from '@/components/admin/ui';

export default function LibraryOperationsPage() {
  const [activeTab, setActiveTab] = useState<'issue' | 'return' | 'renew' | 'lookup' | 'rfid'>('issue');
  const [barcode, setBarcode] = useState('');
  const [patronId, setPatronId] = useState('');
  const [duration, setDuration] = useState(14);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rfidActive, setRfidActive] = useState(false);

  // Mock operational queues
  const todayStats = {
    todayLoans: 42,
    todayReturns: 38,
    overdueAlerts: 14,
    pendingReservations: 28,
    acquisitionReqs: 6,
    inventoryAlerts: 3,
  };

  const recentTransactions = [
    { id: 'TX-901', time: '10:45 AM', type: 'ISSUE', patron: 'Rashid Vattaparamba (KMLRI-2026-0001)', item: 'Fatḥ al-Muʿīn (MS 0142)', due: '15 Sep 2026' },
    { id: 'TX-902', time: '10:30 AM', type: 'RETURN', patron: 'Amina Sabeelul (KMLRI-2026-0002)', item: 'Muḥyiddīn Mālā (AM 0311)', fine: '₹0' },
    { id: 'TX-903', time: '09:55 AM', type: 'RENEW', patron: 'Dr. Taha Malabari (KMLRI-2026-0004)', item: 'Tuḥfat al-Mujāhidīn (RB 0908)', due: '30 Sep 2026' },
    { id: 'TX-904', time: '09:20 AM', type: 'HOLD_READY', patron: 'Farooq K. (KMLRI-2026-0012)', item: 'Arabi-Malayalam Chronicle (AM 0089)', shelf: 'Hold Shelf B2' },
  ];

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !patronId) return;
    setMessage({
      type: 'success',
      text: `Item [${barcode}] issued to patron [${patronId}] for ${duration} days successfully. Receipt sent via SMS & In-App.`,
    });
    setBarcode('');
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;
    setMessage({
      type: 'success',
      text: `Item [${barcode}] returned in good condition. Shelfmark location: Archive Rack 4-B. RFID tag updated.`,
    });
    setBarcode('');
  };

  const tabs: { key: typeof activeTab; label: string; icon: typeof ArrowUpRight }[] = [
    { key: 'issue', label: 'Issue Item (Check-Out)', icon: ArrowUpRight },
    { key: 'return', label: 'Return Item (Check-In)', icon: ArrowDownLeft },
    { key: 'renew', label: 'Item Renewal', icon: RotateCcw },
    { key: 'lookup', label: 'Member Quick Lookup', icon: UserCheck },
    { key: 'rfid', label: 'Barcode & RFID Workbench', icon: Scan },
  ];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Page Header */}
      <PageHeader
        eyebrow="Daily Library Workbench"
        title="Library Operations Desk"
        description="Centralized operational console for daily desk transactions, rapid barcode scanning, RFID verification, and alerts."
        actions={
          <button
            type="button"
            onClick={() => setRfidActive(!rfidActive)}
            className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors border ${
              rfidActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${rfidActive ? 'animate-pulse text-emerald-600' : 'text-gray-400'}`} />
            <span>{rfidActive ? 'RFID Reader Active (Port 4)' : 'Enable RFID Scanner'}</span>
          </button>
        }
      />

      {/* Today's KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Today's Loans" value={todayStats.todayLoans} hint="Checked out" hintTone="positive" />
        <StatCard label="Today's Returns" value={todayStats.todayReturns} hint="Shelved back" />
        <StatCard label="Overdue Alerts" value={todayStats.overdueAlerts} hint="Late patrons" hintTone="negative" />
        <StatCard label="Reservations" value={todayStats.pendingReservations} hint="Holds waiting" hintTone="warning" />
        <StatCard label="Acquisition Reqs" value={todayStats.acquisitionReqs} hint="New purchase" />
        <StatCard label="Inventory Alerts" value={todayStats.inventoryAlerts} hint="Shelf audits" />
      </div>

      {message && (
        <div className={`p-4 border rounded-lg flex items-center gap-3 text-sm font-semibold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Operations Interactive Workstation */}
      <Card>
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setActiveTab(tab.key); setMessage(null); }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab.key ? 'bg-heritage-red text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'issue' && (
          <form onSubmit={handleIssueSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Item Barcode / RFID Tag*
              </label>
              <div className="relative">
                <Scan className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Scan barcode or type MS0142-01"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full pl-9 pr-3 border border-gray-200 h-10 text-sm rounded-lg outline-none font-mono focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Patron Membership ID / Email*
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="KMLRI-2026-0001 or email"
                  value={patronId}
                  onChange={(e) => setPatronId(e.target.value)}
                  className="w-full pl-9 pr-3 border border-gray-200 h-10 text-sm rounded-lg outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Loan Period Tier
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-gray-200 h-10 px-3 text-sm rounded-lg outline-none bg-white focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
              >
                <option value={7}>7 Days (Reserve / Periodicals)</option>
                <option value={14}>14 Days (Standard Student Loan)</option>
                <option value={30}>30 Days (Faculty / Research Fellowship)</option>
                <option value={60}>60 Days (Extended Thesis Research)</option>
              </select>
            </div>
            <div className="col-span-full pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-xs font-semibold px-5 h-10 rounded-lg bg-heritage-red text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                Complete Check-Out &amp; Print Slip
              </button>
            </div>
          </form>
        )}

        {activeTab === 'return' && (
          <form onSubmit={handleReturnSubmit} className="max-w-md space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Scan Item Barcode / RFID Tag
              </label>
              <div className="relative">
                <Scan className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Scan barcode (e.g. RB0908-01)"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full pl-9 pr-3 border border-gray-200 h-10 text-sm rounded-lg outline-none font-mono focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
                  autoFocus
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-xs font-semibold px-5 h-10 rounded-lg bg-heritage-red text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
            >
              Process Check-In &amp; Update Inventory
            </button>
          </form>
        )}

        {activeTab === 'renew' && (
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Scan Barcode or Enter Loan ID
              </label>
              <input
                type="text"
                placeholder="Scan barcode to renew..."
                className="w-full border border-gray-200 h-10 px-3 text-sm rounded-lg outline-none font-mono focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
              />
            </div>
            <button
              type="button"
              onClick={() => setMessage({ type: 'success', text: 'Item renewed for another 14 days. New due date: 29 Sep 2026.' })}
              className="inline-flex items-center gap-2 text-xs font-semibold px-5 h-10 rounded-lg bg-heritage-red text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
            >
              Apply Standard Renewal (+14 Days)
            </button>
          </div>
        )}

        {activeTab === 'lookup' && (
          <div className="space-y-4">
            <div className="max-w-lg">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Lookup Patron by Name, ID, or Barcode
              </label>
              <input
                type="text"
                placeholder="Type member ID, name, or swipe card..."
                className="w-full border border-gray-200 h-10 px-3 text-sm rounded-lg outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
              />
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg max-w-xl text-xs space-y-2">
              <div className="flex justify-between font-semibold text-sm text-gray-900">
                <span>Rashid Vattaparamba</span>
                <Badge variant="success">ACTIVE MEMBER</Badge>
              </div>
              <p className="text-gray-600">ID: KMLRI-2026-0001 · Department: Islamic Studies · Quota: 2/5 Books Loaned</p>
              <p className="text-gray-600">Outstanding Fines: <span className="font-semibold text-gray-900">₹0.00</span> · Active Holds: <span className="font-semibold text-gray-900">1</span></p>
            </div>
          </div>
        )}

        {activeTab === 'rfid' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-sm text-gray-900">RFID Antenna &amp; Barcode Gate Reader</h4>
              <p className="text-gray-600 mt-1">Multi-item high frequency antenna status: <span className="text-emerald-700 font-semibold">READY (4 Tags in field)</span></p>
              <div className="mt-3 space-y-1.5 font-mono">
                <div className="p-2 bg-white border border-gray-200 rounded-lg flex justify-between">
                  <span>TAG ID: E2801160600002100083B (Shelfmark: MS 0142)</span>
                  <span className="text-emerald-700 font-semibold font-sans">SECURITY: DISARMED</span>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded-lg flex justify-between">
                  <span>TAG ID: E2801160600002100083C (Shelfmark: RB 0908)</span>
                  <span className="text-emerald-700 font-semibold font-sans">SECURITY: DISARMED</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Real-Time Operational Log Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Today&apos;s Desk Activity Stream</h3>
            <p className="text-xs text-gray-500">Real-time log of issue, return, renewal, and hold fulfillment events.</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1.5 font-semibold text-gray-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Shift Log</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
                <th className="pb-3 pt-2 pl-2">Log ID &amp; Time</th>
                <th className="pb-3 pt-2">Operation</th>
                <th className="pb-3 pt-2">Patron</th>
                <th className="pb-3 pt-2">Item / Shelfmark</th>
                <th className="pb-3 pt-2">Details / Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pl-2 font-mono text-gray-600">
                    <span className="font-semibold text-gray-900">{tx.id}</span>
                    <span className="text-gray-400 block text-[11px]">{tx.time}</span>
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={
                        tx.type === 'ISSUE'
                          ? 'success'
                          : tx.type === 'RETURN'
                          ? 'info'
                          : tx.type === 'RENEW'
                          ? 'accent'
                          : 'warning'
                      }
                    >
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="py-3 font-medium text-gray-700">{tx.patron}</td>
                  <td className="py-3 font-semibold text-sm text-gray-900">{tx.item}</td>
                  <td className="py-3 text-gray-600">{tx.due || tx.fine || tx.shelf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
