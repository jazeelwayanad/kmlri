import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  const stats = [
    { n: '5,075', label: 'Catalogued items' },
    { n: '1,240', label: 'Manuscripts' },
    { n: '38,600', label: 'Digitised folios' },
    { n: '6', label: 'Collections' },
  ];

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 uppercase font-bold">About</p>
        <h1 className="font-amiri text-[32px] sm:text-[48px] md:text-[60px] font-bold leading-[1.05] mb-4 sm:mb-6 tracking-[-0.015em] max-w-[20ch]">
          Kunhīn Musliyār Library &amp; Research Institute
        </h1>
        <div className="double-rule"></div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 sm:gap-[52px] pt-6 sm:pt-10">
          <div className="text-[17px] sm:text-[21px] leading-[1.6] text-[#2A2620] flex flex-col gap-4 sm:gap-5 font-sans">
            <p className="m-0 text-pretty">
              The institute keeps, describes and makes available the written heritage of Malabar: manuscripts in Arabic, Persian and Arabi-Malayalam, printed books and periodicals, and the papers of scholars and families of the region.
            </p>
            <p className="m-0 text-pretty">
              Work happens in three rooms. In the reading room, researchers consult originals under supervision. In the conservation lab, items are surveyed, cleaned and rehoused. In the digitisation studio, each item is photographed folio by folio and catalogued in both scripts before it enters the digital reading room.
            </p>
            <p className="m-0 text-pretty">
              The library sits beside Sabeelul Hidaya Islamic College in Vattaparamba and is open to students, teachers and visiting researchers.
            </p>
          </div>
          <div>
            <div className="w-full h-[240px] sm:h-[340px] bg-[#E2DACB] border border-black flex items-center justify-center text-center p-4">
              <span className="font-averia text-[12px] tracking-[0.1em] text-[#7E7365] uppercase font-bold">
                Reading Room &amp; Manuscript Stacks
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-black border border-black mt-8 sm:mt-[52px]">
          {stats.map((st, idx) => (
            <div key={idx} className="bg-paper p-4 sm:p-7 flex flex-col gap-1 sm:gap-[6px]">
              <span className="font-amiri text-[28px] sm:text-[38px] font-bold leading-none">{st.n}</span>
              <span className="text-[14px] sm:text-[17px] text-heritage-subtle font-sans">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
