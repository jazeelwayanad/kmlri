'use client';

import { useState } from 'react';
import { 
  BookMarked, 
  Search, 
  Plus, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Eye, 
  X,
  FileCheck
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function CatalogueSerialsPage() {
  const [serials, setSerials] = useState([
    {
      id: 'SER-01',
      title: 'Al-Bayān Monthly Arabic Journal',
      titleArabic: 'مجلة البيان الشهرية',
      issn: '2456-8890',
      frequency: 'Monthly',
      publisher: 'Malabar Archival Press, Kozhikode',
      holdingsSummary: 'Vol. 1 (1921) – Vol. 14 (1935)',
      status: 'ACTIVE_SUBSCRIPTION',
      issues: [
        { id: 'ISS-101', volume: 'Vol. 14', issueNo: 'Issue 8', pubDate: 'August 2026', receivedDate: '25 Aug 2026', status: 'RECEIVED' },
        { id: 'ISS-102', volume: 'Vol. 14', issueNo: 'Issue 7', pubDate: 'July 2026', receivedDate: '20 Jul 2026', status: 'RECEIVED' },
        { id: 'ISS-103', volume: 'Vol. 14', issueNo: 'Issue 9', pubDate: 'September 2026', receivedDate: 'Pending', status: 'EXPECTED' },
      ],
    },
    {
      id: 'SER-02',
      title: 'Majallat al-Huda Arabi-Malayalam Gazette',
      titleArabic: 'مجلة الهدى',
      issn: '1890-4421',
      frequency: 'Quarterly',
      publisher: 'Makhdūmiya Press, Ponnani',
      holdingsSummary: 'Vol. 1 (1902) – Vol. 6 (1908)',
      status: 'CEASED_ARCHIVED',
      issues: [
        { id: 'ISS-201', volume: 'Vol. 6', issueNo: 'Issue 4', pubDate: 'December 1908', receivedDate: 'Archived', status: 'RECEIVED' },
      ],
    },
  ]);

  const [search, setSearch] = useState('');
  const [selectedSerial, setSelectedSerial] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIssn, setNewIssn] = useState('');
  const [newFrequency, setNewFrequency] = useState('Monthly');
  const [newPublisher, setNewPublisher] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // New Issue Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueVol, setIssueVol] = useState('');
  const [issueNum, setIssueNum] = useState('');
  const [issueDate, setIssueDate] = useState('');

  const handleCreateSerial = (e: React.FormEvent) => {
    e.preventDefault();
    const newS = {
      id: `SER-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      titleArabic: '',
      issn: newIssn,
      frequency: newFrequency,
      publisher: newPublisher,
      holdingsSummary: 'Vol. 1 (2026) – Current',
      status: 'ACTIVE_SUBSCRIPTION',
      issues: [],
    };
    setSerials([newS, ...serials]);
    setShowAddModal(false);
    setNewTitle('');
    setNewIssn('');
    setNewPublisher('');
    setNotification(`Serial publication "${newTitle}" registered.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSerial) return;
    const newIss = {
      id: `ISS-${Date.now().toString().slice(-4)}`,
      volume: issueVol,
      issueNo: issueNum,
      pubDate: issueDate,
      receivedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'RECEIVED',
    };
    const updated = serials.map((s) =>
      s.id === selectedSerial.id
        ? { ...s, issues: [newIss, ...s.issues] }
        : s
    );
    setSerials(updated);
    setSelectedSerial({ ...selectedSerial, issues: [newIss, ...selectedSerial.issues] });
    setShowIssueModal(false);
    setIssueVol('');
    setIssueNum('');
    setIssueDate('');
    setNotification(`Issue ${issueNum} checked in and recorded into holdings.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = serials.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.issn.includes(search)
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Periodicals &amp; Serials"
        title="Serials &amp; Periodicals Management"
        description="Track continuous publications, journal subscriptions, archival magazine holdings, and check in new incoming issues."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Serial
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search serials by title or ISSN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Serials Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Serial Title &amp; ISSN</th>
              <th className="py-3 px-4">Frequency</th>
              <th className="py-3 px-4">Publisher / Press</th>
              <th className="py-3 px-4">Holdings Extent</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Holdings Desk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4">
                  <span className="font-amiri font-bold text-base text-gray-900 block leading-tight">{s.title}</span>
                  <span className="font-mono text-[11px] text-gray-500">ISSN: {s.issn} · Ref: {s.id}</span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-gray-700">{s.frequency}</td>
                <td className="py-3.5 px-4 text-gray-600">{s.publisher}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{s.holdingsSummary}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    s.status === 'ACTIVE_SUBSCRIPTION' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {s.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedSerial(s)}
                    className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Manage Issues ({s.issues.length})</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Serial Issue Management Drawer / Modal */}
      {selectedSerial && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A52307]">Issue Check-in Desk</p>
              <h3 className="font-amiri text-2xl font-bold text-gray-900 mt-0.5">{selectedSerial.title}</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" icon={Plus} onClick={() => setShowIssueModal(true)}>
                Check in New Issue
              </Button>
              <button
                type="button"
                onClick={() => setSelectedSerial(null)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close Desk
              </button>
            </div>
          </div>

          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Issue Ref</th>
                <th className="py-3 px-4">Volume &amp; Issue</th>
                <th className="py-3 px-4">Publication Month/Year</th>
                <th className="py-3 px-4">Received / Checked in</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {selectedSerial.issues.map((iss: any) => (
                <tr key={iss.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">{iss.id}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{iss.volume}, {iss.issueNo}</td>
                  <td className="py-3 px-4 text-gray-700">{iss.pubDate}</td>
                  <td className="py-3 px-4 text-gray-600">{iss.receivedDate}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      iss.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {iss.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Serial Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Add Serial Publication</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSerial} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Serial Title*</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">ISSN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 2456-8890"
                  value={newIssn}
                  onChange={(e) => setNewIssn(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Frequency</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Bi-Annual">Bi-Annual</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Publisher</label>
                <input
                  type="text"
                  value={newPublisher}
                  onChange={(e) => setNewPublisher(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors"
                >
                  Register Serial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Check In Issue</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIssue} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Volume Number*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vol. 14"
                  value={issueVol}
                  onChange={(e) => setIssueVol(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Issue Number*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue 9"
                  value={issueNum}
                  onChange={(e) => setIssueNum(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Publication Month/Year*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. September 2026"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors"
                >
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
