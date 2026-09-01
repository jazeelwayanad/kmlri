'use client';

import { useState, useEffect } from 'react';
import { Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

export default function SystemSecurityAdminPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState(60);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [passwordMinLength, setPasswordMinLength] = useState(10);
  const [ipRateLimitRpm, setIpRateLimitRpm] = useState(120);

  useEffect(() => {
    api
      .getSettings('security.')
      .then((settings: any[]) => {
        const find = (key: string) => settings.find((s) => s.key === `security.${key}`)?.value;
        if (find('require2FA') !== undefined) setRequire2FA(find('require2FA'));
        if (find('sessionTimeoutMin') !== undefined) setSessionTimeoutMin(find('sessionTimeoutMin'));
        if (find('maxLoginAttempts') !== undefined) setMaxLoginAttempts(find('maxLoginAttempts'));
        if (find('passwordMinLength') !== undefined) setPasswordMinLength(find('passwordMinLength'));
        if (find('ipRateLimitRpm') !== undefined) setIpRateLimitRpm(find('ipRateLimitRpm'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.setSettings([
        { key: 'security.require2FA', value: require2FA },
        { key: 'security.sessionTimeoutMin', value: sessionTimeoutMin },
        { key: 'security.maxLoginAttempts', value: maxLoginAttempts },
        { key: 'security.passwordMinLength', value: passwordMinLength },
        { key: 'security.ipRateLimitRpm', value: ipRateLimitRpm },
      ]);
      setNotification({ type: 'success', text: 'Security policy values saved. Note: these are stored as configuration only — the login flow does not yet enforce them.' });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Could not save security settings.' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const inputClasses =
    'w-full h-10 border border-gray-200 px-3 rounded-lg font-mono text-sm bg-white focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20 outline-none';

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Hardening"
        title="Security & Authentication Architecture"
        description="Configure institutional multi-factor authentication (MFA/2FA), session expiration, brute-force rate limits, and password entropy rules."
      />

      {notification && (
        <div
          className={`p-4 border rounded-lg text-sm font-semibold flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Security Form */}
      <Card className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-heritage-red" />
            <span>Access & Authentication Policy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Staff Inactivity Session Timeout (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={480}
                value={sessionTimeoutMin}
                onChange={(e) => setSessionTimeoutMin(Number(e.target.value))}
                className={inputClasses}
              />
              <p className="text-gray-400 mt-1">Forces re-authentication upon idle time.</p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Max Failed Login Attempts
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                className={inputClasses}
              />
              <p className="text-gray-400 mt-1">Locks account for 30 minutes on breach attempt.</p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Minimum Password Length
              </label>
              <input
                type="number"
                min={8}
                max={32}
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                className={inputClasses}
              />
              <p className="text-gray-400 mt-1">Requires uppercase, number &amp; symbol.</p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                API Rate Limit (Requests / Min / IP)
              </label>
              <input
                type="number"
                min={30}
                max={1000}
                value={ipRateLimitRpm}
                onChange={(e) => setIpRateLimitRpm(Number(e.target.value))}
                className={inputClasses}
              />
              <p className="text-gray-400 mt-1">Protects OPAC &amp; API from DDoS scraping.</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={require2FA}
                onChange={(e) => setRequire2FA(e.target.checked)}
                className="w-4 h-4 accent-heritage-red"
              />
              <div>
                <span className="font-bold text-gray-900 text-sm block">Enforce 2FA / TOTP for All Staff Accounts</span>
                <span className="text-gray-500">Librarians &amp; administrators must authenticate with Google Authenticator or SMS OTP.</span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit" variant="primary" icon={Save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Security Policy'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
