'use client';

import { useState } from 'react';
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
  Info
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function CirculationConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'loan_rules' | 'renewals' | 'fines' | 'notifications'>('loan_rules');
  const [saved, setSaved] = useState(false);

  // Loan rules per member type
  const [loanRules, setLoanRules] = useState([
    { role: 'STUDENT', name: 'Student Patron', defaultDays: 14, maxQuota: 5, gracePeriodDays: 1 },
    { role: 'FACULTY', name: 'Faculty & Professors', defaultDays: 30, maxQuota: 12, gracePeriodDays: 3 },
    { role: 'RESEARCHER', name: 'Research Fellows', defaultDays: 21, maxQuota: 8, gracePeriodDays: 2 },
    { role: 'GENERAL', name: 'General Public Member', defaultDays: 7, maxQuota: 3, gracePeriodDays: 0 },
    { role: 'STAFF', name: 'Institutional Staff', defaultDays: 30, maxQuota: 6, gracePeriodDays: 2 },
  ]);

  // Renewal settings
  const [renewalSettings, setRenewalSettings] = useState({
    defaultRenewalDays: 14,
    maxRenewalsAllowed: 2,
    allowOnlineRenewal: true,
    blockRenewalIfOverdue: true,
    blockRenewalIfHoldPlaced: true,
    allowRenewalOverdueGraceLimit: 1,
  });

  // Fine settings
  const [fineSettings, setFineSettings] = useState({
    dailyFineRate: 10,
    rareMaterialDailyFine: 25,
    maxFineCapPerItem: 500,
    fineThresholdBlockCirculation: 100,
    enableAutoFines: true,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    preDueReminderDays: 3,
    firstOverdueNoticeDays: 1,
    secondOverdueNoticeDays: 7,
    finalRecallNoticeDays: 14,
    sendEmailAlerts: true,
    sendSmsAlerts: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleRuleChange = (index: number, field: string, value: number) => {
    const updated = [...loanRules];
    (updated[index] as any)[field] = Number(value);
    setLoanRules(updated);
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Circulation"
        title="Circulation Configuration"
        description="Configure default loan periods, renewal rules, borrow quotas by member role, daily fine calculations, and automated return notice triggers."
        actions={
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Save Changes
          </Button>
        }
      />

      {saved && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Circulation rules &amp; loan policies saved successfully across all desks.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#E2E0DB] flex gap-2 flex-wrap">
        {[
          { key: 'loan_rules', label: 'Loan Periods & Quotas', icon: Clock },
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

      {/* TAB 1: Loan Periods & Quotas */}
      {activeTab === 'loan_rules' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Member Type Loan Durations &amp; Quotas</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Define the default loan period (days) and maximum concurrent books allowed per member role.
              </p>
            </div>
            <span className="text-[11px] font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded font-bold uppercase">
              {loanRules.length} Member Categories
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                  <th className="py-3 px-4">Membership Role</th>
                  <th className="py-3 px-4">Default Loan Period (Days)</th>
                  <th className="py-3 px-4">Max Borrow Quota (Books)</th>
                  <th className="py-3 px-4">Grace Period (Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEECE7]">
                {loanRules.map((rule, idx) => (
                  <tr key={rule.role} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-4">
                      <strong className="text-gray-900 block text-sm">{rule.name}</strong>
                      <span className="font-mono text-[10px] text-gray-500 font-bold uppercase">{rule.role}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={rule.defaultDays}
                          onChange={(e) => handleRuleChange(idx, 'defaultDays', Number(e.target.value))}
                          className="w-20 px-3 py-1.5 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                        />
                        <span className="text-gray-500 text-xs">Days</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={rule.maxQuota}
                          onChange={(e) => handleRuleChange(idx, 'maxQuota', Number(e.target.value))}
                          className="w-20 px-3 py-1.5 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                        />
                        <span className="text-gray-500 text-xs">Volumes</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={rule.gracePeriodDays}
                          onChange={(e) => handleRuleChange(idx, 'gracePeriodDays', Number(e.target.value))}
                          className="w-20 px-3 py-1.5 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                        />
                        <span className="text-gray-500 text-xs">Days before fine</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#FAF8F5] border border-[#E2E0DB] rounded text-xs text-gray-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#A52307] flex-shrink-0 mt-0.5" />
            <p>
              When an item is checked out at the circulation desk, the loan due date is calculated automatically from today's date plus the patron's role default days. Staff can manually override the duration on individual issues if needed.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Renewal Policies */}
      {activeTab === 'renewals' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Loan Renewal Limits &amp; Safeguards</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Control extension lengths, maximum renewal counts, and hold reservation blocks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Default Renewal Period (Days)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={renewalSettings.defaultRenewalDays}
                    onChange={(e) => setRenewalSettings({ ...renewalSettings, defaultRenewalDays: Number(e.target.value) })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                  />
                  <span className="text-gray-500">Days extended per renewal</span>
                </div>
                <span className="text-[11px] text-gray-400 block mt-1">Recommended: 14 days</span>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Max Renewals Allowed Per Item</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={renewalSettings.maxRenewalsAllowed}
                    onChange={(e) => setRenewalSettings({ ...renewalSettings, maxRenewalsAllowed: Number(e.target.value) })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                  />
                  <span className="text-gray-500">Consecutive renewals max</span>
                </div>
                <span className="text-[11px] text-gray-400 block mt-1">After reaching this limit, patron must return the volume to the library</span>
              </div>
            </div>

            <div className="space-y-4 border-l border-[#E2E0DB] pl-0 md:pl-6">
              <label className="font-bold text-gray-800 block mb-2">Automated Renewal Guardrails</label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renewalSettings.blockRenewalIfHoldPlaced}
                  onChange={(e) => setRenewalSettings({ ...renewalSettings, blockRenewalIfHoldPlaced: e.target.checked })}
                  className="mt-0.5 rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                />
                <div>
                  <strong className="text-gray-900 block">Block renewal if item has active hold</strong>
                  <span className="text-gray-500 text-[11px]">Prevents renewing a book if another patron is waiting on the reservation queue.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renewalSettings.blockRenewalIfOverdue}
                  onChange={(e) => setRenewalSettings({ ...renewalSettings, blockRenewalIfOverdue: e.target.checked })}
                  className="mt-0.5 rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                />
                <div>
                  <strong className="text-gray-900 block">Block renewal if item is already overdue</strong>
                  <span className="text-gray-500 text-[11px]">Patron must visit the circulation desk to clear overdue fines before renewal.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renewalSettings.allowOnlineRenewal}
                  onChange={(e) => setRenewalSettings({ ...renewalSettings, allowOnlineRenewal: e.target.checked })}
                  className="mt-0.5 rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                />
                <div>
                  <strong className="text-gray-900 block">Allow self-service renewal via OPAC / Account</strong>
                  <span className="text-gray-500 text-[11px]">Members can renew their loans online from their personal account portal.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Fines & Penalties */}
      {activeTab === 'fines' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Fine Rates &amp; Cashier Thresholds</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Set standard overdue fines, rare book penalties, and circulation lockouts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="font-bold text-gray-800 block mb-1">Standard Daily Overdue Fine (₹)</label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={fineSettings.dailyFineRate}
                  onChange={(e) => setFineSettings({ ...fineSettings, dailyFineRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                />
                <span className="text-gray-500">/day</span>
              </div>
              <span className="text-[11px] text-gray-400 block mt-1">General catalog items</span>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Special Collection / Rare Book Daily Fine (₹)</label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={fineSettings.rareMaterialDailyFine}
                  onChange={(e) => setFineSettings({ ...fineSettings, rareMaterialDailyFine: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                />
                <span className="text-gray-500">/day</span>
              </div>
              <span className="text-[11px] text-gray-400 block mt-1">Manuscripts &amp; rare prints</span>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Maximum Fine Cap Per Item (₹)</label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  min="50"
                  value={fineSettings.maxFineCapPerItem}
                  onChange={(e) => setFineSettings({ ...fineSettings, maxFineCapPerItem: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
                />
              </div>
              <span className="text-[11px] text-gray-400 block mt-1">Fines cannot exceed this limit per volume</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E0DB] flex items-center justify-between flex-wrap gap-4">
            <div>
              <strong className="text-gray-900 text-sm block">Auto-Block Borrowing Privileges</strong>
              <p className="text-xs text-gray-500">
                Suspend circulation privileges if a patron has unpaid fines exceeding ₹{fineSettings.fineThresholdBlockCirculation}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">Threshold: ₹</span>
              <input
                type="number"
                min="0"
                value={fineSettings.fineThresholdBlockCirculation}
                onChange={(e) => setFineSettings({ ...fineSettings, fineThresholdBlockCirculation: Number(e.target.value) })}
                className="w-24 px-3 py-1.5 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Notifications & Triggers */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Automated Notification Schedules</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Set the timeline for automated email reminders and overdue recall notices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-[#FAF8F5] border border-[#E2E0DB] rounded">
              <span className="font-bold text-gray-900 block mb-1">Pre-Due Courtesy Reminder</span>
              <p className="text-gray-500 text-[11px] mb-3">Send reminder email to patron before the due date.</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={notificationSettings.preDueReminderDays}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, preDueReminderDays: Number(e.target.value) })}
                  className="w-20 px-2.5 py-1.5 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">Days before due date</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#E2E0DB] rounded">
              <span className="font-bold text-[#A52307] block mb-1">1st Overdue Notice</span>
              <p className="text-gray-500 text-[11px] mb-3">Initial notification dispatched once due date expires.</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={notificationSettings.firstOverdueNoticeDays}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, firstOverdueNoticeDays: Number(e.target.value) })}
                  className="w-20 px-2.5 py-1.5 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">Day after due date</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#E2E0DB] rounded">
              <span className="font-bold text-red-800 block mb-1">Final Urgent Recall</span>
              <p className="text-gray-500 text-[11px] mb-3">Final escalation notice with account hold warning.</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="7"
                  max="30"
                  value={notificationSettings.finalRecallNoticeDays}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, finalRecallNoticeDays: Number(e.target.value) })}
                  className="w-20 px-2.5 py-1.5 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
                <span className="text-gray-600">Days overdue</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Action Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E0DB]">
        <button
          type="button"
          onClick={() => {
            setLoanRules([
              { role: 'STUDENT', name: 'Student Patron', defaultDays: 14, maxQuota: 5, gracePeriodDays: 1 },
              { role: 'FACULTY', name: 'Faculty & Professors', defaultDays: 30, maxQuota: 12, gracePeriodDays: 3 },
              { role: 'RESEARCHER', name: 'Research Fellows', defaultDays: 21, maxQuota: 8, gracePeriodDays: 2 },
              { role: 'GENERAL', name: 'General Public Member', defaultDays: 7, maxQuota: 3, gracePeriodDays: 0 },
              { role: 'STAFF', name: 'Institutional Staff', defaultDays: 30, maxQuota: 6, gracePeriodDays: 2 },
            ]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }}
          className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100 text-gray-700 transition-colors"
        >
          Reset to System Defaults
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Circulation Settings</span>
        </button>
      </div>
    </div>
  );
}
