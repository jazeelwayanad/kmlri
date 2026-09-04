'use client';

import { Suspense } from 'react';
import { PageHeader, Button } from '@/components/admin/ui';
import { CirculationDesk } from '@/components/admin/circulation/CirculationDesk';
import { Settings2, Bookmark, Clock, CreditCard } from 'lucide-react';

function DeskFallback() {
  return (
    <div className="p-12 text-center text-gray-500 font-mono text-xs">
      Loading Circulation Desk workbench…
    </div>
  );
}

export default function CirculationDeskPage() {
  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Circulation"
        title="Circulation Desk"
        description="Unified circulation workbench: Issue loans, process check-ins, and extend renewals in a single station."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" icon={Bookmark} href="/admin/circulation/holds">
              Shelf Holds
            </Button>
            <Button variant="outline" icon={Clock} href="/admin/circulation/overdues">
              Overdues
            </Button>
            <Button variant="outline" icon={CreditCard} href="/admin/circulation/fines">
              Fines Register
            </Button>
            <Button variant="outline" icon={Settings2} href="/admin/circulation/configuration">
              Rules Configuration
            </Button>
          </div>
        }
      />
      <Suspense fallback={<DeskFallback />}>
        <CirculationDesk />
      </Suspense>
    </div>
  );
}
