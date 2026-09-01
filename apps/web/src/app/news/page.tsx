'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';
import { Calendar, Clock, MapPin, Search, CheckCircle, ArrowRight, BookOpen, Award, Sparkles } from 'lucide-react';

function NewsPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'Events';
  const validTabs = ['Events', 'News'];
  const [activeTab, setActiveTab] = useState(validTabs.includes(initialTab) ? initialTab : 'Events');

  const [items, setItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getContentItems({ category: activeTab, search });
        if (isMounted) {
          setItems(res.items || []);
        }
      } catch {
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeTab, search]);

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 sm:mb-3">
          <div>
            <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">
              KMLRI Bulletin &amp; Proceedings
            </p>
            <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] tracking-[-0.015em] max-w-[18ch]">
              News &amp; Events
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              className="w-full pl-9 pr-3 py-2 bg-white/70 border border-black/30 font-sans text-sm outline-none focus:border-black focus:bg-white transition-all rounded-none"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>
        </div>

        {/* Tab Navigation: News and Events only */}
        <div className="flex gap-1 sm:gap-0 text-[16px] sm:text-[20px] flex-wrap mt-6">
          {validTabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setSearch('');
                }}
                className={`border-none cursor-pointer font-amiri text-[16px] sm:text-[20px] leading-none px-4 sm:px-[26px] h-[44px] sm:h-[54px] flex items-center justify-center transition-all ${
                  active ? 'bg-black text-white font-bold' : 'bg-transparent text-black hover:text-heritage-red'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <div className="double-rule"></div>

        {/* Dynamic Items Grid */}
        {items.length === 0 ? (
          <div className="py-16 text-center text-heritage-muted font-sans">
            <p className="text-lg">No {activeTab.toLowerCase()} matching your search criteria.</p>
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-heritage-red underline font-medium hover:text-black cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-9 pt-6 sm:pt-9">
            {items.map((item, idx) => (
              <article
                key={item.id || idx}
                className="flex flex-col justify-between bg-white p-5 border border-black/20 hover:border-black transition-all group"
              >
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <Link
                    href={`/news/${item.slug || item.id}`}
                    className="aspect-[16/9] bg-[#EAE4D9] border border-black/10 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden group-hover:bg-[#dfd7c8] transition-colors"
                  >
                    <span className="font-averia text-[11px] uppercase tracking-wider text-heritage-muted font-bold mb-1">
                      {item.kicker || activeTab}
                    </span>
                    <span className="font-amiri text-base font-semibold text-black/80 line-clamp-1">
                      {item.venue || item.author || 'Kunhīn Musliyār Library'}
                    </span>
                    {item.featured && (
                      <span className="absolute top-2 right-2 bg-heritage-red text-white text-[10px] font-averia px-2 py-0.5 uppercase font-bold">
                        Featured
                      </span>
                    )}
                  </Link>

                  <div className="flex items-center justify-between text-xs text-heritage-muted font-averia font-bold">
                    <span>{item.date || item.deadline}</span>
                    {item.time && <span>{item.time}</span>}
                  </div>

                  <Link href={`/news/${item.slug || item.id}`}>
                    <h3 className="font-amiri text-[20px] sm:text-[23px] font-semibold leading-[1.25] text-pretty text-black group-hover:text-heritage-red transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-[15px] sm:text-[17px] leading-[1.5] text-heritage-body text-pretty font-sans line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-black/10 flex items-center justify-between flex-wrap gap-2">
                  <Link
                    href={`/news/${item.slug || item.id}`}
                    className="border-[1.5px] border-black font-amiri font-semibold text-[15px] sm:text-[16px] py-1 sm:py-1.5 px-4 self-start hover:bg-black hover:text-paper transition-colors"
                  >
                    View Details →
                  </Link>

                  {item.category === 'EVENT' && (
                    <span className="text-xs font-sans text-gray-500">
                      {item.registered || 0}/{item.capacity || 100} Registered
                    </span>
                  )}
                  {item.stipend && (
                    <span className="text-xs font-sans font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                      {item.stipend}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper text-black flex items-center justify-center font-amiri text-xl">
          Loading What’s on...
        </div>
      }
    >
      <NewsPageContent />
    </Suspense>
  );
}
