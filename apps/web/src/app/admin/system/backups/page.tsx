'use client';

import { useState } from 'react';
import { HardDrive, Play, Download, CheckCircle2 } from 'lucide-react';
import { PageHeader, Button, Card, Badge, StatCard } from '@/components/admin/ui';

export default function BackupsAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);
  const [runningBackup, setRunningBackup] = useState(false);

  const backups = [
    { id: 'BAK-2026-0901', name: 'Daily Automated Database Snapshot', type: 'FULL_SQL_DB', size: '1.24 GB', date: '01 Sep 2026 04:00 AM', status: 'VERIFIED', destination: 'S3 Glacier + Off-site NAS' },
    { id: 'BAK-2026-0831', name: 'Digital Manuscripts File Archive Snapshot', type: 'FILES_ARCHIVE', size: '48.6 GB', date: '31 Aug 2026 02:00 AM', status: 'VERIFIED', destination: 'S3 Glacier' },
    { id: 'BAK-2026-0830', name: 'Weekly System Config & Schema Dump', type: 'CONFIG_SCHEMA', size: '14 MB', date: '30 Aug 2026 01:00 AM', status: 'VERIFIED', destination: 'Encrypted Vault' },
  ];

  const handleTriggerBackup = () => {
    setRunningBackup(true);
    setTimeout(() => {
      setRunningBackup(false);
      setNotification('On-demand database snapshot generated and securely encrypted to offsite archive.');
      setTimeout(() => setNotification(null), 4000);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Disaster Recovery & Snapshots"
        title="Backups & Archive Recovery"
        description="Automated PostgreSQL database snapshots, high-resolution manuscript image file archives, retention rules, and point-in-time recovery."
        actions={
          <Button variant="primary" icon={Play} onClick={handleTriggerBackup} disabled={runningBackup}>
            {runningBackup ? 'Snapshotting Database...' : 'Run Backup Now'}
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Last Backup Completed" value="Today, 04:00 AM" hint="Integrity checksum 100% verified" hintTone="positive" icon={HardDrive} />
        <StatCard label="Offsite Retention Rule" value="90 Days Rolling" hint="Geo-redundant encrypted storage" />
        <StatCard label="Recovery Time Objective (RTO)" value="< 15 Minutes" hint="Automated point-in-time restore" />
      </div>

      {/* Backups Table */}
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
              <th className="pb-3 pt-2 px-2 font-semibold">Snapshot Name</th>
              <th className="pb-3 pt-2 px-2 font-semibold">Type</th>
              <th className="pb-3 pt-2 px-2 font-semibold">Size</th>
              <th className="pb-3 pt-2 px-2 font-semibold">Created At</th>
              <th className="pb-3 pt-2 px-2 font-semibold">Destination</th>
              <th className="pb-3 pt-2 px-2 font-semibold">Integrity</th>
              <th className="pb-3 pt-2 px-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3.5 px-2">
                  <div className="font-bold text-sm text-gray-900">{b.name}</div>
                  <div className="text-gray-400 font-mono text-[11px]">{b.id}</div>
                </td>
                <td className="py-3.5 px-2 font-mono text-[11px] text-gray-700 font-semibold">{b.type}</td>
                <td className="py-3.5 px-2 font-mono text-gray-900 font-bold">{b.size}</td>
                <td className="py-3.5 px-2 text-gray-600">{b.date}</td>
                <td className="py-3.5 px-2 text-gray-700">{b.destination}</td>
                <td className="py-3.5 px-2">
                  <Badge variant="success">{b.status}</Badge>
                </td>
                <td className="py-3.5 px-2 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => alert(`Initiating download for ${b.id} (Encrypted Archive)`)}
                    className="px-2.5 py-1 border border-gray-300 rounded-lg text-[11px] font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
