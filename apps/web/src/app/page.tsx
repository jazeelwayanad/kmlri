'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem } from '@/lib/api';
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_SERVICES,
  DEFAULT_HERO_CONFIG,
  resolveHomepageSections,
  type HomepageSection,
  type SiteService,
  type SiteHeroConfig,
} from '@/lib/site-config-defaults';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('News');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const tabs = ['Events', 'News', 'Stories', 'Opportunities'];

  // Dynamic DB state
  const [sectionOrder, setSectionOrder] = useState<HomepageSection[]>(DEFAULT_HOMEPAGE_SECTIONS);
  const [heroConfig, setHeroConfig] = useState<SiteHeroConfig>(DEFAULT_HERO_CONFIG);
  const [servicesList, setServicesList] = useState<SiteService[]>(DEFAULT_SERVICES);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // 1. Load public website configuration from DB settings
  useEffect(() => {
    let cancelled = false;
    api
      .getPublicWebsiteSettings()
      .then((settings) => {
        if (cancelled) return;
        if (settings?.homepageSections) {
          setSectionOrder(resolveHomepageSections(settings.homepageSections));
        }
        if (settings?.hero) {
          setHeroConfig({ ...DEFAULT_HERO_CONFIG, ...settings.hero });
        }
        if (Array.isArray(settings?.services) && settings.services.length > 0) {
          setServicesList(settings.services);
        }
      })
      .catch(() => {
        // graceful fallback to defaults
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Load Content Items for active "What's On" tab dynamically from DB
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
    if (cat === 'Events') return '/events';
    return '/news';
  };

  const getItemDetailUrl = (item: ContentItem, tab: string) => {
    const slug = item.slug || item.id;
    if (item.category === 'STORY' || tab === 'Stories') return `/stories/${slug}`;
    if (item.category === 'OPPORTUNITY' || tab === 'Opportunities') return `/opportunities/${slug}`;
    if (item.category === 'EVENT' || tab === 'Events') return `/events/${slug}`;
    return `/news/${slug}`;
  };

  const renderSection = (id: string) => {
    switch (id) {
      case 'sec-hero':
        return (
          <Fragment key="sec-hero">
            {/* Arabic Wordmark Section */}
            <section className="max-w-[1100px] mx-auto pt-6 sm:pt-[42px] px-4 sm:px-5 text-center">
              <img
                src={heroConfig.wordmarkUrl || '/assets/wordmark-arabic.svg'}
                alt={heroConfig.wordmarkAlt || 'كنجين مسليار — Kunhīn Musliyār Library & Research Institute'}
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
                  placeholder={heroConfig.searchPlaceholder || 'Enter Keywords to Search'}
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
                <Link prefetch href="/advanced" className="hover:text-heritage-red">
                  Advanced Search →
                </Link>
                <Link prefetch href="/search" className="text-heritage-muted text-sm hover:text-black font-averia">
                  Browse All Stacks
                </Link>
              </div>
            </section>
          </Fragment>
        );

      case 'sec-whatson':
        return (
          <Fragment key="sec-whatson">
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
                        className={`border-none cursor-pointer font-amiri text-[16px] sm:text-[20px] leading-none px-4 sm:px-6 relative flex items-center justify-center transition-all whitespace-nowrap ${
                          active
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

            {/* Black Cards Section */}
            <section className="bg-black text-white relative z-10">
              <div className="absolute left-0 right-0 top-[5px] border-t border-white"></div>
              <div className="absolute left-0 right-0 top-[8px] border-t border-white"></div>
              <div className="max-w-[1100px] mx-auto py-10 sm:py-[74px] px-4 sm:px-5">
                {loadingContent ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-[30px]">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="flex flex-col gap-3 animate-pulse">
                        <div className="w-full h-[140px] sm:h-[153px] bg-white/10 rounded"></div>
                        <div className="h-5 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                        <div className="h-10 bg-white/10 rounded w-32 mt-2"></div>
                      </div>
                    ))}
                  </div>
                ) : contentItems.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 font-sans text-sm">
                    No items currently published under {activeTab}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-[30px] justify-between">
                    {contentItems.map((item, idx) => {
                      const detailUrl = getItemDetailUrl(item, activeTab);
                      return (
                        <article
                          key={item.id || idx}
                          className="flex flex-col justify-between gap-3 w-full max-w-[260px] mx-auto sm:mx-0 group"
                        >
                          <div className="flex flex-col gap-2.5">
                            <Link
                              prefetch
                              href={detailUrl}
                              className="w-full h-[140px] sm:h-[153px] bg-[#222] border border-white/20 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden group-hover:border-white/50 transition-colors"
                            >
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                />
                              ) : null}
                              <div className="relative z-10">
                                <span className="font-averia text-[11px] tracking-[0.1em] text-heritage-red uppercase font-bold mb-1 block">
                                  {item.kicker || activeTab}
                                </span>
                                <span className="text-[12px] text-gray-300 font-sans line-clamp-2 block">
                                  {item.date || item.deadline || 'KMLRI Archive Collection'}
                                </span>
                              </div>
                            </Link>
                            <Link prefetch href={detailUrl}>
                              <p className="font-amiri text-[17px] sm:text-[18px] font-bold leading-[1.35] m-0 text-pretty text-white group-hover:text-heritage-red transition-colors line-clamp-3">
                                {item.title}
                              </p>
                            </Link>
                            <p className="text-[13px] text-gray-400 font-sans line-clamp-2 leading-[1.4]">
                              {item.summary}
                            </p>
                          </div>
                          <Link
                            prefetch
                            href={detailUrl}
                            className="w-[130px] sm:w-[137px] h-[40px] sm:h-[46px] shadow-[inset_0_0_0_1px_rgb(243,239,230)] text-white font-amiri font-bold text-[17px] sm:text-[20px] flex items-center justify-center mt-1 hover:bg-paper hover:text-black transition-colors"
                          >
                            Read more
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                )}
                <div className="mt-8 text-right">
                  <Link
                    prefetch
                    href={getTargetUrlForCategory(activeTab)}
                    className="text-[15px] sm:text-[17px] font-averia text-[#E2DACB] hover:text-white underline underline-offset-4"
                  >
                    Explore all {activeTab} →
                  </Link>
                </div>
              </div>
            </section>
          </Fragment>
        );

      case 'sec-services':
        return (
          <Fragment key="sec-services">
            {/* Services 4-Column Grid */}
            <section id="services" className="max-w-[1100px] mx-auto pt-10 sm:pt-[78px] px-4 sm:px-5 pb-16">
              <div className="double-rule"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-9 pt-6 sm:pt-[34px]">
                {servicesList.map((svc, idx) => (
                  <div key={svc.id || idx} className="flex flex-col gap-2">
                    <span className="font-amiri text-[20px] sm:text-[21px] font-semibold">{svc.name}</span>
                    <span className="text-[15px] sm:text-[17px] leading-[1.45] text-heritage-subtle text-pretty font-sans">
                      {svc.note}
                    </span>
                    <Link
                      prefetch
                      href={svc.href}
                      className="text-[16px] sm:text-[17px] text-heritage-red font-semibold hover:underline mt-1"
                    >
                      {svc.action} →
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </Fragment>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      {sectionOrder.filter((s) => s.visible).map((s) => (
        <Fragment key={s.id}>{renderSection(s.id)}</Fragment>
      ))}

      <Footer />
    </div>
  );
}
