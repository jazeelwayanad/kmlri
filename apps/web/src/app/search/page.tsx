'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, BibliographicRecord } from '@/lib/api';
import { getRecordSlug } from '@/lib/slugs';
import { Filter, ChevronDown, Check } from 'lucide-react';

const ACCESS_LABELS: Record<string, string> = {
  DIGITISED_FULL: 'Digitised in full',
  READING_ROOM_ONLY: 'Reading room only',
  RESTRICTED: 'Restricted',
};

const FORMAT_LABELS: Record<string, string> = {
  MANUSCRIPT: 'Manuscript',
  ARABI_MALAYALAM_PRINT: 'Arabi-Malayalam print',
  RARE_BOOK: 'Rare book',
  PERIODICAL: 'Periodical',
  THESIS: 'Thesis',
  AUDIO: 'Audio',
};

interface Facet {
  key: string;
  count: number;
}

function toSet(param: string | null): Set<string> {
  return new Set((param || '').split(',').map((s) => s.trim()).filter(Boolean));
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper text-black">
        <TopBar />
        <Navbar />
        <div className="max-w-[1100px] mx-auto py-20 px-5 text-center font-amiri text-2xl">
          Loading catalogue search...
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || '';
  const formatParam = searchParams.get('format');
  const scriptParam = searchParams.get('script');
  const accessParam = searchParams.get('access');
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<BibliographicRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [facets, setFacets] = useState<{ formats: Facet[]; accessLevels: Facet[]; languages: Facet[] }>({
    formats: [],
    accessLevels: [],
    languages: [],
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const selectedFormats = toSet(formatParam);
  const selectedScripts = toSet(scriptParam);
  const selectedAccess = toSet(accessParam);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(false);
      try {
        const data = await api.searchCatalog({
          q: queryParam,
          format: formatParam || undefined,
          script: scriptParam || undefined,
          access: accessParam || undefined,
          page: pageParam,
          limit: 10,
        });
        setResults(data.data || []);
        setTotalCount(data.meta?.total ?? (data.data || []).length);
        setTotalPages(data.meta?.totalPages ?? 1);
        setFacets({
          formats: data.facets?.formats || [],
          accessLevels: data.facets?.accessLevels || [],
          languages: data.facets?.languages || [],
        });
      } catch (err) {
        setError(true);
        setResults([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [queryParam, formatParam, scriptParam, accessParam, pageParam]);

  const updateParams = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    next.delete('page');
    router.push(`/search?${next.toString()}`);
  };

  const toggleFacet = (paramKey: string, current: Set<string>, value: string) => {
    updateParams((p) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      if (next.size > 0) p.set(paramKey, Array.from(next).join(','));
      else p.delete(paramKey);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams((p) => {
      if (query.trim()) p.set('q', query.trim());
      else p.delete('q');
    });
  };

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('page', String(page));
    router.push(`/search?${next.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const facetGroups = [
    { title: 'Format', param: 'format', selected: selectedFormats, options: facets.formats, labels: FORMAT_LABELS },
    { title: 'Script / Language', param: 'script', selected: selectedScripts, options: facets.languages, labels: {} as Record<string, string> },
    { title: 'Access', param: 'access', selected: selectedAccess, options: facets.accessLevels, labels: ACCESS_LABELS },
  ];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, pageParam - 3),
    Math.max(0, pageParam - 3) + 5,
  );

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-16">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center border-2 border-black bg-[#F7F4EF] h-[52px] sm:h-[60px] px-4 sm:px-5 gap-3 sm:gap-4"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Keywords to Search"
            aria-label="Search the catalogue"
            className="flex-1 border-none outline-none bg-transparent text-[17px] sm:text-[20px] font-sans min-w-0"
          />
          <button
            type="submit"
            aria-label="Search"
            className="border-none bg-transparent cursor-pointer text-heritage-red hover:text-black flex items-center p-1 transition-colors flex-shrink-0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
              <circle cx="10.5" cy="10.5" r="6.8"></circle>
              <line x1="15.6" y1="15.6" x2="21" y2="21"></line>
            </svg>
          </button>
        </form>

        <div className="flex justify-between items-baseline my-3 sm:my-[14px] mb-4 sm:mb-[26px] text-[16px] sm:text-[18px] flex-wrap gap-2">
          <Link href="/advanced" className="hover:text-heritage-red font-semibold">
            Advanced Search →
          </Link>
          <span className="text-heritage-subtle text-[15px] sm:text-[17px] font-sans">
            {loading ? 'Searching…' : `${totalCount} result${totalCount === 1 ? '' : 's'} found`}
          </span>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="w-full flex items-center justify-between p-3 border border-black bg-white rounded font-sans text-sm font-bold"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-heritage-red" />
              <span>Filter Results {selectedFormats.size + selectedScripts.size + selectedAccess.size > 0 ? `(${selectedFormats.size + selectedScripts.size + selectedAccess.size})` : ''}</span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="double-rule"></div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 sm:gap-8 pt-4 sm:pt-[30px]">
          {/* Facets Sidebar (Always on desktop, Collapsible on mobile) */}
          <aside className={`flex flex-col gap-6 sm:gap-[30px] font-sans ${mobileFilterOpen ? 'block' : 'hidden md:flex'}`}>
            {facetGroups.map((f, i) => (
              <div key={i} className="bg-white md:bg-transparent p-4 md:p-0 border md:border-0 border-gray-300 rounded">
                <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 font-bold uppercase">{f.title}</p>
                <div className="flex flex-col gap-2 sm:gap-[9px] text-[15px] sm:text-[17px]">
                  {f.options.length === 0 && (
                    <span className="text-[13px] text-heritage-subtle">No items yet</span>
                  )}
                  {f.options.map((o, j) => (
                    <label key={j} className="flex items-center gap-2.5 cursor-pointer text-heritage-body hover:text-heritage-red">
                      <input
                        type="checkbox"
                        checked={f.selected.has(o.key)}
                        onChange={() => toggleFacet(f.param, f.selected, o.key)}
                        className="hidden"
                      />
                      <span className={`w-[14px] h-[14px] border-[1.5px] border-black inline-flex items-center justify-center flex-shrink-0 ${f.selected.has(o.key) ? 'bg-black text-white' : 'bg-white'}`}>
                        {f.selected.has(o.key) && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span>{f.labels[o.key] || o.key} <span className="text-heritage-subtle">({o.count})</span></span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Search Result List */}
          <div className="flex flex-col min-w-0">
            {error && (
              <div className="py-8 text-center font-sans text-heritage-red border border-heritage-red bg-red-50">
                Couldn&apos;t reach the catalogue service. Please try again shortly.
              </div>
            )}

            {!error && !loading && results.length === 0 && (
              <div className="py-8 text-center font-sans text-heritage-subtle">
                No items matched your search.
              </div>
            )}

            {results.map((r, idx) => (
              <Link
                key={r.id || idx}
                href={`/items/${getRecordSlug(r)}`}
                className="flex flex-col sm:grid sm:grid-cols-[90px_1fr_auto] md:grid-cols-[104px_1fr_auto] gap-4 sm:gap-6 py-5 sm:py-6 border-b border-[#D6CCBC] items-start hover:bg-paper-hover px-2 sm:px-3 -mx-2 sm:-mx-3 transition-colors"
              >
                <span className="w-full sm:w-[90px] md:w-[104px] h-[100px] sm:h-[130px] bg-[#E2DACB] border border-black/30 flex items-center justify-center text-xs font-averia uppercase text-[#7E7365] flex-shrink-0">
                  Folio
                </span>
                <span className="flex flex-col gap-1.5 sm:gap-[7px] min-w-0">
                  <span className="font-amiri text-[20px] sm:text-[22px] font-semibold leading-[1.25]">
                    {r.titleLatin} {r.titleArabic && <span className="font-amiri text-heritage-muted ml-1">({r.titleArabic})</span>}
                  </span>
                  <span className="text-[16px] sm:text-[18px] text-heritage-body font-sans">
                    {Array.isArray(r.authors) ? r.authors.join(', ') : r.authors}
                  </span>
                  <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted">
                    {r.format} · {r.shelfmark} · {r.extent || 'Physical Item'}
                  </span>
                </span>
                <span className="self-start font-averia text-[11px] sm:text-[12px] tracking-[0.06em] border border-black px-2.5 py-1 whitespace-nowrap uppercase font-bold">
                  {r.accessLevel === 'DIGITISED_FULL' ? 'Digitised' : r.accessLevel === 'READING_ROOM_ONLY' ? 'Reading room' : 'Restricted'}
                </span>
              </Link>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex gap-2 pt-6 sm:pt-7 text-[16px] sm:text-[17px] flex-wrap items-center">
                <button
                  type="button"
                  disabled={pageParam <= 1}
                  onClick={() => goToPage(pageParam - 1)}
                  className="border border-black bg-transparent px-3 py-1 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                >
                  ← Prev
                </button>
                {pageNumbers[0] > 1 && <span className="px-2">…</span>}
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    className={`border border-black px-3 py-1 font-bold ${p === pageParam ? 'bg-black text-white' : 'bg-transparent hover:bg-black hover:text-white'}`}
                  >
                    {p}
                  </button>
                ))}
                {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="px-2">…</span>}
                <button
                  type="button"
                  disabled={pageParam >= totalPages}
                  onClick={() => goToPage(pageParam + 1)}
                  className="border border-black bg-transparent px-3 py-1 hover:bg-black hover:text-white ml-2 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
