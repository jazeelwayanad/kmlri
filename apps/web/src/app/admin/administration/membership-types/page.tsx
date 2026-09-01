'use client';

import { useState } from 'react';
import { KeyRound, Plus, CheckCircle2, Edit2 } from 'lucide-react';
import { PageHeader, Button, Card, Badge } from '@/components/admin/ui';

export default function MembershipTypesAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);

  const membershipTypes = [
    {
      id: 'MT-01',
      name: 'Undergraduate & Alimiyyah Student',
      code: 'STUDENT_UG',
      maxBorrowLimit: 3,
      loanDurationDays: 14,
      maxRenewals: 2,
      digitalAccess: 'Standard Open Collections',
      annualFee: '₹0 (Institutional)',
      activeMembersCount: 520,
    },
    {
      id: 'MT-02',
      name: 'Postgraduate & Research Scholar',
      code: 'SCHOLAR_PG',
      maxBorrowLimit: 6,
      loanDurationDays: 30,
      maxRenewals: 3,
      digitalAccess: 'Full Repository + Off-Campus Proxy',
      annualFee: '₹0 (Institutional)',
      activeMembersCount: 188,
    },
    {
      id: 'MT-03',
      name: 'Faculty & Senior Research Fellow',
      code: 'FACULTY_FELLOW',
      maxBorrowLimit: 12,
      loanDurationDays: 60,
      maxRenewals: 5,
      digitalAccess: 'Unrestricted Academic Archive + High-Res Tiff',
      annualFee: '₹0 (Institutional)',
      activeMembersCount: 64,
    },
    {
      id: 'MT-04',
      name: 'Visiting Scholar / External Researcher',
      code: 'EXTERNAL_RESEARCHER',
      maxBorrowLimit: 2,
      loanDurationDays: 7,
      maxRenewals: 1,
      digitalAccess: 'Reading Room Terminals Only',
      annualFee: '₹500 / Year',
      activeMembersCount: 118,
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Administration · Patron Categories"
        title="Membership Types & Quotas"
        description="Define institutional membership tiers, concurrent checkout quotas, maximum renewals, and digital collection privilege levels."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setNotification('New Membership Tier creation form opened.');
              setTimeout(() => setNotification(null), 3000);
            }}
          >
            Add Membership Type
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid of Membership Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {membershipTypes.map((mt) => (
          <Card key={mt.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-mono text-xs text-gray-500 font-bold">{mt.code}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">{mt.name}</h3>
                </div>
              </div>
              <Badge variant="accent">{mt.activeMembersCount} Patrons</Badge>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-center text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Borrow Limit</span>
                <span className="font-bold text-lg text-gray-900">{mt.maxBorrowLimit} Books</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Loan Duration</span>
                <span className="font-bold text-lg text-gray-900">{mt.loanDurationDays} Days</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Max Renewals</span>
                <span className="font-bold text-lg text-gray-900">{mt.maxRenewals} Times</span>
              </div>
            </div>

            <div className="mt-3 text-xs space-y-1 text-gray-600">
              <div><strong className="text-gray-900">Digital Access:</strong> {mt.digitalAccess}</div>
              <div><strong className="text-gray-900">Subscription Fee:</strong> {mt.annualFee}</div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => alert(`Configuring Quotas for ${mt.name}`)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Tier Rules</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
