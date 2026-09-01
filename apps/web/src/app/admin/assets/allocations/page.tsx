'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  RotateCcw, 
  ArrowLeft, 
  Laptop, 
  Camera, 
  Check, 
  X,
  FileSignature
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

interface AssetAllocation {
  id: string;
  assetTag: string;
  assetName: string;
  allocatedTo: string;
  patronId: string;
  role: string;
  department: string;
  issuedDate: string;
  expectedReturnDate: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  purpose: string;
}

export default function AssetAllocationsPage() {
  const [allocations, setAllocations] = useState<AssetAllocation[]>([
    {
      id: 'ALC-001',
      assetTag: 'AST-CAM-008',
      assetName: 'Phase One IQ4 150MP Multi-Spectral Camera Back & Stand',
      allocatedTo: 'Dr. Tariq al-Omani',
      patronId: 'MEM-0942',
      role: 'RESEARCHER',
      department: 'Visiting Indian Ocean Fellow',
      issuedDate: '10 Aug 2026',
      expectedReturnDate: '10 Nov 2026',
      status: 'ACTIVE',
      purpose: 'High-spectral analysis of faded 17th-century Arabi-Malayalam ink recipes.',
    },
    {
      id: 'ALC-002',
      assetTag: 'AST-OPT-022',
      assetName: 'Digital UV-A/UV-C Fluorescence Inspection Lamp Kit',
      allocatedTo: 'Aisha Rahmani',
      patronId: 'STAFF-104',
      role: 'STAFF',
      department: 'Conservation Lab',
      issuedDate: '15 Aug 2026',
      expectedReturnDate: '15 Sep 2026',
      status: 'ACTIVE',
      purpose: 'Mold spore detection on newly donated Parappur family codices.',
    },
    {
      id: 'ALC-003',
      assetTag: 'AST-LAP-091',
      assetName: 'Dell Precision 5770 Mobile Workstation (4K OLED)',
      allocatedTo: 'Prof. K. A. Najeeb',
      patronId: 'MEM-1004',
      role: 'FACULTY',
      department: 'Department of Maritime History',
      issuedDate: '01 Jun 2026',
      expectedReturnDate: '01 Dec 2026',
      status: 'ACTIVE',
      purpose: 'GIS Mapping of Malabar Port Inscription coordinates.',
    },
  ]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [assetTag, setAssetTag] = useState('AST-CAM-008');
  const [assetName, setAssetName] = useState('Phase One Camera Stand');
  const [allocatedTo, setAllocatedTo] = useState('Dr. Tariq al-Omani');
  const [patronId, setPatronId] = useState('MEM-0942');
  const [expectedReturnDate, setExpectedReturnDate] = useState('2026-11-30');
  const [purpose, setPurpose] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlloc: AssetAllocation = {
      id: `ALC-${Date.now().toString().slice(-3)}`,
      assetTag,
      assetName,
      allocatedTo,
      patronId,
      role: 'RESEARCHER',
      department: 'Research Wing',
      issuedDate: '01 Sep 2026',
      expectedReturnDate,
      status: 'ACTIVE',
      purpose: purpose || 'Academic research and institutional digitization project.',
    };

    setAllocations([newAlloc, ...allocations]);
    setShowModal(false);
    setPurpose('');
    setNotification(`Asset "${newAlloc.assetName}" issued to ${newAlloc.allocatedTo}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReturnAsset = (id: string, assetName: string) => {
    setAllocations(
      allocations.map((a) => (a.id === id ? { ...a, status: 'RETURNED' } : a))
    );
    setNotification(`Asset "${assetName}" returned and checked back into vault inventory.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = allocations.filter(
    (a) =>
      a.allocatedTo.toLowerCase().includes(search.toLowerCase()) ||
      a.assetName.toLowerCase().includes(search.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      a.patronId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Asset Management · Hand-Over &amp; Custody"
        title="Asset Allocations &amp; Custody"
        description="Track physical check-outs of movable digitization equipment, field research gear, specialized microscopes, and workstations to fellows and staff."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={ArrowLeft} href="/admin/assets">
              All Assets
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
              Issue Asset to Patron
            </Button>
          </div>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Active External Allocations</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">
            {allocations.filter((a) => a.status === 'ACTIVE').length} Units
          </span>
          <span className="text-[11px] text-gray-500">Currently in researcher custody</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Returned This Term</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {allocations.filter((a) => a.status === 'RETURNED').length} Units
          </span>
          <span className="text-[11px] text-emerald-600">Re-deposited to storage</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Overdue Custody Reminders</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">
            {allocations.filter((a) => a.status === 'OVERDUE').length}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold">All active loans on schedule</span>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Allocation Ref</th>
              <th className="py-3 px-4">Asset Tag &amp; Item</th>
              <th className="py-3 px-4">Custody Assigned To</th>
              <th className="py-3 px-4">Research Purpose</th>
              <th className="py-3 px-4">Issued Date</th>
              <th className="py-3 px-4">Return Due</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{a.id}</td>
                <td className="py-3.5 px-4 max-w-xs">
                  <span className="font-bold text-gray-900 block">{a.assetName}</span>
                  <span className="font-mono text-gray-500 text-[11px]">{a.assetTag}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-gray-900 block">{a.allocatedTo}</span>
                  <span className="font-mono text-gray-500 text-[10px]">{a.patronId} · {a.role}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-600 max-w-xs">{a.purpose}</td>
                <td className="py-3.5 px-4 text-gray-600 font-mono">{a.issuedDate}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{a.expectedReturnDate}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      a.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-800'
                        : a.status === 'RETURNED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {a.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={() => handleReturnAsset(a.id, a.assetName)}
                      className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Check In</span>
                    </button>
                  ) : (
                    <span className="text-gray-400 text-[11px]">Returned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL: Issue Asset */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-[#E2E0DB]">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Issue Movable Asset to Researcher</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAllocation} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Asset Tag</label>
                <input
                  type="text"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Asset Name</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Researcher / Custodian Name</label>
                  <input
                    type="text"
                    value={allocatedTo}
                    onChange={(e) => setAllocatedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Patron Membership ID</label>
                  <input
                    type="text"
                    value={patronId}
                    onChange={(e) => setPatronId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Expected Return Date</label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Project Purpose &amp; Clearance Scope</label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Inscription multispectral imaging in Malabar coastal ports..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800"
                >
                  Authorize Check-Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
