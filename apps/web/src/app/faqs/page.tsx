'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function FaqsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: 'Who can use the reading room?', a: 'Students, teachers and visiting researchers. Bring photo identification for a day pass; members can enter with their card.' },
    { q: 'Can I borrow manuscripts?', a: 'No. Manuscripts and rare books are consulted in the supervised reading room. Printed books in the general collection can be borrowed by members.' },
    { q: 'How do I request a scan?', a: 'Find the item in the catalogue and use Request a scan, or write to the reference desk with the shelfmark. Fees depend on extent and format.' },
    { q: 'Is the catalogue searchable in Arabic script?', a: 'Yes. Records are described in Arabic script and in Latin transliteration, and either will match.' },
    { q: 'Do you accept donations of books and papers?', a: 'We do, subject to a condition survey. Write to the reference desk describing the material before sending anything.' },
    { q: 'Is there parking and step-free access?', a: 'Parking is available beside the college gate. The ground-floor reading room and reference desk are step-free.' },
  ];

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 uppercase font-bold">Help &amp; Guidelines</p>
        <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] mb-3 sm:mb-[18px] tracking-[-0.015em]">
          Frequently Asked Questions
        </h1>
        <div className="double-rule"></div>

        {faqs.map((f, i) => {
          const isOpen = openFaq === i;
          return (
            <div key={i} className="border-b border-[#D6CCBC]">
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : i)}
                className="w-full bg-transparent border-none cursor-pointer flex justify-between items-center gap-4 py-4 sm:py-[22px] text-left font-amiri text-[19px] sm:text-[23px] font-semibold text-black"
              >
                <span>{f.q}</span>
                <span className="font-averia text-[20px] sm:text-[22px] text-heritage-red flex-shrink-0 font-bold">
                  {isOpen ? '–' : '+'}
                </span>
              </button>
              {isOpen && (
                <p className="text-[16px] sm:text-[19px] leading-[1.6] text-heritage-body mb-5 sm:mb-6 max-w-[70ch] text-pretty font-sans">
                  {f.a}
                </p>
              )}
            </div>
          );
        })}

        <p className="text-[17px] sm:text-[19px] text-heritage-body pt-6 sm:pt-[30px]">
          Still stuck? <Link href="/ask" className="text-heritage-red font-bold hover:underline">Ask a librarian →</Link>
        </p>
      </section>

      <Footer />
    </div>
  );
}
