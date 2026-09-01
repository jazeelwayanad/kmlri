'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Receipt, CheckCircle2, QrCode, CreditCard, ShieldCheck, Download, AlertCircle } from 'lucide-react';

export default function MyFinesPage() {
  const { user } = useAuth();
  const [fines, setFines] = useState([
    {
      id: 'f-1',
      title: 'Tuḥfat al-Nafāʾis (Overdue 2 days)',
      barcode: 'RB0411-02',
      amount: 20,
      reason: 'Late return overdue penalty (₹10/day)',
      status: 'UNPAID',
      date: '28 Aug 2026'
    }
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [settled, setSettled] = useState(false);

  const totalAmount = fines.filter((f) => f.status === 'UNPAID').reduce((acc, f) => acc + f.amount, 0);

  const handleSimulatePayment = () => {
    setFines(fines.map((f) => ({ ...f, status: 'PAID' })));
    setShowPaymentModal(false);
    setSettled(true);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
          Fines &amp; Fee Ledger
        </h2>
        <p className="text-xs sm:text-sm text-heritage-muted mt-1">
          Assessment of overdue circulation penalties, digital reproduction invoices, and receipt vouchers.
        </p>
      </div>

      <div className="double-rule"></div>

      {settled && (
        <div className="p-4 bg-green-50 text-green-800 border border-green-300 text-xs font-semibold flex items-center justify-between gap-2 rounded">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-700 flex-shrink-0" />
            <span>All outstanding fines settled successfully. Receipt generated: #REC-2026-0982.</span>
          </div>
          <button
            onClick={() => alert('Downloading official institution receipt voucher PDF...')}
            className="text-xs font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Voucher</span>
          </button>
        </div>
      )}

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
            {totalAmount === 0 ? 'Your institutional account is in full good standing.' : 'Payment clears borrowing restrictions immediately.'}
          </p>
        </div>

        {totalAmount > 0 && (
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="px-6 py-3 bg-black text-paper rounded font-amiri font-bold text-base hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-2 cursor-pointer shadow"
          >
            <CreditCard className="w-4 h-4" />
            <span>Clear Balance (UPI / Card) →</span>
          </button>
        )}
      </div>

      {/* Itemized Ledger Table */}
      <div className="border border-black bg-white rounded overflow-hidden">
        <div className="p-4 bg-[#F7F4EF] border-b border-black flex justify-between items-center">
          <h3 className="font-amiri text-xl font-bold text-black m-0">Fine Assessment Ledger</h3>
          <span className="text-xs font-mono text-gray-600">Standard Rate: ₹10/day for rare books</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase font-averia font-bold text-heritage-muted bg-gray-50/50">
                <th className="py-2.5 px-4">Item &amp; Barcode</th>
                <th className="py-2.5 px-4">Reason</th>
                <th className="py-2.5 px-4">Date Assessed</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fines.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-black font-amiri text-base">{f.title}</p>
                    <span className="text-xs font-mono text-gray-500">{f.barcode}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-heritage-body">{f.reason}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 font-mono">{f.date}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${f.status === 'UNPAID' ? 'bg-red-100 text-heritage-red border border-heritage-red/30' : 'bg-green-100 text-green-800'
                      }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-heritage-red">
                    ₹{f.amount}.00
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 shadow-2xl font-sans rounded space-y-5">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <p className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold">KMLRI Fee Gateway</p>
                <h3 className="font-amiri text-2xl font-bold text-black">Instant Fine Settlement</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-black text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center p-4 bg-[#FAF8F5] border border-black/20 rounded space-y-2">
              <span className="text-xs text-heritage-muted font-bold uppercase font-averia">Total Payable Amount</span>
              <p className="font-amiri text-4xl font-bold text-black">₹{totalAmount}.00</p>
              <div className="w-32 h-32 bg-white p-2 border border-black/30 mx-auto rounded shadow-inner flex items-center justify-center">
                <QrCode className="w-full h-full text-black" />
              </div>
              <p className="text-[11px] text-gray-500 font-mono">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full py-2.5 bg-black text-white rounded font-amiri font-bold text-base hover:bg-heritage-red hover:text-white  transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Simulate Successful UPI Payment</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
