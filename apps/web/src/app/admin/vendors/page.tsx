'use client';

import { useState } from 'react';
import { Search, Plus, Star, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { PageHeader, Button, Card } from '@/components/admin/ui';

export default function VendorsAdminPage() {
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const vendors = [
    {
      id: 'VEN-01',
      name: 'Dar al-Kutub al-Ilmiyyah',
      type: 'International Arabic Publisher',
      contactPerson: 'Hassan Makki',
      email: 'sales@daralkutub.lb',
      phone: '+961 1 804 550',
      activeContracts: 'Annual Academic Supply 2026',
      totalSpent: '₹4,80,000',
      rating: 4.9,
      status: 'ACTIVE',
    },
    {
      id: 'VEN-02',
      name: 'Heritage Book Centre Calicut',
      type: 'Malabar & Regional Books',
      contactPerson: 'K. Kunhali',
      email: 'orders@heritagecalicut.in',
      phone: '+91 98470 12345',
      activeContracts: 'Kerala History Consortium',
      totalSpent: '₹2,35,000',
      rating: 4.8,
      status: 'ACTIVE',
    },
    {
      id: 'VEN-03',
      name: 'Al-Huda Manuscript Preservation Lab',
      type: 'Binding & Conservation Supplies',
      contactPerson: 'Zubair Ahmad',
      email: 'lab@alhudabinding.org',
      phone: '+91 94471 99887',
      activeContracts: 'De-acidification & Leather Binding',
      totalSpent: '₹1,50,000',
      rating: 4.7,
      status: 'ACTIVE',
    },
    {
      id: 'VEN-04',
      name: 'Brill Academic Publishers',
      type: 'Digital Journals & Middle East Databases',
      contactPerson: 'Sophie Van Dijk',
      email: 'journals@brill.com',
      phone: '+31 71 535 3500',
      activeContracts: 'Middle East Islamic Studies Online',
      totalSpent: '₹6,20,000',
      rating: 5.0,
      status: 'ACTIVE',
    },
  ];

  const filtered = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.type.toLowerCase().includes(search.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Supplier Directory"
        title="Vendors & Publisher Partners"
        description="Maintain publisher records, book dealers, binderies, subscription agencies, contracts, and supplier performance metrics."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setNotification('New Vendor Registration form opened.');
              setTimeout(() => setNotification(null), 3000);
            }}
          >
            Register New Vendor
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search Bar */}
      <Card className="flex justify-between items-center" padded={false}>
        <div className="p-4 flex justify-between items-center w-full">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendor name, supplier type, contact person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
            />
          </div>
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide shrink-0 ml-4">
            {filtered.length} Registered Vendors
          </span>
        </div>
      </Card>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((v) => (
          <Card key={v.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[11px] uppercase font-semibold text-heritage-red block">
                  {v.type}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{v.name}</h3>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 ring-1 ring-inset ring-amber-600/20 px-2 py-0.5 rounded-full text-amber-800 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{v.rating}</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-gray-500 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Contact:</span>
                <span>{v.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{v.email}</span>
                <span className="text-gray-300">|</span>
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{v.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold text-gray-700">{v.activeContracts}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-400 text-[11px] block">Total Invoiced</span>
                <span className="font-mono font-bold text-gray-900">{v.totalSpent}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => alert(`Showing Purchase Orders & Invoices ledger for ${v.name}`)}
                >
                  Order History
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
