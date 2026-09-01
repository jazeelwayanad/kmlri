'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  Printer, 
  X, 
  AlertCircle, 
  DollarSign,
  Receipt,
  User,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

interface FineItem {
  id: string;
  patron: string;
  membershipNumber: string;
  item: string;
  totalAmount: number;
  remainingAmount: number;
  paidAmount: number;
  reason: string;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  date: string;
  paymentMethod?: string;
  lastPaymentDate?: string;
}

export default function CirculationFinesPage() {
  const [fines, setFines] = useState<FineItem[]>([
    {
      id: 'FIN-101',
      patron: 'R. Naseer',
      membershipNumber: 'MEM-2231',
      item: 'Fatḥ al-Muʿīn (MS0142-01)',
      totalAmount: 80,
      remainingAmount: 80,
      paidAmount: 0,
      reason: 'Overdue Loan (8 days @ ₹10/day)',
      status: 'UNPAID',
      date: '01 Sep 2026',
    },
    {
      id: 'FIN-102',
      patron: 'S. Fathima',
      membershipNumber: 'MEM-1187',
      item: 'Al-Bayān Monthly Vol. 3',
      totalAmount: 40,
      remainingAmount: 0,
      paidAmount: 40,
      reason: 'Late Return Fine',
      status: 'PAID',
      date: '31 Aug 2026',
      paymentMethod: 'UPI / QR',
      lastPaymentDate: '31 Aug 2026',
    },
    {
      id: 'FIN-103',
      patron: 'Rashid Vattaparamba',
      membershipNumber: 'KMLRI-2026-0001',
      item: 'Tuḥfat al-Mujāhidīn (RB0908-01)',
      totalAmount: 100,
      remainingAmount: 60,
      paidAmount: 40,
      reason: 'Overdue Loan (10 days)',
      status: 'PARTIALLY_PAID',
      date: '28 Aug 2026',
      paymentMethod: 'Cash',
      lastPaymentDate: '29 Aug 2026',
    },
    {
      id: 'FIN-104',
      patron: 'Dr. Tariq al-Omani',
      membershipNumber: 'MEM-0942',
      item: 'Reading Room Rare Codex Slip',
      totalAmount: 150,
      remainingAmount: 0,
      paidAmount: 150,
      reason: 'Special Preservation Lab Handling Fee',
      status: 'PAID',
      date: '25 Aug 2026',
      paymentMethod: 'Credit Card',
      lastPaymentDate: '25 Aug 2026',
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  // Settlement Modal State
  const [activeSettlementFine, setActiveSettlementFine] = useState<FineItem | null>(null);
  const [payingAmount, setPayingAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'WAIVER'>('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const openSettlementModal = (fine: FineItem) => {
    setActiveSettlementFine(fine);
    setPayingAmount(fine.remainingAmount);
    setPaymentMethod('UPI');
    setPaymentNotes('');
  };

  const handleProcessSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSettlementFine) return;
    if (payingAmount <= 0) {
      alert('Please enter a valid payment amount greater than ₹0.');
      return;
    }
    if (payingAmount > activeSettlementFine.remainingAmount) {
      alert(`Amount cannot exceed the remaining balance of ₹${activeSettlementFine.remainingAmount}.`);
      return;
    }

    setIsProcessing(true);

    const newRemaining = activeSettlementFine.remainingAmount - payingAmount;
    const newPaid = activeSettlementFine.paidAmount + payingAmount;
    const newStatus: 'PAID' | 'PARTIALLY_PAID' = newRemaining === 0 ? 'PAID' : 'PARTIALLY_PAID';

    setFines(
      fines.map((f) => {
        if (f.id === activeSettlementFine.id) {
          return {
            ...f,
            remainingAmount: newRemaining,
            paidAmount: newPaid,
            status: newStatus,
            paymentMethod: paymentMethod === 'UPI' ? 'UPI / QR' : paymentMethod === 'CASH' ? 'Cash' : paymentMethod === 'CARD' ? 'Card' : 'Fee Waiver',
            lastPaymentDate: 'Today (Just now)',
          };
        }
        return f;
      })
    );

    setIsProcessing(false);
    setActiveSettlementFine(null);

    if (newStatus === 'PAID') {
      setNotification(`Fine #${activeSettlementFine.id} has been fully settled (Paid ₹${payingAmount}).`);
    } else {
      setNotification(`Partial payment of ₹${payingAmount} recorded for #${activeSettlementFine.id}. Remaining balance: ₹${newRemaining}.`);
    }

    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = fines.filter((f) => {
    const matchesSearch =
      f.patron.toLowerCase().includes(search.toLowerCase()) ||
      f.item.toLowerCase().includes(search.toLowerCase()) ||
      f.membershipNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'UNPAID' && (f.status === 'UNPAID' || f.status === 'PARTIALLY_PAID')) ||
      f.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = fines.reduce((acc, cur) => acc + cur.remainingAmount, 0);
  const totalCollected = fines.reduce((acc, cur) => acc + cur.paidAmount, 0);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Circulation · Cashier Ledger"
        title="Fines &amp; Cashier Payments"
        description="Record overdue penalties, damaged item replacement fees, and process full or partial cashier settlements."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Unpaid Balance</span>
          <span className="text-2xl font-mono font-bold text-[#A52307] mt-1 block">
            ₹{totalOutstanding}
          </span>
          <span className="text-[11px] text-gray-500">Across active members</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Collections Recorded</span>
          <span className="text-2xl font-mono font-bold text-emerald-700 mt-1 block">
            ₹{totalCollected}
          </span>
          <span className="text-[11px] text-emerald-600">Settled via Cashier Desk</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Fine Records</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{fines.length}</span>
          <span className="text-[11px] text-gray-500">
            {fines.filter((f) => f.status === 'PAID').length} fully settled · {fines.filter((f) => f.status === 'PARTIALLY_PAID').length} partial
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search fines by patron, ID, or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
          >
            <option value="ALL">All Fine Statuses</option>
            <option value="UNPAID">Outstanding (Unpaid &amp; Partial)</option>
            <option value="PARTIALLY_PAID">Partially Paid Only</option>
            <option value="PAID">Fully Settled Only</option>
          </select>
        </div>
      </div>

      {/* Fines Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Fine ID</th>
              <th className="py-3 px-4">Patron Details</th>
              <th className="py-3 px-4">Item &amp; Assessment Reason</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Paid / Balance Due</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Cashier Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((f) => (
              <tr key={f.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{f.id}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-gray-900 block">{f.patron}</span>
                  <span className="font-mono text-[11px] text-gray-500">{f.membershipNumber}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-gray-900 block">{f.item}</span>
                  <span className="text-gray-500 text-[11px]">{f.reason} · {f.date}</span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900 text-sm">
                  ₹{f.totalAmount}
                </td>
                <td className="py-3.5 px-4 font-mono">
                  {f.status === 'PAID' ? (
                    <div>
                      <span className="text-emerald-700 font-bold block">Paid: ₹{f.paidAmount}</span>
                      <span className="text-gray-400 text-[10px]">Balance: ₹0</span>
                    </div>
                  ) : f.status === 'PARTIALLY_PAID' ? (
                    <div>
                      <span className="text-[#A52307] font-bold block">Due: ₹{f.remainingAmount}</span>
                      <span className="text-gray-500 text-[10px]">Paid so far: ₹{f.paidAmount}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[#A52307] font-bold block">Due: ₹{f.remainingAmount}</span>
                      <span className="text-gray-400 text-[10px]">Unpaid</span>
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      f.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : f.status === 'PARTIALLY_PAID'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {f.status === 'PARTIALLY_PAID' ? `Partially Paid (₹${f.paidAmount})` : f.status}
                  </span>
                  {f.paymentMethod && (
                    <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                      via {f.paymentMethod}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {/* If fine is UNPAID or PARTIALLY_PAID, ALWAYS show the Settle button */}
                  {f.status !== 'PAID' ? (
                    <button
                      type="button"
                      onClick={() => openSettlementModal(f)}
                      className="px-3 py-1.5 bg-[#A52307] text-white rounded text-[11px] font-bold hover:bg-red-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{f.status === 'PARTIALLY_PAID' ? 'Settle Fine' : 'Settle Fine'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-emerald-700 font-semibold text-[11px]">✓ Settled</span>
                      <button
                        type="button"
                        onClick={() => alert(`Printing receipt for fine #${f.id} (Paid: ₹${f.paidAmount})`)}
                        className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
                        title="Print Payment Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL: Settle Fine (Full or Partial Amount) */}
      {activeSettlementFine && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-50 text-[#A52307] border border-red-100 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Settle Fine · Cashier Desk</h3>
                  <span className="text-[11px] text-gray-500 font-mono">{activeSettlementFine.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSettlementFine(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleProcessSettlement} className="p-6 space-y-5 text-xs font-sans">
              
              {/* Fine Details Breakdown Card */}
              <div className="bg-[#FAF8F5] p-3.5 rounded border border-[#E2E0DB] space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">{activeSettlementFine.patron}</span>
                    <span className="text-gray-500 font-mono text-[11px]">{activeSettlementFine.membershipNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-gray-500 block">Total Fine</span>
                    <span className="font-mono font-bold text-gray-900 text-sm">₹{activeSettlementFine.totalAmount}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E0DB] grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-500 block">Item / Reason:</span>
                    <span className="font-semibold text-gray-800 line-clamp-1">{activeSettlementFine.item}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 block">Current Balance Due:</span>
                    <strong className="text-[#A52307] font-mono text-sm">₹{activeSettlementFine.remainingAmount}</strong>
                  </div>
                </div>
              </div>

              {/* Settlement Amount Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-gray-800 text-xs">
                    Amount to Settle Now (₹) <span className="text-[#A52307]">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPayingAmount(activeSettlementFine.remainingAmount)}
                      className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-[10px] font-bold hover:bg-black hover:text-white transition-colors"
                    >
                      Pay Full (₹{activeSettlementFine.remainingAmount})
                    </button>
                    {activeSettlementFine.remainingAmount > 20 && (
                      <button
                        type="button"
                        onClick={() => setPayingAmount(Math.floor(activeSettlementFine.remainingAmount / 2))}
                        className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-[10px] font-bold hover:bg-black hover:text-white transition-colors"
                      >
                        Pay 50% (₹{Math.floor(activeSettlementFine.remainingAmount / 2)})
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-mono text-gray-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={activeSettlementFine.remainingAmount}
                    value={payingAmount}
                    onChange={(e) => setPayingAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-300 rounded font-mono font-bold text-gray-900 text-base focus:border-[#A52307] outline-none"
                    autoFocus
                    required
                  />
                </div>

                {payingAmount < activeSettlementFine.remainingAmount && payingAmount > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Partial Settlement:</strong> A remaining balance of{' '}
                      <strong>₹{activeSettlementFine.remainingAmount - payingAmount}</strong> will stay on this patron's account and the <strong>Settle button</strong> will remain active.
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 text-xs">Payment Tender / Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR' },
                    { id: 'CASH', label: 'Cash Desk' },
                    { id: 'CARD', label: 'Credit/Debit' },
                    { id: 'WAIVER', label: 'Authorized Waiver' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2 px-2 border rounded text-[11px] font-bold text-center transition-colors cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Receipt Notes / Reference */}
              <div className="space-y-1">
                <label className="font-bold text-gray-800 text-xs">Receipt Reference / Remarks (Optional)</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. UPI Ref: 981240129481 or Cashier Receipt #442..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setActiveSettlementFine(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || payingAmount <= 0}
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>
                    Confirm Settlement (₹{payingAmount})
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
