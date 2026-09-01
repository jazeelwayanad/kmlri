'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ListOrdered, Plus, Download, Copy, Check, Folder, BookOpen, ExternalLink } from 'lucide-react';

export default function MyReadingListsPage() {
  const { user } = useAuth();
  const [readingLists, setReadingLists] = useState([
    {
      id: 'rl-1',
      name: 'Malabar Fiqh & Arabic Treatises',
      description: 'Primary sources for doctoral dissertation chapter 2.',
      itemsCount: 6,
      updatedAt: '29 Aug 2026',
      items: [
        { title: 'Fatḥ al-Muʿīn bi Sharḥ Qurrat al-ʿAyn', shelf: 'RB 0908', year: '1582' },
        { title: 'Bayān al-Fawāʾid', shelf: 'MS 0142', year: '1740' },
        { title: 'Maslak al-Adhkiyāʾ', shelf: 'MS 0055', year: '1590' },
      ]
    },
    {
      id: 'rl-2',
      name: '19th-Century Arabi-Malayalam Lithographs',
      description: 'Poetic chapbooks and devotional lithographic prints.',
      itemsCount: 4,
      updatedAt: '18 Aug 2026',
      items: [
        { title: 'Muḥyiddīn Mālā (Lithograph Edition)', shelf: 'AM 0311', year: '1920' },
        { title: 'Kappappāṭṭu', shelf: 'MS 0089', year: '1888' },
      ]
    }
  ]);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [exportModalList, setExportModalList] = useState<any | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleCreateReadingList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setReadingLists([
      ...readingLists,
      {
        id: `rl-${Date.now()}`,
        name: newListName,
        description: newListDesc || 'Research collection reading list',
        itemsCount: 0,
        updatedAt: 'Just now',
        items: []
      }
    ]);
    setNewListName('');
    setNewListDesc('');
    setShowNewListModal(false);
  };

  const handleCopyCitation = (format: string) => {
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
            Organize references into folders, share reading lists with peers, and export formatted academic bibliographies.
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

      {/* Grid of Reading Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {readingLists.map((list) => (
          <div
            key={list.id}
            className="border-2 border-black bg-white rounded p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 text-heritage-red mb-1">
                <Folder className="w-4 h-4" />
                <span className="text-[11px] font-averia uppercase tracking-wider font-bold">Research Folder</span>
              </div>
              <h3 className="font-amiri text-2xl font-bold text-black leading-snug">{list.name}</h3>
              <p className="text-xs text-heritage-body mt-1 leading-relaxed">{list.description}</p>

              {/* Preview of items */}
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                {list.items && list.items.slice(0, 2).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs text-heritage-muted">
                    <span className="truncate max-w-[200px] font-amiri font-semibold text-black">• {item.title}</span>
                    <span className="font-mono text-[11px]">{item.shelf}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs flex-wrap gap-2">
              <span className="text-[11px] font-mono text-gray-500">
                {list.itemsCount} references · Updated {list.updatedAt}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExportModalList(list)}
                  className="px-3 py-1 bg-[#F7F4EF] border border-black rounded font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
                <Link
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

      {/* Export Citations Modal */}
      {exportModalList && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-lg w-full p-6 shadow-2xl font-sans rounded space-y-4">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <p className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold">Citation Exporter</p>
                <h3 className="font-amiri text-2xl font-bold text-black">{exportModalList.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModalList(null)}
                className="text-gray-400 hover:text-black text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-heritage-muted">
              Select your required bibliographic format to export or copy formatted references:
            </p>

            <div className="space-y-3">
              {['BibTeX (.bib)', 'APA 7th Edition', 'Chicago Manual of Style (Notes & Bibliography)', 'MLA 9th Edition'].map((fmt) => (
                <div key={fmt} className="p-3 bg-[#FAF8F5] border border-black/20 rounded flex justify-between items-center text-xs">
                  <span className="font-bold text-black font-averia">{fmt}</span>
                  <button
                    onClick={() => handleCopyCitation(fmt)}
                    className="px-3 py-1 border border-black rounded hover:bg-black hover:text-white transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedFormat === fmt ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFormat === fmt ? 'Copied to Clipboard!' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>

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
              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                  Scope &amp; Notes
                </label>
                <textarea
                  rows={3}
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Research objectives, seminar notes, or dissertation chapters..."
                  className="w-full border border-black bg-white p-3 text-sm rounded outline-none"
                ></textarea>
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
                  className="px-5 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
