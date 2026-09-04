'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';
import { BookOpen, Tag, Calendar, User, ArrowRight, Share2, Sparkles } from 'lucide-react';

export default function StoriesPage() {
  const [stories, setStories] = useState<ContentItem[]>([]);
  const [activeTag, setActiveTag] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadStories() {
      setLoading(true);
      try {
        const res = await api.getContentItems({ category: 'Stories' });
        if (isMounted) {
          setStories(res.items || []);
        }
      } catch {
        if (isMounted) setStories([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStories();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredStory = stories.find((s) => s.featured) || stories[0];
  const otherStories = stories.filter((s) => s.id !== featuredStory?.id);

  // Extract all unique tags
  const allTags = ['ALL', ...Array.from(new Set(stories.flatMap((s) => s.tags || [])))];

  const filteredStories = activeTag === 'ALL'
    ? otherStories
    : otherStories.filter((s) => s.tags?.includes(activeTag));

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 uppercase font-bold">
          Archive Stories &amp; Codicological Insights
        </p>
        <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] mb-3 sm:mb-[18px] tracking-[-0.015em] max-w-[18ch]">
          From the reading room
        </h1>
        <div className="double-rule mb-6 sm:mb-10"></div>

        {/* Featured Story Hero Article */}
        {featuredStory && (
          <article className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 sm:gap-11 items-center mb-12 sm:mb-16 bg-white p-6 sm:p-8 border border-black/20 shadow-sm">
            <Link prefetch
              href={`/stories/${featuredStory.slug || featuredStory.id}`}
              className="w-full h-[240px] sm:h-[340px] bg-[#E2DACB] border border-black flex flex-col items-center justify-center text-center p-6 relative overflow-hidden group hover:bg-[#d8cfbe] transition-colors"
            >
              <span className="font-averia text-[11px] tracking-[0.15em] text-[#7E7365] uppercase font-bold mb-2">
                Featured Codex Plate · {featuredStory.kicker || 'Primary Archive'}
              </span>
              <p className="font-amiri text-lg font-bold text-black/70 italic max-w-sm line-clamp-3 group-hover:text-black">
                "{featuredStory.summary}"
              </p>
              {featuredStory.date && (
                <span className="mt-4 text-xs font-sans text-gray-600 font-semibold bg-white/70 px-3 py-1 border border-black/20">
                  {featuredStory.date}
                </span>
              )}
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-red uppercase font-bold">
                  {featuredStory.kicker || 'Featured story'}
                </span>
                {featuredStory.author && (
                  <span className="text-xs text-gray-500 font-sans">
                    · By {featuredStory.author}
                  </span>
                )}
              </div>
              <Link prefetch href={`/stories/${featuredStory.slug || featuredStory.id}`}>
                <h2 className="font-amiri text-[28px] sm:text-[38px] font-semibold leading-[1.15] mb-3 sm:mb-4 text-balance text-black hover:text-heritage-red transition-colors">
                  {featuredStory.title}
                </h2>
              </Link>
              <p className="text-[16px] sm:text-[19px] leading-[1.5] text-heritage-body mb-5 sm:mb-6 text-pretty font-sans">
                {featuredStory.summary}
              </p>
              <Link prefetch
                href={`/stories/${featuredStory.slug || featuredStory.id}`}
                className="inline-block bg-black text-paper font-amiri font-semibold text-[16px] sm:text-[17px] py-2.5 sm:py-3 px-6 sm:px-[30px] rounded-full hover:bg-heritage-red hover:text-white transition-colors"
              >
                Read the story →
              </Link>
            </div>
          </article>
        )}

        {/* Tag Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-sm font-sans no-scrollbar">
          <span className="text-xs uppercase tracking-wider text-heritage-muted font-bold mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Topics:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 border text-xs whitespace-nowrap transition-all cursor-pointer ${activeTag === tag
                ? 'bg-black text-white border-black font-semibold'
                : 'bg-white text-gray-700 border-black/20 hover:border-black'
                }`}
            >
              {tag === 'ALL' ? 'All Stories' : `#${tag}`}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-9">
          {filteredStories.map((s, idx) => (
            <Link prefetch
              key={s.id || idx}
              href={`/stories/${s.slug || s.id}`}
              className="flex flex-col justify-between gap-3 group bg-white p-5 border border-black/20 hover:border-black transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <div className="flex flex-col gap-2.5">
                <span className="aspect-[4/3] bg-[#EAE4D9] border border-black/10 flex flex-col items-center justify-center p-4 text-center group-hover:bg-[#dfd7c8] transition-colors">
                  <span className="font-averia text-[11px] uppercase tracking-wider text-heritage-muted font-bold mb-1">
                    {s.kicker || 'Archive Note'}
                  </span>
                  <span className="text-xs font-sans text-gray-600 line-clamp-2">
                    {s.title}
                  </span>
                </span>
                <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">
                  {s.kicker}
                </span>
                <h3 className="font-amiri text-[20px] sm:text-[22px] font-semibold leading-[1.25] text-pretty text-black group-hover:text-heritage-red transition-colors">
                  {s.title}
                </h3>
                <p className="text-[14px] sm:text-[15px] leading-[1.5] text-heritage-body font-sans line-clamp-2">
                  {s.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs font-sans text-gray-500">
                <span>{s.date || 'KMLRI Reading Room'}</span>
                <span className="text-heritage-red font-semibold group-hover:underline">
                  Read Story →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
