'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings2, 
  Clock, 
  RotateCcw, 
  CreditCard, 
  Bell, 
  ShieldAlert, 
  Save, 
  CheckCircle2, 
  RotateCw,
  Users,
  Info,
  Plus,
  Trash2,
  Edit3,
  X,
  Shield
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { DynamicRole, getDynamicRoles, saveDynamicRoles } from '@/lib/dynamic-roles';
import { api } from '@/lib/api';

const PREFIX = 'circulation.';

const DEFAULT_RENEWAL_SETTINGS = {
  defaultRenewalDays: 14,
  maxRenewalsAllowed: 2,
  allowOnlineRenewal: true,
  blockRenewalIfOverdue: true,
  blockRenewalIfHoldPlaced: true,
  allowRenewalOverdueGraceLimit: 1,
};

const DEFAULT_FINE_SETTINGS = {
  dailyFineRate: 10,
  rareMaterialDailyFine: 25,
  maxFineCapPerItem: 500,
  fineThresholdBlockCirculation: 100,
  enableAutoFines: true,
};

const DEFAULT_NOTIFICATION_SETTINGS = {
  preDueReminderDays: 3,
  firstOverdueNoticeDays: 1,
  secondOverdueNoticeDays: 7,
  finalRecallNoticeDays: 14,
  sendEmailAlerts: true,
  sendSmsAlerts: false,
};

interface CirculationRule {
  roleSlug: string;
  roleName: string;
  defaultDays: number;
  maxQuota: number;
  gracePeriodDays: number;
  isSystem?: boolean;
}

export default function CirculationConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'loan_rules' | 'renewals' | 'fines' | 'notifications'>('loan_rules');
  const [saved, setSaved] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dynamic Loan rules per member type
  const [loanRules, setLoanRules] = useState<CirculationRule[]>([]);

  // Add Dynamic Rule Modal State
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleSlug, setNewRuleSlug] = useState('');
  const [newRuleDays, setNewRuleDays] = useState(14);
  const [newRuleQuota, setNewRuleQuota] = useState(5);
  const [newRuleGrace, setNewRuleGrace] = useState(1);

  // Renewal settings
  const [renewalSettings, setRenewalSettings] = useState(DEFAULT_RENEWAL_SETTINGS);

  // Fine settings
  const [fineSettings, setFineSettings] = useState(DEFAULT_FINE_SETTINGS);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);

  // Load persisted settings from backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await api.getSettings(PREFIX);
        const map = new Map<string, any>(settings.map((s: any) => [s.key, s.value]));
        if (cancelled) return;
        setRenewalSettings({ ...DEFAULT_RENEWAL_SETTINGS, ...(map.get(`${PREFIX}renewalSettings`) ?? {}) });
        setFineSettings({ ...DEFAULT_FINE_SETTINGS, ...(map.get(`${PREFIX}fineSettings`) ?? {}) });
        setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...(map.get(`${PREFIX}notificationSettings`) ?? {}) });
      } catch (err: any) {
        if (!cancelled) setNotification({ type: 'error', text: err.message || 'Failed to load circulation configuration.' });
      } finally {
        if (!cancelled) setLoadingSettings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load dynamic roles from storage / registry
  useEffect(() => {
    const roles = getDynamicRoles();
    const dynamicRules: CirculationRule[] = roles.map((r) => ({
      roleSlug: r.slug,
      roleName: r.name,
      defaultDays: r.defaultDays || 14,
      maxQuota: r.maxQuota || 5,
      gracePeriodDays: r.gracePeriodDays ?? 1,
      isSystem: r.isSystem,
    }));
    setLoanRules(dynamicRules);

    const handleRolesUpdate = () => {
      const updated = getDynamicRoles();
      setLoanRules(
        updated.map((r) => ({
          roleSlug: r.slug,
          roleName: r.name,
          defaultDays: r.defaultDays || 14,
          maxQuota: r.maxQuota || 5,
          gracePeriodDays: r.gracePeriodDays ?? 1,
          isSystem: r.isSystem,
        }))
      );
    };

    window.addEventListener('kmlri_roles_updated', handleRolesUpdate);
    return () => window.removeEventListener('kmlri_roles_updated', handleRolesUpdate);
  }, []);

  const handleRuleChange = (index: number, field: keyof CirculationRule, value: any) => {
    const updated = [...loanRules];
    (updated[index] as any)[field] = field === 'roleName' || field === 'roleSlug' ? value : Number(value);
    setLoanRules(updated);
  };

  const handleSave = async () => {
    // Sync back to dynamic roles storage
    const currentRoles = getDynamicRoles();
    const updatedRoles = currentRoles.map((r) => {
      const matched = loanRules.find((lr) => lr.roleSlug === r.slug);
      if (matched) {
        return {
          ...r,
          defaultDays: matched.defaultDays,
          maxQuota: matched.maxQuota,
          gracePeriodDays: matched.gracePeriodDays,
        };
      }
      return r;
    });

    // Also include any new rules created in this page
    loanRules.forEach((lr) => {
      if (!updatedRoles.some((r) => r.slug === lr.roleSlug)) {
        updatedRoles.push({
          id: `role-${Date.now()}-${lr.roleSlug}`,
          name: lr.roleName,
          slug: lr.roleSlug,
          description: `Dynamic role configured in circulation rules.`,
          isSystem: lr.roleSlug === 'super-admin',
          permissions: ['CATALOG_READ', 'CIRCULATION_CHECKOUT', 'HOLD_PLACE'],
          defaultDays: lr.defaultDays,
          maxQuota: lr.maxQuota,
          gracePeriodDays: lr.gracePeriodDays,
          memberCount: 0,
        });
      }
    });

    setSaving(true);
    try {
      saveDynamicRoles(updatedRoles);
      await api.setSettings([
        { key: `${PREFIX}renewalSettings`, value: renewalSettings },
        { key: `${PREFIX}fineSettings`, value: fineSettings },
        { key: `${PREFIX}notificationSettings`, value: notificationSettings },
      ]);
      setSaved(true);
      setNotification({ type: 'success', text: 'Circulation configuration & dynamic role loan limits saved successfully.' });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to save circulation configuration.' });
    } finally {
      setSaving(false);
      setTimeout(() => {
        setSaved(false);
        setNotification(null);
      }, 4000);
    }
  };

  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const slug = newRuleSlug
      ? newRuleSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : newRuleName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newRule: CirculationRule = {
      roleSlug: slug,
      roleName: newRuleName,
      defaultDays: Number(newRuleDays),
      maxQuota: Number(newRuleQuota),
      gracePeriodDays: Number(newRuleGrace),
      isSystem: false,
    };

    setLoanRules([...loanRules, newRule]);
    setShowAddRuleModal(false);
    setNewRuleName('');
    setNewRuleSlug('');
    setNotification({ type: 'success', text: `Dynamic circulation rule added for role "${newRule.roleName}". Click Save to commit.` });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteRule = (roleSlug: string, roleName: string) => {
    if (roleSlug === 'super-admin') {
      alert('Super Administrator is the system protected role and cannot be removed.');
      return;
    }
    if (confirm(`Remove circulation loan rule for "${roleName}"?`)) {
      setLoanRules(loanRules.filter((r) => r.roleSlug !== roleSlug));
      setNotification({ type: 'success', text: `Rule for "${roleName}" removed. Click Save Changes to commit.` });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Circulation"
        title="Circulation Configuration"
        description="Configure default loan periods, renewal rules, borrow quotas by dynamic member role, daily fine calculations, and automated return notice triggers."
        actions={
          <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving || loadingSettings}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        }
      />

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {loadingSettings && (
        <div className="p-4 text-xs text-gray-500">Loading circulation configuration…</div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#E2E0DB] flex gap-2 flex-wrap">
        {[
          { key: 'loan_rules', label: `Dynamic Role Loan Periods (${loanRules.length})`, icon: Clock },
          { key: 'renewals', label: 'Renewal Policies', icon: RotateCcw },
          { key: 'fines', label: 'Fines & Penalties', icon: CreditCard },
          { key: 'notifications', label: 'Overdue & Reminder Triggers', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'border-[#A52307] text-[#A52307]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Loan Periods & Quotas (Dynamic Roles) */}
      {activeTab === 'loan_rules' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Dynamic Member Role Loan Durations &amp; Quotas</h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Fully Dynamic
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Automatically synced with the <Link href="/admin/members/roles" className="text-[#A52307] underline font-semibold">Roles &amp; Permissions Matrix</Link>. Super Admin is the single default system role; all other role rules can be created, customized, or removed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/members/roles"
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Manage Roles Registry</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowAddRuleModal(true)}
                className="px-3.5 py-1.5 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role Rule</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                  <th className="py-3 px-4">Membership Role</th>
                  <th className="py-3 px-4">Role Key / Type</th>
                  <th className="py-3 px-4">Default Loan Period (Days)</th>
                  <th className="py-3 px-4">Max Borrow Quota (Books)</th>
                  <th className="py-3 px-4">Grace Period (Days)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEECE7]">
                {loanRules.map((rule, idx) => (
                  <tr key={rule.roleSlug} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-4">
                      <strong className="text-gray-900 block text-sm">{rule.roleName}</strong>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-gray-500 text-[11px] bg-gray-100 px-2 py-0.5 rounded uppercase font-bold">
                        {rule.roleSlug}
                      </span>
                      {rule.roleSlug === 'super-admin' && (
                        <span className="ml-1.5 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          System
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={180}
                          value={rule.defaultDays}
                          onChange={(e) => handleRuleChange(idx, 'defaultDays', e.target.value)}
                          className="w-20 px-2.5 py-1.5 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs text-center focus:border-[#A52307] outline-none bg-white"
                        />
                        <span className="text-gray-500 text-[11px]">days</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={rule.maxQuota}
                          onChange={(e) => handleRuleChange(idx, 'maxQuota', e.target.value)}
                          className="w-20 px-2.5 py-1.5 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs text-center focus:border-[#A52307] outline-none bg-white"
                        />
                        <span className="text-gray-500 text-[11px]">books</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={rule.gracePeriodDays}
                          onChange={(e) => handleRuleChange(idx, 'gracePeriodDays', e.target.value)}
                          className="w-20 px-2.5 py-1.5 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs text-center focus:border-[#A52307] outline-none bg-white"
                        />
                        <span className="text-gray-500 text-[11px]">days grace</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {rule.roleSlug !== 'super-admin' ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.roleSlug, rule.roleName)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Automatic Synchronization with Member Quotas</strong>
              <p className="mt-0.5 text-[11px]">
                When a new patron is registered or updated under a dynamic role, their default checkout quotas and due date calculations will automatically utilize the day limits defined above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Renewal Policies */}
      {activeTab === 'renewals' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6 text-xs font-sans">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Renewal Limits &amp; Online Self-Service Rules</h3>
            <p className="text-xs text-gray-500 mt-0.5">Control how many times a patron can extend an active loan.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="font-bold text-gray-800 block mb-1">Standard Extension Duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={renewalSettings.defaultRenewalDays}
                  onChange={(e) => setRenewalSettings({ ...renewalSettings, defaultRenewalDays: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">days added to current due date</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Maximum Consecutive Renewals Allowed</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={renewalSettings.maxRenewalsAllowed}
                  onChange={(e) => setRenewalSettings({ ...renewalSettings, maxRenewalsAllowed: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">times per item copy</span>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-3 pt-3 border-t border-[#E2E0DB]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renewalSettings.allowOnlineRenewal}
                  onChange={(e) => setRenewalSettings({ ...renewalSettings, allowOnlineRenewal: e.target.checked })}
                  className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                />
                <div>
                  <span className="font-bold text-gray-800 block">Allow Online Self-Renewal via Patron OPAC Account</span>
                  <span className="text-[11px] text-gray-500">Patrons can renew their own loans without visiting the desk.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renewalSettings.blockRenewalIfHoldPlaced}
                  onChange={(e) => setRenewalSettings({ ...renewalSettings, blockRenewalIfHoldPlaced: e.target.checked })}
                  className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                />
                <div>
                  <span className="font-bold text-gray-800 block">Block Renewal if Another Member has Placed a Hold</span>
                  <span className="text-[11px] text-gray-500">Prevents monopolization of high-demand items reserved by other scholars.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renewalSettings.blockRenewalIfOverdue}
                  onChange={(e) => setRenewalSettings({ ...renewalSettings, blockRenewalIfOverdue: e.target.checked })}
                  className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                />
                <div>
                  <span className="font-bold text-gray-800 block">Block Renewal if Item is Already Overdue</span>
                  <span className="text-[11px] text-gray-500">Requires physical desk inspection and fine settlement before renewing.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Fines & Penalties */}
      {activeTab === 'fines' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6 text-xs font-sans">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Overdue Fine Rates &amp; Cashier Parameters</h3>
            <p className="text-xs text-gray-500 mt-0.5">Define automated daily fines for overdue physical items.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="font-bold text-gray-800 block mb-1">Standard Daily Fine Rate</label>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">₹</span>
                <input
                  type="number"
                  min={0}
                  value={fineSettings.dailyFineRate}
                  onChange={(e) => setFineSettings({ ...fineSettings, dailyFineRate: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">per day / per overdue item</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Rare Books &amp; Manuscripts Daily Fine</label>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">₹</span>
                <input
                  type="number"
                  min={0}
                  value={fineSettings.rareMaterialDailyFine}
                  onChange={(e) => setFineSettings({ ...fineSettings, rareMaterialDailyFine: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">per day for special collection items</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Maximum Fine Cap Per Item</label>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">₹</span>
                <input
                  type="number"
                  min={100}
                  value={fineSettings.maxFineCapPerItem}
                  onChange={(e) => setFineSettings({ ...fineSettings, maxFineCapPerItem: Number(e.target.value) })}
                  className="w-28 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">maximum penalty before replacement fee</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Circulation Lockout Threshold</label>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">₹</span>
                <input
                  type="number"
                  min={50}
                  value={fineSettings.fineThresholdBlockCirculation}
                  onChange={(e) => setFineSettings({ ...fineSettings, fineThresholdBlockCirculation: Number(e.target.value) })}
                  className="w-28 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">unpaid fine balance blocks new check-outs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Overdue & Reminder Triggers */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6 text-xs font-sans">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Automated Patron Email &amp; SMS Notice Triggers</h3>
            <p className="text-xs text-gray-500 mt-0.5">Configure when the system dispatches automated return reminder notices.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="font-bold text-gray-800 block mb-1">Pre-Due Courtesy Reminder</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={notificationSettings.preDueReminderDays}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, preDueReminderDays: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">days before due date</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">1st Overdue Notice</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={notificationSettings.firstOverdueNoticeDays}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, firstOverdueNoticeDays: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">day(s) after due date</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">2nd Overdue Warning Notice</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={14}
                  value={notificationSettings.secondOverdueNoticeDays}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, secondOverdueNoticeDays: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">days after due date</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Final Legal Recall Notice</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={14}
                  max={30}
                  value={notificationSettings.finalRecallNoticeDays}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, finalRecallNoticeDays: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">days overdue (Triggers account freeze)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Add Custom Role Rule */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Add Dynamic Role Circulation Rule</h3>
              <button onClick={() => setShowAddRuleModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRule} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visiting Scholar / PhD Fellow"
                  value={newRuleName}
                  onChange={(e) => {
                    setNewRuleName(e.target.value);
                    setNewRuleSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Role Key / Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. visiting-scholar"
                  value={newRuleSlug}
                  onChange={(e) => setNewRuleSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Loan Days</label>
                  <input
                    type="number"
                    min={1}
                    value={newRuleDays}
                    onChange={(e) => setNewRuleDays(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Borrow Quota</label>
                  <input
                    type="number"
                    min={1}
                    value={newRuleQuota}
                    onChange={(e) => setNewRuleQuota(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Grace Days</label>
                  <input
                    type="number"
                    min={0}
                    value={newRuleGrace}
                    onChange={(e) => setNewRuleGrace(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
