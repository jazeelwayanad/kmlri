'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  Calendar, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ArrowLeft,
  DollarSign,
  FileCheck
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

interface MaintenanceOrder {
  id: string;
  assetTag: string;
  assetName: string;
  serviceType: 'PREVENTIVE' | 'CALIBRATION' | 'REPAIR' | 'ANNUAL_AMC';
  vendor: string;
  scheduledDate: string;
  completionDate?: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  notes: string;
}

export default function AssetMaintenancePage() {
  const [orders, setOrders] = useState<MaintenanceOrder[]>([
    {
      id: 'MNT-2026-081',
      assetTag: 'AST-LAB-088',
      assetName: 'Non-Aqueous Paper Deacidification Treatment Chamber',
      serviceType: 'CALIBRATION',
      vendor: 'Preservation Equipment Calibration Services Ltd.',
      scheduledDate: '28 Aug 2026',
      estimatedCost: 28000,
      status: 'IN_PROGRESS',
      notes: 'Pressure sensor recalibration and chemical spray nozzle replacement.',
    },
    {
      id: 'MNT-2026-074',
      assetTag: 'AST-SCN-001',
      assetName: 'Bookeye 5 V1A Professional Planetary Scanner',
      serviceType: 'ANNUAL_AMC',
      vendor: 'Image Access India Authorised Service Network',
      scheduledDate: '15 Jul 2026',
      completionDate: '16 Jul 2026',
      estimatedCost: 45000,
      actualCost: 45000,
      status: 'COMPLETED',
      notes: 'Optics cleaning, glass plate tension alignment, CCD matrix sensor diagnostic check.',
    },
    {
      id: 'MNT-2026-062',
      assetTag: 'AST-VLT-003',
      assetName: 'Liebert Climate & Humidity Precision Regulating Unit',
      serviceType: 'PREVENTIVE',
      vendor: 'Vertiv Environmental HVAC Systems',
      scheduledDate: '01 Aug 2026',
      completionDate: '01 Aug 2026',
      estimatedCost: 15000,
      actualCost: 15000,
      status: 'COMPLETED',
      notes: 'HEPA filter cartridge change, ultrasonic humidifier descaling.',
    },
    {
      id: 'MNT-2026-090',
      assetTag: 'AST-GT-002',
      assetName: 'Nedap 3D RFID Security Detection Gates',
      serviceType: 'PREVENTIVE',
      vendor: 'Nedap Library Solutions Asia',
      scheduledDate: '10 Sep 2026',
      estimatedCost: 12000,
      status: 'PENDING',
      notes: 'Quarterly firmware security update and tuning antenna frequency.',
    },
  ]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [assetTag, setAssetTag] = useState('AST-LAB-088');
  const [assetName, setAssetName] = useState('Paper Deacidification Chamber');
  const [serviceType, setServiceType] = useState<'PREVENTIVE' | 'CALIBRATION' | 'REPAIR' | 'ANNUAL_AMC'>('PREVENTIVE');
  const [vendor, setVendor] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-09-15');
  const [estimatedCost, setEstimatedCost] = useState(15000);
  const [notes, setNotes] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: MaintenanceOrder = {
      id: `MNT-2026-${Date.now().toString().slice(-3)}`,
      assetTag,
      assetName,
      serviceType,
      vendor: vendor || 'Institutional Maintenance Contractor',
      scheduledDate,
      estimatedCost: Number(estimatedCost),
      status: 'PENDING',
      notes: notes || 'Standard scheduled service check.',
    };

    setOrders([newOrder, ...orders]);
    setShowModal(false);
    setVendor('');
    setNotes('');
    setNotification(`Work order ${newOrder.id} generated for ${newOrder.assetTag}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleMarkCompleted = (id: string) => {
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, status: 'COMPLETED', completionDate: 'Today (Verified)' } : o))
    );
    setNotification(`Work order #${id} marked as completed.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = orders.filter(
    (o) =>
      o.assetName.toLowerCase().includes(search.toLowerCase()) ||
      o.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Asset Management · Service Schedules"
        title="Maintenance &amp; Calibration Orders"
        description="Track preventive maintenance schedules, AMC vendor service contracts, sensor calibrations, and repair logs."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={ArrowLeft} href="/admin/assets">
              All Assets
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
              Schedule Service Order
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Pending / In-Progress Orders</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {orders.filter((o) => o.status === 'PENDING' || o.status === 'IN_PROGRESS').length} Orders
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Completed Service Logs</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {orders.filter((o) => o.status === 'COMPLETED').length} Work Orders
          </span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Annual Maintenance Spend</span>
          <span className="text-2xl font-mono font-bold text-gray-900 mt-1 block">
            ₹{orders.reduce((acc, cur) => acc + (cur.actualCost || cur.estimatedCost), 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Asset Tag &amp; Equipment</th>
              <th className="py-3 px-4">Service Type</th>
              <th className="py-3 px-4">Vendor / Technician</th>
              <th className="py-3 px-4">Scheduled Date</th>
              <th className="py-3 px-4">Cost (₹)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-[#FAF8F5]">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{o.id}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-gray-900 block">{o.assetName}</span>
                  <span className="font-mono text-gray-500 text-[11px]">{o.assetTag}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {o.serviceType.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-700">{o.vendor}</td>
                <td className="py-3.5 px-4 text-gray-600 font-mono">{o.scheduledDate}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                  ₹{(o.actualCost || o.estimatedCost).toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      o.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : o.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {o.status !== 'COMPLETED' ? (
                    <button
                      type="button"
                      onClick={() => handleMarkCompleted(o.id)}
                      className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-[#A52307] transition-colors"
                    >
                      Complete
                    </button>
                  ) : (
                    <span className="text-gray-400 text-[11px]">✓ Verified</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL: Schedule Service */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-[#E2E0DB]">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E2E0DB] flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Schedule Maintenance Work Order</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Target Asset Tag</label>
                <input
                  type="text"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Asset Name</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
                  >
                    <option value="PREVENTIVE">Preventive Check</option>
                    <option value="CALIBRATION">Sensor Calibration</option>
                    <option value="REPAIR">Hardware Repair</option>
                    <option value="ANNUAL_AMC">Annual AMC Service</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Vendor / Certified Technician</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Vertiv Technical Services"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Estimated Cost (₹)</label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Service Notes &amp; Scope of Work</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Details of required calibration or replaced components..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E0DB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
