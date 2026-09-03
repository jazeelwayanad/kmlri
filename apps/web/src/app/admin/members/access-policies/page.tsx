'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Save } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

const PREFIX = 'access-policy.';

export default function AccessPoliciesAdminPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [requireRareBookClearance, setRequireRareBookClearance] = useState(true);
  const [allowOffCampusProxy, setAllowOffCampusProxy] = useState(true);
  const [watermarkDigitalPDFs, setWatermarkDigitalPDFs] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await api.getSettings(PREFIX);
        const map = new Map<string, any>(settings.map((s: any) => [s.key, s.value]));
        if (cancelled) return;
        setRequireRareBookClearance(map.get(`${PREFIX}requireRareBookClearance`) ?? true);
        setAllowOffCampusProxy(map.get(`${PREFIX}allowOffCampusProxy`) ?? true);
        setWatermarkDigitalPDFs(map.get(`${PREFIX}watermarkDigitalPDFs`) ?? true);
      } catch (err: any) {
        if (!cancelled) setNotification({ type: 'error', text: err.message || 'Failed to load access policies.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.setSettings([
        { key: `${PREFIX}requireRareBookClearance`, value: requireRareBookClearance },
        { key: `${PREFIX}allowOffCampusProxy`, value: allowOffCampusProxy },
        { key: `${PREFIX}watermarkDigitalPDFs`, value: watermarkDigitalPDFs },
      ]);
      setNotification({ type: 'success', text: 'Institutional access control policies saved.' });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to save access control policies.' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
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
        <div
          className={`p-4 rounded-lg text-sm font-semibold flex items-center gap-2 ring-1 ring-inset ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
              : 'bg-red-50 text-red-700 ring-red-600/20'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading access policies…</div>}

      {/* Policy Rules Form */}
      {!loading && (
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
            <Button type="submit" variant="primary" icon={Save} disabled={saving}>
              {saving ? 'Saving…' : 'Update Access Policies'}
            </Button>
          </div>
        </form>
      </Card>
      )}
    </div>
  );
}
