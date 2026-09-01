'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { PageHeader, Card, Button, Badge } from '@/components/admin/ui';

export default function IntegrationsAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);

  const integrations = [
    {
      id: 'INT-01',
      name: 'Student Information System (SIS / ERP)',
      category: 'AUTHENTICATION & USERS',
      description: 'Auto-sync student enrolments, department registrations, and graduation status.',
      syncSchedule: 'Hourly',
    },
    {
      id: 'INT-02',
      name: 'Institutional LDAP / Active Directory / SAML',
      category: 'AUTHENTICATION',
      description: 'Single Sign-On (SSO) for faculty and university network accounts.',
      syncSchedule: 'Real-time SSO',
    },
    {
      id: 'INT-03',
      name: 'ORCID & Crossref Scholarly Sync',
      category: 'RESEARCH METRICS',
      description: 'Automated retrieval of faculty research outputs, DOIs, and citation counts.',
      syncSchedule: 'Daily 02:00 AM',
    },
    {
      id: 'INT-04',
      name: 'Razorpay / UPI Payment Gateway',
      category: 'FINANCE & BILLING',
      description: 'Accept online fine settlements and research document reproduction charges.',
      syncSchedule: 'Real-time Webhook',
    },
    {
      id: 'INT-05',
      name: 'OpenAlex & DataCite Metadata Harvesting',
      category: 'HARVESTING & OAI-PMH',
      description: 'Bibliographic discovery enrichment and open citation indexing.',
      syncSchedule: 'Weekly',
    },
  ];

  const handleTestSync = (name: string) => {
    setNotification(`"${name}" is not connected — no integration credentials are configured on the backend yet.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Ecosystem"
        title="External Integrations & Connectors"
        description="Manage institutional SIS synchronization, Single Sign-On (SSO / SAML / LDAP), payment gateways, and academic indexing feeds (ORCID, Crossref, DataCite)."
      />

      {notification && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((int) => (
          <Card key={int.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] uppercase font-semibold tracking-wide text-gray-400">
                  {int.category}
                </span>
                <Badge variant="neutral">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>NOT CONFIGURED</span>
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{int.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{int.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <div className="text-gray-500">
                <span>Intended schedule: <strong className="text-gray-900">{int.syncSchedule}</strong></span>
              </div>
              <Button variant="outline" onClick={() => handleTestSync(int.name)}>
                Test Connection
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
