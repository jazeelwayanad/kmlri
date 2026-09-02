'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Bell, CheckCheck, BookmarkCheck, BookOpen, Sparkles, Inbox } from 'lucide-react';

interface PatronNotification {
  id: string;
  category: 'CIRCULATION' | 'HOLDS' | 'ANNOUNCEMENTS';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const STORAGE_KEY = 'kmlri_patron_notifications_v1';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'CIRCULATION' | 'HOLDS' | 'ANNOUNCEMENTS'>('ALL');
  const [notifications, setNotifications] = useState<PatronNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications, hydrated]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.category === filter;
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

        {notifications.length > 0 && (
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
        {filteredNotifs.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-gray-300 rounded bg-[#FAF8F5] p-8">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-gray-800">Your notification inbox is clear</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You will receive automatic alerts here when borrowed materials approach due dates, holds are ready at the circulation desk, or archival notices are published.
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 border-2 rounded transition-all flex items-start justify-between gap-4 ${
                n.read ? 'bg-white border-gray-200' : 'bg-[#FAF8F5] border-black shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-1">
                  {n.category === 'HOLDS' ? (
                    <BookmarkCheck className="w-5 h-5 text-green-700" />
                  ) : n.category === 'CIRCULATION' ? (
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
                  <p className="text-xs text-heritage-body mt-1 leading-relaxed">{n.desc}</p>
                  <p className="text-[11px] text-gray-400 font-mono mt-2">{n.time}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
