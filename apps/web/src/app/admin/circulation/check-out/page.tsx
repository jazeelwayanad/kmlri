'use client';

import { RotateCcw } from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import { CirculationModeTabs } from '@/components/admin/circulation/CirculationModeTabs';
import { CheckOutPanel } from '@/components/admin/circulation/CheckOutPanel';

export default function CheckOutPage() {
  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Circulation"
        title="Check Out"
        description="Look up a patron, scan item barcodes, and issue volumes with the correct due date."
        actions={
          <Button variant="outline" icon={RotateCcw} href="/admin/circulation">
            Circulation Overview
          </Button>
        }
      />
      <CirculationModeTabs />
      <CheckOutPanel />
    </div>
  );
}
