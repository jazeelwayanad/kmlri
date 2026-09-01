import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function CollectionsPage() {
  const facets = [
    { title: 'Format', options: ['Manuscript', 'Printed book', 'Periodical', 'Audio'] },
    { title: 'Script', options: ['Arabic', 'Arabi-Malayalam', 'Malayalam', 'Latin'] },
    { title: 'Access', options: ['Digitised in full', 'Reading room only', 'Restricted'] },
  ];

  const collections = [
    { name: 'Manuscripts', count: '1,240 items', note: 'Arabic, Persian and Arabi-Malayalam codices, described folio by folio.' },
    { name: 'Arabi-Malayalam Print', count: '860 items', note: 'Lithographs, chapbooks and poetry printed across Malabar.' },
    { name: 'Rare Books', count: '2,100 items', note: 'Early editions in Arabic, Malayalam, Urdu and English.' },
    { name: 'Periodicals', count: '310 titles', note: 'Journals and magazines, bound runs and loose issues.' },
    { name: 'Theses & Papers', count: '470 items', note: 'Dissertations deposited by affiliated researchers.' },
    { name: 'Audio & Oral History', count: '95 hours', note: 'Recorded recitation, interviews and lecture archives.' },
  ];

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
          Six collections, described in Arabic script and in Latin transliteration. Items marked digitised can be read in full from the digital reading room.
        </p>
        <div className="double-rule"></div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] gap-6 sm:gap-8 pt-6 sm:pt-[34px]">
          <aside className="hidden md:flex flex-col gap-6 sm:gap-[30px] font-sans">
            {facets.map((f, i) => (
              <div key={i}>
                <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 uppercase font-bold">{f.title}</p>
                <div className="flex flex-col gap-2 sm:gap-[9px] text-[15px] sm:text-[17px]">
                  {f.options.map((o, j) => (
                    <Link key={j} href={`/search?facet=${encodeURIComponent(o)}`} className="flex items-center gap-2 sm:gap-[9px] cursor-pointer text-heritage-body hover:text-heritage-red">
                      <span className="w-[13px] h-[13px] border-[1.5px] border-black inline-block"></span>
                      <span>{o}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <div>
            <div className="flex justify-between items-baseline mb-4 sm:mb-5 text-[15px] sm:text-[17px] text-heritage-subtle flex-wrap gap-2">
              <span>5,075 items across 6 collections</span>
              <span>Sort: Recently catalogued</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-black border border-black">
              {collections.map((col, idx) => (
                <Link
                  key={idx}
                  href={`/search?format=${encodeURIComponent(col.name)}`}
                  className="bg-paper p-5 flex flex-col gap-2 min-h-[150px] sm:min-h-[175px] hover:bg-paper-hover transition-colors"
                >
                  <span className="font-averia text-[12px] tracking-[0.12em] text-heritage-muted uppercase font-bold">{col.count}</span>
                  <span className="font-amiri text-[20px] sm:text-[22px] font-semibold leading-[1.25]">{col.name}</span>
                  <span className="text-[14px] sm:text-[16px] leading-[1.4] text-heritage-subtle text-pretty font-sans">{col.note}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
