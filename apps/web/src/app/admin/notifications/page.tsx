'use client';

import { useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Radio,
  Clock,
  Settings2,
  Search,
  RotateCw,
  Edit3,
  Trash2,
  X,
  CheckCheck,
  Pause,
  Play,
  RotateCcw,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import {
  useNotifications,
  type NotifChannel,
  type NotifPriority,
  type NotifTemplate,
} from '@/lib/notification-store';

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function channelBadge(ch: NotifChannel) {
  const map: Record<NotifChannel, string> = {
    EMAIL: 'bg-blue-100 text-blue-800',
    SMS: 'bg-emerald-100 text-emerald-800',
    IN_APP: 'bg-violet-100 text-violet-800',
    PUSH: 'bg-amber-100 text-amber-800',
  };
  return map[ch] ?? 'bg-gray-100 text-gray-700';
}

// ──────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────

export default function NotificationsAdminPage() {
  const {
    logs,
    retryLog,
    deleteLog,
    clearAllLogs,
    templates,
    updateTemplate,
    toggleTemplateStatus,
    resetTemplates,
    gateways,
    updateGateways,
    sendBroadcast,
    unreadCount,
    totalDispatched,
    deliveryRate,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'broadcast' | 'templates' | 'logs' | 'gateways'>('broadcast');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function showToast(type: 'success' | 'error', text: string, ms = 4500) {
    setToast({ type, text });
    setTimeout(() => setToast(null), ms);
  }

  // ── Broadcast state ────────────────────────────────────
  const [bAudience, setBAudience] = useState('ALL');
  const [bChannels, setBChannels] = useState<NotifChannel[]>(['EMAIL', 'IN_APP']);
  const [bPriority, setBPriority] = useState<NotifPriority>('NORMAL');
  const [bTitle, setBTitle] = useState('');
  const [bBody, setBBody] = useState('');
  const [bLink, setBLink] = useState('');
  const [sending, setSending] = useState(false);

  function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!bTitle.trim() || !bBody.trim() || bChannels.length === 0) return;
    setSending(true);
    // Short async dispatch simulation
    setTimeout(() => {
      sendBroadcast({
        title: bTitle,
        body: bBody,
        audience: bAudience,
        channels: bChannels,
        priority: bPriority,
        link: bLink,
      });
      setSending(false);
      const savedTitle = bTitle;
      setBTitle('');
      setBBody('');
      setBLink('');
      showToast(
        'success',
        `Broadcast "${savedTitle}" dispatched to ${bAudience} segment via ${bChannels.join(', ')}.`
      );
      // Switch to logs tab to view the live dispatch entries
      setActiveTab('logs');
    }, 600);
  }

  // ── Template editing state ─────────────────────────────
  const [editingTpl, setEditingTpl] = useState<NotifTemplate | null>(null);

  function handleSaveTpl(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTpl) return;
    updateTemplate(editingTpl);
    setEditingTpl(null);
    showToast('success', `Template "${editingTpl.name}" saved.`);
  }

  // ── Log filters ────────────────────────────────────────
  const [logSearch, setLogSearch] = useState('');
  const [logCh, setLogCh] = useState('ALL');
  const [logSt, setLogSt] = useState('ALL');

  const filteredLogs = logs.filter((l) => {
    const chOk = logCh === 'ALL' || l.channel === logCh;
    const stOk = logSt === 'ALL' || l.status === logSt;
    const q = logSearch.toLowerCase();
    const srOk =
      !q ||
      l.recipientName.toLowerCase().includes(q) ||
      l.recipientContact.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q);
    return chOk && stOk && srOk;
  });

  // ── Gateway state local clone for editing ──────────────
  const [smtpForm, setSmtpForm] = useState({
    smtpHost: gateways.smtpHost || '',
    smtpPort: gateways.smtpPort || 587,
    smtpEncryption: gateways.smtpEncryption || 'STARTTLS',
    smtpUser: gateways.smtpUser || '',
    smtpSenderEmail: gateways.smtpSenderEmail || '',
    smtpSenderName: gateways.smtpSenderName || 'KMLRI Library Communications',
  });

  const [smsForm, setSmsForm] = useState({
    smsProvider: gateways.smsProvider || '',
    smsSenderId: gateways.smsSenderId || '',
    smsApiKey: gateways.smsApiKey || '',
    smsDltEntityId: gateways.smsDltEntityId || '',
  });

  const [inAppForm, setInAppForm] = useState({
    retentionDays: gateways.retentionDays || 90,
    playSound: gateways.playSound ?? true,
    webPush: gateways.webPush ?? true,
  });

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    updateGateways({ ...smtpForm, smtpConfigured: !!smtpForm.smtpHost.trim() });
    showToast('success', 'SMTP Gateway configuration parameters saved.');
  };

  const handleSaveSms = (e: React.FormEvent) => {
    e.preventDefault();
    updateGateways({ ...smsForm, smsConfigured: !!smsForm.smsProvider.trim() });
    showToast('success', 'SMS & DLT Gateway configuration parameters saved.');
  };

  const handleSaveInApp = () => {
    updateGateways(inAppForm);
    showToast('success', 'In-App & Push Notification preferences saved.');
  };

  // ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1260px]">
      <PageHeader
        eyebrow="Communications & Messaging Hub"
        title="Notifications Hub"
        description="Compose multi-channel broadcasts, manage automated circulation alert rules, monitor dispatch receipts in real time, and configure gateway providers."
        actions={
          <Button variant="dark" icon={Send} onClick={() => setActiveTab('broadcast')}>
            Compose Broadcast
          </Button>
        }
      />

      {/* Toast */}
      {toast && (
        <div
          className={`p-4 border rounded-xl flex items-center gap-3 text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span className="flex-1">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-current opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Dispatched',
            value: totalDispatched.toLocaleString(),
            sub: totalDispatched === 0 ? 'No dispatches yet' : 'Outbound alerts recorded',
            icon: Bell,
            color: 'text-gray-400',
          },
          {
            label: 'Delivery Success',
            value: totalDispatched === 0 ? '100%' : `${deliveryRate}%`,
            sub: totalDispatched === 0 ? 'All gateways idle' : 'Across Email, SMS & Push',
            icon: CheckCheck,
            color: 'text-emerald-600',
          },
          {
            label: 'Active Triggers',
            value: `${templates.filter((t) => t.status === 'ACTIVE').length} Rules`,
            sub: 'Automated alert triggers',
            icon: Radio,
            color: 'text-[#A52307]',
          },
          {
            label: 'Unread In-App',
            value: String(unreadCount),
            sub: unreadCount === 0 ? 'All caught up' : 'Pending admin review',
            icon: Bell,
            color: unreadCount > 0 ? 'text-[#A52307]' : 'text-gray-400',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold uppercase text-gray-500">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <span className="text-2xl font-bold font-mono text-gray-900 mt-1 block">
                {kpi.value}
              </span>
              <span className="text-[11px] text-gray-500">{kpi.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Tab bar */}
      <div className="border-b border-[#E2E0DB] flex gap-1 flex-wrap">
        {[
          { key: 'broadcast', label: 'Broadcast & Circulars', icon: Send },
          { key: 'templates', label: `Automated Rules (${templates.length})`, icon: Radio },
          { key: 'logs', label: `Dispatch Ledger (${logs.length})`, icon: Clock },
          { key: 'gateways', label: 'Gateways & Settings', icon: Settings2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === key
                ? 'border-[#A52307] text-[#A52307] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          TAB 1 · BROADCAST COMPOSER
      ════════════════════════════════════════════════════ */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 text-xs">
          {/* Compose card */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm">
            <div className="border-b border-[#E2E0DB] pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Compose Institutional Broadcast</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Send real-time alerts, circulars, or emergency library notices to patron segments.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              {/* Row 1: audience + priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Target Segment *</label>
                  <select
                    value={bAudience}
                    onChange={(e) => setBAudience(e.target.value)}
                    className="w-full border border-gray-200 h-10 px-3 rounded text-xs bg-white text-gray-900 font-semibold outline-none focus:border-[#A52307]"
                  >
                    <option value="ALL">All Registered Library Patrons (All Roles)</option>
                    <option value="FACULTY">Faculty &amp; Senior Professors</option>
                    <option value="RESEARCHER">Research Fellows &amp; Scholars</option>
                    <option value="STUDENT">Enrolled Student Patrons</option>
                    <option value="STAFF">Institutional Staff Members</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Priority Level</label>
                  <select
                    value={bPriority}
                    onChange={(e) => setBPriority(e.target.value as NotifPriority)}
                    className="w-full border border-gray-200 h-10 px-3 rounded text-xs bg-white text-gray-900 outline-none focus:border-[#A52307]"
                  >
                    <option value="NORMAL">Standard Circular (Normal Priority)</option>
                    <option value="HIGH">High Priority (Highlighted Banner)</option>
                    <option value="URGENT">Urgent Alert / Emergency Notice</option>
                  </select>
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Dispatch Channels *</label>
                <div className="flex flex-wrap gap-4 p-3 bg-[#FAF8F5] border border-gray-200 rounded">
                  {(
                    [
                      { id: 'EMAIL' as NotifChannel, label: 'Email Newsletter / Digest', icon: Mail },
                      { id: 'SMS' as NotifChannel, label: 'SMS Text Message', icon: MessageSquare },
                      { id: 'IN_APP' as NotifChannel, label: 'In-App Notification Center', icon: Bell },
                      { id: 'PUSH' as NotifChannel, label: 'Web Browser Push Alert', icon: Smartphone },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => {
                    const checked = bChannels.includes(id);
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setBChannels(
                              checked ? bChannels.filter((c) => c !== id) : [...bChannels, id]
                            )
                          }
                          className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                        />
                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                        {label}
                      </label>
                    );
                  })}
                </div>
                {bChannels.length === 0 && (
                  <p className="text-[11px] text-red-600 mt-1 font-semibold">
                    Please select at least one dispatch channel.
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Subject / Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled System Maintenance & Digital Library Upgrade"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded text-xs text-gray-900 font-semibold outline-none focus:border-[#A52307]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Message Body *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Enter full announcement notice text..."
                  value={bBody}
                  onChange={(e) => setBBody(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded text-xs text-gray-900 outline-none focus:border-[#A52307] resize-none"
                />
              </div>

              {/* Action link */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Action URL / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /news/system-update or https://kmlri.in/events"
                  value={bLink}
                  onChange={(e) => setBLink(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded text-xs text-gray-900 font-mono outline-none focus:border-[#A52307]"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={sending || !bTitle.trim() || !bBody.trim() || bChannels.length === 0}
                  className="px-6 py-2.5 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {sending ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Broadcast Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview panel */}
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-3">
                Live In-App Preview
              </span>
              <div className="p-4 bg-[#FAF8F5] border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      bPriority === 'URGENT'
                        ? 'bg-red-600 text-white'
                        : bPriority === 'HIGH'
                        ? 'bg-[#A52307] text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 text-xs truncate">
                      {bTitle || 'Notice headline will appear here'}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-3">
                      {bBody || 'Body text will render for in-app and portal recipients...'}
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono mt-1.5 block">
                      Just now · {bAudience === 'ALL' ? 'All Patrons' : bAudience} · {bPriority}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-[2px] p-4 text-xs text-amber-900 space-y-1">
              <strong className="block font-bold">Multi-Channel Dispatch</strong>
              <p className="text-[11px] text-amber-800">
                Outbound dispatches update the live Dispatch Ledger and the Header Bell notification count instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB 2 · AUTOMATED TEMPLATES
      ════════════════════════════════════════════════════ */}
      {activeTab === 'templates' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-2 text-xs">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900">Automated Notification Rules &amp; Templates</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure subject templates, message formats, and toggle active status for system-triggered events.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetTemplates();
                  showToast('success', 'Reset all notification templates to system defaults.');
                }}
                className="px-2.5 py-1 text-[11px] border border-gray-300 rounded font-semibold text-gray-600 hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
              <span className="font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-700 font-bold text-[11px]">
                {templates.filter((t) => t.status === 'ACTIVE').length} Active / {templates.length} Total
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="py-4 px-3 hover:bg-[#FAF8F5] rounded transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5 max-w-2xl flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-700">
                      {tpl.code}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{tpl.name}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        tpl.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {tpl.status}
                    </span>
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                      {tpl.category}
                    </span>
                  </div>

                  <p className="text-gray-600 text-[11px]">
                    <strong>Subject:</strong> {tpl.subject}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {tpl.channels.map((ch) => (
                      <span
                        key={ch}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${channelBadge(ch)}`}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-500 text-[11px]">
                    <strong className="text-gray-700">Trigger:</strong> {tpl.trigger}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle ACTIVE / PAUSED */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleTemplateStatus(tpl.id);
                      showToast(
                        'success',
                        `Template "${tpl.name}" ${
                          tpl.status === 'ACTIVE' ? 'paused' : 'activated'
                        }.`
                      );
                    }}
                    className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      tpl.status === 'ACTIVE'
                        ? 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {tpl.status === 'ACTIVE' ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => setEditingTpl({ ...tpl })}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB 3 · DISPATCH LEDGER
      ════════════════════════════════════════════════════ */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900">Multi-Channel Dispatch Ledger</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time delivery log of all outbound broadcasts and automated notices.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearAllLogs();
                    showToast('success', 'All dispatch logs cleared.');
                  }}
                  className="px-2.5 py-1 text-[11px] border border-red-200 text-red-700 hover:bg-red-50 rounded font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Ledger</span>
                </button>
              )}
              <span className="font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-700 font-bold text-[11px]">
                {filteredLogs.length} / {logs.length} entries
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 bg-[#FAF8F5] border border-gray-200 p-3 rounded">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipient, type, log ID..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-9 pr-3 h-9 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={logCh}
                onChange={(e) => setLogCh(e.target.value)}
                className="border border-gray-300 px-3 h-9 text-xs rounded bg-white text-gray-700 outline-none"
              >
                <option value="ALL">All Channels</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="IN_APP">In-App</option>
                <option value="PUSH">Push</option>
              </select>
              <select
                value={logSt}
                onChange={(e) => setLogSt(e.target.value)}
                className="border border-gray-300 px-3 h-9 text-xs rounded bg-white text-gray-700 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="DELIVERED">Delivered</option>
                <option value="SENT">Sent</option>
                <option value="FAILED">Failed</option>
                <option value="QUEUED">Queued</option>
              </select>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-gray-300 rounded bg-[#FAF8F5] p-8">
              <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3 stroke-[1.5]" />
              <h3 className="text-base font-bold text-gray-800">Dispatch Ledger is Empty</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No outbound notifications have been dispatched yet. When you transmit an institutional broadcast or automated loan triggers fire, receipt logs will appear here.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('broadcast')}
                className="mt-4 px-4 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send First Broadcast</span>
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              No dispatch records match your current search and filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-3">Log ID</th>
                    <th className="py-3 px-3">Recipient</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Channel</th>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF8F5] group">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">{log.id}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900 block">{log.recipientName}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{log.recipientContact}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-700 font-medium max-w-[200px] truncate">{log.type}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${channelBadge(log.channel)}`}>
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 font-mono">{log.timestamp}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                            log.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.status}
                        </span>
                        {log.details && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[160px]" title={log.details}>
                            {log.details}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {log.status === 'FAILED' && (
                            <button
                              type="button"
                              onClick={() => {
                                retryLog(log.id);
                                showToast('success', `Dispatch ${log.id} retried — delivered.`);
                              }}
                              className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Retry</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              deleteLog(log.id);
                              showToast('success', `Log ${log.id} deleted.`);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-300 hover:text-red-600 cursor-pointer"
                            aria-label="Delete log entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB 4 · GATEWAYS & SETTINGS
      ════════════════════════════════════════════════════ */}
      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* SMTP */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E0DB] pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#A52307]" />
                <h3 className="font-bold text-gray-900 text-base">SMTP Email Gateway</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  gateways.smtpConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {gateways.smtpConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
              </span>
            </div>
            <form onSubmit={handleSaveSmtp} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">SMTP Host / Server</label>
                <input
                  type="text"
                  placeholder="e.g. smtp.mailgun.org or smtp.sendgrid.net"
                  value={smtpForm.smtpHost}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtpHost: e.target.value })}
                  className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Port</label>
                  <input
                    type="number"
                    value={smtpForm.smtpPort}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtpPort: Number(e.target.value) })}
                    className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Encryption</label>
                  <input
                    type="text"
                    value={smtpForm.smtpEncryption}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtpEncryption: e.target.value })}
                    className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">SMTP Username / Account</label>
                <input
                  type="text"
                  placeholder="e.g. postmaster@yourdomain.com"
                  value={smtpForm.smtpUser}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtpUser: e.target.value })}
                  className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Sender From Email</label>
                <input
                  type="email"
                  placeholder="e.g. library-notifications@kmlri.in"
                  value={smtpForm.smtpSenderEmail}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtpSenderEmail: e.target.value })}
                  className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => showToast('success', 'Test ping email transmitted to admin address.')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  Send Test Email
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#A52307] text-white rounded font-bold text-xs hover:bg-red-800 cursor-pointer"
                >
                  Save SMTP Settings
                </button>
              </div>
            </form>
          </div>

          {/* SMS & DLT */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E0DB] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-gray-900 text-base">SMS &amp; DLT Gateway</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  gateways.smsConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {gateways.smsConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
              </span>
            </div>
            <form onSubmit={handleSaveSms} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">SMS Provider Name</label>
                <input
                  type="text"
                  placeholder="e.g. Twilio, Gupshup, Fast2SMS"
                  value={smsForm.smsProvider}
                  onChange={(e) => setSmsForm({ ...smsForm, smsProvider: e.target.value })}
                  className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Approved Sender ID (6-char)</label>
                  <input
                    type="text"
                    placeholder="e.g. KMLRIB"
                    value={smsForm.smsSenderId}
                    onChange={(e) => setSmsForm({ ...smsForm, smsSenderId: e.target.value })}
                    className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">TRAI DLT Entity ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 110145293847291"
                    value={smsForm.smsDltEntityId}
                    onChange={(e) => setSmsForm({ ...smsForm, smsDltEntityId: e.target.value })}
                    className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">API Token / Secret Key</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••"
                  value={smsForm.smsApiKey}
                  onChange={(e) => setSmsForm({ ...smsForm, smsApiKey: e.target.value })}
                  className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => showToast('success', 'Test SMS test ping dispatched.')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  Send Test SMS
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#A52307] text-white rounded font-bold text-xs hover:bg-red-800 cursor-pointer"
                >
                  Save SMS Settings
                </button>
              </div>
            </form>
          </div>

          {/* In-App & Push */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-3">
              <Bell className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-gray-900 text-base">In-App &amp; Web Push Settings</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Notification Retention (Days)</label>
                <input
                  type="number"
                  min={7}
                  max={365}
                  value={inAppForm.retentionDays}
                  onChange={(e) => setInAppForm({ ...inAppForm, retentionDays: Number(e.target.value) })}
                  className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-mono outline-none focus:border-[#A52307]"
                />
              </div>
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={inAppForm.webPush}
                    onChange={(e) => setInAppForm({ ...inAppForm, webPush: e.target.checked })}
                    className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                  />
                  Enable Web Browser Push Notifications
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={inAppForm.playSound}
                    onChange={(e) => setInAppForm({ ...inAppForm, playSound: e.target.checked })}
                    className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                  />
                  Play Sound for Urgent Circulars
                </label>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSaveInApp}
                  className="px-4 py-2 bg-[#A52307] text-white rounded font-bold text-xs hover:bg-red-800 cursor-pointer"
                >
                  Save In-App Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL · EDIT TEMPLATE
      ════════════════════════════════════════════════════ */}
      {editingTpl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Edit Template</h3>
                <span className="text-[11px] text-gray-500 font-mono">{editingTpl.code}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingTpl(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTpl} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Email Subject Line *</label>
                <input
                  type="text"
                  required
                  value={editingTpl.subject}
                  onChange={(e) => setEditingTpl({ ...editingTpl, subject: e.target.value })}
                  className="w-full border border-gray-300 h-9 px-3 rounded text-xs font-semibold outline-none focus:border-[#A52307]"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Email Body (HTML/Markdown) *</label>
                <textarea
                  rows={5}
                  required
                  value={editingTpl.bodyPreview}
                  onChange={(e) => setEditingTpl({ ...editingTpl, bodyPreview: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded text-xs outline-none focus:border-[#A52307] resize-none font-sans"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">SMS Text (max 160 chars)</label>
                <textarea
                  rows={2}
                  maxLength={160}
                  value={editingTpl.smsText}
                  onChange={(e) => setEditingTpl({ ...editingTpl, smsText: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded text-xs font-mono outline-none focus:border-[#A52307] resize-none"
                />
                <span className="text-[10px] text-gray-400">{editingTpl.smsText.length}/160 chars</span>
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Trigger Description</label>
                <input
                  type="text"
                  value={editingTpl.trigger}
                  onChange={(e) => setEditingTpl({ ...editingTpl, trigger: e.target.value })}
                  className="w-full border border-gray-300 h-9 px-3 rounded text-xs outline-none focus:border-[#A52307]"
                />
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-gray-200 rounded">
                <span className="font-bold text-gray-700 block mb-1.5">Available Dynamic Variables</span>
                <div className="flex flex-wrap gap-1.5">
                  {editingTpl.variables.map((v) => (
                    <span
                      key={v}
                      className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-[10px] text-[#A52307]"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingTpl(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
