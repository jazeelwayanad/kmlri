'use client';

import { useState } from 'react';
import { GraduationCap, Search, Plus, ExternalLink, Award, FileText, CheckCircle2, Bookmark } from 'lucide-react';
import { PageHeader, Button, Card, StatCard, Badge } from '@/components/admin/ui';

export default function ResearchAdminPage() {
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const researchers = [
    {
      id: 'RES-01',
      name: 'Dr. Taha Malabari',
      title: 'Senior Research Fellow & Chair of Manuscript Studies',
      department: 'Islamic & Malabar Studies',
      orcid: '0000-0002-1825-0097',
      publicationsCount: 24,
      activeProjectsCount: 2,
      grantsValue: '₹14,50,000',
      status: 'ACTIVE',
    },
    {
      id: 'RES-02',
      name: 'Prof. Zakariyya Nadwi',
      title: 'Professor Emeritus of Arabic Epigraphy',
      department: 'Linguistics & Epigraphy',
      orcid: '0000-0001-9982-3412',
      publicationsCount: 42,
      activeProjectsCount: 1,
      grantsValue: '₹8,00,000',
      status: 'ACTIVE',
    },
    {
      id: 'RES-03',
      name: 'Rashid Vattaparamba',
      title: 'Doctoral Candidate & Junior Fellow',
      department: 'Department of Jurisprudence',
      orcid: '0009-0004-1120-9901',
      publicationsCount: 6,
      activeProjectsCount: 1,
      grantsValue: '₹3,00,000',
      status: 'ACTIVE',
    },
  ];

  const projects = [
    {
      code: 'PRJ-2026-MAL',
      title: 'Digital Preservation and Dialect Mapping of 18th-Century Arabi-Malayalam Poetry',
      lead: 'Dr. Taha Malabari',
      fundingBody: 'Kerala Heritage Conservation Council',
      budget: '₹9,50,000',
      duration: '2025 - 2027',
      status: 'ONGOING',
    },
    {
      code: 'PRJ-2026-EPI',
      title: 'Corpus of Islamic Inscriptions on the Malabar Littoral (800 - 1600 CE)',
      lead: 'Prof. Zakariyya Nadwi',
      fundingBody: 'Indian Council of Historical Research (ICHR)',
      budget: '₹12,00,000',
      duration: '2024 - 2026',
      status: 'ONGOING',
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Academic Research Hub"
        title="Research Management & Projects"
        description="Administer scholar research profiles, funded projects, ORCID/DOI identifiers, bibliometrics, and grant deliverables."
        actions={
          <Button
            variant="dark"
            icon={Plus}
            onClick={() => {
              setNotification('New Research Project profile created.');
              setTimeout(() => setNotification(null), 3000);
            }}
          >
            Register Research Project
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Active Researchers" value="64" hint="Faculty & Postdocs" />
        <StatCard label="Funded Projects" value="12 Grants" hint="₹48.5 Lakhs in research funds" hintTone="positive" />
        <StatCard label="ORCID Integration" value="92%" hint="Automated metadata sync" hintTone="positive" />
        <StatCard label="Total Publications" value="310" hint="Indexed in institutional portal" />
      </div>

      {/* Active Funded Projects */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ongoing Funded Research Grants</h3>
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.code} className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-start flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-900 text-white px-2 py-0.5 rounded font-bold">{p.code}</span>
                  <Badge variant="success">{p.status}</Badge>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mt-1">{p.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Principal Investigator: <span className="font-semibold text-gray-900">{p.lead}</span> · Sponsor: <span className="font-semibold text-gray-900">{p.fundingBody}</span> ({p.duration})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-400 block">Grant Allocation</span>
                <span className="font-mono text-base font-bold text-gray-900">{p.budget}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Researchers Directory */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Faculty &amp; Fellow Researcher Profiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {researchers.map((r) => (
            <div key={r.id} className="p-5 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
              <span className="text-[11px] uppercase font-semibold tracking-wide text-heritage-red block">
                {r.department}
              </span>
              <h4 className="text-xl font-bold text-gray-900 mt-0.5">{r.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{r.title}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1 font-mono">
                <div className="text-gray-400">ORCID: <span className="text-gray-900 font-semibold">{r.orcid}</span></div>
                <div className="text-gray-400">Publications: <span className="text-gray-900 font-semibold font-sans">{r.publicationsCount} Papers</span></div>
                <div className="text-gray-400">Active Grants: <span className="text-gray-900 font-semibold font-sans">{r.grantsValue}</span></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
