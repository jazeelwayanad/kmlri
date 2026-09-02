'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Share2,
  Users,
  Tag,
  HelpCircle,
  Ticket,
  Send,
} from 'lucide-react';

// Minimal sanitization for admin-authored rich-text HTML: strips script tags,
// inline event handlers, and javascript: URLs before rendering with
// dangerouslySetInnerHTML. This is not a general-purpose sanitizer — content
// is authored exclusively by trusted staff through the admin RichTextEditor.
function sanitizeContentHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

export default function NewsEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedItems, setRelatedItems] = useState<ContentItem[]>([]);

  // Modal & Registration state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getContentItem(id);
        if (isMounted) {
          setItem(data);
          const category = data.category === 'EVENT' ? 'Events' : 'News';
          const fallback = FALLBACK_CONTENT[category] || [];
          setRelatedItems(fallback.filter((r) => r.id !== data.id).slice(0, 3));
        }
      } catch (err: any) {
        if (isMounted) {
          const allItems = [...(FALLBACK_CONTENT['Events'] || []), ...(FALLBACK_CONTENT['News'] || [])];
          const found = allItems.find((i) => i.id === id || i.slug === id);
          if (found) {
            setItem(found);
            const category = found.category === 'EVENT' ? 'Events' : 'News';
            const fallback = FALLBACK_CONTENT[category] || [];
            setRelatedItems(fallback.filter((r) => r.id !== found.id).slice(0, 3));
          } else {
            setError(err.message || 'Article or event not found');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadItem();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const [regError, setRegError] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setRegistering(true);
    setRegError(null);
    try {
      const res = await api.registerContentItem(item.id, {
        name: attendeeName,
        email: attendeeEmail,
      });
      setRegSuccess(res.message || `Registration confirmed! Your seat reservation ID is KMLRI-EVT-${Date.now().toString(36).toUpperCase()}`);
      setAttendeeName('');
      setAttendeeEmail('');
      setAttendeePhone('');
    } catch (err: any) {
      setRegError(err.message || 'Could not complete your registration. Please try again.');
    } finally {
      setRegistering(false);
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
          Loading article details...
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-paper text-black font-amiri">
        <TopBar />
        <Navbar />
        <section className="max-w-[1100px] mx-auto py-20 px-5 text-center">
          <h1 className="text-3xl font-bold mb-4">Item Not Found</h1>
          <p className="font-sans text-heritage-body mb-6">
            The requested news update or event announcement could not be located.
          </p>
          <Link
            href="/news"
            className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-base font-bold hover:bg-heritage-red transition-colors"
          >
            ← Return to News &amp; Events
          </Link>
        </section>
        <Footer />
      </div>
    );
  }

  const isEvent = item.category === 'EVENT' || item.venue || item.time;
  const seatsRemaining = (item.capacity || 50) - (item.registered || 12);

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <main className="max-w-[1100px] mx-auto pt-6 sm:pt-12 px-4 sm:px-5 pb-24">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 font-sans text-xs sm:text-sm text-heritage-muted">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 font-semibold text-black hover:text-heritage-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to News &amp; Events</span>
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

        {/* Article / Event Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.08em] text-heritage-red uppercase font-bold bg-heritage-red/10 px-2.5 py-0.5 border border-heritage-red/20">
              {item.kicker || (isEvent ? 'Event Bulletin' : 'News Dispatch')}
            </span>
            {item.featured && (
              <span className="font-averia text-[11px] uppercase tracking-wider bg-black text-paper px-2 py-0.5 font-bold">
                Featured
              </span>
            )}
            <span className="text-xs font-sans text-gray-500">
              {item.date || item.deadline}
            </span>
          </div>

          <h1 className="font-amiri text-[32px] sm:text-[50px] font-bold leading-[1.1] text-black mb-4 tracking-[-0.015em] text-balance">
            {item.title}
          </h1>

          <p className="font-amiri text-[20px] sm:text-[24px] text-gray-800 leading-relaxed font-semibold mb-6 text-pretty">
            {item.summary}
          </p>

          {/* 3-Column Metadata Bar for Events */}
          {/* {isEvent && (
            <div className="border border-black bg-white grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black my-6">
              <div className="p-4 sm:p-5 flex items-center gap-3.5">
                <Calendar className="w-6 h-6 text-heritage-red flex-shrink-0" />
                <div>
                  <p className="font-averia text-[11px] uppercase tracking-[0.08em] text-heritage-muted font-bold m-0 leading-tight">
                    DATE
                  </p>
                  <p className="font-sans text-sm sm:text-[15px] font-semibold text-black m-0 mt-0.5 leading-snug">
                    {item.date || 'To Be Announced'}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-center gap-3.5">
                <Clock className="w-6 h-6 text-[#7E7365] flex-shrink-0" />
                <div>
                  <p className="font-averia text-[11px] uppercase tracking-[0.08em] text-heritage-muted font-bold m-0 leading-tight">
                    SCHEDULE / TIME
                  </p>
                  <p className="font-sans text-sm sm:text-[15px] font-semibold text-black m-0 mt-0.5 leading-snug">
                    {item.time || '10:00 AM – 4:30 PM'}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-center gap-3.5">
                <MapPin className="w-6 h-6 text-heritage-red flex-shrink-0" />
                <div>
                  <p className="font-averia text-[11px] uppercase tracking-[0.08em] text-heritage-muted font-bold m-0 leading-tight">
                    LOCATION / VENUE
                  </p>
                  <p className="font-sans text-sm sm:text-[15px] font-semibold text-black m-0 mt-0.5 leading-snug">
                    {item.venue || 'KMLRI Main Campus, Calicut'}
                  </p>
                </div>
              </div>
            </div>
          )} */}
        </header>

        <div className="double-rule mb-10"></div>

        {/* Content Layout (Article Body + Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Main Body */}
          <article className="space-y-6 font-sans text-heritage-body text-[16px] sm:text-[18px] leading-[1.7]">
            {/* Visual Feature Plate Box */}
            <div className="w-full bg-[#EAE4D9] border border-black/20 p-8 sm:p-12 text-center relative overflow-hidden">
              <span className="font-averia text-[11px] uppercase tracking-[0.15em] text-[#7E7365] block mb-2 font-bold">
                Kunhīn Musliyār Library &amp; Research Institute · Bulletin &amp; Proceedings
              </span>
              <p className="font-amiri text-2xl sm:text-3xl font-bold text-black/85 max-w-xl mx-auto leading-snug">
                "{item.title}"
              </p>
              {item.author && (
                <p className="font-averia text-xs text-gray-600 uppercase tracking-wider mt-4">
                  Curated &amp; Communicated by {item.author}
                </p>
              )}
            </div>

            {item.content ? (
              <div
                className="space-y-4 pt-4 text-gray-900 leading-relaxed prose prose-lg max-w-none [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mt-4 [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-black/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-heritage-red [&_a]:underline [&_img]:max-w-full [&_img]:my-4"
                dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(item.content) }}
              />
            ) : (
              <div className="space-y-4 pt-4 text-gray-900 leading-relaxed">
                <p>
                  The Kunhīn Musliyār Library and Research Institute continues to document and share discoveries from its rare codices, lithograph stacks, and conservation surveys. For complete archival documentation or high-resolution codicological reproductions, contact the Reference Desk.
                </p>
                <p>
                  Sessions are held under the supervision of senior curators and manuscript preservation specialists. Attendees receive annotated bibliographies and access to dedicated digital folio viewports.
                </p>
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="pt-6 border-t border-black/15 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-sans text-gray-500 uppercase font-bold mr-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Topics:
                </span>
                {item.tags.map((t) => (
                  <span key={t} className="bg-white border border-black/20 text-xs px-2.5 py-1 font-sans">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Sidebar Area: Action Card */}
          <aside className="space-y-6">
            {isEvent ? (
              <div className="bg-white border-2 border-black p-6 sm:p-7 shadow-md font-sans">
                <span className="font-averia text-[11px] uppercase tracking-wider text-heritage-red font-bold block mb-1">
                  Event Admission &amp; Attendance
                </span>
                <h3 className="font-amiri text-2xl sm:text-[26px] font-bold text-black mb-2 leading-tight">
                  Reserve Your Seat
                </h3>
                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Admission is complimentary for registered scholars, students, and members. Advance RSVP required.
                </p>

                <div className="space-y-2.5 bg-[#F7F4EF] p-4 border border-black/15 text-xs text-gray-800 mb-5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date &amp; Time:</span>
                    <span className="font-semibold text-black">{item.date} {item.time ? `· ${item.time}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Venue:</span>
                    <span className="font-semibold text-black">{item.venue || 'KMLRI Auditorium'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seat Capacity:</span>
                    <span className="font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5">{seatsRemaining > 0 ? `${seatsRemaining} seats available` : 'Full / Waitlist'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(true);
                    setRegSuccess(null);
                  }}
                  className="w-full bg-black text-white font-amiri font-bold text-[19px] py-3 hover:bg-heritage-red transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Register for Event →</span>
                </button>
              </div>
            ) : null}

            {/* Reference Help Card */}
            <div className="bg-[#F7F4EF] border border-black/20 p-6 font-sans">
              <h4 className="font-amiri text-xl font-bold mb-2">Inquiries &amp; Press</h4>
              <p className="text-xs text-heritage-body leading-relaxed mb-4">
                For reference inquiries, schedule adjustments, or press releases, contact the library desk.
              </p>
              <div className="text-xs space-y-1.5 font-medium text-gray-700">
                <p><strong>Email:</strong> info@kmlri.in</p>
                <p><strong>Phone:</strong> +91 97452 34786</p>
                <p><strong>Reading Room:</strong> Mon–Sat, 9:00–17:00</p>
              </div>
              <Link
                href="/ask"
                className="inline-block mt-4 text-xs font-bold text-heritage-red uppercase tracking-wider hover:underline"
              >
                Ask a Librarian →
              </Link>
            </div>
          </aside>
        </div>

        {/* Related Items Section */}
        {relatedItems.length > 0 && (
          <section className="mt-16 pt-10 border-t border-black/15">
            <h2 className="font-amiri text-[28px] font-bold mb-6 text-black">
              More News &amp; Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedItems.map((r, idx) => (
                <Link
                  key={r.id || idx}
                  href={`/news/${r.id}`}
                  className="bg-white border border-black/15 p-5 hover:border-black transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <span className="font-averia text-[11px] text-heritage-red uppercase font-bold">
                      {r.kicker || r.category}
                    </span>
                    <h3 className="font-amiri text-[20px] font-semibold leading-snug group-hover:text-heritage-red transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="text-xs font-sans text-gray-600 line-clamp-2">
                      {r.summary}
                    </p>
                  </div>
                  <span className="mt-4 pt-3 border-t border-black/10 text-xs font-averia text-heritage-muted font-bold block">
                    {r.date || r.deadline} →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Event Registration Popup Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-paper text-black max-w-[640px] w-full max-h-[90vh] overflow-y-auto border-2 border-black p-6 sm:p-8 shadow-2xl relative">
            <div className="flex justify-between items-start mb-4 border-b border-black/20 pb-3">
              <div>
                <span className="font-averia text-[12px] uppercase font-bold text-heritage-red tracking-wider">
                  {item.kicker || 'Event Registration'}
                </span>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  {item.date} {item.time ? `· ${item.time}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-2xl leading-none font-bold hover:text-heritage-red px-2 py-1 cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <h2 className="font-amiri text-[24px] sm:text-[30px] font-bold leading-tight mb-3">
              {item.title}
            </h2>

            {regSuccess ? (
              <div className="my-6 p-6 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-3 font-sans">
                <div className="flex items-center gap-2 font-bold text-base">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Seat Reserved Successfully!</span>
                </div>
                <p className="text-sm leading-relaxed">{regSuccess}</p>
                <p className="text-xs text-gray-700">
                  Please show your confirmation email or quote your name at the library reception desk upon arrival.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="mt-4 px-6 py-2.5 bg-emerald-800 text-white text-sm font-semibold hover:bg-emerald-900 cursor-pointer"
                >
                  Done &amp; Close
                </button>
              </div>
            ) : (
              <div className="space-y-5 font-sans">
                <div className="text-xs bg-[#EAE4D9] p-3.5 border border-black/15 flex flex-wrap justify-between gap-2">
                  <span><strong>Venue:</strong> {item.venue || 'KMLRI Auditorium, Calicut'}</span>
                  <span><strong>Availability:</strong> {seatsRemaining} seats left</span>
                </div>

                {regError && (
                  <div className="text-xs bg-red-50 border border-red-300 text-red-800 p-3 font-semibold">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      placeholder="e.g. Fathima K."
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
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      placeholder="e.g. scholar@kmlri.in"
                      className="w-full p-2.5 bg-white border border-black/30 text-sm outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-700 mb-1">
                      Phone Number / WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      placeholder="e.g. +91 98470 12345"
                      className="w-full p-2.5 bg-white border border-black/30 text-sm outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-black/20">
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(false)}
                      className="px-4 py-2 border border-black text-sm hover:bg-black/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={registering}
                      className="px-6 py-2 bg-black text-white text-sm font-semibold hover:bg-heritage-red transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{registering ? 'Reserving...' : 'Confirm Seat Reservation →'}</span>
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
