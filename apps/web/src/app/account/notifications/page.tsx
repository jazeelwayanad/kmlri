'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Bell, CheckCheck, BookmarkCheck, BookOpen, Sparkles, Inbox } from 'lucide-react';

interface PatronNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

function categoryOf(type: string): 'CIRCULATION' | 'HOLDS' | 'ANNOUNCEMENTS' {
  if (type === 'HOLD_READY') return 'HOLDS';
  if (['LOAN_ISSUED', 'RETURN_CONFIRMED', 'FINE_ASSESSED'].includes(type)) return 'CIRCULATION';
  return 'ANNOUNCEMENTS';
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'CIRCULATION' | 'HOLDS' | 'ANNOUNCEMENTS'>('ALL');
  const [notifications, setNotifications] = useState<PatronNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err: any) {
      setError(err?.message || 'Failed to mark notifications as read.');
    }
  };

  const handleOpen = async (n: PatronNotification) => {
    if (!n.read) {
      try {
        await api.markNotificationRead(n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      } catch {}
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return categoryOf(n.type) === filter;
  });

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Notices &amp; Notifications Inbox
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Official communications regarding hold arrivals, circulation renewal deadlines, and repository accessions.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-heritage-red hover:underline flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="double-rule"></div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-300 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-300 gap-2 flex-wrap text-xs">
        {[
          { id: 'ALL', label: `All Notices (${notifications.length})` },
          { id: 'HOLDS', label: 'Hold Ready' },
          { id: 'CIRCULATION', label: 'Circulation' },
          { id: 'ANNOUNCEMENTS', label: 'Archival Updates' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-2 font-bold border-b-2 transition-colors cursor-pointer ${
              filter === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notices Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500">Loading notifications…</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-gray-300 rounded bg-[#FAF8F5] p-8">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-gray-800">Your notification inbox is clear</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You will receive automatic alerts here when borrowed materials approach due dates, holds are ready at the circulation desk, or archival notices are published.
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => {
            const category = categoryOf(n.type);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => handleOpen(n)}
                className={`w-full text-left p-4 sm:p-5 border-2 rounded transition-all flex items-start justify-between gap-4 cursor-pointer ${
                  n.read ? 'bg-white border-gray-200' : 'bg-[#FAF8F5] border-black shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-1">
                    {category === 'HOLDS' ? (
                      <BookmarkCheck className="w-5 h-5 text-green-700" />
                    ) : category === 'CIRCULATION' ? (
                      <BookOpen className="w-5 h-5 text-heritage-red" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-amiri text-xl font-bold text-black m-0">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-heritage-red inline-block"></span>
                      )}
                    </div>
                    <p className="text-xs text-heritage-body mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
