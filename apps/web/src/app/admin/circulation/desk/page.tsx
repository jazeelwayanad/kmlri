'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Scan, 
  ArrowUpRight, 
  ArrowDownLeft, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Barcode,
  RotateCcw,
  Clock,
  Printer,
  Search,
  Check,
  CreditCard,
  Layers,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function CirculationDeskCheckinCheckoutPage() {
  const [activeTab, setActiveTab] = useState<'checkout' | 'checkin'>('checkout');
  
  // Checkout State
  const [patronSearch, setPatronSearch] = useState('KMLRI-2026-0001');
  const [selectedPatron, setSelectedPatron] = useState<any>({
    fullName: 'Rashid Vattaparamba',
    membershipNumber: 'KMLRI-2026-0001',
    role: 'RESEARCHER',
    maxBorrowLimit: 8,
    activeLoansCount: 2,
    unpaidFines: 80,
    status: 'ACTIVE',
    holdsWaiting: 1
  });
  const [checkoutBarcode, setCheckoutBarcode] = useState('');
  const [checkoutDays, setCheckoutDays] = useState(21);
  const [cart, setCart] = useState<any[]>([]);

  // Checkin State
  const [checkinBarcode, setCheckinBarcode] = useState('');
  const [checkinCondition, setCheckinCondition] = useState('GOOD');
  const [recentReturns, setRecentReturns] = useState<any[]>([
    {
      id: 'RET-01',
      barcode: 'MS0140-01',
      title: 'Fatḥ al-Muʿīn Vol. 1',
      patron: 'Rashid Vattaparamba',
      returnTime: 'Just now',
      condition: 'GOOD',
      fineAssessed: 0,
      routing: 'Return to Manuscript Vault Box 14'
    }
  ]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string; action?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePatronSelect = (memNumber: string) => {
    setPatronSearch(memNumber);
    if (memNumber === 'MEM-2231') {
      setSelectedPatron({
        fullName: 'Dr. R. Naseer',
        membershipNumber: 'MEM-2231',
        role: 'FACULTY',
        maxBorrowLimit: 12,
        activeLoansCount: 1,
        unpaidFines: 0,
        status: 'ACTIVE',
        holdsWaiting: 0
      });
      setCheckoutDays(30);
    } else if (memNumber === 'MEM-1187') {
      setSelectedPatron({
        fullName: 'S. Fathima',
        membershipNumber: 'MEM-1187',
        role: 'STUDENT',
        maxBorrowLimit: 5,
        activeLoansCount: 3,
        unpaidFines: 0,
        status: 'ACTIVE',
        holdsWaiting: 0
      });
      setCheckoutDays(14);
    } else {
      setSelectedPatron({
        fullName: 'Rashid Vattaparamba',
        membershipNumber: 'KMLRI-2026-0001',
        role: 'RESEARCHER',
        maxBorrowLimit: 8,
        activeLoansCount: 2,
        unpaidFines: 80,
        status: 'ACTIVE',
        holdsWaiting: 1
      });
      setCheckoutDays(21);
    }
  };

  const handleAddCheckoutItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutBarcode.trim()) return;
    
    let title = 'General Library Volume';
    let shelfmark = 'GEN-001';
    if (checkoutBarcode.toUpperCase().includes('MS0142')) {
      title = 'Bayān al-Fawāʾid';
      shelfmark = 'MS 0142';
    } else if (checkoutBarcode.toUpperCase().includes('RB0908')) {
      title = 'Tuḥfat al-Mujāhidīn (Latin Edition)';
      shelfmark = 'RB 0908';
    } else if (checkoutBarcode.toUpperCase().includes('AM0311')) {
      title = 'Muḥyiddīn Mālā Print';
      shelfmark = 'AM 0311';
    } else {
      title = `Volume (${checkoutBarcode.toUpperCase()})`;
      shelfmark = 'ACC-8891';
    }

    const newItem = {
      id: `ITEM-${Date.now()}`,
      barcode: checkoutBarcode.toUpperCase(),
      title,
      shelfmark,
      days: checkoutDays,
      dueDate: new Date(Date.now() + checkoutDays * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setCart([...cart, newItem]);
    setCheckoutBarcode('');
    setNotification({
      type: 'success',
      text: `Added "${title}" (${newItem.barcode}) to issue cart.`
    });
  };

  const handleFinalizeCheckout = () => {
    if (cart.length === 0) return;
    setNotification({
      type: 'success',
      text: `Successfully issued ${cart.length} volume(s) to ${selectedPatron.fullName}. Due dates recorded.`
    });
    setCart([]);
  };

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinBarcode.trim()) return;
    
    const bc = checkinBarcode.toUpperCase();
    let title = 'Returned Library Item';
    let patron = selectedPatron?.fullName || 'Rashid Vattaparamba';
    let fine = 0;
    let routing = 'Return to Stack 4 / Shelf B';

    if (bc.includes('RB0908')) {
      title = 'Tuḥfat al-Mujāhidīn (Latin Edition)';
      patron = 'Rashid Vattaparamba';
      fine = 80;
      routing = 'Hold Shelf A1 (Waiting for Dr. Tariq al-Omani)';
    } else if (bc.includes('MS0142')) {
      title = 'Bayān al-Fawāʾid';
      patron = 'Dr. Naseer';
      fine = 0;
      routing = 'Return to Manuscript Vault Box 14';
    } else if (bc.includes('AM0311')) {
      title = 'Muḥyiddīn Mālā Print';
      patron = 'S. Fathima';
      fine = 0;
      routing = 'Rare Print Vault Shelf 2';
    }

    const record = {
      id: `RET-${Date.now().toString().slice(-4)}`,
      barcode: bc,
      title,
      patron,
      returnTime: 'Just now',
      condition: checkinCondition,
      fineAssessed: fine,
      routing
    };

    setRecentReturns([record, ...recentReturns]);
    setCheckinBarcode('');
    setNotification({
      type: fine > 0 ? 'error' : 'success',
      text: `Check-in complete: "${title}". ${fine > 0 ? `Late Fine Assessed: ₹${fine}. ` : 'No late fines. '}Routing: ${routing}`
    });
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Circulation Desk"
        title="Check In &amp; Check Out Desk"
        description="High-throughput circulation scanning station. Switch between issue (Check Out) and return (Check In) modes."
        actions={
          <Button variant="outline" icon={RotateCcw} href="/admin/circulation">
            Circulation Overview
          </Button>
        }
      />

      {notification && (
        <div
          className={`p-4 border rounded-xl flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-700 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mode Switch Bar */}
      <div className="bg-white border border-[#E2E0DB] p-2 rounded-[2px] shadow-sm flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('checkout')}
          className={`flex-1 py-3 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'checkout'
              ? 'bg-black text-white shadow'
              : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-amber-400" />
          <span>Check Out Mode (Issue Items)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checkin')}
          className={`flex-1 py-3 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'checkin'
              ? 'bg-[#A52307] text-white shadow'
              : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-white" />
          <span>Check In Mode (Return Items)</span>
        </button>
      </div>

      {/* MODE 1: CHECK OUT (ISSUE ITEMS) */}
      {activeTab === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          
          {/* Left Column: Patron Verification Card */}
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#A52307]" />
                  <span>Step 1: Patron Lookup</span>
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {selectedPatron?.status}
                </span>
              </div>

              {/* Patron Search & Fast Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-700 block">Patron Membership ID / Barcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={patronSearch}
                    onChange={(e) => setPatronSearch(e.target.value)}
                    placeholder="Scan patron card..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handlePatronSelect(patronSearch)}
                    className="px-3 py-2 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307]"
                  >
                    Lookup
                  </button>
                </div>
              </div>

              {/* Quick Select Preset Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Quick Demo Patrons:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'KMLRI-2026-0001', name: 'Rashid (Researcher)' },
                    { id: 'MEM-2231', name: 'Dr. Naseer (Faculty)' },
                    { id: 'MEM-1187', name: 'S. Fathima (Student)' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePatronSelect(p.id)}
                      className={`px-2 py-1 border text-[10px] rounded font-mono transition-colors ${
                        selectedPatron?.membershipNumber === p.id
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-[#FAF8F5] text-gray-700 border-gray-300 hover:border-black'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patron Eligibility Summary Box */}
              {selectedPatron && (
                <div className="bg-[#FAF8F5] p-3.5 rounded border border-[#E2E0DB] space-y-2.5 text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{selectedPatron.fullName}</h4>
                    <span className="text-gray-500 font-mono text-[11px]">{selectedPatron.membershipNumber} · {selectedPatron.role}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E0DB] text-[11px]">
                    <div>
                      <span className="text-gray-500 block">Borrow Quota:</span>
                      <strong className="text-gray-900 font-mono font-bold">
                        {selectedPatron.activeLoansCount + cart.length} / {selectedPatron.maxBorrowLimit} Books
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Unpaid Fines:</span>
                      <strong className={`font-mono font-bold ${selectedPatron.unpaidFines > 0 ? 'text-[#A52307]' : 'text-emerald-700'}`}>
                        ₹{selectedPatron.unpaidFines}
                      </strong>
                    </div>
                  </div>

                  {selectedPatron.holdsWaiting > 0 && (
                    <div className="bg-amber-100 text-amber-900 p-2 rounded text-[11px] font-bold flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                      <span>1 Hold ready for pickup on Hold Shelf A1</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Barcode Scan & Issue Cart */}
          <div className="space-y-4">
            
            {/* Step 2: Item Barcode Scan */}
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-4">
              <div className="border-b border-[#E2E0DB] pb-2.5 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-[#A52307]" />
                  <span>Step 2: Scan Item Barcode &amp; Set Duration</span>
                </span>
                <span className="text-[11px] font-bold font-mono text-gray-500">
                  Loan Duration: {checkoutDays} Days
                </span>
              </div>

              <form onSubmit={handleAddCheckoutItem} className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Item Barcode / RFID Tag</label>
                  <input
                    type="text"
                    value={checkoutBarcode}
                    onChange={(e) => setCheckoutBarcode(e.target.value)}
                    placeholder="Scan MS0142-01 or RB0908-01..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Loan Period</label>
                  <select
                    value={checkoutDays}
                    onChange={(e) => setCheckoutDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-semibold bg-white text-gray-900 outline-none"
                  >
                    <option value="7">7 Days (Short)</option>
                    <option value="14">14 Days (Standard)</option>
                    <option value="21">21 Days (Research)</option>
                    <option value="30">30 Days (Faculty)</option>
                    <option value="60">60 Days (Semester)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors h-[38px]"
                  >
                    + Add Volume
                  </button>
                </div>
              </form>

              {/* Preset Sample Barcodes */}
              <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                <span className="font-bold">Test Barcodes:</span>
                <button
                  type="button"
                  onClick={() => setCheckoutBarcode('MS0142-01')}
                  className="underline hover:text-black font-mono"
                >
                  MS0142-01 (Bayān)
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setCheckoutBarcode('RB0908-01')}
                  className="underline hover:text-black font-mono"
                >
                  RB0908-01 (Tuḥfat)
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setCheckoutBarcode('AM0311-01')}
                  className="underline hover:text-black font-mono"
                >
                  AM0311-01 (Mālā)
                </button>
              </div>
            </div>

            {/* Step 3: Checkout Cart Table */}
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Items Queued for Issue ({cart.length})</h3>
                  <span className="text-xs text-gray-500">Volumes will be stamped with the respective return due date.</span>
                </div>

                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={handleFinalizeCheckout}
                    className="px-6 py-2 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete Issue ({cart.length})</span>
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-10 text-center text-gray-400 font-mono text-xs">
                  Scan an item barcode above to add books to this patron's issue session.
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-2.5 px-3">Volume Title &amp; Shelfmark</th>
                      <th className="py-2.5 px-3">Barcode</th>
                      <th className="py-2.5 px-3">Loan Days</th>
                      <th className="py-2.5 px-3">Calculated Due Date</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {cart.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-3">
                          <strong className="text-gray-900 block">{item.title}</strong>
                          <span className="font-mono text-gray-500 text-[11px]">{item.shelfmark}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-gray-900">{item.barcode}</td>
                        <td className="py-3 px-3 text-gray-700">{item.days} Days</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-800">{item.dueDate}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                            className="text-red-600 hover:underline text-[11px] font-bold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODE 2: CHECK IN (RETURN ITEMS) */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          
          {/* Checkin Scanner Input Card */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
            <div className="border-b border-[#E2E0DB] pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Scan className="w-5 h-5 text-[#A52307]" />
                <span>Rapid Return Scanning Station</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Scan returned barcodes or RFID tags. Overdue penalties and routing triggers calculate automatically.
              </p>
            </div>

            <form onSubmit={handleCheckinSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Scanned Item Barcode / Shelfmark</label>
                <input
                  type="text"
                  value={checkinBarcode}
                  onChange={(e) => setCheckinBarcode(e.target.value)}
                  placeholder="Scan returned book barcode (e.g. RB0908-01)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Condition Assessment</label>
                <select
                  value={checkinCondition}
                  onChange={(e) => setCheckinCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-semibold bg-white text-gray-900 outline-none"
                >
                  <option value="GOOD">Good / Intact</option>
                  <option value="MINOR_WEAR">Minor Wear</option>
                  <option value="DAMAGED">Damaged (Send to Lab)</option>
                  <option value="LOST_COVER">Missing Cover</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors h-[38px] flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Process Check-In</span>
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
              <span className="font-bold">Test Return Barcodes:</span>
              <button
                type="button"
                onClick={() => setCheckinBarcode('RB0908-01')}
                className="underline hover:text-black font-mono text-[#A52307]"
              >
                RB0908-01 (Overdue with Fine)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setCheckinBarcode('MS0142-01')}
                className="underline hover:text-black font-mono"
              >
                MS0142-01 (Standard Return)
              </button>
            </div>
          </div>

          {/* Session Returns Log */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
              <h3 className="text-base font-bold text-gray-900">Returns Processed in Current Session</h3>
              <span className="text-xs text-gray-500 font-mono">{recentReturns.length} volumes returned</span>
            </div>

            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                  <th className="py-3 px-3">Item Title &amp; Barcode</th>
                  <th className="py-3 px-3">Returning Patron</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Overdue Fine</th>
                  <th className="py-3 px-3">Re-Shelving / Hold Routing</th>
                  <th className="py-3 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEECE7]">
                {recentReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-3">
                      <strong className="text-gray-900 block">{ret.title}</strong>
                      <span className="font-mono text-gray-500 text-[11px]">{ret.barcode}</span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-gray-800">{ret.patron}</td>
                    <td className="py-3.5 px-3">
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {ret.condition}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {ret.fineAssessed > 0 ? (
                        <span className="font-mono font-bold text-[#A52307] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          ₹{ret.fineAssessed} (Cashier Due)
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">₹0 (On Time)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-gray-900">{ret.routing}</td>
                    <td className="py-3.5 px-3 text-right text-gray-500 font-mono">{ret.returnTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
