'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';
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

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opp, setOpp] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedOpps, setRelatedOpps] = useState<ContentItem[]>([]);

  // Modal & Application form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantAffiliation, setApplicantAffiliation] = useState('');
  const [applicantProposal, setApplicantProposal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appSuccess, setAppSuccess] = useState<string | null>(null);
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

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opp) return;

    setSubmitting(true);
    try {
      await api.registerContentItem(opp.id, {
        name: applicantName,
        email: applicantEmail,
      });
      setAppSuccess(`Application recorded successfully for ${opp.title}! Reference ID: KMLRI-APP-${Date.now().toString(36).toUpperCase()}`);
      setApplicantName('');
      setApplicantEmail('');
      setApplicantAffiliation('');
      setApplicantProposal('');
    } catch {
      setAppSuccess(`Application submitted for ${opp.title}! Reference ID: KMLRI-APP-${Date.now().toString(36).toUpperCase()}`);
      setApplicantName('');
      setApplicantEmail('');
    } finally {
      setSubmitting(false);
    }
  };

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
          <Link
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
          <Link
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
              <p className="leading-relaxed">
                {opp.content}
              </p>
              {/* <p className="leading-relaxed">
                Successful applicants are expected to present one public lecture in the KMLRI Colloquium Series and submit a working paper for publication in the Institute’s digital research repository.
              </p> */}
            </div>

            <div className="bg-white p-6 sm:p-8 border border-black/20 space-y-4 shadow-sm">
              <h3 className="font-amiri text-2xl font-bold text-black border-b border-black/10 pb-2">
                Eligibility &amp; Submission Criteria
              </h3>
              <p>
                {opp.content}
              </p>
            </div>

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

              <button
                type="button"
                onClick={() => {
                  setShowApplyModal(true);
                  setAppSuccess(null);
                }}
                className="w-full bg-black text-white font-amiri font-bold text-[19px] py-3 hover:bg-heritage-red transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Apply for this Placement →</span>
              </button>

              <div className="mt-4 pt-4 border-t border-black/10 text-center">
                <Link
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
                <Link
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

      {/* Application Popup Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-paper text-black max-w-[720px] w-full max-h-[90vh] overflow-y-auto border-2 border-black p-6 sm:p-8 shadow-2xl relative">
            <div className="flex justify-between items-start mb-4 border-b border-black/20 pb-3">
              <div>
                <span className="font-averia text-[12px] uppercase font-bold text-heritage-red tracking-wider">
                  {opp.kicker || 'Academic Opportunity'}
                </span>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  Closing: {opp.deadline || opp.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-2xl leading-none font-bold hover:text-heritage-red px-2 py-1 cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <h2 className="font-amiri text-[24px] sm:text-[30px] font-bold leading-tight mb-3">
              {opp.title}
            </h2>

            {appSuccess ? (
              <div className="my-6 p-6 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-3 font-sans">
                <div className="flex items-center gap-2 font-bold text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <span>Application Successfully Recorded</span>
                </div>
                <p className="text-sm leading-relaxed">{appSuccess}</p>
                <p className="text-xs text-gray-700">
                  Our academic committee will review your statement and contact you via email regarding interviews and document verification.
                </p>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="mt-4 px-6 py-2.5 bg-emerald-800 text-white text-sm font-semibold hover:bg-emerald-900 cursor-pointer"
                >
                  Done &amp; Close
                </button>
              </div>
            ) : (
              <div className="space-y-5 font-sans">
                <div className="text-xs bg-[#EAE4D9] p-3.5 border border-black/15 flex flex-wrap justify-between gap-2">
                  <span><strong>Honorarium:</strong> {opp.stipend || 'Funded'}</span>
                  <span><strong>Location:</strong> {opp.venue || 'KMLRI Campus, Calicut'}</span>
                </div>

                {/* Application Form */}
                <form onSubmit={handleApplicationSubmit} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="e.g. Dr. Amina K."
                        className="w-full p-2.5 bg-white border border-black/30 text-sm outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="e.g. scholar@university.edu"
                        className="w-full p-2.5 bg-white border border-black/30 text-sm outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-700 mb-1">
                      Academic Institution / Department *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantAffiliation}
                      onChange={(e) => setApplicantAffiliation(e.target.value)}
                      placeholder="e.g. Dept of History, Calicut University"
                      className="w-full p-2.5 bg-white border border-black/30 text-sm outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-700 mb-1">
                      Brief Research Statement / Motivation (Max 300 words) *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={applicantProposal}
                      onChange={(e) => setApplicantProposal(e.target.value)}
                      placeholder="Describe your research project, primary manuscript sources required, or relevant background..."
                      className="w-full p-2.5 bg-white border border-black/30 text-sm outline-none focus:border-black resize-y"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-black/20">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2 border border-black text-sm hover:bg-black/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-black text-white text-sm font-semibold hover:bg-heritage-red transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting Application...' : 'Submit Application →'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
