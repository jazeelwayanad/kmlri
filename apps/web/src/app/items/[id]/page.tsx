'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, BibliographicRecord } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [record, setRecord] = useState<BibliographicRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [folioIndex, setFolioIndex] = useState(0);
  const [holdStatus, setHoldStatus] = useState<string | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  const [readingLists, setReadingLists] = useState<{ id: string; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [listStatus, setListStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .getReadingLists()
      .then((lists) => setReadingLists(lists || []))
      .catch(() => {});
  }, [user]);

  const handleAddToList = async () => {
    if (!selectedListId || !record) return;
    try {
      await api.addToReadingList(selectedListId, record.id);
      setListStatus('Added to reading list.');
    } catch (err: any) {
      setListStatus(err.message || 'Could not add to reading list.');
    } finally {
      setTimeout(() => setListStatus(null), 3000);
    }
  };

  useEffect(() => {
    async function loadItem() {
      if (!id) return;
      setLoading(true);
      setNotFound(false);
      try {
        const data = await api.getCatalogItem(id);
        setRecord(data);
        setFolioIndex(0);
      } catch {
        setRecord(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  const handlePlaceHold = async () => {
    if (!user) {
      setHoldStatus('Please sign in to place a hold on this item.');
      return;
    }
    try {
      await api.placeHold(record?.id || id);
      setHoldStatus('Hold placed successfully! We will notify you when ready for collection.');
    } catch (err: any) {
      setHoldStatus(err.message || 'Could not place hold.');
    }
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(format);
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-black font-amiri flex items-center justify-center">
        <p className="text-xl font-bold">Loading item record...</p>
      </div>
    );
  }

  if (notFound || !record) {
    return (
      <div className="min-h-screen bg-paper text-black font-amiri">
        <TopBar />
        <Navbar />
        <div className="max-w-[700px] mx-auto py-24 px-5 text-center">
          <h1 className="text-3xl font-bold mb-3">Item Not Found</h1>
          <p className="text-heritage-muted font-sans mb-6">
            We couldn&apos;t find a catalogue record matching &quot;{id}&quot;.
          </p>
          <Link href="/search" className="inline-block px-5 py-2 bg-black text-white rounded text-xs font-bold font-sans hover:bg-heritage-red">
            Back to Catalogue Search →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const folios = record.digitalFolios || [];
  const currentFolio = folios[folioIndex];

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-4 sm:px-5 py-6 sm:py-10">
        <nav className="mb-6 text-sm font-sans flex items-center gap-2 text-heritage-muted">
          <Link href="/search" className="hover:text-heritage-red underline">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">{record.shelfmark}</span>
          <span>/</span>
          <span className="text-black truncate max-w-xs">{record.titleLatin}</span>
        </nav>

        {/* Title Header */}
        <div className="border-b border-black pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div>
              <span className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold block mb-1">
                {record.format} · Shelfmark: {record.shelfmark}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-black leading-tight">
                {record.titleLatin}
              </h1>
              {record.titleArabic && (
                <p className="text-2xl sm:text-3xl text-gray-700 mt-1 font-amiri" dir="rtl">
                  {record.titleArabic}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handlePlaceHold}
                className="px-5 py-2.5 bg-black text-white font-sans text-xs uppercase font-bold tracking-wider hover:bg-heritage-red transition-colors"
              >
                Place Hold / Reserve
              </button>
              {user && readingLists.length > 0 && (
                <div className="flex items-center gap-2 font-sans">
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="border border-black text-xs px-2 py-2.5 rounded outline-none bg-white"
                  >
                    <option value="">Add to reading list…</option>
                    {readingLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddToList}
                    disabled={!selectedListId}
                    className="px-4 py-2.5 border-2 border-black text-xs uppercase font-bold tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
          {holdStatus && (
            <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-sans rounded">
              {holdStatus}
            </div>
          )}
          {listStatus && (
            <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-sans rounded">
              {listStatus}
            </div>
          )}
        </div>

        {/* 2-Column Metadata & IIIF Viewer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Details & Viewer */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            {record.summary && (
              <div className="bg-white p-6 border border-black/15 shadow-sm">
                <h3 className="font-averia text-xs uppercase tracking-wider text-heritage-muted font-bold mb-2">
                  Codicological Summary
                </h3>
                <p className="font-sans text-sm text-gray-800 leading-relaxed">
                  {record.summary}
                </p>
              </div>
            )}

            {/* Digital Folio Viewer */}
            {folios.length > 0 ? (
              <div className="bg-[#1A1A1A] text-white p-6 border border-black rounded shadow-md space-y-4">
                <div className="flex justify-between items-center border-b border-white/20 pb-3">
                  <div>
                    <span className="text-xs font-sans text-gray-400 uppercase tracking-wider font-bold">
                      Digital Folio Viewer
                    </span>
                    <p className="text-sm font-semibold text-gray-200">
                      {currentFolio?.label || `Folio ${folioIndex + 1}`} ({folioIndex + 1} of {folios.length})
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-sans">
                    <button
                      type="button"
                      disabled={folioIndex <= 0}
                      onClick={() => setFolioIndex(folioIndex - 1)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30"
                    >
                      ← Prev Folio
                    </button>
                    <button
                      type="button"
                      disabled={folioIndex >= folios.length - 1}
                      onClick={() => setFolioIndex(folioIndex + 1)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30"
                    >
                      Next Folio →
                    </button>
                  </div>
                </div>

                <div className="aspect-[4/3] bg-[#0D0D0D] border border-white/10 flex items-center justify-center text-center relative overflow-hidden">
                  {currentFolio?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentFolio.imageUrl}
                      alt={currentFolio.label || `Folio ${folioIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-xs font-sans text-gray-400">No image available for this folio.</p>
                  )}
                </div>

                {(currentFolio?.ocrTextArabic || currentFolio?.ocrTextLatin) && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    {currentFolio.ocrTextArabic && (
                      <p className="font-amiri text-lg text-amber-200" dir="rtl">
                        {currentFolio.ocrTextArabic}
                      </p>
                    )}
                    {currentFolio.ocrTextLatin && (
                      <p className="text-xs font-sans text-gray-300">{currentFolio.ocrTextLatin}</p>
                    )}
                  </div>
                )}

                {/* Folio thumbnail strip */}
                {folios.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pt-2">
                    {folios.map((f: any, idx: number) => (
                      <button
                        key={f.id || idx}
                        type="button"
                        onClick={() => setFolioIndex(idx)}
                        className={`flex-shrink-0 w-14 h-16 border-2 rounded overflow-hidden ${
                          idx === folioIndex ? 'border-amber-300' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {f.thumbnailUrl || f.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.thumbnailUrl || f.imageUrl} alt={f.label} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-gray-500">#{idx + 1}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#FAF8F5] border border-black/15 p-6 rounded text-center text-sm text-heritage-muted font-sans">
                No digital facsimile has been captured for this item yet.
              </div>
            )}

            {/* Citations Desk */}
            {record.citations && (
              <div className="bg-white p-6 border border-black/15 shadow-sm space-y-4">
                <h3 className="font-averia text-xs uppercase tracking-wider text-heritage-muted font-bold">
                  Scholarly Citations
                </h3>
                <div className="space-y-3 font-sans text-xs">
                  {Object.entries(record.citations).map(([format, text]) => (
                    <div key={format} className="p-3 bg-[#FAF8F5] border border-gray-200 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="uppercase text-gray-600 text-[10px]">{format}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(text as string, format)}
                          className="text-[#A52307] hover:underline font-bold"
                        >
                          {copiedCitation === format ? 'Copied!' : 'Copy Citation'}
                        </button>
                      </div>
                      <p className="font-mono text-gray-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                        {text as string}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Bibliographic Metadata Table */}
          <div className="space-y-6">
            <div className="bg-white p-6 border border-black/15 shadow-sm space-y-4 font-sans text-xs">
              <h3 className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold border-b border-gray-200 pb-2">
                Bibliographic Information
              </h3>

              <div className="space-y-2.5">
                <div>
                  <span className="text-gray-500 block text-[11px]">Primary Author(s):</span>
                  <span className="font-semibold text-gray-900">{record.authors?.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Language:</span>
                  <span className="font-semibold text-gray-900">{record.language}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Physical Extent:</span>
                  <span className="font-semibold text-gray-900">{record.extent || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Material &amp; Paper:</span>
                  <span className="font-semibold text-gray-900">{record.material || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Binding:</span>
                  <span className="font-semibold text-gray-900">{record.binding || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Provenance &amp; Custody:</span>
                  <span className="font-semibold text-gray-900">{record.provenance || 'KMLRI Custodial Vault'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Access Clearance:</span>
                  <span className="font-bold text-emerald-800 uppercase">{record.accessLevel}</span>
                </div>
                {(record as any).totalCopiesCount !== undefined && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">Copies:</span>
                    <span className="font-semibold text-gray-900">
                      {(record as any).availableCopiesCount} of {(record as any).totalCopiesCount} available
                    </span>
                  </div>
                )}
              </div>

              {record.subjects && record.subjects.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-500 block text-[11px] mb-1.5">Subject Headings:</span>
                  <div className="flex flex-wrap gap-1">
                    {record.subjects.map((sub, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px]">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(record as any).related && (record as any).related.length > 0 && (
              <div className="bg-white p-6 border border-black/15 shadow-sm space-y-3 font-sans text-xs">
                <h3 className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold border-b border-gray-200 pb-2">
                  Related Items
                </h3>
                {(record as any).related.map((r: any) => (
                  <Link
                    key={r.id}
                    href={`/items/${r.id}`}
                    className="block hover:text-heritage-red"
                  >
                    <span className="font-amiri text-base font-bold block">{r.titleLatin}</span>
                    <span className="text-gray-500">{r.format}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
