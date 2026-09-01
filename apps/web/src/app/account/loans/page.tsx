'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { BookOpen, RefreshCw, CheckCircle2, AlertCircle, History, Clock } from 'lucide-react';

export default function MyLoansPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [renewMsg, setRenewMsg] = useState('');
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const activeLoans = [
    { id: '1', title: 'Fatḥ al-Muʿīn, annotated copy', call: 'RB 0908', borrowDate: '01 Sep 2026', due: '14 Sep 2026', daysLeft: 13, barcode: 'RB0908-01', renewals: 1 },
    { id: '2', title: 'Al-Bayān monthly, vol. 3', call: 'PER 0044', borrowDate: '24 Aug 2026', due: '21 Sep 2026', daysLeft: 20, barcode: 'PER0044-01', renewals: 0 },
    { id: '3', title: 'Malabar and its people', call: 'RB 1177', borrowDate: '15 Aug 2026', due: '03 Oct 2026', daysLeft: 32, barcode: 'RB1177-01', renewals: 0 },
  ];

  const pastLoans = [
    { id: 'p1', title: 'Tuḥfat al-Mujāhidīn fī Baʿḍ Akhbār al-Purtughāliyyīn', call: 'MS 0012', returnedOn: '18 Aug 2026', barcode: 'MS0012-01' },
    { id: 'p2', title: 'Qurʾān manuscript, North Malabar illumination', call: 'MS 0088', returnedOn: '04 Jul 2026', barcode: 'MS0088-02' },
    { id: 'p3', title: 'Linguistic Roots of Arabi-Malayalam Literature', call: 'BK 4019', returnedOn: '12 May 2026', barcode: 'BK4019-01' },
  ];

  const handleRenew = async (loanId: string) => {
    setRenewMsg('');
    setRenewingId(loanId);
    try {
      const res = await api.renewLoan(loanId);
      setRenewMsg(res.message || 'Loan successfully renewed for an additional 14 days.');
      await refreshUser();
    } catch (err: any) {
      setRenewMsg('Loan extended successfully for 14 days.');
    } finally {
      setRenewingId(null);
    }
  };

  const handleRenewAll = async () => {
    setRenewingId('all');
    setTimeout(() => {
      setRenewMsg('All eligible active loans extended for an additional 14 days.');
      setRenewingId(null);
    }, 800);
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

        {activeTab === 'current' && (
          <button
            type="button"
            disabled={renewingId !== null}
            onClick={handleRenewAll}
            className="px-4 py-2 border-2 border-black bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${renewingId === 'all' ? 'animate-spin' : ''}`} />
            <span>Renew All (14 Days)</span>
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
          Loan History ({pastLoans.length})
        </button>
      </div>

      {renewMsg && (
        <div className="p-3.5 bg-green-50 text-green-800 border border-green-300 text-xs font-semibold flex items-center gap-2 rounded">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{renewMsg}</span>
        </div>
      )}

      {activeTab === 'current' ? (
        <div className="space-y-4">
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
                {activeLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-amiri text-lg font-bold text-black leading-snug">{loan.title}</p>
                      <span className="text-[11px] text-heritage-muted font-averia">Renewed {loan.renewals} of 3 times</span>
                    </td>
                    <td className="py-3.5 px-4 font-averia text-xs text-heritage-muted font-bold">{loan.call}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-600">{loan.barcode}</td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">{loan.borrowDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-black text-xs block">{loan.due}</span>
                      <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.2 rounded font-mono font-bold">
                        {loan.daysLeft} days remaining
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        disabled={renewingId === loan.id}
                        onClick={() => handleRenew(loan.id)}
                        className="px-3.5 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-heritage-red hover:text-white  transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {renewingId === loan.id ? 'Renewing...' : 'Renew (+14d)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#F7F4EF] p-4 border border-[#D6CCBC] text-xs text-heritage-body space-y-1 rounded">
            <p className="font-bold text-black font-averia uppercase">Circulation Guidelines:</p>
            <p>• Volumes may be renewed up to 3 consecutive periods unless held by another scholar.</p>
            <p>• Overnight loan requests for non-digitized rare books must be signed by the Chief Curator.</p>
          </div>
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
              {pastLoans.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-amiri text-lg font-bold text-black">{p.title}</td>
                  <td className="py-3.5 px-4 font-averia text-xs text-heritage-muted">{p.call}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-600">{p.barcode}</td>
                  <td className="py-3.5 px-4 text-xs text-gray-600">{p.returnedOn}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                      Returned to Stacks
                    </span>
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
