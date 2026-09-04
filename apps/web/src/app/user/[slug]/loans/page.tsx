'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysLeft(dueDate: string) {
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function MyLoansPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [renewMsg, setRenewMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);

  const activeLoans = (user?.loans || []).filter((l: any) => l.status === 'ACTIVE');

  useEffect(() => {
    if (activeTab !== 'history' || !user) return;
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(false);
    api
      .getLoanHistory()
      .then((data) => {
        if (!cancelled) setHistory(data || []);
      })
      .catch(() => {
        if (!cancelled) setHistoryError(true);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, user]);

  const handleRenew = async (loanId: string) => {
    setRenewMsg(null);
    setRenewingId(loanId);
    try {
      const res = await api.renewLoan(loanId);
      setRenewMsg({ type: 'success', text: res.message || `Loan renewed. New due date: ${formatDate(res.newDueDate)}.` });
      await refreshUser();
    } catch (err: any) {
      setRenewMsg({ type: 'error', text: err.message || 'Could not renew this loan.' });
    } finally {
      setRenewingId(null);
    }
  };

  const handleRenewAll = async () => {
    setRenewingId('all');
    setRenewMsg(null);
    let succeeded = 0;
    let failed = 0;
    for (const loan of activeLoans) {
      try {
        await api.renewLoan(loan.id);
        succeeded++;
      } catch {
        failed++;
      }
    }
    await refreshUser();
    setRenewingId(null);
    if (failed === 0) {
      setRenewMsg({ type: 'success', text: `Renewed ${succeeded} loan(s) successfully.` });
    } else {
      setRenewMsg({ type: 'error', text: `Renewed ${succeeded} loan(s); ${failed} could not be renewed (limit reached or held by another reader).` });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-baseline flex-wrap gap-4">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Circulation Loans
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Checked out volumes from stacks, return due dates, and 1-click renewal manager.
          </p>
        </div>

        {activeTab === 'current' && activeLoans.length > 0 && (
          <button
            type="button"
            disabled={renewingId !== null}
            onClick={handleRenewAll}
            className="px-4 py-2 border-2 border-black bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${renewingId === 'all' ? 'animate-spin' : ''}`} />
            <span>Renew All (Where Eligible)</span>
          </button>
        )}
      </div>

      <div className="double-rule"></div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 font-amiri text-lg font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'current' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
            }`}
        >
          Active Loans ({activeLoans.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-amiri text-lg font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'history' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
            }`}
        >
          Loan History
        </button>
      </div>

      {renewMsg && (
        <div
          className={`p-3.5 border text-xs font-semibold flex items-center gap-2 rounded ${
            renewMsg.type === 'success' ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-heritage-red border-heritage-red/30'
          }`}
        >
          {renewMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{renewMsg.text}</span>
        </div>
      )}

      {activeTab === 'current' ? (
        <div className="space-y-4">
          {activeLoans.length === 0 ? (
            <div className="border border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">
              You have no active loans right now.
            </div>
          ) : (
            <div className="overflow-x-auto border border-black bg-white rounded">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black bg-[#F7F4EF] text-left text-xs uppercase font-averia font-bold text-heritage-muted">
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">Call Number</th>
                    <th className="py-3 px-4">Barcode</th>
                    <th className="py-3 px-4">Issued On</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeLoans.map((loan: any) => {
                    const dl = daysLeft(loan.dueDate);
                    return (
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-amiri text-lg font-bold text-black leading-snug">{loan.copy?.bibRecord?.titleLatin || 'Item'}</p>
                          <span className="text-[11px] text-heritage-muted font-averia">Renewed {loan.renewalCount || 0} of 3 times</span>
                        </td>
                        <td className="py-3.5 px-4 font-averia text-xs text-heritage-muted font-bold">{loan.copy?.bibRecord?.shelfmark}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-gray-600">{loan.copy?.barcode}</td>
                        <td className="py-3.5 px-4 text-xs text-gray-500">{formatDate(loan.issuedAt)}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-black text-xs block">{formatDate(loan.dueDate)}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              dl < 0 ? 'bg-red-100 text-red-800' : dl <= 3 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {dl < 0 ? `${Math.abs(dl)} days overdue` : `${dl} days remaining`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            disabled={renewingId === loan.id || renewingId === 'all'}
                            onClick={() => handleRenew(loan.id)}
                            className="px-3.5 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-heritage-red hover:text-white  transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {renewingId === loan.id ? 'Renewing...' : 'Renew'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-[#F7F4EF] p-4 border border-[#D6CCBC] text-xs text-heritage-body space-y-1 rounded">
            <p className="font-bold text-black font-averia uppercase">Circulation Guidelines:</p>
            <p>• Volumes may be renewed up to 3 consecutive periods unless held by another scholar.</p>
            <p>• Overnight loan requests for non-digitized rare books must be signed by the Chief Curator.</p>
          </div>
        </div>
      ) : historyLoading ? (
        <div className="border border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">Loading loan history…</div>
      ) : historyError ? (
        <div className="border border-heritage-red bg-red-50 rounded p-8 text-center text-heritage-red text-sm">
          Could not load loan history. Please try again shortly.
        </div>
      ) : history.length === 0 ? (
        <div className="border border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">
          No past loans on record yet.
        </div>
      ) : (
        <div className="overflow-x-auto border border-black bg-white rounded">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black bg-[#F7F4EF] text-left text-xs uppercase font-averia font-bold text-heritage-muted">
                <th className="py-3 px-4">Catalog Title</th>
                <th className="py-3 px-4">Call Number</th>
                <th className="py-3 px-4">Barcode</th>
                <th className="py-3 px-4">Returned Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-amiri text-lg font-bold text-black">{p.copy?.bibRecord?.titleLatin || 'Item'}</td>
                  <td className="py-3.5 px-4 font-averia text-xs text-heritage-muted">{p.copy?.bibRecord?.shelfmark}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-600">{p.copy?.barcode}</td>
                  <td className="py-3.5 px-4 text-xs text-gray-600">{formatDate(p.returnedAt)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">Returned to Stacks</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
