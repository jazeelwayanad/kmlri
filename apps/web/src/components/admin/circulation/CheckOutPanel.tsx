'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { User, CheckCircle2, AlertCircle, Barcode, Bookmark, Loader2 } from 'lucide-react';

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function CheckOutPanel() {
  const [patronSearch, setPatronSearch] = useState('');
  const [selectedPatron, setSelectedPatron] = useState<any>(null);
  const [patronLoading, setPatronLoading] = useState(false);

  const [checkoutBarcode, setCheckoutBarcode] = useState('');
  const [checkoutDays, setCheckoutDays] = useState(21);
  const [issuedThisSession, setIssuedThisSession] = useState<any[]>([]);
  const [issuing, setIssuing] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        setNotification({ type: 'error', text: `No member found matching "${patronSearch}".` });
        return;
      }
      const full = await api.getUser(matches[0].id);
      setSelectedPatron(full);
    } catch (err: any) {
      setSelectedPatron(null);
      setNotification({ type: 'error', text: err.message || 'Patron lookup failed.' });
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
      setIssuedThisSession([
        {
          id: loan.id,
          barcode: loan.copy?.barcode || checkoutBarcode,
          title: loan.copy?.bibRecord?.titleLatin || 'Item',
          shelfmark: loan.copy?.bibRecord?.shelfmark || '',
          days: checkoutDays,
          dueDate: formatDate(loan.dueDate),
        },
        ...issuedThisSession,
      ]);
      setCheckoutBarcode('');
      setNotification({ type: 'success', text: `Issued "${loan.copy?.bibRecord?.titleLatin}" to ${selectedPatron.fullName}. Due ${formatDate(loan.dueDate)}.` });
      await refreshPatron(selectedPatron.id);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not issue item.' });
    } finally {
      setIssuing(false);
    }
  };

  const activeLoansCount = selectedPatron?.loans?.filter((l: any) => l.status === 'ACTIVE').length || 0;
  const unpaidFinesTotal = (selectedPatron?.fines || [])
    .filter((f: any) => f.status === 'UNPAID')
    .reduce((acc: number, f: any) => acc + f.amount, 0);
  const holdsWaiting = (selectedPatron?.reservations || []).filter(
    (r: any) => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP',
  ).length;

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

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Left Column: Patron Verification Card */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#A52307]" />
                <span>Step 1: Patron Lookup</span>
              </span>
              {selectedPatron && (
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedPatron.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedPatron.status}
                </span>
              )}
            </div>

            <form onSubmit={handlePatronLookup} className="space-y-2">
              <label className="text-[11px] font-bold text-gray-700 block">Patron Membership ID / Email</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={patronSearch}
                  onChange={(e) => setPatronSearch(e.target.value)}
                  placeholder="Scan patron card, e.g. KMLRI-2026-0001"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                />
                <button
                  type="submit"
                  disabled={patronLoading}
                  className="px-3 py-2 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {patronLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Lookup
                </button>
              </div>
            </form>

            {selectedPatron && (
              <div className="bg-[#FAF8F5] p-3.5 rounded border border-[#E2E0DB] space-y-2.5 text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{selectedPatron.fullName}</h4>
                  <span className="text-gray-500 font-mono text-[11px]">
                    {selectedPatron.membershipNumber} · {selectedPatron.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E0DB] text-[11px]">
                  <div>
                    <span className="text-gray-500 block">Borrow Quota:</span>
                    <strong className="text-gray-900 font-mono font-bold">
                      {activeLoansCount} / {selectedPatron.maxBorrowLimit} Books
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Unpaid Fines:</span>
                    <strong className={`font-mono font-bold ${unpaidFinesTotal > 0 ? 'text-[#A52307]' : 'text-emerald-700'}`}>₹{unpaidFinesTotal}</strong>
                  </div>
                </div>

                {holdsWaiting > 0 && (
                  <div className="bg-amber-100 text-amber-900 p-2 rounded text-[11px] font-bold flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                    <span>{holdsWaiting} hold{holdsWaiting > 1 ? 's' : ''} waiting for this patron</span>
                  </div>
                )}
              </div>
            )}

            {!selectedPatron && <div className="py-4 text-center text-gray-400 font-mono text-[11px]">Look up a patron to begin an issue session.</div>}
          </div>
        </div>

        {/* Right Column: Barcode Scan & Issue Log */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-4">
            <div className="border-b border-[#E2E0DB] pb-2.5 flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-[#A52307]" />
                <span>Step 2: Scan Item Barcode &amp; Set Duration</span>
              </span>
              <span className="text-[11px] font-bold font-mono text-gray-500">Loan Duration: {checkoutDays} Days</span>
            </div>

            <form onSubmit={handleAddCheckoutItem} className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Item Barcode / RFID Tag</label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-semibold bg-white text-gray-900 outline-none"
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
                  {issuing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Issue Volume</span>
                </button>
              </div>
            </form>

            {!selectedPatron && <p className="text-[11px] text-gray-400">Look up a patron on the left before scanning items.</p>}
          </div>

          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Issued This Session ({issuedThisSession.length})</h3>
                <span className="text-xs text-gray-500">Each scan issues immediately and stamps the due date.</span>
              </div>
            </div>

            {issuedThisSession.length === 0 ? (
              <div className="py-10 text-center text-gray-400 font-mono text-xs">Scan an item barcode above to issue a book to this patron.</div>
            ) : (
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                    <th className="py-2.5 px-3">Volume Title &amp; Shelfmark</th>
                    <th className="py-2.5 px-3">Barcode</th>
                    <th className="py-2.5 px-3">Loan Days</th>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
