'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  User,
  Shield,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Clock,
  Bookmark,
  CreditCard,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  Edit3,
  Trash2,
  Users,
  Plus,
} from 'lucide-react';
import { confirmDialog } from '@/lib/dialog';
import { MemberForm } from '@/components/members/MemberForm';

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function daysOverdue(dueDate: string) {
  return Math.ceil((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
}

export default function MemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string;

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'circulations' | 'holds' | 'overdues' | 'fines' | 'history' | 'relatives' | 'overview'>('circulations');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRelativeModal, setShowRelativeModal] = useState(false);

  const loadMember = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const u = await api.getUser(memberId);
      setMember(u);
    } catch {
      setMember(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) loadMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const handleOpenEditModal = () => {
    setShowEditModal(true);
  };

  const handleDeleteMember = async () => {
    if (!(await confirmDialog({ message: `Are you sure you want to delete member "${member.fullName}" (${member.membershipNumber})? This is only possible for members with no circulation history.`, variant: 'danger' }))) return;
    try {
      await api.deleteUser(member.id);
      setNotification({ type: 'success', text: `Member "${member.fullName}" deleted. Redirecting to directory...` });
      setTimeout(() => router.push('/admin/members'), 1200);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not delete this member.' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRenew = async (loanId: string, title: string) => {
    setActingId(loanId);
    try {
      const res = await api.renewLoan(loanId);
      setNotification({ type: 'success', text: res.message || `Renewed "${title}".` });
      await loadMember();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || `Could not renew "${title}".` });
    } finally {
      setActingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSettleFine = async (fineId: string, amount: number) => {
    setActingId(fineId);
    try {
      await api.settleFine(fineId);
      setNotification({ type: 'success', text: `Fine of ₹${amount} marked as paid.` });
      await loadMember();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not settle this fine.' });
    } finally {
      setActingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 text-sm font-sans">Loading member record...</div>;
  }

  if (notFound || !member) {
    return (
      <div className="p-12 text-center font-sans">
        <p className="text-lg font-bold text-gray-900 mb-2">Member not found</p>
        <Link prefetch href="/admin/members" className="text-[#A52307] font-semibold text-sm hover:underline">
          ← Back to Members Directory
        </Link>
      </div>
    );
  }

  const allLoans = member.loans || [];
  const currentLoans = allLoans.filter((l: any) => l.status === 'ACTIVE');
  const overdueLoans = currentLoans.filter((l: any) => daysOverdue(l.dueDate) > 0);
  const pastLoans = allLoans.filter((l: any) => l.status !== 'ACTIVE');
  const holds = (member.reservations || []).filter((r: any) => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP');
  const fines = member.fines || [];
  const unpaidFines = fines.filter((f: any) => f.status === 'UNPAID');
  const totalUnpaidFines = unpaidFines.reduce((acc: number, cur: any) => acc + cur.amount, 0);

  const subTabs = [
    { key: 'circulations', label: 'Current Loans', count: currentLoans.length, icon: BookOpen },
    { key: 'holds', label: 'Holds & Reservations', count: holds.length, icon: Bookmark },
    { key: 'overdues', label: 'Overdue Items', count: overdueLoans.length, icon: Clock },
    { key: 'fines', label: 'Fines & Payments', count: `₹${totalUnpaidFines}`, icon: CreditCard },
    { key: 'history', label: 'Loan History', count: pastLoans.length, icon: History },
    { key: 'relatives', label: 'Relatives & Guarantors', count: (member.relatives?.length || 0) + (member.guarantor ? 1 : 0), icon: Users },
    { key: 'overview', label: 'Membership Profile', icon: User },
  ] as const;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      {/* Top Back Link & Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Link prefetch href="/admin/members" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#A52307] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members Directory</span>
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="px-3.5 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Member</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteMember}
            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold hover:bg-red-700 hover:text-white transition-colors flex items-center gap-1.5"
            title="Delete this member"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Member</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 border rounded-xl text-xs font-semibold flex items-center gap-2 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Member Profile Banner Card */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-black shadow flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                {member.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{member.fullName}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#A52307] text-white px-2 py-0.5 rounded">{member.role}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {member.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-1">
                ID: <strong className="text-gray-900">{member.membershipNumber}</strong> · Email: <strong className="text-gray-900">{member.email}</strong>
                {member.phone && <> · Phone: <strong className="text-gray-900">{member.phone}</strong></>}
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
              <span className={`text-xl font-bold mt-0.5 block ${overdueLoans.length > 0 ? 'text-[#A52307]' : 'text-gray-900'}`}>{overdueLoans.length}</span>
            </div>
            <div className="px-3">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Unpaid Fines</span>
              <span className={`text-xl font-bold font-mono mt-0.5 block ${totalUnpaidFines > 0 ? 'text-[#A52307]' : 'text-gray-900'}`}>₹{totalUnpaidFines}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <aside className="bg-white border border-[#E2E0DB] rounded-[2px] p-2 shadow-sm space-y-1">
          <div className="px-3 py-2 border-b border-[#EEECE7] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Member Sections</span>
          </div>
          {subTabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`w-full text-left cursor-pointer p-2.5 rounded-[4px] transition-all flex items-center justify-between text-xs font-semibold ${active ? 'bg-[#A52307] text-white shadow-sm font-bold' : 'text-gray-700 hover:bg-[#FAF8F5] hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
                  <span className="truncate">{t.label}</span>
                </div>
                {'count' in t && (
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-800'}`}>{t.count}</span>
                )}
              </button>
            );
          })}
        </aside>

        <div className="min-w-0">
          {/* Current Loans */}
          {activeTab === 'circulations' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Active Borrowed Items</h3>
                <span className="text-xs text-gray-500 font-mono">{currentLoans.length} of {member.maxBorrowLimit} quota used</span>
              </div>

              {currentLoans.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-xs">No items currently checked out to this member.</div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Item Title &amp; Shelfmark</th>
                      <th className="py-3 px-3">Barcode</th>
                      <th className="py-3 px-3">Issued Date</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Desk Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {currentLoans.map((l: any) => {
                      const overdueBy = daysOverdue(l.dueDate);
                      return (
                        <tr key={l.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-gray-900 block">{l.copy.bibRecord.titleLatin}</span>
                            <span className="text-[11px] font-mono text-gray-500">{l.copy.bibRecord.shelfmark}</span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-gray-700">{l.copy.barcode}</td>
                          <td className="py-3.5 px-3 text-gray-600">{formatDate(l.issuedAt)}</td>
                          <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{formatDate(l.dueDate)}</td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${overdueBy > 0 ? 'bg-red-100 text-[#A52307] border border-red-300' : 'bg-emerald-100 text-emerald-800'}`}>
                              {overdueBy > 0 ? `Overdue (${overdueBy}d)` : 'On Loan'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right space-x-2">
                            <button
                              type="button"
                              disabled={actingId === l.id}
                              onClick={() => handleRenew(l.id, l.copy.bibRecord.titleLatin)}
                              className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors disabled:opacity-50"
                            >
                              {actingId === l.id ? 'Renewing…' : 'Renew Loan'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Holds */}
          {activeTab === 'holds' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Reserved Items &amp; Hold Shelf</h3>
                <span className="text-xs text-gray-500 font-mono">{holds.length} active requests</span>
              </div>

              {holds.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-xs">No active hold requests for this member.</div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Item Title</th>
                      <th className="py-3 px-3">Shelfmark</th>
                      <th className="py-3 px-3">Request Date</th>
                      <th className="py-3 px-3">Hold Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {holds.map((h: any) => (
                      <tr key={h.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-3 font-bold text-gray-900">{h.bibRecord.titleLatin}</td>
                        <td className="py-3.5 px-3 font-mono text-gray-600">{h.bibRecord.shelfmark}</td>
                        <td className="py-3.5 px-3 text-gray-600">{formatDate(h.requestedAt)}</td>
                        <td className="py-3.5 px-3">
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">{h.status.replace(/_/g, ' ')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Overdues */}
          {activeTab === 'overdues' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Overdue Items Awaiting Return</h3>
                <span className="text-xs text-red-600 font-bold font-mono">{overdueLoans.length} items overdue</span>
              </div>

              {overdueLoans.length === 0 ? (
                <div className="p-12 text-center text-emerald-700 text-xs font-semibold">✓ No overdue items on this account.</div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Title &amp; Shelfmark</th>
                      <th className="py-3 px-3">Barcode</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Days Overdue</th>
                      <th className="py-3 px-3">Projected Fine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {overdueLoans.map((l: any) => {
                      const overdueBy = daysOverdue(l.dueDate);
                      return (
                        <tr key={l.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-3.5 px-3 font-bold text-gray-900">{l.copy.bibRecord.titleLatin}</td>
                          <td className="py-3.5 px-3 font-mono text-gray-600">{l.copy.barcode}</td>
                          <td className="py-3.5 px-3 font-mono text-red-600 font-bold">{formatDate(l.dueDate)}</td>
                          <td className="py-3.5 px-3 font-bold text-red-700">{overdueBy} days</td>
                          <td className="py-3.5 px-3 font-mono font-bold text-gray-900">₹{overdueBy * 5}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Fines */}
          {activeTab === 'fines' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Fines Ledger</h3>
                <span className="text-xs font-mono font-bold text-[#A52307]">Outstanding: ₹{totalUnpaidFines}</span>
              </div>

              {fines.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-xs">No fines on record.</div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Item / Assessment</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Reason</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Cashier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {fines.map((f: any) => (
                      <tr key={f.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-gray-900 block">{f.loan?.copy?.bibRecord?.titleLatin || '—'}</span>
                          <span className="text-[10px] font-mono text-gray-500">{f.loan?.copy?.barcode || ''}</span>
                        </td>
                        <td className="py-3.5 px-3 text-gray-600 font-mono">{formatDate(f.createdAt)}</td>
                        <td className="py-3.5 px-3 text-gray-700">{f.reason}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-900">₹{f.amount}</td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${f.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : f.status === 'WAIVED' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-[#A52307]'}`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {f.status === 'UNPAID' ? (
                            <button
                              type="button"
                              disabled={actingId === f.id}
                              onClick={() => handleSettleFine(f.id, f.amount)}
                              className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors disabled:opacity-50"
                            >
                              {actingId === f.id ? 'Settling…' : 'Settle Fine'}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[11px]">{f.status === 'PAID' ? `Paid ${formatDate(f.paidAt)}` : '—'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Loan History */}
          {activeTab === 'history' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Past Loan History</h3>
                <span className="text-xs text-gray-500 font-mono">{pastLoans.length} past loans logged</span>
              </div>

              {pastLoans.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-xs">No past loans on record.</div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Item Title</th>
                      <th className="py-3 px-3">Barcode</th>
                      <th className="py-3 px-3">Issued Date</th>
                      <th className="py-3 px-3">Returned Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {pastLoans.map((h: any) => (
                      <tr key={h.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-3 font-bold text-gray-900">{h.copy.bibRecord.titleLatin}</td>
                        <td className="py-3.5 px-3 font-mono text-gray-600">{h.copy.barcode}</td>
                        <td className="py-3.5 px-3 text-gray-600">{formatDate(h.issuedAt)}</td>
                        <td className="py-3.5 px-3 font-semibold text-emerald-700">{formatDate(h.returnedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Relatives & Guarantor */}
          {activeTab === 'relatives' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6 text-xs font-sans">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Relatives &amp; Institutional Dependents</h3>
                  <p className="text-[11px] text-gray-500">
                    Family members, children, student supervisees, or institutional relations connected to this patron.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRelativeModal(true)}
                  className="px-3.5 py-1.5 bg-[#A52307] text-white rounded text-xs font-semibold hover:bg-red-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Relative</span>
                </button>
              </div>

              {/* Guarantor Section if this member has a guarantor */}
              {member.guarantor && (
                <div className="border border-amber-200 bg-amber-50/60 p-4 rounded-[2px] space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold uppercase text-[10px] tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-amber-700" />
                    <span>Designated Guarantor / Parent Patron</span>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
                    <div className="flex items-center gap-3">
                      {member.guarantor.avatarUrl ? (
                        <img
                          src={member.guarantor.avatarUrl}
                          alt={member.guarantor.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-amber-300 shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {member.guarantor.fullName?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <Link
                          prefetch
                          href={`/admin/members/${member.guarantor.id}`}
                          className="font-bold text-gray-900 hover:text-[#A52307] hover:underline text-sm"
                        >
                          {member.guarantor.fullName}
                        </Link>
                        <p className="text-[11px] text-gray-500 font-mono">
                          ID: {member.guarantor.membershipNumber} · {member.guarantor.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-white border border-amber-300 text-amber-900 px-2.5 py-1 rounded font-semibold">
                      Role: {member.guarantor.role}
                    </span>
                  </div>
                </div>
              )}

              {/* Relatives List */}
              {(!member.relatives || member.relatives.length === 0) ? (
                <div className="p-10 text-center text-gray-500 text-xs border border-dashed border-gray-200 rounded">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">No relatives or dependents recorded</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Click "Add Relative" to register a family member, child, or academic supervisee.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#E2E0DB] rounded">
                  <table className="w-full border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold text-[11px]">
                        <th className="py-3 px-3">Relative Name</th>
                        <th className="py-3 px-3">Relationship</th>
                        <th className="py-3 px-3">Membership ID</th>
                        <th className="py-3 px-3">Role &amp; Status</th>
                        <th className="py-3 px-3">Active Loans</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEECE7]">
                      {member.relatives.map((rel: any) => (
                        <tr key={rel.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {rel.avatarUrl ? (
                                <img
                                  src={rel.avatarUrl}
                                  alt={rel.fullName}
                                  className="w-7 h-7 rounded-full object-cover border border-gray-300 shadow-xs flex-shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                                  {rel.fullName?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <Link
                                  prefetch
                                  href={`/admin/members/${rel.id}`}
                                  className="font-bold text-gray-900 hover:text-[#A52307] hover:underline"
                                >
                                  {rel.fullName}
                                </Link>
                                <p className="text-[10px] text-gray-500">{rel.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-neutral-100 border border-neutral-300 text-neutral-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {rel.relationship || 'Relative'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-gray-700">{rel.membershipNumber}</td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-bold uppercase bg-[#A52307] text-white px-1.5 py-0.5 rounded mr-1">
                              {rel.role}
                            </span>
                            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              {rel.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-900">
                            {rel._count?.loans ?? 0} active
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              prefetch
                              href={`/admin/members/${rel.id}`}
                              className="text-[#A52307] font-semibold hover:underline text-xs"
                            >
                              View Record →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Membership Profile */}
          {activeTab === 'overview' && (
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6 text-xs font-sans">
              <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                <h3 className="text-base font-bold text-gray-900">Membership Profile</h3>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="px-3 py-1 bg-black text-white rounded text-xs font-semibold hover:bg-[#A52307] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

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
                  <span className="text-gray-500 block text-[11px]">Patron Username:</span>
                  <span className="font-mono text-gray-900">@{member.username || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Registered Email:</span>
                  <span className="font-mono text-gray-900">{member.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Phone Number:</span>
                  <span className="font-mono text-gray-900">{member.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Institution / Organization:</span>
                  <span className="font-semibold text-gray-900">{member.institution || member.department || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Gender:</span>
                  <span className="font-medium text-gray-900">{member.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Institutional Role:</span>
                  <span className="font-bold text-[#A52307] uppercase">{member.role}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Research Interest:</span>
                  <span className="font-medium text-gray-800">{member.researchInterest || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Mailing Address:</span>
                  <span className="text-gray-800">{member.address || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Concurrent Borrow Limit:</span>
                  <span className="font-bold text-gray-900">{member.maxBorrowLimit} Books</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Account Standing:</span>
                  <span className={`font-bold uppercase ${member.status === 'ACTIVE' ? 'text-emerald-700' : 'text-[#A52307]'}`}>{member.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL: Edit Member Profile with Unified MemberForm */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A52307]">Member Registry</p>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">Edit Member Profile</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <MemberForm
              mode="admin-edit"
              initialData={member}
              onCancel={() => setShowEditModal(false)}
              onSuccess={async () => {
                setShowEditModal(false);
                setNotification({ type: 'success', text: `Member profile updated successfully.` });
                await loadMember();
                setTimeout(() => setNotification(null), 4000);
              }}
            />
          </div>
        </div>
      )}

      {/* POPUP MODAL: Add Relative with Unified MemberForm */}
      {showRelativeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A52307]">Relative / Dependent Registration</p>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">Add Relative for {member.fullName}</h3>
              </div>
              <button onClick={() => setShowRelativeModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <MemberForm
              mode="relative"
              guarantorId={member.id}
              guarantorName={member.fullName}
              onCancel={() => setShowRelativeModal(false)}
              onSuccess={async (rel) => {
                setShowRelativeModal(false);
                setNotification({
                  type: 'success',
                  text: `Relative "${rel?.fullName || 'Relative'}" registered and linked successfully.`,
                });
                await loadMember();
                setTimeout(() => setNotification(null), 4000);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
