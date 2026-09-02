'use client';

/**
 * notification-store.tsx
 * ---------------------
 * A global React context that acts as the single source of truth for
 * the admin notification system. Both the AdminHeader bell dropdown and
 * the /admin/notifications hub page read from and write to this store so
 * they stay in sync without any prop-drilling.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Bell, type LucideIcon } from 'lucide-react';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export type NotifChannel = 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
export type NotifStatus = 'DELIVERED' | 'SENT' | 'FAILED' | 'QUEUED';
export type NotifCategory = 'CIRCULATION' | 'MEMBERSHIP' | 'SYSTEM' | 'SECURITY' | 'BROADCAST';
export type NotifPriority = 'NORMAL' | 'HIGH' | 'URGENT';

/** Shown in the header bell dropdown */
export interface QuickNotif {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  href: string;
  priority: NotifPriority;
  createdAt: string;
}

/** Row in the Dispatch Ledger / Audit Log */
export interface DispatchLog {
  id: string;
  recipientName: string;
  recipientContact: string;
  type: string;
  channel: NotifChannel;
  status: NotifStatus;
  timestamp: string;
  details?: string;
  priority: NotifPriority;
  createdAt: string;
}

/** Automated trigger template */
export interface NotifTemplate {
  id: string;
  code: string;
  name: string;
  category: NotifCategory;
  channels: NotifChannel[];
  trigger: string;
  subject: string;
  bodyPreview: string;
  smsText: string;
  status: 'ACTIVE' | 'PAUSED';
  variables: string[];
}

export interface GatewaySettings {
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: string;
  smtpUser: string;
  smtpSenderEmail: string;
  smtpSenderName: string;
  smtpConfigured: boolean;

  smsProvider: string;
  smsSenderId: string;
  smsApiKey: string;
  smsDltEntityId: string;
  smsConfigured: boolean;

  retentionDays: number;
  playSound: boolean;
  webPush: boolean;
}

// ──────────────────────────────────────────────────────────
// Default System Templates (Rules)
// ──────────────────────────────────────────────────────────

const DEFAULT_TEMPLATES: NotifTemplate[] = [
  {
    id: 'TPL-01',
    code: 'PRE_DUE_REMINDER',
    name: 'Pre-Due Courtesy Reminder',
    category: 'CIRCULATION',
    channels: ['EMAIL', 'SMS', 'IN_APP'],
    trigger: 'Automated 3 days before due date at 08:00 AM',
    subject: 'Library Courtesy Reminder: {{item_title}} due on {{due_date}}',
    bodyPreview:
      'Dear {{patron_name}}, your borrowed item "{{item_title}}" (Barcode: {{barcode}}) is due for return on {{due_date}}. You may renew online via your OPAC account.',
    smsText: 'KMLRI: {{item_title}} is due on {{due_date}}. Renew online: kmlri.in/account',
    status: 'ACTIVE',
    variables: ['patron_name', 'item_title', 'barcode', 'due_date', 'renew_url'],
  },
  {
    id: 'TPL-02',
    code: 'OVERDUE_NOTICE_1',
    name: '1st Overdue Notice & Daily Fine Notice',
    category: 'CIRCULATION',
    channels: ['EMAIL', 'SMS', 'IN_APP'],
    trigger: 'Automated 1 day after due date at 09:00 AM',
    subject: 'OVERDUE NOTICE: Please return {{item_title}} (Accruing Fine: ₹{{fine_rate}}/day)',
    bodyPreview:
      'Dear {{patron_name}}, the loan period for "{{item_title}}" expired on {{due_date}}. A daily overdue fine of ₹{{fine_rate}} is currently being assessed.',
    smsText:
      'KMLRI OVERDUE: {{item_title}} was due on {{due_date}}. Please return to avoid fine accumulation.',
    status: 'ACTIVE',
    variables: ['patron_name', 'item_title', 'barcode', 'due_date', 'fine_rate', 'accrued_fine'],
  },
  {
    id: 'TPL-03',
    code: 'HOLD_READY_PICKUP',
    name: 'Hold Ready for Reading Room / Desk Pickup',
    category: 'CIRCULATION',
    channels: ['EMAIL', 'SMS', 'IN_APP', 'PUSH'],
    trigger: 'Real-time on check-in scan or hold fulfillment',
    subject: 'Your Reserved Item is Ready: {{item_title}}',
    bodyPreview:
      'Dear {{patron_name}}, your requested material "{{item_title}}" has arrived and is held for you at {{shelf_location}} until {{expiry_date}}.',
    smsText:
      'KMLRI: Your hold for {{item_title}} is ready at {{shelf_location}} until {{expiry_date}}.',
    status: 'ACTIVE',
    variables: ['patron_name', 'item_title', 'shelf_location', 'expiry_date'],
  },
  {
    id: 'TPL-04',
    code: 'FINE_SETTLED_RECEIPT',
    name: 'Cashier Fine Settlement Receipt',
    category: 'CIRCULATION',
    channels: ['EMAIL', 'IN_APP'],
    trigger: 'Real-time on cashier payment confirmation',
    subject: 'Payment Receipt: ₹{{amount_paid}} for Fine Reference #{{receipt_no}}',
    bodyPreview:
      'Dear {{patron_name}}, we have received payment of ₹{{amount_paid}} via {{payment_method}} for {{item_title}}.',
    smsText: 'KMLRI: Received ₹{{amount_paid}} for receipt #{{receipt_no}}. Thank you.',
    status: 'ACTIVE',
    variables: ['patron_name', 'amount_paid', 'payment_method', 'receipt_no', 'item_title'],
  },
  {
    id: 'TPL-05',
    code: 'MEMBERSHIP_VALIDITY_WARNING',
    name: 'Membership Expiry & Annual Re-Registration',
    category: 'MEMBERSHIP',
    channels: ['EMAIL', 'IN_APP'],
    trigger: 'Automated 14 days before membership expiration date',
    subject: 'Institutional Membership Expiring on {{valid_until}}',
    bodyPreview:
      'Dear {{patron_name}}, your library borrowing privileges under {{role_name}} will expire on {{valid_until}}.',
    smsText:
      'KMLRI: Your library card {{membership_no}} expires on {{valid_until}}. Please renew online.',
    status: 'ACTIVE',
    variables: ['patron_name', 'membership_no', 'valid_until', 'role_name'],
  },
  {
    id: 'TPL-06',
    code: 'SECURITY_LOGIN_ALERT',
    name: 'Security New Login Device Verification',
    category: 'SECURITY',
    channels: ['EMAIL'],
    trigger: 'Real-time on unrecognized IP / browser login',
    subject: 'Security Alert: New Sign-in to your KMLRI Account',
    bodyPreview:
      'Dear {{patron_name}}, a new sign-in was detected from IP {{ip_address}} at {{timestamp}}.',
    smsText: 'KMLRI Security: New login detected from {{ip_address}}.',
    status: 'ACTIVE',
    variables: ['patron_name', 'ip_address', 'device_name', 'timestamp'],
  },
];

const DEFAULT_GATEWAYS: GatewaySettings = {
  smtpHost: '',
  smtpPort: 587,
  smtpEncryption: 'STARTTLS',
  smtpUser: '',
  smtpSenderEmail: '',
  smtpSenderName: 'KMLRI Library Communications',
  smtpConfigured: false,

  smsProvider: '',
  smsSenderId: '',
  smsApiKey: '',
  smsDltEntityId: '',
  smsConfigured: false,

  retentionDays: 90,
  playSound: true,
  webPush: true,
};

// ──────────────────────────────────────────────────────────
// Context definition
// ──────────────────────────────────────────────────────────

interface NotificationStore {
  // Header bell
  quickNotifs: QuickNotif[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissNotif: (id: string) => void;
  clearAllNotifs: () => void;

  // Dispatch logs
  logs: DispatchLog[];
  retryLog: (id: string) => void;
  deleteLog: (id: string) => void;
  clearAllLogs: () => void;

  // Templates
  templates: NotifTemplate[];
  updateTemplate: (tpl: NotifTemplate) => void;
  toggleTemplateStatus: (id: string) => void;
  resetTemplates: () => void;

  // Gateways
  gateways: GatewaySettings;
  updateGateways: (settings: Partial<GatewaySettings>) => void;

  // Broadcast
  sendBroadcast: (opts: {
    title: string;
    body: string;
    audience: string;
    channels: NotifChannel[];
    priority: NotifPriority;
    link?: string;
  }) => void;

  // Stats
  totalDispatched: number;
  deliveryRate: number;
}

const NotificationContext = createContext<NotificationStore | undefined>(undefined);

const STORAGE_KEYS = {
  QUICK_NOTIFS: 'kmlri_quick_notifs_v1',
  LOGS: 'kmlri_dispatch_logs_v1',
  TEMPLATES: 'kmlri_notif_templates_v1',
  GATEWAYS: 'kmlri_gateway_settings_v1',
};

// ──────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [quickNotifs, setQuickNotifs] = useState<QuickNotif[]>([]);
  const [logs, setLogs] = useState<DispatchLog[]>([]);
  const [templates, setTemplates] = useState<NotifTemplate[]>(DEFAULT_TEMPLATES);
  const [gateways, setGateways] = useState<GatewaySettings>(DEFAULT_GATEWAYS);
  const [hydrated, setHydrated] = useState(false);
  const counterRef = useRef(100);

  // Restore from localStorage on mount (no dummy fallback)
  useEffect(() => {
    try {
      const savedNotifs = localStorage.getItem(STORAGE_KEYS.QUICK_NOTIFS);
      if (savedNotifs) {
        setQuickNotifs(JSON.parse(savedNotifs));
      }

      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }

      const savedTpls = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (savedTpls) {
        setTemplates(JSON.parse(savedTpls));
      }

      const savedGateways = localStorage.getItem(STORAGE_KEYS.GATEWAYS);
      if (savedGateways) {
        setGateways(JSON.parse(savedGateways));
      }
    } catch (e) {
      console.error('Failed to load notifications from storage:', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.QUICK_NOTIFS, JSON.stringify(quickNotifs));
    } catch {}
  }, [quickNotifs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch {}
  }, [logs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch {}
  }, [templates, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.GATEWAYS, JSON.stringify(gateways));
    } catch {}
  }, [gateways, hydrated]);

  const unreadCount = quickNotifs.filter((n) => n.unread).length;

  const totalDispatched = logs.length;
  const delivered = logs.filter((l) => l.status === 'DELIVERED').length;
  const deliveryRate = logs.length > 0 ? Math.round((delivered / logs.length) * 1000) / 10 : 100;

  // ── Bell dropdown actions ──────────────────────────────

  const markRead = useCallback((id: string) => {
    setQuickNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setQuickNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const dismissNotif = useCallback((id: string) => {
    setQuickNotifs((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifs = useCallback(() => {
    setQuickNotifs([]);
  }, []);

  // ── Log actions ────────────────────────────────────────

  const retryLog = useCallback((id: string) => {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'DELIVERED' as NotifStatus,
              details: 'Retried and delivered successfully via gateway.',
            }
          : l
      )
    );
  }, []);

  const deleteLog = useCallback((id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearAllLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // ── Template actions ───────────────────────────────────

  const updateTemplate = useCallback((tpl: NotifTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === tpl.id ? tpl : t)));
  }, []);

  const toggleTemplateStatus = useCallback((id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : t
      )
    );
  }, []);

  const resetTemplates = useCallback(() => {
    setTemplates(DEFAULT_TEMPLATES);
  }, []);

  // ── Gateway actions ───────────────────────────────────

  const updateGateways = useCallback((settings: Partial<GatewaySettings>) => {
    setGateways((prev) => ({ ...prev, ...settings }));
  }, []);

  // ── Broadcast ─────────────────────────────────────────

  const sendBroadcast = useCallback(
    (opts: {
      title: string;
      body: string;
      audience: string;
      channels: NotifChannel[];
      priority: NotifPriority;
      link?: string;
    }) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const seq = ++counterRef.current;

      // Add one dispatch log entry per channel
      const newLogs: DispatchLog[] = opts.channels.map((ch, idx) => ({
        id: `DISP-${seq + idx}`,
        recipientName: `Broadcast → ${opts.audience}`,
        recipientContact: opts.channels.join(' + '),
        type: `Broadcast: ${opts.title}`,
        channel: ch,
        status: 'DELIVERED' as NotifStatus,
        timestamp: `Today, ${timeStr}`,
        details: `Broadcast "${opts.title}" delivered to ${opts.audience} segment via ${ch}.`,
        priority: opts.priority,
        createdAt: now.toISOString(),
      }));

      setLogs((prev) => [...newLogs, ...prev]);

      // Push a quick-notif into the bell (only if IN_APP or PUSH channel chosen)
      if (opts.channels.includes('IN_APP') || opts.channels.includes('PUSH')) {
        const qn: QuickNotif = {
          id: `qn-${Date.now()}-${seq}`,
          title: opts.title,
          desc: opts.body.slice(0, 120) + (opts.body.length > 120 ? '…' : ''),
          time: 'Just now',
          unread: true,
          href: opts.link || '/admin/notifications',
          priority: opts.priority,
          createdAt: now.toISOString(),
        };
        setQuickNotifs((prev) => [qn, ...prev]);
      }
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        quickNotifs,
        unreadCount,
        markRead,
        markAllRead,
        dismissNotif,
        clearAllNotifs,
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
        totalDispatched,
        deliveryRate,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────

export function useNotifications(): NotificationStore {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}
