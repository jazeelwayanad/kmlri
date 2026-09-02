'use client';

import { RotateCcw } from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import { CirculationModeTabs } from '@/components/admin/circulation/CirculationModeTabs';
import { CheckInPanel } from '@/components/admin/circulation/CheckInPanel';

export default function CheckInPage() {
  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Circulation"
        title="Check In"
        description="Scan returned items to close out loans, assess overdue fines, and log condition on return."
        actions={
          <Button variant="outline" icon={RotateCcw} href="/admin/circulation">
            Circulation Overview
          </Button>
        }
      />
      <CirculationModeTabs />
      <CheckInPanel />
    </div>
  );
}
