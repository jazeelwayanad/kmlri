'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';
import {
  ArrowLeft,
  Share2,
  BookOpen,
  Tag,
  Calendar,
  User,
  Sparkles,
  ExternalLink,
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

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedStories, setRelatedStories] = useState<ContentItem[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadStory() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getContentItem(id);
        if (isMounted) {
          setStory(data);
          const fallback = FALLBACK_CONTENT['Stories'] || [];
          setRelatedStories(fallback.filter((r) => r.id !== data.id).slice(0, 3));
        }
      } catch (err: any) {
        if (isMounted) {
          const fallback = FALLBACK_CONTENT['Stories'] || [];
          const found = fallback.find((i) => i.id === id || i.slug === id);
          if (found) {
            setStory(found);
            setRelatedStories(fallback.filter((r) => r.id !== found.id).slice(0, 3));
          } else {
            setError(err.message || 'Story not found');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStory();
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
          Loading archival story...
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-paper text-black font-amiri">
        <TopBar />
        <Navbar />
        <section className="max-w-[1100px] mx-auto py-20 px-5 text-center">
          <h1 className="text-3xl font-bold mb-4">Story Not Found</h1>
          <p className="font-sans text-heritage-body mb-6">
            The requested reading room story or research note could not be found.
          </p>
          <Link prefetch
            href="/stories"
            className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-base font-bold hover:bg-heritage-red hover:text-white  transition-colors"
          >
            ← Return to All Stories
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
            href="/stories"
            className="inline-flex items-center gap-1.5 font-semibold text-black hover:text-heritage-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-black hover:text-heritage-red font-medium transition-colors bg-white px-3 py-1 border border-black/20 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedShare ? 'Link Copied!' : 'Share Story'}</span>
          </button>
        </div>

        {/* Story Header */}
        <header className="max-w-[850px] mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.08em] text-heritage-red uppercase font-bold bg-heritage-red/10 px-2.5 py-0.5 border border-heritage-red/20">
              {story.kicker || 'Reading Room Story'}
            </span>
            <span className="text-xs font-sans text-gray-500">
              {story.date || 'KMLRI Primary Collections'}
            </span>
            {story.author && (
              <span className="text-xs font-sans text-gray-700 font-semibold">
                · By {story.author}
              </span>
            )}
          </div>

          <h1 className="font-amiri text-[34px] sm:text-[54px] font-bold leading-[1.08] text-black mb-5 tracking-[-0.015em] text-balance">
            {story.title}
          </h1>

          <p className="font-amiri text-[20px] sm:text-[24px] text-gray-800 leading-relaxed font-semibold mb-6 text-pretty">
            {story.summary}
          </p>
        </header>

        <div className="double-rule mb-10"></div>

        {/* Archival Codex Plate / Exhibit Banner */}
        <div className="w-full bg-[#EAE4D9] border-2 border-black p-8 sm:p-14 text-center my-8 shadow-inner relative overflow-hidden">
          <span className="font-averia text-[11px] uppercase tracking-[0.2em] text-[#7E7365] block mb-3 font-bold">
            Kunhīn Musliyār Library Manuscript Collection · Exhibit Plate
          </span>
          <p className="font-amiri text-2xl sm:text-3xl italic text-black/85 max-w-2xl mx-auto leading-snug">
            "{story.summary}"
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap text-xs font-sans text-gray-700">
            <span className="bg-white/80 px-3 py-1 border border-black/15">Shelfmark: KMLRI-{story.id || 'MSS-01'}</span>
            <span className="bg-white/80 px-3 py-1 border border-black/15">Script: Arabic &amp; Arabi-Malayalam</span>
            <span className="bg-white/80 px-3 py-1 border border-black/15">Conservation Level: High-Res Folio Digitized</span>
          </div>
        </div>

        {/* Story Narrative Article */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start mt-10">
          <article className="space-y-6 font-serif text-[17px] sm:text-[19px] leading-[1.8] text-gray-900">
            <div className="font-sans text-[16px] sm:text-[18px] text-heritage-body leading-relaxed space-y-4">
              {story.content ? (
                <div
                  className="prose prose-lg max-w-none [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mt-4 [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-black/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-heritage-red [&_a]:underline [&_img]:max-w-full [&_img]:my-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(story.content) }}
                />
              ) : (
                <>
                  <p>
                    A close examination of handwritten codices from the Malabar coast reveals how books circulated between study circles, port towns, and madrasas. Scribes often recorded not only the date of completion, but the specific mosque or family home where the copying took place.
                  </p>
                  <p>
                    These manuscripts carry extensive marginal notes (*ḥawāshī*) that document disputes between teachers and students, glosses explaining difficult vocabulary in Arabi-Malayalam verse, and ownership inscriptions spanning generations of the same scholarly family.
                  </p>
                  <p>
                    In the KMLRI reading room, each item is made available alongside its digitized folio records, condition survey maps, and high-resolution multispectral imaging outputs.
                  </p>
                </>
              )}
            </div>

            {/* Tags */}
            {story.tags && story.tags.length > 0 && (
              <div className="pt-8 mt-8 border-t border-black/15 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-sans text-gray-500 uppercase font-bold mr-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Topics &amp; Themes:
                </span>
                {story.tags.map((t) => (
                  <span key={t} className="bg-white border border-black/20 text-xs px-3 py-1 font-sans">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Reading Room Consultation Box */}
          <aside className="space-y-6">
            <div className="bg-white border-2 border-black p-6 shadow-md font-sans space-y-4">
              <h3 className="font-amiri text-2xl font-bold text-black">
                Consult this Material
              </h3>
              <p className="text-xs text-heritage-body leading-relaxed">
                Researchers and students may consult the original manuscripts and related catalog records under reading room supervision.
              </p>
              <div className="space-y-2 text-xs text-gray-700">
                <p><strong>Access Status:</strong> Supervised Reading Room</p>
                <p><strong>Reproduction:</strong> High-res folio scans available on request</p>
                <p><strong>Appointment:</strong> Minimum 24-hour advance booking</p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <Link prefetch
                  href="/services"
                  className="w-full bg-black text-white font-amiri font-bold text-center py-2.5 rounded-full hover:bg-heritage-red hover:text-white transition-colors text-base"
                >
                  Plan Reading Room Visit →
                </Link>
                <Link prefetch
                  href="/ask"
                  className="w-full border border-black text-black font-amiri font-bold text-center py-2 rounded-full hover:bg-black hover:text-white transition-colors text-base"
                >
                  Request Item Scan
                </Link>
              </div>
            </div>

            {/* Library Citation Info */}
            <div className="bg-[#F7F4EF] border border-black/20 p-5 font-sans text-xs space-y-2">
              <p className="font-bold uppercase tracking-wider text-black">How to Cite this Story:</p>
              <p className="font-mono text-[11px] text-gray-700 bg-white p-2.5 border border-black/10">
                KMLRI Research Bulletin, "{story.title}", Kunhīn Musliyār Library &amp; Research Institute, 2026.
              </p>
            </div>
          </aside>
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <section className="mt-16 pt-10 border-t border-black/15">
            <h2 className="font-amiri text-[28px] font-bold mb-6 text-black">
              More Stories from the Reading Room
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedStories.map((r, idx) => (
                <Link prefetch
                  key={r.id || idx}
                  href={`/stories/${r.id}`}
                  className="bg-white border border-black/15 p-5 hover:border-black transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <span className="font-averia text-[11px] text-heritage-red uppercase font-bold">
                      {r.kicker || 'Archive Story'}
                    </span>
                    <h3 className="font-amiri text-[20px] font-semibold leading-snug group-hover:text-heritage-red transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="text-xs font-sans text-gray-600 line-clamp-2">
                      {r.summary}
                    </p>
                  </div>
                  <span className="mt-4 pt-3 border-t border-black/10 text-xs font-averia text-heritage-muted font-bold block">
                    Read Story →
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
