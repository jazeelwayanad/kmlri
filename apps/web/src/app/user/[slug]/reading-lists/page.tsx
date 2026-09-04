'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Plus, Download, Copy, Check, Folder, Trash2, X } from 'lucide-react';

interface ReadingListItem {
  id: string;
  titleLatin: string;
  titleArabic?: string;
  shelfmark: string;
  format: string;
  authors?: string[];
  publicationYear?: string;
}

interface ReadingList {
  id: string;
  name: string;
  itemIds: string[];
  items: ReadingListItem[];
  updatedAt: string;
}

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildCitation(item: ReadingListItem, style: string): string {
  const authorStr = item.authors && item.authors.length > 0 ? item.authors.join(', ') : 'Anonymous';
  const year = item.publicationYear || 'n.d.';
  switch (style) {
    case 'APA 7th Edition':
      return `${authorStr} (${year}). ${item.titleLatin} [${item.shelfmark}]. Kunhīn Musliyār Library & Research Institute.`;
    case 'MLA 9th Edition':
      return `${authorStr}. ${item.titleLatin}. ${year}. Item ${item.shelfmark}, Kunhīn Musliyār Library & Research Institute.`;
    case 'Chicago Manual of Style (Notes & Bibliography)':
      return `${authorStr}. ${item.titleLatin}. Malabar: KMLRI Archives (${item.shelfmark}), ${year}.`;
    default:
      return `@misc{kmlri_${item.id},\n  author = {${authorStr}},\n  title = {${item.titleLatin}},\n  year = {${year}},\n  note = {Shelfmark: ${item.shelfmark}, KMLRI}\n}`;
  }
}

export default function MyReadingListsPage() {
  const { user } = useAuth();
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exportModalList, setExportModalList] = useState<ReadingList | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getReadingLists();
      setReadingLists(data || []);
    } catch {
      // leave list empty; page will show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const handleCreateReadingList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreating(true);
    try {
      await api.createReadingList(newListName.trim());
      setNewListName('');
      setShowNewListModal(false);
      await load();
    } catch {
      // keep modal open so the user can retry
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (id: string) => {
    try {
      await api.deleteReadingList(id);
      await load();
    } catch {
      // ignore; list stays visible for retry
    }
  };

  const handleRemoveItem = async (listId: string, bibRecordId: string) => {
    try {
      await api.removeFromReadingList(listId, bibRecordId);
      await load();
      if (exportModalList?.id === listId) {
        setExportModalList((prev) => (prev ? { ...prev, items: prev.items.filter((i) => i.id !== bibRecordId) } : prev));
      }
    } catch {
      // ignore
    }
  };

  const handleCopyCitation = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Curated Reading Lists &amp; Bibliographies
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Organize catalogue items into folders and export formatted academic bibliographies.
          </p>
        </div>

        <button
          onClick={() => setShowNewListModal(true)}
          className="px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New List</span>
        </button>
      </div>

      <div className="double-rule"></div>

      {loading ? (
        <div className="border-2 border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">Loading your reading lists…</div>
      ) : readingLists.length === 0 ? (
        <div className="border-2 border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">
          You haven&apos;t created any reading lists yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {readingLists.map((list) => (
            <div
              key={list.id}
              className="border-2 border-black bg-white rounded p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-heritage-red mb-1">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    <span className="text-[11px] font-averia uppercase tracking-wider font-bold">Research Folder</span>
                  </div>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="text-gray-300 hover:text-heritage-red cursor-pointer"
                    title="Delete list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="font-amiri text-2xl font-bold text-black leading-snug">{list.name}</h3>

                {/* Preview of items */}
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                  {list.items.length === 0 && <p className="text-xs text-heritage-muted">No items added yet.</p>}
                  {list.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-heritage-muted gap-2">
                      <span className="truncate max-w-[200px] font-amiri font-semibold text-black">• {item.titleLatin}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono text-[11px]">{item.shelfmark}</span>
                        <button onClick={() => handleRemoveItem(list.id, item.id)} className="text-gray-300 hover:text-heritage-red">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs flex-wrap gap-2">
                <span className="text-[11px] font-mono text-gray-500">
                  {list.items.length} reference{list.items.length === 1 ? '' : 's'} · Updated {formatDate(list.updatedAt)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExportModalList(list)}
                    disabled={list.items.length === 0}
                    className="px-3 py-1 bg-[#F7F4EF] border border-black rounded font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                  <Link prefetch
                    href="/search"
                    className="px-3 py-1 bg-black text-white rounded font-bold hover:bg-heritage-red hover:text-white  transition-colors"
                  >
                    Browse →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Citations Modal */}
      {exportModalList && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-lg w-full p-6 shadow-2xl font-sans rounded space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <p className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold">Citation Exporter</p>
                <h3 className="font-amiri text-2xl font-bold text-black">{exportModalList.name}</h3>
              </div>
              <button type="button" onClick={() => setExportModalList(null)} className="text-gray-400 hover:text-black text-sm font-bold">
                ✕
              </button>
            </div>

            {['APA 7th Edition', 'MLA 9th Edition', 'Chicago Manual of Style (Notes & Bibliography)', 'BibTeX (.bib)'].map((fmt) => {
              const combined = exportModalList.items.map((item) => buildCitation(item, fmt)).join('\n\n');
              return (
                <div key={fmt} className="p-3 bg-[#FAF8F5] border border-black/20 rounded space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black font-averia">{fmt}</span>
                    <button
                      onClick={() => handleCopyCitation(combined, fmt)}
                      className="px-3 py-1 border border-black rounded hover:bg-black hover:text-white transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedFormat === fmt ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedFormat === fmt ? 'Copied!' : 'Copy All'}</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-[11px] text-gray-700">{combined}</pre>
                </div>
              );
            })}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setExportModalList(null)}
                className="px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white "
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Reading List Modal */}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 shadow-2xl font-sans rounded space-y-4">
            <h3 className="font-amiri text-2xl font-bold text-black">Create New Reading List</h3>
            <form onSubmit={handleCreateReadingList} className="space-y-4">
              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                  Reading List Title*
                </label>
                <input
                  type="text"
                  required
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. 18th Century Shafi'i Glosses"
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewListModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
