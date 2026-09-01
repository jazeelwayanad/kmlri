'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AdvancedSearchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    allWords: '',
    exactPhrase: '',
    author: '',
    shelfmark: '',
    collection: '',
    script: '',
    dateFrom: '',
    dateTo: '',
  });

  const fields = [
    { name: 'allWords', label: 'All of these words', hint: 'e.g. mālā poem' },
    { name: 'exactPhrase', label: 'Exact phrase', hint: 'e.g. fatḥ al-muʿīn' },
    { name: 'author', label: 'Author or scribe', hint: 'name in any script' },
    { name: 'shelfmark', label: 'Shelfmark', hint: 'e.g. MS 0142' },
    { name: 'collection', label: 'Collection', hint: 'manuscripts, rare books…' },
    { name: 'script', label: 'Script', hint: 'Arabic, Arabi-Malayalam…' },
    { name: 'dateFrom', label: 'Date from', hint: 'yyyy' },
    { name: 'dateTo', label: 'Date to', hint: 'yyyy' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = formData.allWords || formData.exactPhrase || formData.author || formData.shelfmark;
    router.push(`/search?q=${encodeURIComponent(q)}&format=${encodeURIComponent(formData.collection)}`);
  };

  const handleReset = () => {
    setFormData({
      allWords: '',
      exactPhrase: '',
      author: '',
      shelfmark: '',
      collection: '',
      script: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 uppercase font-bold">Search</p>
        <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] mb-3 sm:mb-[18px] tracking-[-0.015em]">
          Advanced Catalogue Search
        </h1>
        <div className="double-rule mb-6 sm:mb-[34px]"></div>

        <form onSubmit={handleSubmit} onReset={handleReset} className="grid grid-cols-1 md:grid-cols-2 gap-x-[30px] gap-y-4 sm:gap-y-[26px] font-sans">
          {fields.map((f) => (
            <label key={f.name} className="flex flex-col gap-1.5">
              <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">{f.label}</span>
              <input
                type="text"
                placeholder={f.hint}
                value={(formData as any)[f.name]}
                onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                className="border-[1.5px] border-black bg-white h-11 sm:h-12 px-3 sm:px-[14px] text-sm sm:text-base outline-none w-full rounded"
              />
            </label>
          ))}

          <div className="col-span-full flex gap-3 pt-3 flex-wrap">
            <button
              type="submit"
              className="bg-black text-paper border-none h-[46px] sm:h-[50px] px-6 sm:px-[38px] rounded-full font-amiri text-[17px] sm:text-[19px] font-bold cursor-pointer hover:bg-heritage-red hover:text-white  transition-colors"
            >
              Search Catalogue →
            </button>
            <button
              type="reset"
              className="bg-transparent border-[1.5px] border-black h-[46px] sm:h-[50px] px-5 sm:px-[30px] rounded-full font-amiri text-[16px] sm:text-[17px] font-semibold cursor-pointer hover:bg-black hover:text-paper transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </div>
  );
}
