'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { FolderHeart, Copy, ExternalLink, Trash2, Check } from 'lucide-react';

export default function SavedResourcesPage() {
  const { user } = useAuth();
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

  const [savedResources, setSavedResources] = useState([
    {
      id: 'res-1',
      bibId: '1',
      titleLatin: 'Bayān al-Fawāʾid',
      titleArabic: 'بيان الفوائد',
      shelfmark: 'MS 0142',
      format: 'MANUSCRIPT',
      dateAdded: '28 Aug 2026',
      callNumber: 'MS-ARA-0142',
      citation: 'Unnamed scribe. (n.d.). Bayān al-Fawāʾid [Manuscript MS 0142]. KMLRI Archives.'
    },
    {
      id: 'res-2',
      bibId: '2',
      titleLatin: 'Muḥyiddīn Mālā',
      titleArabic: 'محي الدين مالا',
      shelfmark: 'AM 0311',
      format: 'ARABI_MALAYALAM_PRINT',
      dateAdded: '15 Aug 2026',
      callNumber: 'AM-LIT-0311',
      citation: 'Qāḍī Muḥammad. (1920). Muḥyiddīn Mālā [Lithograph AM 0311]. KMLRI Lithograph Collection.'
    },
    {
      id: 'res-3',
      bibId: '3',
      titleLatin: 'Fatḥ al-Muʿīn, annotated copy',
      titleArabic: 'فتح المعين شرح قرة العين',
      shelfmark: 'RB 0908',
      format: 'RARE_BOOK',
      dateAdded: '02 Aug 2026',
      callNumber: 'RB-FIQ-0908',
      citation: 'Zayn al-Dīn al-Malībārī. Fatḥ al-Muʿīn. Rare Book RB 0908, KMLRI.'
    }
  ]);

  const handleCopyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(id);
    setTimeout(() => setCopiedCitation(null), 2500);
  };

  const handleRemove = (id: string) => {
    setSavedResources(savedResources.filter((r) => r.id !== id));
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Saved Codex Resources
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Bookmarked manuscripts, Arabi-Malayalam prints, and rare folios for immediate research retrieval.
          </p>
        </div>

        <Link
          href="/search"
          className="text-xs font-bold text-heritage-red hover:underline"
        >
          Explore Catalog Stacks →
        </Link>
      </div>

      <div className="double-rule"></div>

      <div className="space-y-4">
        {savedResources.map((res) => (
          <div
            key={res.id}
            className="border-2 border-black bg-white rounded p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-16 sm:w-16 sm:h-20 bg-[#E2DACB] border border-black/30 flex items-center justify-center text-[10px] font-averia uppercase text-[#7E7365] flex-shrink-0 font-bold">
                Folio
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-[#F5F2EC] text-black border border-[#D6CCBC] px-2 py-0.5 rounded font-bold font-averia uppercase">
                    {res.format.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-gray-500 font-bold">{res.shelfmark}</span>
                </div>

                <h3 className="font-amiri text-xl sm:text-2xl font-bold text-black mt-1 leading-snug">
                  {res.titleLatin} {res.titleArabic && <span className="font-amiri text-heritage-red ml-1.5 font-normal">({res.titleArabic})</span>}
                </h3>

                <p className="text-xs text-heritage-muted mt-0.5">
                  Call: <strong className="text-black font-mono">{res.callNumber}</strong> · Bookmarked on {res.dateAdded}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center text-xs">
              <button
                onClick={() => handleCopyCitation(res.citation, res.id)}
                className="px-3 py-1.5 border border-gray-300 rounded font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedCitation === res.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCitation === res.id ? 'Copied!' : 'Copy Citation'}</span>
              </button>

              <Link
                href={`/items/${res.bibId}`}
                className="px-3.5 py-1.5 bg-black text-white rounded font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1"
              >
                <span>View Codex</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => handleRemove(res.id)}
                title="Remove Bookmark"
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
