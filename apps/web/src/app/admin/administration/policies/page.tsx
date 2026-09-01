'use client';

import { useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/admin/ui';

export default function CirculationPoliciesAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);

  const [finePerDay, setFinePerDay] = useState(10);
  const [gracePeriodDays, setGracePeriodDays] = useState(2);
  const [holdPickupDays, setHoldPickupDays] = useState(5);
  const [lostBookMultiplier, setLostBookMultiplier] = useState(1.5);
  const [maxRenewalsStandard, setMaxRenewalsStandard] = useState(2);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Institutional circulation policies updated and live on circulation desk.');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Administration · Governance"
        title="Circulation & Borrowing Policies"
        description="Configure institutional overdue fine rates, grace period windows, hold shelf retention times, and replacement multipliers."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Form Settings */}
      <Card className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Overdue Fine Rate (₹ Per Day)
              </label>
              <input
                type="number"
                min={1}
                value={finePerDay}
                onChange={(e) => setFinePerDay(Number(e.target.value))}
                className="w-full h-10 border border-gray-200 px-3 rounded-lg font-mono text-sm bg-white focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20 outline-none"
              />
              <p className="text-gray-500 mt-1">Accrues daily per overdue item.</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Overdue Grace Period (Days)
              </label>
              <input
                type="number"
                min={0}
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                className="w-full h-10 border border-gray-200 px-3 rounded-lg font-mono text-sm bg-white focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20 outline-none"
              />
              <p className="text-gray-500 mt-1">Days before fine calculation triggers.</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Hold Shelf Retention Window (Days)
              </label>
              <input
                type="number"
                min={1}
                value={holdPickupDays}
                onChange={(e) => setHoldPickupDays(Number(e.target.value))}
                className="w-full h-10 border border-gray-200 px-3 rounded-lg font-mono text-sm bg-white focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20 outline-none"
              />
              <p className="text-gray-500 mt-1">Days reserved item stays on hold shelf before auto-expiry.</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Lost Book Replacement Charge Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                min={1}
                value={lostBookMultiplier}
                onChange={(e) => setLostBookMultiplier(Number(e.target.value))}
                className="w-full h-10 border border-gray-200 px-3 rounded-lg font-mono text-sm bg-white focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20 outline-none"
              />
              <p className="text-gray-500 mt-1">Multiplier on catalog book value + processing fee.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit" variant="primary" icon={Save}>
              Save Circulation Policies
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
