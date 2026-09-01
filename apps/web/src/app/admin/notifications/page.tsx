'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { Badge, Card, PageHeader, Button, StatCard } from '@/components/admin/ui';

export default function NotificationsAdminPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs' | 'channels' | 'broadcast'>('templates');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const templates = [
    {
      id: 'NOTIF-T01',
      title: 'Due Date Reminder (3 Days Advance)',
      channels: ['Email', 'SMS', 'In-App'],
      trigger: 'Automated (Cron Daily 08:00 AM)',
      languages: 'English, Arabic, Malayalam',
      status: 'ACTIVE',
    },
    {
      id: 'NOTIF-T02',
      title: 'Overdue Item Notice & Fine Assessment',
      channels: ['Email', 'SMS', 'In-App'],
      trigger: 'Automated (Cron Daily 09:00 AM)',
      languages: 'English, Arabic, Malayalam',
      status: 'ACTIVE',
    },
    {
      id: 'NOTIF-T03',
      title: 'Reserved Book Ready for Pickup',
      channels: ['SMS', 'In-App', 'Push'],
      trigger: 'Real-time on Check-in Scan',
      languages: 'English, Arabic, Malayalam',
      status: 'ACTIVE',
    },
    {
      id: 'NOTIF-T04',
      title: 'Acquisition Request Approval Notification',
      channels: ['Email', 'In-App'],
      trigger: 'On Staff Clearance',
      languages: 'English',
      status: 'ACTIVE',
    },
  ];

  const deliveryLogs = [
    { id: 'LOG-991', recipient: 'rashid@kmlri.in (+91 98470XXXXX)', type: 'Due Date Reminder', channel: 'Email + SMS', status: 'DELIVERED', time: 'Today 08:00 AM' },
    { id: 'LOG-992', recipient: 'amina@kmlri.in', type: 'Hold Pickup Alert', channel: 'In-App + Push', status: 'DELIVERED', time: 'Today 08:15 AM' },
    { id: 'LOG-993', recipient: 'taha@kmlri.in', type: 'Acquisition PO Dispatched', channel: 'Email', status: 'DELIVERED', time: 'Yesterday 04:20 PM' },
  ];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Communications Hub"
        title="Notification Management & Dispatch"
        description="Configure automated multi-channel alert templates (Email, SMS, Push, In-App), scheduling rules, multilingual localized copies, and dispatch queues."
        actions={
          <Button
            variant="dark"
            icon={Send}
            onClick={() => {
              setNotification('Broadcast notification sent to all 890 active patrons.');
              setTimeout(() => setNotification(null), 4000);
            }}
          >
            Send Instant Broadcast
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Channel Health Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">Email Gateway (SMTP)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-0.5"></span>
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">Online</div>
          <div className="text-[11px] font-medium mt-0.5 text-gray-400">mail.kmlri.in (99.9% uptime)</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">SMS Gateway</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-0.5"></span>
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">Online</div>
          <div className="text-[11px] font-medium mt-0.5 text-gray-400">DLT Registered Headers</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">In-App &amp; Push</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-0.5"></span>
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">Active</div>
          <div className="text-[11px] font-medium mt-0.5 text-gray-400">Real-time WebSocket &amp; PWA</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">Dispatched Today</span>
            <span className="text-[11px] text-emerald-600 font-bold font-mono">184 msgs</span>
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">100% Sent</div>
          <div className="text-[11px] font-medium mt-0.5 text-gray-400">0 failed delivery attempts</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Notification Templates (4)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'logs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Delivery Audit Logs
        </button>
      </div>

      {activeTab === 'templates' && (
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] tracking-wide">
                <th className="pb-3 px-3 py-2">Template Name</th>
                <th className="pb-3 px-3 py-2">Channels</th>
                <th className="pb-3 px-3 py-2">Trigger Schedule</th>
                <th className="pb-3 px-3 py-2">Languages</th>
                <th className="pb-3 px-3 py-2">Status</th>
                <th className="pb-3 px-3 py-2 text-right">Configure</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-sm text-gray-900">{t.title}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{t.id}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex gap-1">
                      {t.channels.map((c) => (
                        <span key={c} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-gray-700">{t.trigger}</td>
                  <td className="py-3.5 px-3 text-gray-600">{t.languages}</td>
                  <td className="py-3.5 px-3">
                    <Badge variant="success">{t.status}</Badge>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Editing template: ${t.title}`)}
                      className="px-2.5 py-1 border border-gray-300 rounded-lg text-[11px] font-semibold hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
                    >
                      Edit Template
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] tracking-wide">
                <th className="pb-3 px-3 py-2">Log ID</th>
                <th className="pb-3 px-3 py-2">Recipient</th>
                <th className="pb-3 px-3 py-2">Template</th>
                <th className="pb-3 px-3 py-2">Channel</th>
                <th className="pb-3 px-3 py-2">Time</th>
                <th className="pb-3 px-3 py-2 text-right">Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveryLogs.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{l.id}</td>
                  <td className="py-3.5 px-3 font-semibold text-gray-900">{l.recipient}</td>
                  <td className="py-3.5 px-3 font-bold text-sm text-gray-900">{l.type}</td>
                  <td className="py-3.5 px-3 text-gray-600">{l.channel}</td>
                  <td className="py-3.5 px-3 text-gray-500">{l.time}</td>
                  <td className="py-3.5 px-3 text-right">
                    <Badge variant="success">{l.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
