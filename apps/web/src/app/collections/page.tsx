'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { records: number };
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCollections()
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch((err: any) => setError(err.message || 'Failed to load collections'))
      .finally(() => setLoading(false));
  }, []);

  const totalItems = collections.reduce((sum, c) => sum + (c._count?.records || 0), 0);

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 uppercase font-bold">Collections</p>
        <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] mb-3 sm:mb-[18px] tracking-[-0.015em] max-w-[16ch]">
          Browse the holdings
        </h1>
        <p className="text-[17px] sm:text-[21px] leading-[1.5] text-heritage-body max-w-[62ch] mb-6 sm:mb-[30px] text-pretty font-sans">
          Described in Arabic script and in Latin transliteration. Items marked digitised can be read in full from the digital reading room.
        </p>
        <div className="double-rule"></div>

        <div className="pt-6 sm:pt-[34px]">
          <div className="flex justify-between items-baseline mb-4 sm:mb-5 text-[15px] sm:text-[17px] text-heritage-subtle flex-wrap gap-2">
            <span>
              {loading
                ? 'Loading collections…'
                : `${totalItems.toLocaleString()} items across ${collections.length} collection${collections.length === 1 ? '' : 's'}`}
            </span>
            <span>Sort: A&ndash;Z</span>
          </div>

          {error && (
            <div className="border border-heritage-red text-heritage-red p-4 mb-4 text-[15px] font-sans">
              {error}
            </div>
          )}

          {!loading && !error && collections.length === 0 && (
            <div className="border border-black p-8 text-center text-heritage-subtle font-sans">
              No collections have been catalogued yet.
            </div>
          )}

          <div className="flex flex-col border-t border-black">
            {collections.map((col) => {
              const count = col._count?.records ?? 0;
              return (
                <Link
                  key={col.id}
                  href={`/search?collection=${encodeURIComponent(col.slug)}`}
                  className="flex flex-col gap-1.5 sm:gap-[7px] py-5 sm:py-6 px-2 sm:px-3 -mx-2 sm:-mx-3 border-b border-[#D6CCBC] hover:bg-paper-hover transition-colors"
                >
                  <span className="font-amiri text-[20px] sm:text-[22px] font-semibold leading-[1.25]">
                    {col.name}
                  </span>
                  <span className="text-[16px] sm:text-[18px] text-heritage-body font-sans">
                    {col.description || 'No description yet.'}
                  </span>
                  <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted">
                    COLLECTION · {count.toLocaleString()} {count === 1 ? 'item' : 'items'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
