'use client';

import { HardDrive, AlertCircle } from 'lucide-react';
import { PageHeader, Card, StatCard } from '@/components/admin/ui';

export default function BackupsAdminPage() {
  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Disaster Recovery & Snapshots"
        title="Backups & Archive Recovery"
        description="Automated PostgreSQL database snapshots, high-resolution manuscript image file archives, retention rules, and point-in-time recovery."
      />

      <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-sm font-semibold flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>Not yet implemented — no backup infrastructure is wired up on the backend yet. No snapshots have been taken.</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Last Backup Completed" value="Never" icon={HardDrive} />
        <StatCard label="Offsite Retention Rule" value="Not configured" />
        <StatCard label="Recovery Time Objective (RTO)" value="Not configured" />
      </div>

      {/* Backups Table (empty state) */}
      <Card className="overflow-x-auto">
        <div className="py-12 text-center text-gray-400">
          <HardDrive className="w-8 h-8 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-sm font-semibold text-gray-500">No backups on record</p>
          <p className="text-xs text-gray-400 mt-1">Automated backup infrastructure is not yet available on this system.</p>
        </div>
      </Card>
    </div>
  );
}
