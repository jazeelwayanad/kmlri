'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Search, Trash2, ArrowRight, AlertCircle } from 'lucide-react';

interface SavedSearch {
  id: string;
  query: string;
  createdAt: string;
}

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SavedSearchesPage() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getSavedSearches();
      setSearches(data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await api.deleteSavedSearch(id);
      setSearches(searches.filter((s) => s.id !== id));
    } catch {
      // leave the row; user can retry
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Saved OPAC Searches
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Search queries you&apos;ve saved for quick reuse. Save one from any catalogue search results page.
          </p>
        </div>

        <Link prefetch href="/search" className="text-xs font-bold text-heritage-red hover:underline">
          New Search →
        </Link>
      </div>

      <div className="double-rule"></div>

      {loading ? (
        <div className="border-2 border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">Loading saved searches…</div>
      ) : error ? (
        <div className="border border-heritage-red bg-red-50 rounded p-8 text-center text-heritage-red text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> Could not load your saved searches.
        </div>
      ) : searches.length === 0 ? (
        <div className="border-2 border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">
          You haven&apos;t saved any searches yet.
        </div>
      ) : (
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
                <p className="text-xs text-heritage-muted">Saved on {formatDate(s.createdAt)}</p>
              </div>

              <div className="flex items-center gap-2 text-xs self-start md:self-center">
                <Link prefetch
                  href={`/search?q=${encodeURIComponent(s.query)}`}
                  className="px-3.5 py-1.5 bg-black text-white rounded font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1"
                >
                  <span>Run Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  disabled={removingId === s.id}
                  onClick={() => handleRemove(s.id)}
                  title="Remove Saved Search"
                  className="p-1.5 text-gray-400 hover:text-heritage-red cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
