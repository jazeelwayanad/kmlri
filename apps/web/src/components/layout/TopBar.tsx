'use client';

import Link from 'next/link';

export function TopBar() {
  return (
    <>
      <div className="h-[4px]"></div>
      <div className="h-[2px] bg-black"></div>
      <div className="h-[3px] sm:h-[3px]"></div>
      <div className="bg-black min-h-[40px] sm:h-[45px] relative py-1 sm:py-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-5 h-full flex items-center justify-between">
          <Link prefetch href="/" className="font-amiri text-[40px] sm:text-[50px] translate-y-[10px] leading-none text-white tracking-tight hover:text-paper transition-colors">
            kmlri
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 font-amiri text-[13px] sm:text-[15px] text-white">
            <Link prefetch href="/faqs" className="text-white hover:underline">
              FAQs
            </Link>
            <span>|</span>
            <Link prefetch href="/ask" className="text-white hover:underline">
              Ask Librarian
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
