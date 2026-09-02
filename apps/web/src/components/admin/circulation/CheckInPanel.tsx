'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Scan, CheckCircle2, AlertCircle, Check, Loader2 } from 'lucide-react';

export function CheckInPanel() {
  const [checkinBarcode, setCheckinBarcode] = useState('');
  const [checkinCondition, setCheckinCondition] = useState('GOOD');
  const [recentReturns, setRecentReturns] = useState<any[]>([]);
  const [returning, setReturning] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinBarcode.trim()) return;
    setReturning(true);
    try {
      const result = await api.checkIn({ barcode: checkinBarcode.trim(), conditionNote: checkinCondition });
      const record = {
        id: `RET-${Date.now().toString().slice(-6)}`,
        barcode: result.barcode,
        title: result.title,
        patron: result.patron,
        returnTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        condition: checkinCondition,
        fineAssessed: result.fineAssessed || 0,
      };
      setRecentReturns([record, ...recentReturns]);
      setCheckinBarcode('');
      setNotification({
        type: result.fineAssessed > 0 ? 'error' : 'success',
        text: `Check-in complete: "${result.title}". ${result.fineAssessed > 0 ? `Late fine assessed: ₹${result.fineAssessed}.` : 'No late fines.'}`,
      });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not process return.' });
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-4 border rounded-xl flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
            <span>{notification.text}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-700 ml-4 font-bold">
            ✕
          </button>
        </div>
      )}

      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
        <div className="border-b border-[#E2E0DB] pb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#A52307]" />
            <span>Rapid Return Scanning Station</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Scan returned barcodes or RFID tags. Overdue penalties calculate automatically.</p>
        </div>

        <form onSubmit={handleCheckinSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Scanned Item Barcode</label>
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
          <div className="py-10 text-center text-gray-400 font-mono text-xs">No returns processed yet this session.</div>
        ) : (
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
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">{ret.condition}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    {ret.fineAssessed > 0 ? (
                      <span className="font-mono font-bold text-[#A52307] bg-red-50 border border-red-200 px-2 py-0.5 rounded">₹{ret.fineAssessed} (Cashier Due)</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">₹0 (On Time)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right text-gray-500 font-mono">{ret.returnTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
