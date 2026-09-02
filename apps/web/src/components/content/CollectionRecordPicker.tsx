'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface CollectionRecord {
  id: string;
  titleLatin: string;
  titleArabic?: string;
  shelfmark: string;
  format: string;
}

export function CollectionRecordPicker({ collectionId, onChanged }: { collectionId: string; onChanged?: () => void }) {
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<CollectionRecord[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getCollection(collectionId);
      setRecords(data.records || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.searchCatalog({ q: search, limit: 10 });
        setSearchResults((res.data || []).filter((r: any) => !records.some((rec) => rec.id === r.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, records]);

  const handleAdd = async (recordId: string) => {
    try {
      await api.addRecordToCollection(collectionId, recordId);
      setSearch('');
      setSearchResults([]);
      await load();
      onChanged?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not add this record.' });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleRemove = async (recordId: string) => {
    try {
      await api.removeRecordFromCollection(collectionId, recordId);
      await load();
      onChanged?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not remove this record.' });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-3">
      {message && (
        <div className={`p-2.5 rounded text-xs font-semibold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
          {message.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {message.text}
        </div>
      )}

      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search catalogue records to add…"
          className="w-full pl-8 pr-3 h-9 border border-gray-200 rounded text-xs outline-none focus:border-heritage-red"
        />

        {search.trim() && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
            {searching ? (
              <div className="p-3 text-xs text-gray-500">Searching…</div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-xs text-gray-500">No matching records.</div>
            ) : (
              searchResults.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleAdd(r.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between gap-2 text-xs border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="font-semibold text-gray-900 block">{r.titleLatin}</span>
                    <span className="text-gray-400 font-mono text-[10px]">{r.shelfmark}</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-heritage-red flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-xs text-gray-500 py-3">Loading records…</div>
      ) : records.length === 0 ? (
        <div className="p-4 text-center text-gray-400 text-xs border border-dashed border-gray-300 rounded">No records in this collection yet.</div>
      ) : (
        <div className="border border-gray-200 rounded divide-y divide-gray-100">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-3 py-2 text-xs">
              <div>
                <span className="font-semibold text-gray-900 block">{r.titleLatin}</span>
                <span className="text-gray-400 font-mono text-[10px]">
                  {r.shelfmark} · {r.format}
                </span>
              </div>
              <button type="button" onClick={() => handleRemove(r.id)} className="p-1 text-gray-400 hover:text-red-600" title="Remove from collection">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
