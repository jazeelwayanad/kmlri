'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowLeft, 
  Check, 
  RotateCw,
  QrCode,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

interface AuditItem {
  tag: string;
  name: string;
  expectedLocation: string;
  scannedLocation?: string;
  auditStatus: 'VERIFIED' | 'MISSING' | 'DISPLACED' | 'PENDING';
  lastScannedTime?: string;
}

export default function AssetAuditsPage() {
  const [auditSession, setAuditSession] = useState({
    sessionName: 'Annual Physical Hardware Verification 2026',
    zone: 'Digitization Lab & Conservation Suites',
    startDate: '01 Sep 2026',
    totalExpected: 7,
    verifiedCount: 5,
    displacedCount: 1,
    missingCount: 1,
  });

  const [scanInput, setScanInput] = useState('');
  const [items, setItems] = useState<AuditItem[]>([
    {
      tag: 'AST-SCN-001',
      name: 'Bookeye 5 V1A Planetary Scanner',
      expectedLocation: 'Digitization Lab (Room 204)',
      scannedLocation: 'Digitization Lab (Room 204)',
      auditStatus: 'VERIFIED',
      lastScannedTime: '01 Sep 2026, 09:30 AM',
    },
    {
      tag: 'AST-LAB-014',
      name: 'Ultrasonic Polyester Encapsulation Welder',
      expectedLocation: 'Conservation & Paper Lab',
      scannedLocation: 'Conservation & Paper Lab',
      auditStatus: 'VERIFIED',
      lastScannedTime: '01 Sep 2026, 10:15 AM',
    },
    {
      tag: 'AST-GT-002',
      name: 'Nedap 3D RFID Security Detection Gates',
      expectedLocation: 'Main Library Entrance / Exit',
      scannedLocation: 'Main Library Entrance / Exit',
      auditStatus: 'VERIFIED',
      lastScannedTime: '01 Sep 2026, 11:00 AM',
    },
    {
      tag: 'AST-IT-019',
      name: 'Dell PowerEdge R750 IIIF Server',
      expectedLocation: 'Server Room Rack A2',
      scannedLocation: 'Server Room Rack A2',
      auditStatus: 'VERIFIED',
      lastScannedTime: '01 Sep 2026, 11:30 AM',
    },
    {
      tag: 'AST-VLT-003',
      name: 'Liebert Climate & Humidity Precision Regulating Unit',
      expectedLocation: 'Special Collections Vault A',
      scannedLocation: 'Special Collections Vault A',
      auditStatus: 'VERIFIED',
      lastScannedTime: '01 Sep 2026, 11:45 AM',
    },
    {
      tag: 'AST-LAB-088',
      name: 'Paper Deacidification Treatment Chamber',
      expectedLocation: 'Chemical Conservation Suite',
      scannedLocation: 'Maintenance Bay 2 (Under Repair)',
      auditStatus: 'DISPLACED',
      lastScannedTime: '01 Sep 2026, 12:10 PM',
    },
    {
      tag: 'AST-CAM-008',
      name: 'Phase One IQ4 150MP Multi-Spectral Camera Back & Stand',
      expectedLocation: 'Manuscript Micro-Imaging Suite',
      auditStatus: 'PENDING',
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleScanAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const query = scanInput.trim().toUpperCase();
    const found = items.find((i) => i.tag.toUpperCase() === query || query.includes(i.tag.toUpperCase()));

    if (found) {
      setItems(
        items.map((i) =>
          i.tag === found.tag
            ? {
                ...i,
                auditStatus: 'VERIFIED',
                scannedLocation: i.expectedLocation,
                lastScannedTime: 'Just now (Scanner Verification)',
              }
            : i
        )
      );
      setNotification(`✓ Tag "${found.tag}" (${found.name}) verified in location.`);
    } else {
      setNotification(`Tag "${query}" verified as external / unknown asset tag.`);
    }

    setScanInput('');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Asset Management · Physical Audits"
        title="Physical Audits &amp; Verification"
        description="Run RFID and barcode audit scanners to reconcile expected physical asset placements against actual room locations."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={ArrowLeft} href="/admin/assets">
              All Assets
            </Button>
            <Button variant="primary" icon={FileSpreadsheet} onClick={() => alert('Exporting Audit Reconciliation Report (CSV)')}>
              Export Audit Report
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

      {/* Audit Banner Card */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E2E0DB] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Audit Session
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{auditSession.sessionName}</h2>
            <p className="text-xs text-gray-500 font-mono">Scope Zone: {auditSession.zone} · Started: {auditSession.startDate}</p>
          </div>

          <div className="flex gap-3 text-center text-xs">
            <div className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2E0DB] rounded">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Reconciliation</span>
              <strong className="text-lg font-bold text-emerald-700">
                {Math.round((items.filter((i) => i.auditStatus === 'VERIFIED').length / items.length) * 100)}%
              </strong>
            </div>
            <div className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2E0DB] rounded">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Verified</span>
              <strong className="text-lg font-bold text-gray-900">
                {items.filter((i) => i.auditStatus === 'VERIFIED').length} / {items.length}
              </strong>
            </div>
          </div>
        </div>

        {/* Audit Barcode Scanner Form */}
        <form onSubmit={handleScanAudit} className="flex gap-3">
          <div className="relative flex-1">
            <Scan className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan handheld RFID tag or barcode (e.g. AST-CAM-008)..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors"
          >
            Verify Tag
          </button>
        </form>
      </div>

      {/* Audit Reconciliation Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Asset Tag</th>
              <th className="py-3 px-4">Equipment Name</th>
              <th className="py-3 px-4">Expected Location</th>
              <th className="py-3 px-4">Scanned Audit Location</th>
              <th className="py-3 px-4">Audit Status</th>
              <th className="py-3 px-4 text-right">Last Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {items.map((i) => (
              <tr key={i.tag} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{i.tag}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{i.name}</td>
                <td className="py-3.5 px-4 text-gray-700">{i.expectedLocation}</td>
                <td className="py-3.5 px-4 font-mono text-gray-800">
                  {i.scannedLocation || <span className="text-gray-400 italic">Not Scanned Yet</span>}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      i.auditStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : i.auditStatus === 'DISPLACED'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {i.auditStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-gray-500 text-[11px]">
                  {i.lastScannedTime || 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
