'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Info } from 'lucide-react';

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyFinesPage() {
  const { user } = useAuth();

  const fines = (user?.fines || []) as any[];
  const totalAmount = fines.filter((f) => f.status === 'UNPAID').reduce((acc, f) => acc + f.amount, 0);

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
          Fines &amp; Fee Ledger
        </h2>
        <p className="text-xs sm:text-sm text-heritage-muted mt-1">
          Assessment of overdue circulation penalties and their settlement status.
        </p>
      </div>

      <div className="double-rule"></div>

      {/* Balance Hero Card */}
      <div className="bg-[#FAF8F5] border-2 border-black p-6 rounded shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-xs font-averia uppercase tracking-wider text-heritage-muted font-bold block">
            Current Outstanding Balance
          </span>
          <p className="font-amiri text-4xl sm:text-5xl font-bold text-heritage-red mt-1">
            ₹{totalAmount}.00
          </p>
          <p className="text-xs text-heritage-muted mt-1">
            {totalAmount === 0
              ? 'Your institutional account is in full good standing.'
              : 'Please settle outstanding fines at the circulation desk to clear borrowing restrictions.'}
          </p>
        </div>

        {totalAmount > 0 && (
          <div className="flex items-start gap-2 max-w-xs text-xs text-heritage-body bg-white border border-black/20 rounded p-3">
            <Info className="w-4 h-4 text-heritage-red flex-shrink-0 mt-0.5" />
            <span>Online payment isn&apos;t available yet. Bring your membership card to the circulation desk to pay by cash or card.</span>
          </div>
        )}
      </div>

      {/* Itemized Ledger Table */}
      <div className="border border-black bg-white rounded overflow-hidden">
        <div className="p-4 bg-[#F7F4EF] border-b border-black flex justify-between items-center">
          <h3 className="font-amiri text-xl font-bold text-black m-0">Fine Assessment Ledger</h3>
          <span className="text-xs font-mono text-gray-600">Standard Rate: ₹5/day overdue</span>
        </div>

        {fines.length === 0 ? (
          <div className="p-8 text-center text-heritage-muted text-sm">No fines on record.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase font-averia font-bold text-heritage-muted bg-gray-50/50">
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4">Date Assessed</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-xs text-heritage-body">{f.reason}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 font-mono">{formatDate(f.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          f.status === 'UNPAID' ? 'bg-red-100 text-heritage-red border border-heritage-red/30' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-heritage-red">₹{f.amount}.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
