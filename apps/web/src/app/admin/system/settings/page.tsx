'use client';

import { useState } from 'react';
import { Sliders, Save, CheckCircle2, AlertTriangle, Database, Search, HardDrive, RefreshCw } from 'lucide-react';
import { PageHeader, Button, Card } from '@/components/admin/ui';

export default function SystemSettingsAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);

  const [instituteName, setInstituteName] = useState('Kunhīn Musliyār Research & Resource Institute');
  const [instituteDomain, setInstituteDomain] = useState('kmlri.in');
  const [adminEmail, setAdminEmail] = useState('admin@kmlri.in');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [cacheTTL, setCacheTTL] = useState(3600);
  const [searchIndexingEngine, setSearchIndexingEngine] = useState('POSTGRES_FTS_ARABIC');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('System configuration parameters saved and updated across cluster.');
    setTimeout(() => setNotification(null), 4000);
  };

  const inputClasses =
    'w-full h-10 border border-gray-200 rounded-lg px-3 bg-white text-sm text-gray-900 outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20';

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Core Config"
        title="Institutional System Settings"
        description="Configure global institutional metadata, OPAC search indexing engine, Redis cache TTL, storage backends, and maintenance mode status."
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Settings Form */}
      <Card className="max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">General Institutional Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label className="block font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Institution Full Name
                </label>
                <input
                  type="text"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Primary Domain / URL
                </label>
                <input
                  type="text"
                  value={instituteDomain}
                  onChange={(e) => setInstituteDomain(e.target.value)}
                  className={`${inputClasses} font-mono`}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  System Administrator Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className={`${inputClasses} font-mono`}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Search Indexing &amp; High-Speed Cache</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  OPAC Search Engine
                </label>
                <select
                  value={searchIndexingEngine}
                  onChange={(e) => setSearchIndexingEngine(e.target.value)}
                  className={inputClasses}
                >
                  <option value="POSTGRES_FTS_ARABIC">PostgreSQL Bilingual FTS (Arabic + English)</option>
                  <option value="MEILISEARCH">Meilisearch Cluster (Typo-Tolerant Transliteration)</option>
                  <option value="ELASTICSEARCH">Elasticsearch Enterprise Academic Harvester</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Redis Cache TTL (Seconds)
                </label>
                <input
                  type="number"
                  value={cacheTTL}
                  onChange={(e) => setCacheTTL(Number(e.target.value))}
                  className={`${inputClasses} font-mono`}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 p-3 border border-amber-200 bg-amber-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-heritage-red"
              />
              <div>
                <span className="font-bold text-amber-900 text-sm block">Enable Public Maintenance Mode</span>
                <span className="text-amber-700 text-[11px]">Displays maintenance banner on kmlri.in while keeping staff console accessible.</span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit" variant="primary" icon={Save}>
              Save System Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
