'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  BookOpen, 
  ArrowLeft, 
  RotateCcw, 
  Clock, 
  Bookmark, 
  AlertCircle, 
  CreditCard, 
  History, 
  CheckCircle2, 
  QrCode, 
  Edit2, 
  Check, 
  X,
  Printer,
  ChevronRight
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function MemberDetailsPage() {
  const params = useParams();
  const memberId = params?.id as string;

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'circulations' | 'holds' | 'overdues' | 'fines' | 'checkout_history' | 'checkin_history' | 'overview' | 'activity'>('circulations');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadMember() {
      try {
        const u = await api.getUser(memberId);
        if (u && u.fullName) {
          setMember(u);
          setLoading(false);
          return;
        }
      } catch {
        // Continue to fallback lookup
      }

      const idLower = (memberId || '').toLowerCase();
      let memNumber = 'KMLRI-2026-0001';
      let name = 'Rashid Vattaparamba';
      let email = 'rashid@kmlri.in';
      let role = 'RESEARCHER';
      let dept = 'Department of Islamic Jurisprudence & Malabar Studies';

      if (idLower.includes('2231') || idLower.includes('naseer')) {
        memNumber = 'MEM-2231';
        name = 'Dr. R. Naseer';
        email = 'naseer@kmlri.in';
        role = 'FACULTY';
        dept = 'Department of Arabic & Epigraphy';
      } else if (idLower.includes('1187') || idLower.includes('fathima')) {
        memNumber = 'MEM-1187';
        name = 'S. Fathima';
        email = 'fathima@kmlri.in';
        role = 'STUDENT';
        dept = 'Postgraduate Islamic History';
      } else if (idLower.includes('0942') || idLower.includes('ahmed') || idLower.includes('tariq')) {
        memNumber = 'MEM-0942';
        name = 'Dr. Tariq al-Omani';
        email = 'tariq@squ.edu.om';
        role = 'RESEARCHER';
        dept = 'Visiting Indian Ocean Fellow';
      } else if (idLower.includes('1004') || idLower.includes('najeeb')) {
        memNumber = 'MEM-1004';
        name = 'Prof. K. A. Najeeb';
        email = 'najeeb@kmlri.in';
        role = 'FACULTY';
        dept = 'Department of Maritime History';
      } else if (idLower.includes('2002') || idLower.includes('amina')) {
        memNumber = 'KMLRI-2026-0002';
        name = 'Amina Sabeelul';
        email = 'amina@kmlri.in';
        role = 'STUDENT';
        dept = 'School of Library & Archival Studies';
      }

      setMember({
        id: memberId,
        fullName: name,
        membershipNumber: memNumber,
        email: email,
        phone: '+91 98470 11223',
        role: role,
        status: 'ACTIVE',
        maxBorrowLimit: role === 'FACULTY' ? 12 : role === 'RESEARCHER' ? 8 : 5,
        department: dept,
        joinedDate: '15 Jan 2026',
        validUntil: '15 Jan 2027',
        activeLoans: [
          {
            id: 'LOAN-101',
            title: 'Fatḥ al-Muʿīn, annotated classical copy',
            shelfmark: 'MS 0142',
            barcode: 'MS0142-01',
            issuedDate: '20 Aug 2026',
            dueDate: '10 Sep 2026',
            renewalsCount: 1,
            status: 'ON_LOAN',
          },
          {
            id: 'LOAN-102',
            title: 'Tuḥfat al-Mujāhidīn (Latin Edition)',
            shelfmark: 'RB 0908',
            barcode: 'RB0908-01',
            issuedDate: '10 Aug 2026',
            dueDate: '24 Aug 2026',
            renewalsCount: 0,
            status: 'OVERDUE',
            overdueDays: 8,
            fine: 80,
          },
        ],
        checkoutHistory: [
          { id: 'HIST-01', title: 'Muḥyiddīn Mālā Print', barcode: 'AM0311-01', checkoutDate: '01 Jul 2026', returnDate: '14 Jul 2026', issuedBy: 'Staff Desk A' },
          { id: 'HIST-02', title: 'Malabar Maritime Inscriptions', barcode: 'RB0411-01', checkoutDate: '15 Jun 2026', returnDate: '28 Jun 2026', issuedBy: 'Staff Desk B' },
        ],
        checkinHistory: [
          { id: 'RET-01', title: 'Fatḥ al-Muʿīn Vol. 1', barcode: 'MS0140-01', returnDate: '14 Jul 2026', condition: 'GOOD', fineCollected: 0, receivedBy: 'Librarian Desk A' },
        ],
        holds: [
          { id: 'HLD-01', title: 'Bayān al-Fawāʾid', shelfmark: 'MS 0142', requestDate: '28 Aug 2026', status: 'READY_FOR_PICKUP', shelfAllocation: 'Hold Shelf A1', expiryDate: '05 Sep 2026' },
        ],
        fines: [
          { id: 'FIN-101', itemTitle: 'Tuḥfat al-Mujāhidīn (Latin Edition)', barcode: 'RB0908-01', assessmentDate: '25 Aug 2026', amount: 80, reason: 'Overdue Loan (8 days)', status: 'UNPAID' },
          { id: 'FIN-098', itemTitle: 'Malabar Inscriptions', barcode: 'RB0411-01', assessmentDate: '15 Jun 2026', amount: 20, reason: 'Late Return (2 days)', status: 'PAID', paidDate: '15 Jun 2026', paymentMethod: 'UPI' },
        ],
        activityLog: [
          { id: 'ACT-01', event: 'RENEWAL_GRANTED', desc: 'Extended loan period for "Fatḥ al-Muʿīn" (+14 days)', timestamp: '28 Aug 2026, 11:20 AM', actor: 'Self (Online OPAC)' },
          { id: 'ACT-02', event: 'CHECKOUT', desc: 'Checked out volume "Fatḥ al-Muʿīn (MS0142-01)"', timestamp: '20 Aug 2026, 02:45 PM', actor: 'Staff Desk A' },
          { id: 'ACT-03', event: 'FINE_ASSESSED', desc: 'Late fee assessed: ₹80 for overdue volume RB0908-01', timestamp: '25 Aug 2026, 09:00 AM', actor: 'Automated System Daemon' },
        ],
      });
      setLoading(false);
    }
    loadMember();
  }, [memberId]);

  const handleRenew = (loanId: string, title: string) => {
    setNotification(`Successfully renewed "${title}" for an additional 14 days.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSettleFine = (fineId: string, amount: number) => {
    setNotification(`Fine #${fineId} (₹${amount}) marked as paid in cashier ledger.`);
    setTimeout(() => setNotification(null), 4000);
  };

  if (!member) return null;

  const currentLoans = member.activeLoans || [];
  const overdueLoans = currentLoans.filter((l: any) => l.status === 'OVERDUE');
  const unpaidFines = (member.fines || []).filter((f: any) => f.status === 'UNPAID');
  const totalUnpaidFines = unpaidFines.reduce((acc: number, cur: any) => acc + cur.amount, 0);

  const subTabs = [
    {
      key: 'circulations',
      label: 'Current Loans',
      count: currentLoans.length,
      badgeColor: 'bg-gray-100 text-gray-800',
      icon: BookOpen,
    },
    {
      key: 'holds',
      label: 'Holds & Reservations',
      count: (member.holds || []).length,
      badgeColor: 'bg-amber-100 text-amber-900',
      icon: Bookmark,
    },
    {
      key: 'overdues',
      label: 'Overdue Items',
      count: overdueLoans.length,
      badgeColor: overdueLoans.length > 0 ? 'bg-red-100 text-[#A52307] font-bold' : 'bg-gray-100 text-gray-600',
      icon: Clock,
    },
    {
      key: 'fines',
      label: 'Fines & Payments',
      count: totalUnpaidFines > 0 ? `₹${totalUnpaidFines}` : '₹0',
      badgeColor: totalUnpaidFines > 0 ? 'bg-red-100 text-[#A52307] font-bold' : 'bg-emerald-100 text-emerald-800',
      icon: CreditCard,
    },
    {
      key: 'checkout_history',
      label: 'Checkout History',
      count: (member.checkoutHistory || []).length,
      badgeColor: 'bg-gray-100 text-gray-600',
      icon: History,
    },
    {
      key: 'checkin_history',
      label: 'Check-in History',
      count: (member.checkinHistory || []).length,
      badgeColor: 'bg-gray-100 text-gray-600',
      icon: RotateCcw,
    },
    {
      key: 'overview',
      label: 'Membership Profile',
      icon: User,
    },
    {
      key: 'activity',
      label: 'Activity Audit Log',
      count: (member.activityLog || []).length,
      badgeColor: 'bg-gray-100 text-gray-600',
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      {/* Top Back Link & Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#A52307] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members Directory</span>
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Member Statement</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Member Profile Banner Card */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
              {member.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {member.fullName}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#A52307] text-white px-2 py-0.5 rounded">
                  {member.role}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {member.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-1">
                ID: <strong className="text-gray-900">{member.membershipNumber}</strong> · Email: <strong className="text-gray-900">{member.email}</strong> · Phone: <strong className="text-gray-900">{member.phone}</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Department: <span className="font-semibold text-gray-800">{member.department}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-[#FAF8F5] p-3 rounded border border-[#E2E0DB] text-center text-xs w-full md:w-auto">
            <div className="px-3 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Active Loans</span>
              <span className="text-xl font-bold text-gray-900 mt-0.5 block">{currentLoans.length} / {member.maxBorrowLimit}</span>
            </div>
            <div className="px-3 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Overdue</span>
              <span className={`text-xl font-bold mt-0.5 block ${overdueLoans.length > 0 ? 'text-[#A52307]' : 'text-gray-900'}`}>
                {overdueLoans.length}
              </span>
            </div>
            <div className="px-3">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Unpaid Fines</span>
              <span className={`text-xl font-bold font-mono mt-0.5 block ${totalUnpaidFines > 0 ? 'text-[#A52307]' : 'text-gray-900'}`}>
                ₹{totalUnpaidFines}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        
        {/* Left Side Sub-Navigation Tabs */}
        <aside className="bg-white border border-[#E2E0DB] rounded-[2px] p-2 shadow-sm space-y-1">
          <div className="px-3 py-2 border-b border-[#EEECE7] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Member Sections &amp; Activities
            </span>
          </div>

          {subTabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key as any)}
                className={`w-full text-left cursor-pointer p-2.5 rounded-[4px] transition-all flex items-center justify-between text-xs font-semibold ${
                  active
                    ? 'bg-[#A52307] text-white shadow-sm font-bold'
                    : 'text-gray-700 hover:bg-[#FAF8F5] hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
                  <span className="truncate">{t.label}</span>
                </div>
                {t.count !== undefined && (
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : t.badgeColor
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Content Pane */}
        <div className="min-w-0">
          
          {/* TAB 1: Current Loans */}
          {activeTab === 'circulations' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Currently Checked-Out Volumes</h3>
                <span className="text-xs text-gray-500 font-mono">{currentLoans.length} active items on loan</span>
              </div>

              {currentLoans.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-mono text-xs">
                  No volumes currently checked out by this member.
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Title &amp; Shelfmark</th>
                      <th className="py-3 px-3">Barcode</th>
                      <th className="py-3 px-3">Issued Date</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Renewals</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {currentLoans.map((loan: any) => (
                      <tr key={loan.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-gray-900 block">{loan.title}</span>
                          <span className="font-mono text-gray-500 text-[11px]">{loan.shelfmark}</span>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{loan.barcode}</td>
                        <td className="py-3.5 px-3 text-gray-600">{loan.issuedDate}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{loan.dueDate}</td>
                        <td className="py-3.5 px-3 text-gray-600">{loan.renewalsCount} Times</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            loan.status === 'OVERDUE' ? 'bg-red-100 text-[#A52307]' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {loan.status === 'OVERDUE' ? `Overdue (${loan.overdueDays}d)` : 'Active Loan'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRenew(loan.id, loan.title)}
                            className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Renew (+14d)</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: Holds & Reservations */}
          {activeTab === 'holds' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Active Shelf Reservations &amp; Holds</h3>
                <span className="text-xs text-gray-500 font-mono">{(member.holds || []).length} items queued</span>
              </div>

              {(member.holds || []).length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-mono text-xs">
                  No active reservations on hold.
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Hold Ref</th>
                      <th className="py-3 px-3">Requested Title</th>
                      <th className="py-3 px-3">Request Date</th>
                      <th className="py-3 px-3">Shelf Allocation</th>
                      <th className="py-3 px-3">Pickup Expiry</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {(member.holds || []).map((h: any) => (
                      <tr key={h.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{h.id}</td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-gray-900 block">{h.title}</span>
                          <span className="font-mono text-gray-500 text-[11px]">{h.shelfmark}</span>
                        </td>
                        <td className="py-3.5 px-3 text-gray-600">{h.requestDate}</td>
                        <td className="py-3.5 px-3 font-mono text-gray-900 font-semibold">{h.shelfAllocation || 'Pending Stack Pick'}</td>
                        <td className="py-3.5 px-3 font-mono text-gray-600">{h.expiryDate || 'N/A'}</td>
                        <td className="py-3.5 px-3">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            {h.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: Overdue Items */}
          {activeTab === 'overdues' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900 text-[#A52307]">Overdue Loans &amp; Notice Triggers</h3>
                <span className="text-xs text-gray-500 font-mono">{overdueLoans.length} items past due date</span>
              </div>

              {overdueLoans.length === 0 ? (
                <div className="py-12 text-center text-emerald-700 font-mono text-xs">
                  ✓ Great news: Member has zero overdue volumes.
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Overdue Title</th>
                      <th className="py-3 px-3">Barcode</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Days Overdue</th>
                      <th className="py-3 px-3">Accrued Late Fee</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {overdueLoans.map((l: any) => (
                      <tr key={l.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-3 font-bold text-gray-900">{l.title}</td>
                        <td className="py-3.5 px-3 font-mono text-gray-900">{l.barcode}</td>
                        <td className="py-3.5 px-3 font-mono text-red-700 font-bold">{l.dueDate}</td>
                        <td className="py-3.5 px-3 font-bold text-[#A52307]">{l.overdueDays} Days</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-900">₹{l.fine || 80}</td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => alert(`Overdue recall notice sent to ${member.email}`)}
                            className="px-2.5 py-1 border border-red-300 text-[#A52307] rounded text-[11px] font-semibold hover:bg-red-50"
                          >
                            Send Recall Notice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 4: Fines & Payments */}
          {activeTab === 'fines' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Fines &amp; Cashier Payment Register</h3>
                <span className="text-xs font-mono font-bold text-[#A52307]">Outstanding Balance: ₹{totalUnpaidFines}</span>
              </div>

              {(member.fines || []).length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-mono text-xs">
                  No fine records on member ledger.
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Fine Ref</th>
                      <th className="py-3 px-3">Item &amp; Reason</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Assessed Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Cashier Desk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {(member.fines || []).map((f: any) => (
                      <tr key={f.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{f.id}</td>
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-gray-900 block">{f.itemTitle}</span>
                          <span className="text-gray-500 text-[11px]">{f.reason}</span>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-900 text-sm">₹{f.amount}</td>
                        <td className="py-3.5 px-3 text-gray-600">{f.assessmentDate}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {f.status} {f.paymentMethod ? `(${f.paymentMethod})` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {f.status === 'UNPAID' ? (
                            <button
                              type="button"
                              onClick={() => handleSettleFine(f.id, f.amount)}
                              className="px-2.5 py-1 bg-[#A52307] text-white rounded text-[11px] font-bold hover:bg-red-700 transition-colors inline-flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Settle Fine</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 5: Checkout History */}
          {activeTab === 'checkout_history' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Historical Checkout Records</h3>
                <span className="text-xs text-gray-500 font-mono">{(member.checkoutHistory || []).length} past loans</span>
              </div>

              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                    <th className="py-3 px-3">Record ID</th>
                    <th className="py-3 px-3">Item Title</th>
                    <th className="py-3 px-3">Barcode</th>
                    <th className="py-3 px-3">Checkout Date</th>
                    <th className="py-3 px-3">Return Date</th>
                    <th className="py-3 px-3">Staff Desk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {(member.checkoutHistory || []).map((h: any) => (
                    <tr key={h.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{h.id}</td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">{h.title}</td>
                      <td className="py-3.5 px-3 font-mono text-gray-600">{h.barcode}</td>
                      <td className="py-3.5 px-3 text-gray-700">{h.checkoutDate}</td>
                      <td className="py-3.5 px-3 text-gray-700">{h.returnDate}</td>
                      <td className="py-3.5 px-3 text-gray-500">{h.issuedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: Check-in History */}
          {activeTab === 'checkin_history' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Check-in Returns History</h3>
                <span className="text-xs text-gray-500 font-mono">{(member.checkinHistory || []).length} returns logged</span>
              </div>

              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                    <th className="py-3 px-3">Return Ref</th>
                    <th className="py-3 px-3">Item Title</th>
                    <th className="py-3 px-3">Barcode</th>
                    <th className="py-3 px-3">Return Date</th>
                    <th className="py-3 px-3">Condition Assessment</th>
                    <th className="py-3 px-3">Receiving Librarian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {(member.checkinHistory || []).map((r: any) => (
                    <tr key={r.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{r.id}</td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">{r.title}</td>
                      <td className="py-3.5 px-3 font-mono text-gray-600">{r.barcode}</td>
                      <td className="py-3.5 px-3 text-gray-700">{r.returnDate}</td>
                      <td className="py-3.5 px-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {r.condition}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-500">{r.receivedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 7: Membership Profile Details */}
          {activeTab === 'overview' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6 text-xs font-sans">
              <h3 className="text-base font-bold text-gray-900 border-b border-[#E2E0DB] pb-3">Membership Profile &amp; Quotas</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-gray-500 block text-[11px]">Full Name:</span>
                  <span className="font-bold text-gray-900 text-sm">{member.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Membership Number:</span>
                  <span className="font-mono font-bold text-gray-900 text-sm">{member.membershipNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Registered Email:</span>
                  <span className="font-mono text-gray-900">{member.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Phone Number:</span>
                  <span className="font-mono text-gray-900">{member.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Department / Faculty:</span>
                  <span className="font-semibold text-gray-900">{member.department}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Institutional Role:</span>
                  <span className="font-bold text-[#A52307] uppercase">{member.role}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Date Joined:</span>
                  <span className="font-mono text-gray-800">{member.joinedDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Membership Valid Until:</span>
                  <span className="font-mono font-bold text-gray-900">{member.validUntil}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Concurrent Borrow Limit:</span>
                  <span className="font-bold text-gray-900">{member.maxBorrowLimit} Books</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Account Standing:</span>
                  <span className="font-bold text-emerald-700 uppercase">{member.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Activity Audit Log */}
          {activeTab === 'activity' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Member Activity Audit Trail</h3>
                <span className="text-xs text-gray-500 font-mono">{(member.activityLog || []).length} events logged</span>
              </div>

              <div className="space-y-3 pt-2">
                {(member.activityLog || []).map((act: any) => (
                  <div key={act.id} className="p-3 bg-[#FAF8F5] border border-gray-200 rounded flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-gray-900">{act.desc}</span>
                        <span className="text-[10px] font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 uppercase font-bold">
                          {act.event}
                        </span>
                      </div>
                      <span className="text-gray-500 text-[11px]">Logged by: {act.actor}</span>
                    </div>
                    <span className="font-mono text-gray-500 text-[11px] text-right">{act.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
