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
  const formatParam = searchParams.get('format') || '';
  const accessParam = searchParams.get('access') || '';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<BibliographicRecord[]>([]);
  const [totalCount, setTotalCount] = useState(248);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState(formatParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const facets = [
    { title: 'Format', options: ['Manuscript', 'Printed book', 'Periodical', 'Audio'] },
    { title: 'Script', options: ['Arabic', 'Arabi-Malayalam', 'Malayalam', 'Latin'] },
    { title: 'Access', options: ['Digitised in full', 'Reading room only', 'Restricted'] },
  ];

  // Fallback items if API is booting
  const defaultResults: BibliographicRecord[] = [
    {
      id: 'rec-1',
      titleLatin: 'Bayān al-Fawāʾid',
      titleArabic: 'بيان الفوائد',
      authors: ['Unnamed scribe, Malabar coast'],
      shelfmark: 'MS 0142',
      format: 'MANUSCRIPT',
      language: 'Arabic',
      extent: '84 folios',
      subjects: ['Islamic Jurisprudence'],
      accessLevel: 'DIGITISED_FULL',
    },
    {
      id: 'rec-2',
      titleLatin: 'Muḥyiddīn Mālā',
      titleArabic: 'محي الدين مالا',
      authors: ['Qāḍī Muḥammad'],
      shelfmark: 'AM 0311',
      format: 'ARABI_MALAYALAM_PRINT',
      language: 'Arabi-Malayalam',
      subjects: ['Poetry'],
      accessLevel: 'DIGITISED_FULL',
    },
    {
      id: 'rec-3',
      titleLatin: 'Fatḥ al-Muʿīn, annotated copy',
      authors: ['Zayn al-Dīn al-Malībārī'],
      shelfmark: 'RB 0908',
      format: 'RARE_BOOK',
      language: 'Arabic',
      subjects: ['Fiqh'],
      accessLevel: 'READING_ROOM_ONLY',
    },
    {
      id: 'rec-4',
      titleLatin: 'Al-Bayān monthly, bound run 1954–1961',
      authors: ['Various'],
      shelfmark: 'PER 0044',
      format: 'PERIODICAL',
      language: 'Arabic',
      subjects: ['Periodical'],
      accessLevel: 'READING_ROOM_ONLY',
    },
    {
      id: 'rec-5',
      titleLatin: 'Notes on a family collection, Parappur',
      authors: ['Deposited papers'],
      shelfmark: 'ARC 0026',
      format: 'THESIS',
      language: 'Malayalam',
      subjects: ['Archive'],
      accessLevel: 'RESTRICTED',
    },
    {
      id: 'rec-6',
      titleLatin: 'Kappappāṭṭu: nautical poem in Arabi-Malayalam',
      titleArabic: 'كف فattu',
      authors: ['Kunhāyaṉ Musliyār'],
      shelfmark: 'MS 0089',
      format: 'MANUSCRIPT',
      language: 'Arabi-Malayalam',
      subjects: ['Maritime Poetry'],
      accessLevel: 'DIGITISED_FULL',
    }
  ];

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const data = await api.searchCatalog({
          q: queryParam,
          format: formatParam,
          accessLevel: accessParam,
        });
        if (data && data.items && data.items.length > 0) {
          setResults(data.items);
          setTotalCount(data.total || data.items.length);
        } else {
          setResults(defaultResults);
          setTotalCount(defaultResults.length);
        }
      } catch (err) {
        setResults(defaultResults);
        setTotalCount(defaultResults.length);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [queryParam, formatParam, accessParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

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
            {totalCount} results found
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
              <span>Filter Results {selectedFormat ? `(${selectedFormat})` : ''}</span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="double-rule"></div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 sm:gap-8 pt-4 sm:pt-[30px]">
          {/* Facets Sidebar (Always on desktop, Collapsible on mobile) */}
          <aside className={`flex flex-col gap-6 sm:gap-[30px] font-sans ${mobileFilterOpen ? 'block' : 'hidden md:flex'}`}>
            {facets.map((f, i) => (
              <div key={i} className="bg-white md:bg-transparent p-4 md:p-0 border md:border-0 border-gray-300 rounded">
                <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 font-bold uppercase">{f.title}</p>
                <div className="flex flex-col gap-2 sm:gap-[9px] text-[15px] sm:text-[17px]">
                  {f.options.map((o, j) => (
                    <label key={j} className="flex items-center gap-2.5 cursor-pointer text-heritage-body hover:text-heritage-red">
                      <input
                        type="checkbox"
                        checked={selectedFormat === o}
                        onChange={() => {
                          const nextVal = selectedFormat === o ? '' : o;
                          setSelectedFormat(nextVal);
                          router.push(`/search?format=${encodeURIComponent(nextVal)}`);
                        }}
                        className="hidden"
                      />
                      <span className={`w-[14px] h-[14px] border-[1.5px] border-black inline-flex items-center justify-center ${selectedFormat === o ? 'bg-black text-white' : 'bg-white'}`}>
                        {selectedFormat === o && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Search Result List */}
          <div className="flex flex-col min-w-0">
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
            <div className="flex gap-2 pt-6 sm:pt-7 text-[16px] sm:text-[17px] flex-wrap items-center">
              <button type="button" className="border border-black bg-black text-white px-3 py-1 font-bold">1</button>
              <button type="button" className="border border-black bg-transparent px-3 py-1 hover:bg-black hover:text-white">2</button>
              <button type="button" className="border border-black bg-transparent px-3 py-1 hover:bg-black hover:text-white">3</button>
              <span className="px-2">...</span>
              <button type="button" className="border border-black bg-transparent px-3 py-1 hover:bg-black hover:text-white">25</button>
              <button type="button" className="border border-black bg-transparent px-3 py-1 hover:bg-black hover:text-white ml-2">Next →</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
