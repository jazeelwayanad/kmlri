'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';
import { Clock, MapPin, Search } from 'lucide-react';

export default function EventsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getContentItems({ category: 'Events', search });
        if (isMounted) {
          setItems(res.items || []);
        }
      } catch {
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [search]);

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 sm:mb-3">
          <div>
            <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">
              Academic Calendar &amp; Public Exhibitions
            </p>
            <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] tracking-[-0.015em] max-w-[18ch]">
              Events &amp; Workshops
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, seminars, venue..."
              className="w-full pl-9 pr-3 py-2 bg-white/70 border border-black/30 font-sans text-sm outline-none focus:border-black focus:bg-white transition-all rounded-none"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>
        </div>
        <div className="double-rule mb-8 sm:mb-12"></div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((event) => {
            const capacity = event.capacity || 100;
            const registered = event.registered || 0;
            const isFull = registered >= capacity;

            return (
              <article
                key={event.id}
                className="bg-white border border-black/10 p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-averia text-[12px] tracking-[0.06em] uppercase text-heritage-red font-bold">
                      {event.kicker || 'Event'}
                    </span>
                    <span
                      className={`text-[11px] font-sans font-bold px-2 py-0.5 rounded ${isFull
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                        }`}
                    >
                      {isFull ? 'Waitlist' : 'Seats Open'}
                    </span>
                  </div>

                  <Link prefetch href={`/events/${event.slug || event.id}`}>
                    <h2 className="font-amiri text-[22px] sm:text-[24px] font-bold leading-[1.25] mb-3 group-hover:text-heritage-red transition-colors">
                      {event.title}
                    </h2>
                  </Link>

                  <p className="font-sans text-[14px] sm:text-[15px] leading-[1.5] text-heritage-body mb-4">
                    {event.summary}
                  </p>

                  <div className="font-sans text-[12px] text-gray-600 space-y-1.5 mb-6 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5 text-black font-semibold">
                      <Clock className="w-3.5 h-3.5 text-heritage-red" />
                      <span>{event.date} · {event.time}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100 mt-auto">
                  <Link prefetch
                    href={`/events/${event.slug || event.id}`}
                    className="font-amiri text-[17px] font-bold text-heritage-red hover:underline flex items-center gap-1"
                  >
                    View details &amp; register →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
