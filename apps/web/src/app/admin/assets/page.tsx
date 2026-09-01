'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Boxes, 
  Search, 
  Plus, 
  Filter, 
  QrCode, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Printer, 
  Laptop, 
  Scan, 
  ShieldCheck, 
  Eye, 
  Building2, 
  Calendar, 
  Tag, 
  FileText,
  Clock,
  RotateCw
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

interface LibraryAsset {
  id: string;
  tag: string;
  name: string;
  category: 'DIGITIZATION' | 'CONSERVATION' | 'CIRCULATION' | 'IT_INFRASTRUCTURE' | 'ARCHIVAL_STORAGE';
  model: string;
  serialNumber: string;
  location: string;
  custodian: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiry: string;
  status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'ALLOCATED' | 'DEPRECATED';
  lastServiceDate?: string;
  condition: 'EXCELLENT' | 'GOOD' | 'NEEDS_CALIBRATION' | 'POOR';
}

export default function AssetManagementPage() {
  const [assets, setAssets] = useState<LibraryAsset[]>([
    {
      id: 'AST-001',
      tag: 'AST-SCN-001',
      name: 'Bookeye 5 V1A Professional Planetary Book Scanner',
      category: 'DIGITIZATION',
      model: 'Image Access Bookeye 5 V1A-C35',
      serialNumber: 'BE5-2024-8891',
      location: 'Digitization Lab (Room 204)',
      custodian: 'Senior Digitization Specialist',
      purchaseDate: '12 Jan 2024',
      purchaseCost: 1850000,
      warrantyExpiry: '12 Jan 2027',
      status: 'OPERATIONAL',
      lastServiceDate: '15 Jul 2026',
      condition: 'EXCELLENT',
    },
    {
      id: 'AST-002',
      tag: 'AST-LAB-014',
      name: 'Ultrasonic Polyester Encapsulation Welder',
      category: 'CONSERVATION',
      model: 'Preservation Equipment Ltd. SonicSeal 300',
      serialNumber: 'SS3-9941-K',
      location: 'Conservation & Paper Lab',
      custodian: 'Head of Manuscript Conservation',
      purchaseDate: '05 Mar 2023',
      purchaseCost: 640000,
      warrantyExpiry: '05 Mar 2026',
      status: 'OPERATIONAL',
      lastServiceDate: '10 Aug 2026',
      condition: 'GOOD',
    },
    {
      id: 'AST-003',
      tag: 'AST-GT-002',
      name: 'Nedap 3D RFID Security Detection Gates (Dual Pedestal)',
      category: 'CIRCULATION',
      model: 'Nedap PG39 RFID Gates',
      serialNumber: 'NDP-2025-091',
      location: 'Main Library Entrance / Exit',
      custodian: 'Circulation Desk Supervisor',
      purchaseDate: '20 Nov 2024',
      purchaseCost: 420000,
      warrantyExpiry: '20 Nov 2027',
      status: 'OPERATIONAL',
      lastServiceDate: '01 Jun 2026',
      condition: 'EXCELLENT',
    },
    {
      id: 'AST-004',
      tag: 'AST-LAB-088',
      name: 'Non-Aqueous Paper Deacidification Treatment Chamber',
      category: 'CONSERVATION',
      model: 'Bookkeeper Deacidification Unit Mk IV',
      serialNumber: 'BK-2022-104',
      location: 'Chemical Conservation Suite',
      custodian: 'Conservation Chemist',
      purchaseDate: '18 Aug 2022',
      purchaseCost: 1200000,
      warrantyExpiry: '18 Aug 2025',
      status: 'UNDER_MAINTENANCE',
      lastServiceDate: '28 Aug 2026',
      condition: 'NEEDS_CALIBRATION',
    },
    {
      id: 'AST-005',
      tag: 'AST-IT-019',
      name: 'Dell PowerEdge R750 IIIF & Archival Storage Server',
      category: 'IT_INFRASTRUCTURE',
      model: 'Dell R750 128TB RAID-6',
      serialNumber: 'SRV-DEL-7721',
      location: 'Server Room Rack A2',
      custodian: 'Lead Systems Architect',
      purchaseDate: '10 Oct 2023',
      purchaseCost: 950000,
      warrantyExpiry: '10 Oct 2028',
      status: 'OPERATIONAL',
      lastServiceDate: '20 Jul 2026',
      condition: 'EXCELLENT',
    },
    {
      id: 'AST-006',
      tag: 'AST-VLT-003',
      name: 'Liebert Climate & Humidity Precision Regulating Unit',
      category: 'ARCHIVAL_STORAGE',
      model: 'Vertiv Liebert PEX 30kW',
      serialNumber: 'VRT-2024-441',
      location: 'Special Collections Vault A',
      custodian: 'Facilities & Environmental Control',
      purchaseDate: '15 Feb 2024',
      purchaseCost: 1450000,
      warrantyExpiry: '15 Feb 2029',
      status: 'OPERATIONAL',
      lastServiceDate: '01 Aug 2026',
      condition: 'EXCELLENT',
    },
    {
      id: 'AST-007',
      tag: 'AST-CAM-008',
      name: 'Phase One IQ4 150MP Multi-Spectral Camera Back & Stand',
      category: 'DIGITIZATION',
      model: 'Phase One iXG 150MP',
      serialNumber: 'PHS-150-0928',
      location: 'Manuscript Micro-Imaging Suite',
      custodian: 'Dr. Tariq al-Omani (Research Fellow)',
      purchaseDate: '01 Jun 2024',
      purchaseCost: 3200000,
      warrantyExpiry: '01 Jun 2027',
      status: 'ALLOCATED',
      lastServiceDate: '12 May 2026',
      condition: 'EXCELLENT',
    },
  ]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  // New Asset Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState<'DIGITIZATION' | 'CONSERVATION' | 'CIRCULATION' | 'IT_INFRASTRUCTURE' | 'ARCHIVAL_STORAGE'>('DIGITIZATION');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('Digitization Lab (Room 204)');
  const [custodian, setCustodian] = useState('Senior Digitization Specialist');
  const [purchaseCost, setPurchaseCost] = useState(250000);
  const [warrantyExpiry, setWarrantyExpiry] = useState('2028-09-01');

  // Selected Asset Details View Modal
  const [viewingAsset, setViewingAsset] = useState<LibraryAsset | null>(null);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAsset: LibraryAsset = {
      id: `AST-${Date.now().toString().slice(-3)}`,
      tag: tag || `AST-EQ-${Date.now().toString().slice(-4)}`,
      name,
      category,
      model: model || 'Custom Institutional Spec',
      serialNumber: serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      location,
      custodian,
      purchaseDate: '01 Sep 2026',
      purchaseCost: Number(purchaseCost),
      warrantyExpiry,
      status: 'OPERATIONAL',
      condition: 'EXCELLENT',
      lastServiceDate: 'Just now',
    };

    setAssets([newAsset, ...assets]);
    setShowAddModal(false);
    setName('');
    setTag('');
    setModel('');
    setSerialNumber('');
    setNotification(`Asset "${newAsset.name}" registered successfully with Tag ${newAsset.tag}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tag.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase()) ||
      a.custodian.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValuation = assets.reduce((acc, cur) => acc + cur.purchaseCost, 0);
  const operationalCount = assets.filter((a) => a.status === 'OPERATIONAL' || a.status === 'ALLOCATED').length;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Asset Management · Institutional Registry"
        title="Asset Registry &amp; Equipment"
        description="Comprehensive lifecycle inventory of all physical hardware, digitization systems, conservation equipment, IT servers, and climate-control assets."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={Wrench} href="/admin/assets/maintenance">
              Maintenance Orders
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
              Register New Asset
            </Button>
          </div>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Registered Assets</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{assets.length} Units</span>
          <span className="text-[11px] text-gray-500">Active institutional hardware</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Asset Portfolio Value</span>
          <span className="text-2xl font-mono font-bold text-gray-900 mt-1 block">
            ₹{(totalValuation / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold">Total capital expenditure</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Operational Availability</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {Math.round((operationalCount / assets.length) * 100)}%
          </span>
          <span className="text-[11px] text-emerald-600">{operationalCount} of {assets.length} operational</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">In Maintenance / Service</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length}
          </span>
          <span className="text-[11px] text-amber-700">1 unit awaiting calibration</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets by tag, name, serial #, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="DIGITIZATION">Digitization Equipment</option>
            <option value="CONSERVATION">Conservation &amp; Lab</option>
            <option value="CIRCULATION">Circulation &amp; RFID</option>
            <option value="IT_INFRASTRUCTURE">IT &amp; Storage Servers</option>
            <option value="ARCHIVAL_STORAGE">Archival Climate Systems</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="ALLOCATED">Allocated to Staff/Fellow</option>
            <option value="DEPRECATED">Deprecated</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Asset Tag / ID</th>
              <th className="py-3 px-4">Asset Name &amp; Model</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Physical Location</th>
              <th className="py-3 px-4">Assigned Custodian</th>
              <th className="py-3 px-4">Valuation</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                  <span className="block">{a.tag}</span>
                  <span className="text-[10px] text-gray-400">{a.id}</span>
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <span className="font-bold text-gray-900 block text-sm">{a.name}</span>
                  <span className="text-gray-500 text-[11px] block">{a.model}</span>
                  <span className="font-mono text-gray-400 text-[10px]">SN: {a.serialNumber}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {a.category.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-700 font-semibold">{a.location}</td>
                <td className="py-3.5 px-4 text-gray-600">{a.custodian}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                  ₹{a.purchaseCost.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      a.status === 'OPERATIONAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : a.status === 'ALLOCATED'
                        ? 'bg-blue-100 text-blue-800'
                        : a.status === 'UNDER_MAINTENANCE'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {a.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => setViewingAsset(a)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Printing QR / Barcode Tag for ${a.tag}`)}
                    className="p-1 text-gray-400 hover:text-gray-900"
                    title="Print QR Tag"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL: Register New Asset */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-50 text-[#A52307] border border-red-100 flex items-center justify-center font-bold">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Register New Library Asset</h3>
                  <span className="text-[11px] text-gray-500">Enter institutional hardware and equipment specifications</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Asset Name <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zeutschel OS 16000 High-Resolution Overhead Book Scanner"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Asset Tag / Identification</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. AST-SCN-005 (Auto-generated if empty)"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Asset Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
                  >
                    <option value="DIGITIZATION">Digitization Equipment</option>
                    <option value="CONSERVATION">Conservation &amp; Lab</option>
                    <option value="CIRCULATION">Circulation &amp; RFID</option>
                    <option value="IT_INFRASTRUCTURE">IT &amp; Storage Servers</option>
                    <option value="ARCHIVAL_STORAGE">Archival Climate Systems</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Model / Specification</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Image Access A2+"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-8829104-X"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Location / Department</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Conservation Lab Suite 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Assigned Custodian</label>
                  <input
                    type="text"
                    value={custodian}
                    onChange={(e) => setCustodian(e.target.value)}
                    placeholder="e.g. Senior Conservator"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Warranty / AMC Expiry</label>
                  <input
                    type="date"
                    value={warrantyExpiry}
                    onChange={(e) => setWarrantyExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow"
                >
                  Save Asset Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: View Asset Details */}
      {viewingAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full overflow-hidden border border-[#E2E0DB] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-gray-500 block">{viewingAsset.tag}</span>
                <h3 className="font-bold text-gray-900 text-sm">{viewingAsset.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingAsset(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded border border-[#E2E0DB]">
                <div>
                  <span className="text-gray-500 block text-[11px]">Category:</span>
                  <strong className="text-gray-900">{viewingAsset.category.replace(/_/g, ' ')}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Status:</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    {viewingAsset.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Model &amp; Spec:</span>
                  <span className="text-gray-800">{viewingAsset.model}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Serial Number:</span>
                  <span className="font-mono font-bold text-gray-900">{viewingAsset.serialNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Installed Location:</span>
                  <span className="text-gray-800 font-semibold">{viewingAsset.location}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Assigned Custodian:</span>
                  <span className="text-gray-800">{viewingAsset.custodian}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Purchase Valuation:</span>
                  <span className="font-mono font-bold text-gray-900">₹{viewingAsset.purchaseCost.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Warranty Expiry:</span>
                  <span className="font-mono text-gray-900">{viewingAsset.warrantyExpiry}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Printing Asset Tag sticker for ${viewingAsset.tag}`);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Barcode / QR Tag</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingAsset(null)}
                  className="px-4 py-1.5 bg-black text-white rounded font-bold hover:bg-[#A52307]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
