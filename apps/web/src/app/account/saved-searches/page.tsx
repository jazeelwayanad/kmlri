'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Search, Bell, Trash2, ArrowRight, Check } from 'lucide-react';

export default function SavedSearchesPage() {
  const { user } = useAuth();
  const [searches, setSearches] = useState([
    { id: 's1', query: 'subject:"Shafi\'i Jurisprudence" format:MANUSCRIPT', resultsCount: 42, alertFreq: 'Weekly', date: '20 Aug 2026' },
    { id: 's2', query: 'author:"Qāḍī Muḥammad" language:"Arabi-Malayalam"', resultsCount: 8, alertFreq: 'Immediate', date: '12 Aug 2026' },
    { id: 's3', query: 'originPlace:"Ponnani" century:"19th"', resultsCount: 29, alertFreq: 'Monthly', date: '01 Aug 2026' }
  ]);

  const handleToggleFreq = (id: string) => {
    const modes = ['Immediate', 'Weekly', 'Off'];
    setSearches(
      searches.map((s) => {
        if (s.id === id) {
          const nextIdx = (modes.indexOf(s.alertFreq) + 1) % modes.length;
          return { ...s, alertFreq: modes[nextIdx] };
        }
        return s;
      })
    );
  };

  const handleRemove = (id: string) => {
    setSearches(searches.filter((s) => s.id !== id));
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Saved OPAC Searches &amp; Alerts
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Stored search queries that automatically track and notify you when new codices matching your criteria are accessioned.
          </p>
        </div>

        <Link
          href="/advanced"
          className="text-xs font-bold text-heritage-red hover:underline"
        >
          New Advanced Search →
        </Link>
      </div>

      <div className="double-rule"></div>

      <div className="space-y-3">
        {searches.map((s) => (
          <div
            key={s.id}
            className="border-2 border-black bg-white rounded p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-heritage-red" />
                <span className="font-mono text-sm font-bold text-black">{s.query}</span>
              </div>
              <p className="text-xs text-heritage-muted">
                Matches <strong>{s.resultsCount} catalog records</strong> · Saved on {s.date}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs self-start md:self-center">
              <button
                type="button"
                onClick={() => handleToggleFreq(s.id)}
                className="px-3 py-1.5 border border-gray-300 rounded font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Click to toggle alert frequency"
              >
                <Bell className="w-3.5 h-3.5 text-heritage-red" />
                <span>Alerts: <strong className="text-black">{s.alertFreq}</strong></span>
              </button>

              <Link
                href={`/search?q=${encodeURIComponent(s.query)}`}
                className="px-3.5 py-1.5 bg-black text-white rounded font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1"
              >
                <span>Run Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => handleRemove(s.id)}
                title="Remove Saved Search"
                className="p-1.5 text-gray-400 hover:text-heritage-red cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
