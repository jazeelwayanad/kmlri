'use client';

import { useState } from 'react';
import { CreditCard, Search, CheckCircle2, Plus, Printer, Receipt } from 'lucide-react';
import { Badge, BadgeVariant, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';

export default function FinesAndPaymentsPage() {
  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'PAID' | 'WAIVED'>('ALL');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const transactions = [
    {
      id: 'FIN-801',
      patron: 'Rashid Vattaparamba',
      membershipNo: 'KMLRI-2026-0001',
      type: 'OVERDUE_FINE',
      typeLabel: 'Overdue Loan (4 days)',
      amount: 40,
      status: 'UNPAID',
      date: '01 Sep 2026',
      item: 'Fatḥ al-Muʿīn (MS 0142)',
    },
    {
      id: 'FIN-802',
      patron: 'Farooq K.',
      membershipNo: 'KMLRI-2026-0012',
      type: 'LOST_ITEM',
      typeLabel: 'Lost Book Replacement Fee',
      amount: 450,
      status: 'UNPAID',
      date: '28 Aug 2026',
      item: 'Modern Malabar Historiography',
    },
    {
      id: 'FIN-803',
      patron: 'Amina Sabeelul',
      membershipNo: 'KMLRI-2026-0002',
      type: 'OVERDUE_FINE',
      typeLabel: 'Overdue Loan (2 days)',
      amount: 20,
      status: 'PAID',
      date: '25 Aug 2026',
      item: 'Muḥyiddīn Mālā (AM 0311)',
      paymentMethod: 'UPI / Razorpay',
    },
    {
      id: 'FIN-804',
      patron: 'Prof. Zakariyya Nadwi',
      membershipNo: 'KMLRI-2026-0008',
      type: 'OVERDUE_FINE',
      typeLabel: 'Overdue Loan (6 days)',
      amount: 60,
      status: 'WAIVED',
      date: '22 Aug 2026',
      item: 'Arabi-Malayalam Chronicle',
      waiveReason: 'Official Research Expedition Waiver',
    },
  ];

  const filtered = transactions.filter((t) => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch =
      search === '' ||
      t.patron.toLowerCase().includes(search.toLowerCase()) ||
      t.membershipNo.toLowerCase().includes(search.toLowerCase()) ||
      t.item.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCollectPayment = (id: string, patron: string, amount: number) => {
    setNotification(`Collected ₹${amount} from ${patron} for fine #${id}. Printed Official Receipt.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleWaiveFine = (id: string, patron: string) => {
    setNotification(`Fine #${id} for ${patron} has been waived by Administrator.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const statusBadgeVariant: Record<string, BadgeVariant> = {
    PAID: 'success',
    UNPAID: 'danger',
    WAIVED: 'neutral',
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Financial Desk"
        title="Fines, Payments & Fee Ledger"
        description="Track overdue charges, lost/damaged item assessments, manual waivers, receipt printing, and daily cashier reconciliations."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
            Manual Fee Assessment
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Unpaid Fines" value="₹1,250" hint="Across 14 overdue accounts" hintTone="negative" icon={CreditCard} />
        <StatCard label="Collected This Month" value="₹3,420" hint="Reconciled in bank ledger" hintTone="positive" />
        <StatCard label="Waivers Authorized" value="₹380" hint="Approved by chief librarian" />
        <StatCard label="Lost Item Claims" value="2 Items" hint="₹900 total recovery" hintTone="warning" />
      </div>

      {/* Filters & Search */}
      <Card padded={false} className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {(['ALL', 'UNPAID', 'PAID', 'WAIVED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                filter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'ALL' ? 'All Transactions' : tab === 'UNPAID' ? 'Unpaid Fines' : tab === 'PAID' ? 'Settled' : 'Waived'}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patron, title, receipt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 border border-gray-200 bg-white rounded-lg outline-none text-sm text-gray-800 placeholder-gray-400 focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
          />
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
              <th className="pb-3 pt-2 px-2 first:pl-3">Fine Ref #</th>
              <th className="pb-3 pt-2 px-2">Patron Details</th>
              <th className="pb-3 pt-2 px-2">Item &amp; Violation Reason</th>
              <th className="pb-3 pt-2 px-2">Amount</th>
              <th className="pb-3 pt-2 px-2">Status</th>
              <th className="pb-3 pt-2 px-2">Date</th>
              <th className="pb-3 pt-2 px-2 text-right last:pr-3">Cashier Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3.5 px-2 font-mono font-bold text-gray-900">{t.id}</td>
                <td className="py-3.5 px-2">
                  <div className="font-semibold text-gray-900">{t.patron}</div>
                  <div className="text-gray-500 text-[11px]">{t.membershipNo}</div>
                </td>
                <td className="py-3.5 px-2">
                  <div className="font-semibold text-sm text-gray-900">{t.item}</div>
                  <div className="text-gray-500 text-[11px]">{t.typeLabel}</div>
                </td>
                <td className="py-3.5 px-2 font-mono text-sm font-bold text-gray-900">₹{t.amount}</td>
                <td className="py-3.5 px-2">
                  <Badge variant={statusBadgeVariant[t.status] || 'neutral'}>{t.status}</Badge>
                </td>
                <td className="py-3.5 px-2 text-gray-500">{t.date}</td>
                <td className="py-3.5 px-2 text-right space-x-2">
                  {t.status === 'UNPAID' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCollectPayment(t.id, t.patron, t.amount)}
                        className="px-2.5 py-1.5 bg-heritage-red text-white rounded-lg text-[11px] font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Collect Fee</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWaiveFine(t.id, t.patron)}
                        className="px-2.5 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-[11px] font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Waive
                      </button>
                    </>
                  )}
                  {t.status === 'PAID' && (
                    <button
                      type="button"
                      onClick={() => alert(`Official KMLRI Cash Receipt\nReceipt #: REC-${t.id}\nPatron: ${t.patron}\nAmount: ₹${t.amount}\nStatus: Settled via ${t.paymentMethod}`)}
                      className="px-2.5 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-[11px] font-semibold hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Receipt</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Manual Fine Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full border border-gray-200 rounded-xl shadow-xl font-sans">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Assess Manual Fine / Charge</h3>
            <p className="text-xs text-gray-500 mb-4">Charge damage, lost replacement, or document reproduction fees.</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Patron Membership ID</label>
                <input
                  type="text"
                  placeholder="e.g. KMLRI-2026-0001"
                  className="w-full h-9 px-3 border border-gray-200 bg-white rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Charge Type</label>
                <select className="w-full h-9 px-3 border border-gray-200 bg-white rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20">
                  <option>Lost Item Replacement Fee</option>
                  <option>Manuscript Binding Damage Fee</option>
                  <option>Special Reprographics / Digitization Fee</option>
                  <option>Inter-Library Loan Postage Charge</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  defaultValue={100}
                  className="w-full h-9 px-3 border border-gray-200 bg-white rounded-lg text-sm font-mono outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setModalOpen(false);
                    setNotification('Manual charge added to patron account.');
                    setTimeout(() => setNotification(null), 4000);
                  }}
                >
                  Confirm Assessment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
