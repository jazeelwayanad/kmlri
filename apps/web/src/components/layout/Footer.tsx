'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DEFAULT_FOOTER_CONTACT, DEFAULT_SOCIAL_LINKS, type FooterContact, type SocialLinks } from '@/lib/site-config-defaults';

export function Footer() {
  const [contact, setContact] = useState<FooterContact>(DEFAULT_FOOTER_CONTACT);
  const [social, setSocial] = useState<SocialLinks>(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    let cancelled = false;
    api
      .getPublicWebsiteSettings()
      .then((settings) => {
        if (cancelled) return;
        if (settings?.footerContact) setContact({ ...DEFAULT_FOOTER_CONTACT, ...settings.footerContact });
        if (settings?.socialLinks) setSocial({ ...DEFAULT_SOCIAL_LINKS, ...settings.socialLinks });
      })
      .catch(() => {
        // Keep the default footer contact details if the settings service is unreachable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="bg-black text-white font-amiri">
      <div className="max-w-[1100px] mx-auto pt-10 sm:pt-[65px] px-4 sm:px-5 grid grid-cols-1 md:grid-cols-[374px_1fr_1fr] gap-8 sm:gap-12">
        <div>
          <img
            src="/assets/wordmark-latin.svg"
            alt="Kunhīn Musliyār Library & Research Institute"
            className="w-[300px] sm:w-[374px] max-w-full h-auto block invert"
          />
          <p className="text-[13px] leading-[1.4] text-white mt-5 sm:mt-[33px] whitespace-pre-line">
            {contact.address}
          </p>
          <p className="text-[14px] leading-[1.4] text-[#9C9C9C] mt-5 sm:mt-[41px] flex gap-4 sm:gap-[19px] flex-wrap">
            <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="text-[#9C9C9C] hover:text-white">
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} className="text-[#9C9C9C] hover:text-white">
              {contact.email}
            </a>
          </p>
          {contact.hours && (
            <p className="text-[13px] leading-[1.4] text-[#9C9C9C] mt-3">{contact.hours}</p>
          )}
          <div className="flex gap-4 mt-5">
            <Link
              href={social.twitter || '/about'}
              aria-label="Twitter / X"
              className="w-[32px] h-[32px] rounded-[5px] bg-[#1F1F1F] flex items-center justify-center text-[15px] leading-none text-white hover:bg-[#4B4B4B] transition-colors"
            >
              f
            </Link>
            <Link
              href={social.github || '/about'}
              aria-label="GitHub"
              className="w-[32px] h-[32px] rounded-[5px] bg-[#1F1F1F] flex items-center justify-center text-white hover:bg-[#4B4B4B] transition-colors"
            >
              <img src="/assets/social-icon.svg" alt="" className="w-[14px] h-[14px] invert" />
            </Link>
            <Link
              href={social.orcid || '/about'}
              aria-label="ORCID"
              className="w-[32px] h-[32px] rounded-[5px] bg-[#1F1F1F] flex items-center justify-center text-[15px] leading-none text-white hover:bg-[#4B4B4B] transition-colors"
            >
              ▶
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 md:border-t-0 pt-6 md:pt-0">
          <p className="font-averia text-[13px] tracking-[0.06em] text-[#9C9C9C] mb-3 sm:mb-[18px] uppercase font-bold">Explore</p>
          <div className="flex flex-col gap-2.5 sm:gap-[11px] text-[16px] sm:text-[17px]">
            <Link href="/collections" className="text-white hover:text-paper">Collections</Link>
            <Link href="/search" className="text-white hover:text-paper">Digital reading room</Link>
            <Link href="/advanced" className="text-white hover:text-paper">Advanced search</Link>
            <Link href="/news" className="text-white hover:text-paper">New acquisitions</Link>
            <Link href="/stories" className="text-white hover:text-paper">Stories</Link>
            <Link href="/opportunities" className="text-white hover:text-paper">Opportunities</Link>
          </div>
        </div>

        <div className="border-t border-gray-800 md:border-t-0 pt-6 md:pt-0">
          <p className="font-averia text-[13px] tracking-[0.06em] text-[#9C9C9C] mb-3 sm:mb-[18px] uppercase font-bold">Visit &amp; Use</p>
          <div className="flex flex-col gap-2.5 sm:gap-[11px] text-[16px] sm:text-[17px]">
            <Link href="/services" className="text-white hover:text-paper">Reading room</Link>
            <Link href="/account" className="text-white hover:text-paper">Membership</Link>
            <Link href="/ask" className="text-white hover:text-paper">Ask a librarian</Link>
            <Link href="/services" className="text-white hover:text-paper">Reproduction requests</Link>
            <Link href="/faqs" className="text-white hover:text-paper">FAQs</Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto mt-8 sm:mt-11 px-4 sm:px-5 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[12px] text-white border-t border-[#1F1F1F] text-center sm:text-left">
        <span>© 2026 Kunhīn Musliyār Library &amp; Research Institute. All rights reserved.</span>
        <span className="flex gap-4 sm:gap-5">
          <Link href="/about" className="text-[#9C9C9C] hover:text-white">Privacy</Link>
          <Link href="/about" className="text-[#9C9C9C] hover:text-white">Terms of use</Link>
          <Link href="/about" className="text-[#9C9C9C] hover:text-white">Accessibility</Link>
        </span>
      </div>
    </footer>
  );
}
