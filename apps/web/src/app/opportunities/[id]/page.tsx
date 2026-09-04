'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';
import { PublicRegistrationForm } from '@/components/content/PublicRegistrationForm';
import {
  ArrowLeft,
  Share2,
  DollarSign,
  MapPin,
  Briefcase,
  CheckCircle2,
  Send,
  Calendar,
  Tag,
  FileText,
  Clock,
  X,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

// Minimal sanitization for admin-authored rich-text HTML: strips script tags,
// inline event handlers, and javascript: URLs before rendering with
// dangerouslySetInnerHTML. Content is authored exclusively by trusted staff
// through the admin RichTextEditor, not by arbitrary site visitors.
function sanitizeContentHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opp, setOpp] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedOpps, setRelatedOpps] = useState<ContentItem[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadOpp() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getContentItem(id);
        if (isMounted) {
          setOpp(data);
          const fallback = FALLBACK_CONTENT['Opportunities'] || [];
          setRelatedOpps(fallback.filter((r) => r.id !== data.id).slice(0, 3));
        }
      } catch (err: any) {
        if (isMounted) {
          const fallback = FALLBACK_CONTENT['Opportunities'] || [];
          const found = fallback.find((i) => i.id === id || i.slug === id);
          if (found) {
            setOpp(found);
            setRelatedOpps(fallback.filter((r) => r.id !== found.id).slice(0, 3));
          } else {
            setError(err.message || 'Opportunity not found');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOpp();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-black font-amiri">
        <TopBar />
        <Navbar />
        <section className="max-w-[1100px] mx-auto py-24 px-5 text-center text-2xl">
          Loading opportunity details...
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !opp) {
    return (
      <div className="min-h-screen bg-paper text-black font-amiri">
        <TopBar />
        <Navbar />
        <section className="max-w-[1100px] mx-auto py-20 px-5 text-center">
          <h1 className="text-3xl font-bold mb-4">Opportunity Not Found</h1>
          <p className="font-sans text-heritage-body mb-6">
            The requested fellowship, grant, or placement announcement could not be located.
          </p>
          <Link prefetch
            href="/opportunities"
            className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-base font-bold hover:bg-heritage-red transition-colors"
          >
            ← Return to All Opportunities
          </Link>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <main className="max-w-[1100px] mx-auto pt-6 sm:pt-12 px-4 sm:px-5 pb-24">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 font-sans text-xs sm:text-sm text-heritage-muted">
          <Link prefetch
            href="/opportunities"
            className="inline-flex items-center gap-1.5 font-semibold text-black hover:text-heritage-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-black hover:text-heritage-red font-medium transition-colors bg-white px-3 py-1 border border-black/20 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Opportunity Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.08em] text-heritage-red uppercase font-bold bg-heritage-red/10 px-2.5 py-0.5 border border-heritage-red/20">
              {opp.kicker || 'Academic Opportunity'}
            </span>
            <span className="text-xs font-sans font-semibold bg-black/5 px-2.5 py-0.5 border border-black/10 text-gray-700">
              Deadline: {opp.deadline || opp.date}
            </span>
            {opp.featured && (
              <span className="font-averia text-[11px] uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 font-bold">
                High Priority
              </span>
            )}
          </div>

          <h1 className="font-amiri text-[32px] sm:text-[50px] font-bold leading-[1.1] text-black mb-4 tracking-[-0.015em] text-balance">
            {opp.title}
          </h1>

          <p className="font-amiri text-[20px] sm:text-[24px] text-gray-800 leading-relaxed font-semibold mb-6 text-pretty">
            {opp.summary}
          </p>

          {/* 3-Column Metadata Application Bar */}
          {/* <div className="border border-black bg-white grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black my-6">
            <div className="p-4 sm:p-5 flex items-center gap-3.5">
              <DollarSign className="w-6 h-6 text-emerald-800 flex-shrink-0" />
              <div>
                <p className="font-averia text-[11px] uppercase tracking-[0.08em] text-heritage-muted font-bold m-0 leading-tight">
                  HONORARIUM / STIPEND
                </p>
                <p className="font-sans text-sm sm:text-[15px] font-semibold text-emerald-900 m-0 mt-0.5 leading-snug">
                  {opp.stipend || 'Funded Research Grant'}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3.5">
              <MapPin className="w-6 h-6 text-heritage-red flex-shrink-0" />
              <div>
                <p className="font-averia text-[11px] uppercase tracking-[0.08em] text-heritage-muted font-bold m-0 leading-tight">
                  LOCATION
                </p>
                <p className="font-sans text-sm sm:text-[15px] font-semibold text-black m-0 mt-0.5 leading-snug">
                  {opp.venue || 'KMLRI Research Wing, Calicut'}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3.5">
              <Briefcase className="w-6 h-6 text-[#7E7365] flex-shrink-0" />
              <div>
                <p className="font-averia text-[11px] uppercase tracking-[0.08em] text-heritage-muted font-bold m-0 leading-tight">
                  POSITIONS &amp; INTAKE
                </p>
                <p className="font-sans text-sm sm:text-[15px] font-semibold text-black m-0 mt-0.5 leading-snug">
                  {opp.capacity || '4'} ({opp.registered || 18} applicants)
                </p>
              </div>
            </div>
          </div> */}
        </header>

        <div className="double-rule mb-10"></div>

        {/* Content Details + Sidebar Action Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Detailed Guidelines & Requirements */}
          <article className="space-y-6 font-sans text-heritage-body text-[16px] sm:text-[18px] leading-[1.7]">
            <div className="bg-white p-6 sm:p-8 border border-black/20 space-y-4 shadow-sm">
              <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-black border-b border-black/10 pb-2">
                Program Description &amp; Scope
              </h2>
              {opp.content ? (
                <div
                  className="leading-relaxed prose prose-lg max-w-none [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mt-4 [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-black/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-heritage-red [&_a]:underline [&_img]:max-w-full [&_img]:my-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(opp.content) }}
                />
              ) : (
                <p className="leading-relaxed text-gray-500">Full program details will be published shortly.</p>
              )}
            </div>

            {opp.eligibilityCriteria && (
              <div className="bg-white p-6 sm:p-8 border border-black/20 space-y-4 shadow-sm">
                <h3 className="font-amiri text-2xl font-bold text-black border-b border-black/10 pb-2">
                  Eligibility &amp; Submission Criteria
                </h3>
                <div
                  className="leading-relaxed prose prose-lg max-w-none [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mt-4 [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-black/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-heritage-red [&_a]:underline [&_img]:max-w-full [&_img]:my-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(opp.eligibilityCriteria) }}
                />
              </div>
            )}

            {opp.registrationEnabled && (
              <div id="apply-now" className="bg-white p-6 sm:p-8 border-2 border-black space-y-4 shadow-md scroll-mt-24">
                <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-black border-b border-black/10 pb-2">
                  Apply Now
                </h3>
                <PublicRegistrationForm contentItemId={opp.id} title={opp.title} />
              </div>
            )}

            {opp.tags && opp.tags.length > 0 && (
              <div className="pt-4 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-sans text-gray-500 uppercase font-bold mr-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Tags:
                </span>
                {opp.tags.map((t) => (
                  <span key={t} className="bg-white border border-black/20 text-xs px-3 py-1 font-sans">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Application Sidebar Card */}
          <aside className="space-y-6">
            <div className="bg-white border-2 border-black p-6 sm:p-7 shadow-md font-sans">
              <span className="font-averia text-[11px] uppercase tracking-wider text-heritage-red font-bold block mb-1">
                Admissions &amp; Placements
              </span>
              <h3 className="font-amiri text-2xl sm:text-[26px] font-bold text-black mb-2 leading-tight">
                Apply for this Placement
              </h3>
              <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                Applications are reviewed on a rolling basis by the Academic Advisory Committee.
              </p>

              <div className="space-y-2.5 bg-[#F7F4EF] p-4 border border-black/15 text-xs text-gray-800 mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Closing Date:</span>
                  <span className="font-semibold text-black">{opp.deadline || opp.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Intake Quota:</span>
                  <span className="font-semibold text-black">{opp.capacity || 4} positions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5">Open for Submissions</span>
                </div>
              </div>

              {opp.registrationEnabled ? (
                <a
                  href="#apply-now"
                  className="w-full bg-black text-white font-amiri font-bold text-[19px] py-3 hover:bg-heritage-red transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply for this Placement →</span>
                </a>
              ) : (
                <p className="text-xs text-gray-500 leading-relaxed text-center">
                  Online applications are not currently open for this opportunity. Contact the Fellowship Secretariat below to apply.
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-black/10 text-center">
                <Link prefetch
                  href="/services"
                  className="text-xs font-sans text-heritage-muted hover:text-black font-semibold underline underline-offset-2"
                >
                  View Reading Room Guidelines
                </Link>
              </div>
            </div>

            {/* Secretariat Contact Box */}
            <div className="bg-[#F7F4EF] border border-black/20 p-5 font-sans text-xs space-y-2">
              <p className="font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-heritage-red" />
                Fellowship Secretariat:
              </p>
              <p className="text-gray-700 leading-relaxed">
                Questions regarding eligibility, visa letters for international scholars, or travel allowances may be addressed to <strong>fellowships@kmlri.in</strong>.
              </p>
            </div>
          </aside>
        </div>

        {/* Related Opportunities */}
        {relatedOpps.length > 0 && (
          <section className="mt-16 pt-10 border-t border-black/15">
            <h2 className="font-amiri text-[28px] font-bold mb-6 text-black">
              More Opportunities &amp; Grants
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedOpps.map((r, idx) => (
                <Link prefetch
                  key={r.id || idx}
                  href={`/opportunities/${r.id}`}
                  className="bg-white border border-black/15 p-5 hover:border-black transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <span className="font-averia text-[11px] text-heritage-red uppercase font-bold">
                      {r.kicker || 'Opportunity'}
                    </span>
                    <h3 className="font-amiri text-[20px] font-semibold leading-snug group-hover:text-heritage-red transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="text-xs font-sans text-gray-600 line-clamp-2">
                      {r.summary}
                    </p>
                  </div>
                  <span className="mt-4 pt-3 border-t border-black/10 text-xs font-averia text-heritage-muted font-bold block">
                    Deadline: {r.deadline || r.date} →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
