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
  Info,
  Plus,
  Trash2,
  Edit3,
  X,
  Shield,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api, Role } from '@/lib/api';
import { confirmDialog, alertDialog } from '@/lib/dialog';

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

interface RoleLoanConfig {
  roleId: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  memberCount: number;
  maxBorrowLimit: number;
  loanDurationDays: number;
}

export default function CirculationConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'loan_rules' | 'renewals' | 'fines' | 'notifications'>('loan_rules');
  const [saved, setSaved] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);

  // Role loan durations & quotas (sourced from system/roles + circulation settings)
  const [roleConfigs, setRoleConfigs] = useState<RoleLoanConfig[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Add Role Modal State
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRuleDays, setNewRuleDays] = useState(14);
  const [newRuleQuota, setNewRuleQuota] = useState(5);

  // Renewal settings
  const [renewalSettings, setRenewalSettings] = useState(DEFAULT_RENEWAL_SETTINGS);

  // Fine settings
  const [fineSettings, setFineSettings] = useState(DEFAULT_FINE_SETTINGS);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);

  // Load all configuration & roles from system
  const loadData = async () => {
    setLoadingSettings(true);
    setLoadingRoles(true);
    try {
      const [settings, rolesData] = await Promise.all([
        api.getSettings(PREFIX).catch(() => []),
        api.getRoles().catch(() => []),
      ]);

      const map = new Map<string, any>(settings.map((s: any) => [s.key, s.value]));
      setRenewalSettings({ ...DEFAULT_RENEWAL_SETTINGS, ...(map.get(`${PREFIX}renewalSettings`) ?? {}) });
      setFineSettings({ ...DEFAULT_FINE_SETTINGS, ...(map.get(`${PREFIX}fineSettings`) ?? {}) });
      setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...(map.get(`${PREFIX}notificationSettings`) ?? {}) });

      const savedRules = map.get(`${PREFIX}roleLoanRules`) || {};

      const combined: RoleLoanConfig[] = (rolesData || []).map((r: Role) => {
        const saved = savedRules[r.slug] || savedRules[r.id] || {};
        const defaultDays = r.slug === 'faculty' ? 30 : r.slug === 'researcher' ? 28 : 14;
        const defaultQuota = r.slug === 'faculty' ? 10 : r.slug === 'researcher' ? 8 : 5;
        return {
          roleId: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          isSystem: r.isSystem,
          memberCount: r.memberCount || 0,
          loanDurationDays: saved.loanDurationDays !== undefined ? Number(saved.loanDurationDays) : defaultDays,
          maxBorrowLimit: saved.maxBorrowLimit !== undefined ? Number(saved.maxBorrowLimit) : defaultQuota,
        };
      });

      setRoleConfigs(combined);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to load circulation configuration.' });
    } finally {
      setLoadingSettings(false);
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRuleChange = (index: number, field: 'maxBorrowLimit' | 'loanDurationDays', value: any) => {
    const updated = [...roleConfigs];
    (updated[index] as any)[field] = Number(value);
    setRoleConfigs(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const roleLoanRules: Record<string, { loanDurationDays: number; maxBorrowLimit: number }> = {};
      roleConfigs.forEach((c) => {
        const config = {
          loanDurationDays: c.loanDurationDays,
          maxBorrowLimit: c.maxBorrowLimit,
        };
        roleLoanRules[c.slug] = config;
        roleLoanRules[c.roleId] = config;
      });

      await api.setSettings([
        { key: `${PREFIX}roleLoanRules`, value: roleLoanRules },
        { key: `${PREFIX}renewalSettings`, value: renewalSettings },
        { key: `${PREFIX}fineSettings`, value: fineSettings },
        { key: `${PREFIX}notificationSettings`, value: notificationSettings },
      ]);
      setSaved(true);
      setNotification({ type: 'success', text: 'Circulation rules & membership role limits saved successfully.' });
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

  const handleAddCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      const generatedSlug = newRoleName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const createdRole = await api.createRole({
        name: newRoleName.trim(),
        slug: generatedSlug,
        description: newRoleDescription.trim() || undefined,
        permissions: ['CATALOG_VIEW', 'MEMBER_HOLD_PLACE', 'MEMBER_DIGITAL_ACCESS'],
      });

      // Update roleLoanRules setting with the initial duration & quota
      const currentSettings = await api.getSettings(PREFIX).catch(() => []);
      const map = new Map<string, any>(currentSettings.map((s: any) => [s.key, s.value]));
      const roleLoanRules = map.get(`${PREFIX}roleLoanRules`) || {};
      const rule = {
        loanDurationDays: Number(newRuleDays),
        maxBorrowLimit: Number(newRuleQuota),
      };
      roleLoanRules[createdRole.slug] = rule;
      roleLoanRules[createdRole.id] = rule;

      await api.setSettings([
        { key: `${PREFIX}roleLoanRules`, value: roleLoanRules },
      ]);

      setShowAddRoleModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRuleDays(14);
      setNewRuleQuota(5);
      setNotification({ type: 'success', text: `Role "${newRoleName}" created and loan parameters configured.` });
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not create role.' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDeleteRole = async (roleId: string, name: string, isSystem: boolean) => {
    if (isSystem) {
      alertDialog('System protected roles cannot be deleted.');
      return;
    }
    if (!(await confirmDialog({ message: `Delete member role "${name}" from the system? Members assigned to it must be reassigned first.`, variant: 'danger' }))) return;
    try {
      await api.deleteRole(roleId);
      setNotification({ type: 'success', text: `Role "${name}" removed.` });
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not delete role.' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Circulation"
        title="Circulation Configuration"
        description="Configure loan periods and borrow quotas by system member role, renewal policies, daily fine calculations, and return notice triggers."
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
          { key: 'loan_rules', label: `Member Role Loan Periods (${roleConfigs.length})`, icon: Clock },
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

      {/* TAB 1: Loan Periods & Quotas (Fetched from system/roles) */}
      {activeTab === 'loan_rules' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Member Role Loan Durations &amp; Quotas</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Member types are fetched dynamically from <strong className="text-gray-700">System Roles</strong>. Configure the checkout limits and duration here, or manage role permissions on the{' '}
                <Link prefetch href="/admin/system/roles" className="text-[#A52307] underline font-semibold inline-flex items-center gap-1">
                  Roles &amp; Permissions page <ExternalLink className="w-3 h-3" />
                </Link>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                prefetch
                href="/admin/system/roles"
                className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-gray-500" />
                <span>Manage Roles &amp; Permissions</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowAddRoleModal(true)}
                className="px-3.5 py-1.5 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member Role</span>
              </button>
            </div>
          </div>

          {loadingRoles ? (
            <div className="p-6 text-center text-gray-400 text-xs">Loading member roles from system/roles…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                    <th className="py-3 px-4">Member Role</th>
                    <th className="py-3 px-4">Identifier / Slug</th>
                    <th className="py-3 px-4">Loan Period (Days)</th>
                    <th className="py-3 px-4">Max Borrow Quota (Books)</th>
                    <th className="py-3 px-4 text-center">Active Members</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {roleConfigs.map((role, idx) => (
                    <tr key={role.roleId} className="hover:bg-[#FAF8F5]">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <strong className="text-gray-900 block text-sm">{role.name}</strong>
                          {role.isSystem && (
                            <span className="bg-gray-900 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                              System
                            </span>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-[11px] text-gray-500 mt-0.5 max-w-sm truncate">{role.description}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                          {role.slug}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={180}
                            value={role.loanDurationDays}
                            onChange={(e) => handleRuleChange(idx, 'loanDurationDays', e.target.value)}
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
                            value={role.maxBorrowLimit}
                            onChange={(e) => handleRuleChange(idx, 'maxBorrowLimit', e.target.value)}
                            className="w-20 px-2.5 py-1.5 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs text-center focus:border-[#A52307] outline-none bg-white"
                          />
                          <span className="text-gray-500 text-[11px]">books</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-gray-700">
                        {role.memberCount}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!role.isSystem ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(role.roleId, role.name, role.isSystem)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Delete Member Role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-mono italic">
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {roleConfigs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">No member roles found in the system.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 p-4 rounded text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Applied at Circulation Check-out</strong>
              <p className="mt-0.5 text-[11px]">
                A patron's role determines their default loan duration and maximum items quota when books are issued.
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

          <div className="bg-amber-50 border border-amber-200 p-4 rounded text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Not Yet Automated</strong>
              <p className="mt-0.5 text-[11px]">
                These thresholds are saved, but no scheduled job is wired up yet to dispatch email/SMS notices automatically — in-app notifications are still created immediately at issue, return, and hold-ready time.
              </p>
            </div>
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

      {/* POPUP MODAL: Add Role & Loan Rule */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Add New Member Role</h3>
              <button onClick={() => setShowAddRoleModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRole} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Role Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visiting Scholar / PhD Fellow"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Scope and purpose of this member role..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                  <label className="font-bold text-gray-800 block mb-1">Borrow Quota (Books)</label>
                  <input
                    type="number"
                    min={1}
                    value={newRuleQuota}
                    onChange={(e) => setNewRuleQuota(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800"
                >
                  Create Member Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

