'use client';

import { useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/admin/ui';

export default function AccessPoliciesAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);

  const [requireRareBookClearance, setRequireRareBookClearance] = useState(true);
  const [allowOffCampusProxy, setAllowOffCampusProxy] = useState(true);
  const [watermarkDigitalPDFs, setWatermarkDigitalPDFs] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Institutional access control policies saved.');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Administration · Access Control"
        title="Access Policies & Clearances"
        description="Configure reading room physical access tiers, rare manuscript viewing clearances, automated dynamic watermarking, and proxy IP ranges."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Policy Rules Form */}
      <Card className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={requireRareBookClearance}
                onChange={(e) => setRequireRareBookClearance(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-heritage-red"
              />
              <div>
                <span className="font-bold text-gray-900 text-sm block">Require Chief Librarian Clearance for Rare Manuscripts</span>
                <span className="text-gray-500">Patrons must submit digital research intent form before physical vault access is authorized.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={allowOffCampusProxy}
                onChange={(e) => setAllowOffCampusProxy(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-heritage-red"
              />
              <div>
                <span className="font-bold text-gray-900 text-sm block">Enable Off-Campus EZProxy / Shibboleth Authentication</span>
                <span className="text-gray-500">Allow active students &amp; faculty to access subscribed research journals and databases from off-campus.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={watermarkDigitalPDFs}
                onChange={(e) => setWatermarkDigitalPDFs(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-heritage-red"
              />
              <div>
                <span className="font-bold text-gray-900 text-sm block">Embed Dynamic Patron Watermark on PDF Downloads</span>
                <span className="text-gray-500">Stamps patron Membership ID, IP address, and timestamp across generated digital facsimiles.</span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit" variant="primary" icon={Save}>
              Update Access Policies
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
