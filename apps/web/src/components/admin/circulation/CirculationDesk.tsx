'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  User,
  Barcode,
  Scan,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Search,
  Loader2,
  Check,
  Layers,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

type TabType = 'checkout' | 'checkin' | 'renewals';

interface Loan {
  id: string;
  dueDate: string;
  renewalCount: number;
  status: string;
  issuedAt?: string;
  returnedAt?: string;
  user: { id: string; fullName: string; membershipNumber: string; role?: string };
  copy: { barcode: string; bibRecord: { titleLatin: string; shelfmark?: string } };
}

function formatDate(d: string | Date | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate: string) {
  return new Date(dueDate).getTime() < Date.now();
}

const MAX_RENEWALS = 3;

export function CirculationDesk() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Tab State
  const initialTab = (searchParams?.get('tab') as TabType) || 'checkout';
  const [activeTab, setActiveTab] = useState<TabType>(
    ['checkout', 'checkin', 'renewals'].includes(initialTab) ? initialTab : 'checkout'
  );

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('tab', tab);
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  // Keyboard shortcut listener for quick tab switching (Alt+1, Alt+2, Alt+3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        switchTab('checkout');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        switchTab('checkin');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        switchTab('renewals');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchParams]);

  // Desk KPI Metrics
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [deskStats, setDeskStats] = useState({
    todaysIssues: 0,
    todaysReturns: 0,
    activeLoansCount: 0,
    overdueCount: 0,
  });

  const loadDeskStats = useCallback(async () => {
    try {
      const [circReport, loans] = await Promise.all([
        api.getCirculationReports().catch(() => []),
        api.getActiveLoans().catch(() => []),
      ]);

      const isToday = (dateStr?: string) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const now = new Date();
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      };

      const todaysIssues = (circReport || []).filter((l: any) => isToday(l.issuedAt)).length;
      const todaysReturns = (circReport || []).filter((l: any) => isToday(l.returnedAt)).length;
      const activeLoansCount = (loans || []).length;
      const overdueCount = (loans || []).filter((l: any) => isOverdue(l.dueDate)).length;

      setDeskStats({
        todaysIssues,
        todaysReturns,
        activeLoansCount,
        overdueCount,
      });
    } catch {
      // ignore
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeskStats();
  }, [loadDeskStats]);

  // Global Toast / Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  };

  // ==========================================
  // TAB 1: CHECK OUT (ISSUE) STATE
  // ==========================================
  const [patronSearch, setPatronSearch] = useState('');
  const [selectedPatron, setSelectedPatron] = useState<any>(null);
  const [patronLoading, setPatronLoading] = useState(false);

  const [checkoutBarcode, setCheckoutBarcode] = useState('');
  const [checkoutDays, setCheckoutDays] = useState(14);
  const [issuedThisSession, setIssuedThisSession] = useState<any[]>([]);
  const [issuing, setIssuing] = useState(false);
  const [actionInProgressLoanId, setActionInProgressLoanId] = useState<string | null>(null);

  const refreshPatron = async (userId: string) => {
    try {
      const full = await api.getUser(userId);
      setSelectedPatron(full);
      return full;
    } catch {
      return null;
    }
  };

  const handlePatronLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!patronSearch.trim()) return;
    setPatronLoading(true);
    try {
      const matches = await api.getUsers(patronSearch.trim());
      if (!matches || matches.length === 0) {
        setSelectedPatron(null);
        showNotification('error', `No member found matching "${patronSearch}".`);
        return;
      }
      const full = await api.getUser(matches[0].id);
      setSelectedPatron(full);
      showNotification('info', `Loaded profile for ${full.fullName} (${full.membershipNumber})`);
    } catch (err: any) {
      setSelectedPatron(null);
      showNotification('error', err.message || 'Patron lookup failed.');
    } finally {
      setPatronLoading(false);
    }
  };

  const handleAddCheckoutItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutBarcode.trim() || !selectedPatron) return;
    setIssuing(true);
    try {
      const loan = await api.checkOut({
        barcode: checkoutBarcode.trim(),
        userIdentifier: selectedPatron.membershipNumber,
        dueDays: checkoutDays,
      });
      setIssuedThisSession((prev) => [
        {
          id: loan.id,
          barcode: loan.copy?.barcode || checkoutBarcode,
          title: loan.copy?.bibRecord?.titleLatin || 'Item',
          shelfmark: loan.copy?.bibRecord?.shelfmark || '',
          days: checkoutDays,
          dueDate: formatDate(loan.dueDate),
        },
        ...prev,
      ]);
      setCheckoutBarcode('');
      showNotification(
        'success',
        `Issued "${loan.copy?.bibRecord?.titleLatin || 'Volume'}" to ${selectedPatron.fullName}. Due ${formatDate(loan.dueDate)}.`
      );
      await refreshPatron(selectedPatron.id);
      loadDeskStats();
    } catch (err: any) {
      showNotification('error', err.message || 'Could not issue item.');
    } finally {
      setIssuing(false);
    }
  };

  // One-click renew from Patron loan card in Checkout view
  const handleQuickRenewFromPatron = async (loanId: string, title: string) => {
    setActionInProgressLoanId(loanId);
    try {
      const res = await api.renewLoan(loanId);
      showNotification('success', res.message || `Loan for "${title}" extended.`);
      if (selectedPatron) {
        await refreshPatron(selectedPatron.id);
      }
      loadDeskStats();
      if (activeTab === 'renewals') {
        loadAllActiveLoans();
      }
    } catch (err: any) {
      showNotification('error', err.message || `Could not renew loan for "${title}".`);
    } finally {
      setActionInProgressLoanId(null);
    }
  };

  // One-click return from Patron loan card in Checkout view
  const handleQuickReturnFromPatron = async (barcode: string, title: string) => {
    setActionInProgressLoanId(barcode);
    try {
      const result = await api.checkIn({ barcode, conditionNote: 'GOOD' });
      showNotification(
        result.fineAssessed > 0 ? 'error' : 'success',
        `Returned "${title}". ${result.fineAssessed > 0 ? `Late fine: ₹${result.fineAssessed}.` : 'No fine.'}`
      );
      if (selectedPatron) {
        await refreshPatron(selectedPatron.id);
      }
      loadDeskStats();
      if (activeTab === 'renewals') {
        loadAllActiveLoans();
      }
    } catch (err: any) {
      showNotification('error', err.message || `Could not return "${title}".`);
    } finally {
      setActionInProgressLoanId(null);
    }
  };

  const patronActiveLoans = (selectedPatron?.loans || []).filter((l: any) => l.status === 'ACTIVE');
  const patronUnpaidFines = (selectedPatron?.fines || [])
    .filter((f: any) => f.status === 'UNPAID')
    .reduce((acc: number, f: any) => acc + f.amount, 0);
  const patronHoldsWaiting = (selectedPatron?.reservations || []).filter(
    (r: any) => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP'
  ).length;

  // ==========================================
  // TAB 2: CHECK IN (RAPID RETURN) STATE
  // ==========================================
  const [checkinBarcode, setCheckinBarcode] = useState('');
  const [checkinCondition, setCheckinCondition] = useState('GOOD');
  const [recentReturns, setRecentReturns] = useState<any[]>([]);
  const [returning, setReturning] = useState(false);

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinBarcode.trim()) return;
    setReturning(true);
    try {
      const result = await api.checkIn({
        barcode: checkinBarcode.trim(),
        conditionNote: checkinCondition,
      });
      const record = {
        id: `RET-${Date.now().toString().slice(-6)}`,
        barcode: result.barcode,
        title: result.title,
        patron: result.patron,
        returnTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        condition: checkinCondition,
        fineAssessed: result.fineAssessed || 0,
      };
      setRecentReturns((prev) => [record, ...prev]);
      setCheckinBarcode('');
      showNotification(
        result.fineAssessed > 0 ? 'error' : 'success',
        `Check-in complete: "${result.title}". ${
          result.fineAssessed > 0 ? `Late fine assessed: ₹${result.fineAssessed}.` : 'No late fines.'
        }`
      );
      loadDeskStats();
      if (selectedPatron) {
        refreshPatron(selectedPatron.id);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Could not process return.');
    } finally {
      setReturning(false);
    }
  };

  // ==========================================
  // TAB 3: RENEWALS STATE
  // ==========================================
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [renewSearch, setRenewSearch] = useState('');
  const [quickScanRenewBarcode, setQuickScanRenewBarcode] = useState('');
  const [quickRenewing, setQuickRenewing] = useState(false);

  const loadAllActiveLoans = useCallback(() => {
    setLoansLoading(true);
    api
      .getActiveLoans()
      .then((data) => setAllLoans(data || []))
      .catch(() => setAllLoans([]))
      .finally(() => setLoansLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'renewals') {
      loadAllActiveLoans();
    }
  }, [activeTab, loadAllActiveLoans]);

  const handleRenewLoanItem = async (loanId: string, title: string) => {
    setActionInProgressLoanId(loanId);
    try {
      const res = await api.renewLoan(loanId);
      showNotification('success', res.message || `Loan for "${title}" extended.`);
      loadAllActiveLoans();
      loadDeskStats();
    } catch (err: any) {
      showNotification('error', err.message || `Could not renew loan for "${title}".`);
    } finally {
      setActionInProgressLoanId(null);
    }
  };

  const handleQuickScanRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScanRenewBarcode.trim()) return;
    setQuickRenewing(true);
    try {
      const trimmed = quickScanRenewBarcode.trim();
      const matched = allLoans.find((l) => l.copy.barcode.toLowerCase() === trimmed.toLowerCase());
      if (matched) {
        const res = await api.renewLoan(matched.id);
        showNotification('success', res.message || `Loan for "${matched.copy.bibRecord.titleLatin}" extended.`);
        setQuickScanRenewBarcode('');
        loadAllActiveLoans();
        loadDeskStats();
      } else {
        const freshLoans = await api.getActiveLoans().catch(() => []);
        setAllLoans(freshLoans || []);
        const freshMatch = (freshLoans || []).find((l: any) => l.copy.barcode.toLowerCase() === trimmed.toLowerCase());
        if (freshMatch) {
          const res = await api.renewLoan(freshMatch.id);
          showNotification('success', res.message || `Loan for "${freshMatch.copy.bibRecord.titleLatin}" extended.`);
          setQuickScanRenewBarcode('');
          loadDeskStats();
        } else {
          showNotification('error', `No active loan found for barcode "${trimmed}".`);
        }
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Could not renew item.');
    } finally {
      setQuickRenewing(false);
    }
  };

  const filteredLoans = allLoans.filter((l) => {
    const q = renewSearch.toLowerCase();
    return (
      l.copy?.bibRecord?.titleLatin?.toLowerCase().includes(q) ||
      l.user?.fullName?.toLowerCase().includes(q) ||
      l.user?.membershipNumber?.toLowerCase().includes(q) ||
      l.copy?.barcode?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Live Desk Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Today's Check Outs</span>
            <span className="text-2xl font-mono font-bold text-gray-900 mt-0.5 block">
              {metricsLoading ? '—' : deskStats.todaysIssues}
            </span>
          </div>
          <div className="w-9 h-9 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Today's Returns</span>
            <span className="text-2xl font-mono font-bold text-gray-900 mt-0.5 block">
              {metricsLoading ? '—' : deskStats.todaysReturns}
            </span>
          </div>
          <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Active Loans</span>
            <span className="text-2xl font-mono font-bold text-gray-900 mt-0.5 block">
              {metricsLoading ? '—' : deskStats.activeLoansCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Overdue Items</span>
            <span
              className={`text-2xl font-mono font-bold mt-0.5 block ${
                deskStats.overdueCount > 0 ? 'text-[#A52307]' : 'text-gray-900'
              }`}
            >
              {metricsLoading ? '—' : deskStats.overdueCount}
            </span>
          </div>
          <div
            className={`w-9 h-9 rounded flex items-center justify-center ${
              deskStats.overdueCount > 0 ? 'bg-red-50 text-[#A52307]' : 'bg-gray-50 text-gray-500'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Global Notifications */}
      {notification && (
        <div
          className={`p-4 border rounded-[2px] flex items-center justify-between text-xs font-semibold shadow-sm transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : notification.type === 'error'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            ) : (
              <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-700 ml-4 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Primary Unified Segmented Tab Navigation */}
      <div className="bg-[#FAF8F5] border border-[#E2E0DB] p-1.5 rounded-[2px] shadow-sm flex flex-col sm:flex-row gap-1.5">
        <button
          type="button"
          onClick={() => switchTab('checkout')}
          className={`flex-1 py-3 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'checkout'
              ? 'bg-black text-white shadow'
              : 'bg-white text-gray-700 border border-[#E2E0DB] hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ArrowUpRight className={`w-4 h-4 ${activeTab === 'checkout' ? 'text-amber-400' : 'text-gray-500'}`} />
          <span>1. Check Out (Issue Items)</span>
          <span className="hidden md:inline text-[10px] opacity-60 font-mono">(Alt+1)</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('checkin')}
          className={`flex-1 py-3 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'checkin'
              ? 'bg-[#A52307] text-white shadow'
              : 'bg-white text-gray-700 border border-[#E2E0DB] hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ArrowDownLeft className={`w-4 h-4 ${activeTab === 'checkin' ? 'text-white' : 'text-gray-500'}`} />
          <span>2. Check In (Rapid Returns)</span>
          <span className="hidden md:inline text-[10px] opacity-60 font-mono">(Alt+2)</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('renewals')}
          className={`flex-1 py-3 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'renewals'
              ? 'bg-[#1E3A8A] text-white shadow'
              : 'bg-white text-gray-700 border border-[#E2E0DB] hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <RotateCcw className={`w-4 h-4 ${activeTab === 'renewals' ? 'text-sky-300' : 'text-gray-500'}`} />
          <span>3. Renewals (Extend Loans)</span>
          <span className="hidden md:inline text-[10px] opacity-60 font-mono">(Alt+3)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CHECK OUT (ISSUE) PANEL */}
      {/* ========================================================================= */}
      {activeTab === 'checkout' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
            {/* Left Column: Patron Lookup & Patron Status */}
            <div className="space-y-4">
              <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#A52307]" />
                    <span>Patron Verification</span>
                  </span>
                  {selectedPatron && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          selectedPatron.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedPatron.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatron(null);
                          setPatronSearch('');
                        }}
                        className="text-[10px] text-gray-500 hover:text-red-700 underline font-semibold"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handlePatronLookup} className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Patron Barcode / Member ID / Email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={patronSearch}
                      onChange={(e) => setPatronSearch(e.target.value)}
                      placeholder="e.g. KMLRI-2026-0001 or name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                    />
                    <button
                      type="submit"
                      disabled={patronLoading}
                      className="px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {patronLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      Lookup
                    </button>
                  </div>
                </form>

                {selectedPatron ? (
                  <div className="bg-[#FAF8F5] p-4 rounded border border-[#E2E0DB] space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      {selectedPatron.avatarUrl ? (
                        <img
                          src={selectedPatron.avatarUrl}
                          alt={selectedPatron.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-[#E2E0DB] shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {selectedPatron.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center justify-between">
                          <span className="truncate">{selectedPatron.fullName}</span>
                          <Link
                            prefetch
                            href={`/admin/members/${selectedPatron.id}`}
                            className="text-[11px] text-[#A52307] font-semibold hover:underline flex items-center gap-0.5 flex-shrink-0"
                          >
                            Profile <ExternalLink className="w-3 h-3" />
                          </Link>
                        </h4>
                        <span className="text-gray-500 font-mono text-[11px]">
                          {selectedPatron.membershipNumber} · {selectedPatron.role || 'Member'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E0DB] text-[11px]">
                      <div>
                        <span className="text-gray-500 block">Borrow Quota:</span>
                        <strong className="text-gray-900 font-mono font-bold">
                          {patronActiveLoans.length} / {selectedPatron.maxBorrowLimit || 5} Books
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Unpaid Fines:</span>
                        <strong
                          className={`font-mono font-bold ${
                            patronUnpaidFines > 0 ? 'text-[#A52307]' : 'text-emerald-700'
                          }`}
                        >
                          ₹{patronUnpaidFines}
                        </strong>
                      </div>
                    </div>

                    {patronHoldsWaiting > 0 && (
                      <div className="bg-amber-100 text-amber-900 p-2 rounded text-[11px] font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                        <span>{patronHoldsWaiting} hold{patronHoldsWaiting > 1 ? 's' : ''} waiting for pickup</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-400 font-mono text-[11px] bg-[#FAF8F5] rounded border border-dashed border-[#E2E0DB]">
                    Scan or enter a patron ID above to begin issuing items.
                  </div>
                )}
              </div>

              {/* Patron's Currently Active Loans (with 1-click Renew and 1-click Return) */}
              {selectedPatron && (
                <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Currently Checked Out ({patronActiveLoans.length})</span>
                    </span>
                  </div>

                  {patronActiveLoans.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-400 font-mono">
                      No active loans currently borrowed.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                      {patronActiveLoans.map((l: any) => {
                        const overdue = isOverdue(l.dueDate);
                        const isActing = actionInProgressLoanId === l.id || actionInProgressLoanId === l.copy?.barcode;
                        return (
                          <div
                            key={l.id}
                            className={`p-2.5 rounded border text-xs space-y-1.5 ${
                              overdue ? 'bg-red-50/50 border-red-200' : 'bg-[#FAF8F5] border-[#E2E0DB]'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <strong className="text-gray-900 block font-semibold text-[11px] leading-tight">
                                  {l.copy?.bibRecord?.titleLatin || 'Item'}
                                </strong>
                                <span className="font-mono text-[10px] text-gray-500">
                                  {l.copy?.barcode} · Renewals: {l.renewalCount || 0}/{MAX_RENEWALS}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                                  overdue ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {overdue ? 'OVERDUE' : `Due: ${formatDate(l.dueDate)}`}
                              </span>
                            </div>

                            <div className="flex justify-end gap-1.5 pt-1 border-t border-gray-200/60">
                              <button
                                type="button"
                                disabled={isActing || (l.renewalCount || 0) >= MAX_RENEWALS}
                                onClick={() => handleQuickRenewFromPatron(l.id, l.copy?.bibRecord?.titleLatin || 'Item')}
                                className="px-2 py-1 bg-white border border-gray-300 text-gray-800 rounded text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1"
                              >
                                {isActing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RotateCcw className="w-2.5 h-2.5" />}
                                Renew (+14d)
                              </button>
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() => handleQuickReturnFromPatron(l.copy?.barcode, l.copy?.bibRecord?.titleLatin || 'Item')}
                                className="px-2 py-1 bg-[#A52307] text-white rounded text-[10px] font-bold hover:bg-red-800 disabled:opacity-40 flex items-center gap-1"
                              >
                                {isActing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <ArrowDownLeft className="w-2.5 h-2.5" />}
                                Return Item
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Barcode Issue Scanner & Session Issue Table */}
            <div className="space-y-4">
              <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-4">
                <div className="border-b border-[#E2E0DB] pb-2.5 flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5 text-[#A52307]" />
                    <span>Scan Item Barcode &amp; Issue</span>
                  </span>
                  <span className="text-[11px] font-bold font-mono text-gray-500">
                    Duration: {checkoutDays} Days
                  </span>
                </div>

                <form onSubmit={handleAddCheckoutItem} className="grid grid-cols-1 sm:grid-cols-[1fr_150px_auto] gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Scanned Item Barcode / RFID
                    </label>
                    <input
                      type="text"
                      value={checkoutBarcode}
                      onChange={(e) => setCheckoutBarcode(e.target.value)}
                      placeholder="Scan copy barcode..."
                      disabled={!selectedPatron}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none disabled:bg-gray-100"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Loan Period</label>
                    <select
                      value={checkoutDays}
                      onChange={(e) => setCheckoutDays(Number(e.target.value))}
                      disabled={!selectedPatron}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-semibold bg-white text-gray-900 outline-none disabled:bg-gray-100"
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
                      disabled={!selectedPatron || issuing}
                      className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors h-[38px] disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {issuing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      <span>Issue Volume</span>
                    </button>
                  </div>
                </form>

                {!selectedPatron && (
                  <p className="text-[11px] text-gray-400 font-mono">
                    Please lookup and select a patron on the left before scanning barcodes.
                  </p>
                )}
              </div>

              {/* Session Issued Table */}
              <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Volumes Issued in Current Session ({issuedThisSession.length})
                    </h3>
                    <span className="text-xs text-gray-500">Items stamped and recorded immediately.</span>
                  </div>
                </div>

                {issuedThisSession.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 font-mono text-xs bg-[#FAF8F5] rounded border border-dashed border-[#E2E0DB]">
                    Scan item barcodes above to issue books in this session.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                          <th className="py-2.5 px-3">Volume Title &amp; Shelfmark</th>
                          <th className="py-2.5 px-3">Barcode</th>
                          <th className="py-2.5 px-3">Loan Period</th>
                          <th className="py-2.5 px-3">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEECE7]">
                        {issuedThisSession.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-[#FAF8F5]">
                            <td className="py-3 px-3">
                              <strong className="text-gray-900 block">{item.title}</strong>
                              <span className="font-mono text-gray-500 text-[11px]">{item.shelfmark}</span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-gray-900">{item.barcode}</td>
                            <td className="py-3 px-3 text-gray-700">{item.days} Days</td>
                            <td className="py-3 px-3 font-mono font-bold text-emerald-800">{item.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHECK IN (RAPID RETURNS) PANEL */}
      {/* ========================================================================= */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
            <div className="border-b border-[#E2E0DB] pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Scan className="w-5 h-5 text-[#A52307]" />
                <span>Rapid Return Scanning Station</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Scan returned book barcodes or RFID tags. Overdue fines and loan status are updated instantly.
              </p>
            </div>

            <form onSubmit={handleCheckinSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Scanned Item Barcode / RFID</label>
                <input
                  type="text"
                  value={checkinBarcode}
                  onChange={(e) => setCheckinBarcode(e.target.value)}
                  placeholder="Scan returned book barcode..."
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
                  disabled={returning}
                  className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors h-[38px] flex items-center gap-1.5 disabled:opacity-50"
                >
                  {returning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Process Check-In</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
              <h3 className="text-base font-bold text-gray-900">Returns Processed in Current Session</h3>
              <span className="text-xs text-gray-500 font-mono">{recentReturns.length} volumes returned</span>
            </div>

            {recentReturns.length === 0 ? (
              <div className="py-10 text-center text-gray-400 font-mono text-xs bg-[#FAF8F5] rounded border border-dashed border-[#E2E0DB]">
                No returns processed yet in this session. Scan an item barcode above to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-3">Item Title &amp; Barcode</th>
                      <th className="py-3 px-3">Returning Patron</th>
                      <th className="py-3 px-3">Condition</th>
                      <th className="py-3 px-3">Overdue Fine</th>
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
                              ₹{ret.fineAssessed} (Late Fine)
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold">₹0 (On Time)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right text-gray-500 font-mono">{ret.returnTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RENEWALS PANEL */}
      {/* ========================================================================= */}
      {activeTab === 'renewals' && (
        <div className="space-y-6">
          {/* Fast Scan Barcode Box */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-3">
            <div className="border-b border-[#E2E0DB] pb-2 flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Quick Scan &amp; Renew</span>
              </span>
              <span className="text-xs text-gray-500">Scan any active loan barcode to extend +14 days</span>
            </div>

            <form onSubmit={handleQuickScanRenew} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Scan book barcode to renew instantly..."
                  value={quickScanRenewBarcode}
                  onChange={(e) => setQuickScanRenewBarcode(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#1E3A8A]"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={quickRenewing || !quickScanRenewBarcode.trim()}
                className="px-5 h-10 bg-[#1E3A8A] text-white rounded text-xs font-bold hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {quickRenewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>Renew (+14d)</span>
              </button>
            </form>
          </div>

          {/* Search Active Loans Table */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] shadow-sm space-y-4">
            <div className="p-4 border-b border-[#E2E0DB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Active Borrowed Loans Directory</h3>
                <p className="text-xs text-gray-500">
                  Search by book title, barcode, or patron name to extend borrowing periods.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by title, barcode, patron..."
                  value={renewSearch}
                  onChange={(e) => setRenewSearch(e.target.value)}
                  className="w-full pl-8 pr-3 h-9 border border-gray-300 rounded text-xs outline-none focus:border-[#1E3A8A] bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loansLoading ? (
                <div className="p-8 text-center text-gray-500 text-xs font-mono">Loading active loans…</div>
              ) : filteredLoans.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-mono">
                  {renewSearch ? 'No active loans match your search.' : 'No active loans currently checked out.'}
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                      <th className="py-3 px-4">Item Barcode</th>
                      <th className="py-3 px-4">Book Title</th>
                      <th className="py-3 px-4">Borrower Details</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Renewals Used</th>
                      <th className="py-3 px-4 text-right">Desk Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEECE7]">
                    {filteredLoans.map((l) => {
                      const overdue = isOverdue(l.dueDate);
                      const isActing = actionInProgressLoanId === l.id;
                      const maxReached = (l.renewalCount || 0) >= MAX_RENEWALS;
                      return (
                        <tr key={l.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{l.copy?.barcode}</td>
                          <td className="py-3.5 px-4 font-semibold text-gray-900">{l.copy?.bibRecord?.titleLatin}</td>
                          <td className="py-3.5 px-4 text-gray-700">
                            {l.user?.fullName}{' '}
                            <span className="font-mono text-[11px] text-gray-500">({l.user?.membershipNumber})</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] ${
                                overdue ? 'bg-red-100 text-red-800' : 'text-gray-900'
                              }`}
                            >
                              {formatDate(l.dueDate)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                maxReached ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {l.renewalCount || 0} / {MAX_RENEWALS} Renewals
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              disabled={maxReached || isActing}
                              onClick={() => handleRenewLoanItem(l.id, l.copy?.bibRecord?.titleLatin || 'Item')}
                              className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded text-[11px] font-semibold hover:bg-blue-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                            >
                              {isActing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3 h-3" />
                              )}
                              <span>{isActing ? 'Renewing…' : 'Renew (+14d)'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
