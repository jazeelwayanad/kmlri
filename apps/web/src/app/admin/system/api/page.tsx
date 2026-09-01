'use client';

import { useState } from 'react';
import { Terminal, Plus, Key, Copy, AlertCircle, Shield, ExternalLink } from 'lucide-react';
import { PageHeader, Button, Card, Badge } from '@/components/admin/ui';

export default function ApiKeysAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);

  const apiKeys = [
    {
      id: 'KEY-01',
      name: 'OPAC Public Search & OAI-PMH Harvester',
      keyPreview: 'kmlri_live_pub_78a8f902xxxxxxxxxxxx',
      role: 'READ_ONLY_CATALOG',
      rateLimit: '1000 req / min',
      created: '01 Jan 2026',
      lastUsed: '2 mins ago',
      status: 'ACTIVE',
    },
    {
      id: 'KEY-02',
      name: 'SIS Student Sync Integration Key',
      keyPreview: 'kmlri_live_sis_44d01b91xxxxxxxxxxxx',
      role: 'STUDENT_MEMBER_WRITE',
      rateLimit: '500 req / min',
      created: '15 Feb 2026',
      lastUsed: '10 mins ago',
      status: 'ACTIVE',
    },
    {
      id: 'KEY-03',
      name: 'Digital Manuscript High-Res Microservice',
      keyPreview: 'kmlri_live_ms_11c88e00xxxxxxxxxxxx',
      role: 'DIGITAL_ASSET_STREAM',
      rateLimit: '2000 req / min',
      created: '10 Mar 2026',
      lastUsed: 'Today 09:30 AM',
      status: 'ACTIVE',
    },
  ];

  const showNotConnected = (action: string) => {
    setNotification(`${action} is not connected — there is no API key management backend wired up yet. This screen shows the intended layout only.`);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Developer APIs"
        title="API Keys, Webhooks & REST Documentation"
        description="Issue and revoke API keys for external applications, configure granular scopes, inspect request rate limits, and view live API documentation."
        actions={
          <Button variant="dark" icon={Plus} onClick={() => showNotConnected('Generating a new API key')}>
            Generate New API Key
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* API Keys Table */}
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400">
              <th className="pb-3 px-3 py-2">Client / Application Name</th>
              <th className="pb-3 px-3 py-2">Key Token Prefix</th>
              <th className="pb-3 px-3 py-2">Assigned Scope</th>
              <th className="pb-3 px-3 py-2">Rate Limit</th>
              <th className="pb-3 px-3 py-2">Last Active</th>
              <th className="pb-3 px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((k) => (
              <tr key={k.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3.5 px-3">
                  <div className="font-bold text-sm text-gray-900">{k.name}</div>
                  <div className="text-gray-400 text-[11px] font-mono">{k.id} · Created {k.created}</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-gray-800 font-bold">{k.keyPreview}</td>
                <td className="py-3.5 px-3">
                  <Badge variant="neutral">{k.role}</Badge>
                </td>
                <td className="py-3.5 px-3 text-gray-700 font-mono">{k.rateLimit}</td>
                <td className="py-3.5 px-3 text-gray-600">{k.lastUsed}</td>
                <td className="py-3.5 px-3 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => showNotConnected('Revoking API keys')}
                    className="px-2.5 py-1 border border-heritage-red text-heritage-red rounded-lg text-[11px] font-semibold hover:bg-heritage-red hover:text-white transition-colors"
                  >
                    Revoke Key
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* OpenAPI Swagger Spec Preview */}
      <Card className="bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Institutional REST Endpoints (v1)</h3>
        <p className="text-xs text-gray-500 mb-4">Base URL: <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-bold text-gray-700">https://api.kmlri.in/v1</code></p>
        <div className="space-y-2 font-mono text-xs">
          <div className="p-2.5 bg-white border border-gray-200 rounded-lg flex justify-between items-center">
            <div><span className="text-emerald-700 font-bold mr-3">GET</span>/catalog/records</div>
            <span className="text-gray-500 font-sans">Search and paginate bibliographic holdings</span>
          </div>
          <div className="p-2.5 bg-white border border-gray-200 rounded-lg flex justify-between items-center">
            <div><span className="text-emerald-700 font-bold mr-3">GET</span>/catalog/records/:id/digital-facsimile</div>
            <span className="text-gray-500 font-sans">Stream authenticated high-res manuscript scans</span>
          </div>
          <div className="p-2.5 bg-white border border-gray-200 rounded-lg flex justify-between items-center">
            <div><span className="text-blue-700 font-bold mr-3">POST</span>/circulation/issue</div>
            <span className="text-gray-500 font-sans">Issue item transaction to patron</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
