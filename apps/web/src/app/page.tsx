'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('News');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const tabs = ['Events', 'News', 'Stories', 'Opportunities'];

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCategory() {
      setLoadingContent(true);
      try {
        const res = await api.getContentItems({ category: activeTab, limit: 4 });
        if (isMounted) {
          setContentItems(res.items || []);
        }
      } catch {
        if (isMounted) setContentItems([]);
      } finally {
        if (isMounted) setLoadingContent(false);
      }
    }
    loadCategory();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const collections = [
    { name: 'Manuscripts', count: '1,240 items', note: 'Arabic, Persian and Arabi-Malayalam codices, described folio by folio.' },
    { name: 'Arabi-Malayalam Print', count: '860 items', note: 'Lithographs, chapbooks and poetry printed across Malabar.' },
    { name: 'Rare Books', count: '2,100 items', note: 'Early editions in Arabic, Malayalam, Urdu and English.' },
    { name: 'Periodicals', count: '310 titles', note: 'Journals and magazines, bound runs and loose issues.' },
    { name: 'Theses & Papers', count: '470 items', note: 'Dissertations deposited by affiliated researchers.' },
    { name: 'Audio & Oral History', count: '95 hours', note: 'Recorded recitation, interviews and lecture archives.' },
  ];

  const services = [
    { name: 'Reading Room', note: 'Open to researchers, Monday to Saturday, 9:00 to 17:00.', action: 'Plan a visit', href: '/services' },
    { name: 'Reproduction', note: 'Digital copies of catalogued items on request.', action: 'Request a scan', href: '/services' },
    { name: 'Reference Help', note: 'Ask a librarian about sources, scripts and citations.', action: 'Ask a question', href: '/ask' },
    { name: 'Membership', note: 'Borrowing and remote access for members of the institute.', action: 'Become a member', href: '/ask' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const getTargetUrlForCategory = (cat: string) => {
    if (cat === 'Stories') return '/stories';
    if (cat === 'Opportunities') return '/opportunities';
    return '/news';
  };

  const getItemDetailUrl = (item: ContentItem, tab: string) => {
    const slug = item.slug || item.id;
    if (item.category === 'STORY' || tab === 'Stories') return `/stories/${slug}`;
    if (item.category === 'OPPORTUNITY' || tab === 'Opportunities') return `/opportunities/${slug}`;
    return `/news/${slug}`;
  };

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      {/* Arabic Wordmark Section */}
      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-[42px] px-4 sm:px-5 text-center">
        <img
          src="/assets/wordmark-arabic.svg"
          alt="كنجين مسليار — Kunhīn Musliyār Library & Research Institute"
          className="w-[240px] sm:w-[313px] max-w-full h-auto mx-auto block"
        />
      </section>

      {/* Main Search Bar */}
      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-[51px] px-4 sm:px-5">
        <form
          onSubmit={handleSearch}
          className="flex items-center shadow-[inset_0_0_0_2px_rgb(0,0,0)] sm:shadow-[inset_0_0_0_3px_rgb(0,0,0)] h-[52px] sm:h-[68px] px-4 sm:px-7 gap-3 sm:gap-4 bg-transparent"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Keywords to Search"
            aria-label="Search the catalogue"
            className="flex-1 border-none outline-none bg-transparent font-sans font-light text-[17px] sm:text-[24px] text-black placeholder:text-[#D8B3B3]/60 min-w-0"
          />
          <button
            type="submit"
            aria-label="Search"
            className="border-none bg-transparent cursor-pointer text-heritage-red hover:text-black flex items-center p-0 transition-colors flex-shrink-0"
          >
            <span
              className="w-[24px] h-[24px] sm:w-[31px] sm:h-[31px] block bg-current"
              style={{
                WebkitMask: 'url(/assets/search-icon.svg) no-repeat center/contain',
                mask: 'url(/assets/search-icon.svg) no-repeat center/contain',
              }}
            ></span>
          </button>
        </form>
        <div className="mt-2 font-amiri text-[16px] sm:text-[20px] flex justify-between items-center">
          <Link href="/advanced" className="hover:text-heritage-red">
            Advanced Search →
          </Link>
          <Link href="/search" className="text-heritage-muted text-sm hover:text-black font-averia">
            Browse All Stacks
          </Link>
        </div>
      </section>

      {/* What's On Section Header & Overlapping Tabs */}
      <section id="whatson" className="max-w-[1100px] mx-auto pt-12 sm:pt-20 px-4 sm:px-5 relative z-20">
        <div className="flex items-end justify-between gap-4 font-amiri flex-wrap">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-heritage-red mb-3 sm:mb-5">What’s On</h2>
          <div className="flex items-end gap-1 sm:gap-0 text-[16px] sm:text-[20px] flex-wrap">
            {tabs.map((tab) => {
              const active = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-none cursor-pointer font-amiri text-[16px] sm:text-[20px] leading-none px-4 sm:px-6 relative flex items-center justify-center transition-all whitespace-nowrap ${active
                    ? 'bg-black text-white h-[44px] sm:h-[54px] -mb-[10px] sm:-mb-[14px] pb-[10px] sm:pb-[14px] font-bold'
                    : 'bg-transparent text-black h-[44px] sm:h-[54px] hover:text-heritage-red'
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Black Cards Carousel/Grid Section */}
      <section className="bg-black text-white relative z-10">
        <div className="absolute left-0 right-0 top-[5px] border-t border-white"></div>
        <div className="absolute left-0 right-0 top-[8px] border-t border-white"></div>
        <div className="max-w-[1100px] mx-auto py-10 sm:py-[74px] px-4 sm:px-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-[30px] justify-between">
            {contentItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 font-sans text-sm">
                No items currently published under {activeTab}.
              </div>
            ) : (
              contentItems.map((item, idx) => {
              const detailUrl = getItemDetailUrl(item, activeTab);
              return (
                <article key={item.id || idx} className="flex flex-col justify-between gap-3 w-full max-w-[260px] mx-auto sm:mx-0 group">
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href={detailUrl}
                      className="w-full h-[140px] sm:h-[153px] bg-[#222] border border-white/20 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden group-hover:border-white/50 transition-colors"
                    >
                      <span className="font-averia text-[11px] tracking-[0.1em] text-heritage-red uppercase font-bold mb-1">
                        {item.kicker || activeTab}
                      </span>
                      <span className="text-[12px] text-gray-400 font-sans line-clamp-2">
                        {item.date || item.deadline || 'KMLRI Archive Collection'}
                      </span>
                    </Link>
                    <Link href={detailUrl}>
                      <p className="font-amiri text-[17px] sm:text-[18px] font-bold leading-[1.35] m-0 text-pretty text-white group-hover:text-heritage-red transition-colors line-clamp-3">
                        {item.title}
                      </p>
                    </Link>
                    <p className="text-[13px] text-gray-400 font-sans line-clamp-2 leading-[1.4]">
                      {item.summary}
                    </p>
                  </div>
                  <Link
                    href={detailUrl}
                    className="w-[130px] sm:w-[137px] h-[40px] sm:h-[46px] shadow-[inset_0_0_0_1px_rgb(243,239,230)] text-white font-amiri font-bold text-[17px] sm:text-[20px] flex items-center justify-center mt-1 hover:bg-paper hover:text-black transition-colors"
                  >
                    Read more
                  </Link>
                </article>
              );
            }))}
          </div>
          <div className="mt-8 text-right">
            <Link
              href={getTargetUrlForCategory(activeTab)}
              className="text-[15px] sm:text-[17px] font-averia text-[#E2DACB] hover:text-white underline underline-offset-4"
            >
              Explore all {activeTab} →
            </Link>
          </div>
        </div>
      </section>

      {/* Browse the Collections Section */}
      <section id="collections" className="max-w-[1100px] mx-auto pt-10 sm:pt-[78px] px-4 sm:px-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h2 className="font-amiri text-[22px] sm:text-[26px] font-semibold text-heritage-red mb-2 sm:mb-[10px]">
            Browse the Collections
          </h2>
          <Link href="/collections" className="text-[16px] sm:text-[18px] mb-2 sm:mb-3 hover:text-heritage-red">
            All collections →
          </Link>
        </div>
        <div className="double-rule"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-black border border-black border-t-0">
          {collections.map((col, idx) => (
            <Link
              key={idx}
              href={`/search?format=${encodeURIComponent(col.name)}`}
              className="bg-paper p-5 sm:p-7 flex flex-col gap-2 min-h-[140px] sm:min-h-[168px] hover:bg-paper-hover transition-colors"
            >
              <span className="font-averia text-[12px] tracking-[0.12em] text-heritage-muted font-bold">
                {col.count}
              </span>
              <span className="font-amiri text-[21px] sm:text-[23px] font-semibold leading-[1.25]">
                {col.name}
              </span>
              <span className="text-[15px] sm:text-[17px] leading-[1.45] text-heritage-subtle text-pretty font-sans">
                {col.note}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* From the Archive Featured Section */}
      <section id="stories" className="max-w-[1100px] mx-auto pt-10 sm:pt-[78px] px-4 sm:px-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h2 className="font-amiri text-[22px] sm:text-[26px] font-semibold text-heritage-red mb-2 sm:mb-[10px]">
            From the Archive
          </h2>
          <Link href="/stories" className="text-[16px] sm:text-[18px] mb-2 sm:mb-3 hover:text-heritage-red">
            More stories →
          </Link>
        </div>
        <div className="double-rule"></div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 sm:gap-11 pt-6 sm:pt-[38px] items-center">
          <div className="w-full min-h-[220px] sm:h-[320px] bg-[#E2DACB] border border-black p-6 flex items-center justify-center text-center">
            <span className="font-averia text-[12px] tracking-[0.1em] text-[#7E7365] uppercase font-bold">
              manuscript folio scan &amp; codex plate
            </span>
          </div>
          <div>
            <p className="font-averia text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-[14px] uppercase font-bold">
              Featured item
            </p>
            <h3 className="font-amiri text-[28px] sm:text-[38px] font-semibold leading-[1.15] mb-3 sm:mb-[18px] text-balance">
              A hand-copied Arabi-Malayalam poem, newly digitised
            </h3>
            <p className="text-[17px] sm:text-[20px] leading-[1.5] text-heritage-body mb-5 sm:mb-[26px] text-pretty font-sans">
              Every item added to the digital reading room is catalogued in both scripts, photographed folio by folio, and made searchable for researchers working on the manuscript cultures of Malabar.
            </p>
            <Link
              href="/stories"
              className="inline-block bg-black text-paper font-amiri font-semibold text-[17px] py-2.5 sm:py-[13px] px-6 sm:px-8 rounded-full hover:bg-heritage-red hover:text-white transition-colors"
            >
              Read the story →
            </Link>
          </div>
        </div>
      </section>

      {/* Services 4-Column Grid */}
      <section id="services" className="max-w-[1100px] mx-auto pt-10 sm:pt-[78px] px-4 sm:px-5 pb-16">
        <div className="double-rule"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-9 pt-6 sm:pt-[34px]">
          {services.map((svc, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <span className="font-amiri text-[20px] sm:text-[21px] font-semibold">{svc.name}</span>
              <span className="text-[15px] sm:text-[17px] leading-[1.45] text-heritage-subtle text-pretty font-sans">
                {svc.note}
              </span>
              <Link href={svc.href} className="text-[16px] sm:text-[17px] text-heritage-red font-semibold hover:underline mt-1">
                {svc.action} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
