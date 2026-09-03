'use client';

import { Key, AlertCircle } from 'lucide-react';
import { PageHeader, Card } from '@/components/admin/ui';

export default function ApiKeysAdminPage() {
  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Developer APIs"
        title="API Keys, Webhooks & REST Documentation"
        description="Issue and revoke API keys for external applications, configure granular scopes, and inspect request rate limits."
      />

      <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-sm font-semibold flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>Not yet implemented — there is no API key management backend wired up. No keys have been issued.</span>
      </div>

      {/* API Keys Table (empty state) */}
      <Card className="overflow-x-auto">
        <div className="py-12 text-center text-gray-400">
          <Key className="w-8 h-8 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-sm font-semibold text-gray-500">No API keys have been issued</p>
          <p className="text-xs text-gray-400 mt-1">Key management is not yet available on this system.</p>
        </div>
      </Card>

      {/* OpenAPI Swagger Spec Preview */}
      <Card className="bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Institutional REST Endpoints (v1)</h3>
        <p className="text-xs text-gray-500 mb-4">Base URL: <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-bold text-gray-700">/api</code></p>
        <div className="space-y-2 font-mono text-xs">
          <div className="p-2.5 bg-white border border-gray-200 rounded-lg flex justify-between items-center">
            <div><span className="text-emerald-700 font-bold mr-3">GET</span>/catalog/search</div>
            <span className="text-gray-500 font-sans">Search and paginate bibliographic holdings</span>
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
