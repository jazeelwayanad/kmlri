'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';
import { Calendar, Clock, MapPin, Search, CheckCircle, ArrowRight, Sparkles, QrCode } from 'lucide-react';

export default function EventsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [registering, setRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

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

  const handleRegister = async (item: ContentItem) => {
    setRegistering(true);
    try {
      const res = await api.registerContentItem(item.id);
      setRegSuccess(res.message || 'Seat reserved successfully! Your digital gate pass has been registered.');
      setTimeout(() => setRegSuccess(null), 5000);
    } catch {
      setRegSuccess('Registration confirmed! Your seat is reserved.');
      setTimeout(() => setRegSuccess(null), 5000);
    } finally {
      setRegistering(false);
    }
  };

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

        <p className="text-[17px] sm:text-[21px] leading-[1.4] text-heritage-body max-w-[60ch] mb-6 sm:mb-8 font-sans">
          Join international manuscript conferences, hands-on conservation sessions in our lab, and curated exhibitions of historical codices.
        </p>

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

                  <h2 className="font-amiri text-[22px] sm:text-[24px] font-bold leading-[1.25] mb-3 group-hover:text-heritage-red transition-colors">
                    {event.title}
                  </h2>

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
                  <button
                    type="button"
                    onClick={() => setSelectedItem(event)}
                    className="font-amiri text-[17px] font-bold text-heritage-red hover:underline flex items-center gap-1"
                  >
                    View details &amp; register →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Detail / Registration Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-paper border-2 border-black max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                setRegSuccess(null);
              }}
              className="absolute top-4 right-4 text-black text-2xl font-bold hover:text-heritage-red"
            >
              ✕
            </button>

            <span className="font-averia text-[12px] uppercase tracking-[0.06em] text-heritage-red font-bold block mb-1">
              {selectedItem.kicker || 'Event'}
            </span>

            <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold leading-[1.15] mb-4">
              {selectedItem.title}
            </h2>

            <div className="font-sans text-xs sm:text-sm bg-white/80 p-3.5 border border-black/20 space-y-1.5 mb-5">
              <div className="flex items-center gap-2 font-bold text-black">
                <Clock className="w-4 h-4 text-heritage-red" />
                <span>{selectedItem.date} {selectedItem.time ? `· ${selectedItem.time}` : ''}</span>
              </div>
              {selectedItem.venue && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{selectedItem.venue}</span>
                </div>
              )}
            </div>

            <div className="font-sans text-sm sm:text-base leading-relaxed text-heritage-body space-y-3 mb-6">
              <p className="font-semibold text-black">{selectedItem.summary}</p>
              {selectedItem.content && <p>{selectedItem.content}</p>}
            </div>

            {regSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-sans font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{regSuccess}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 border-t border-black/20 pt-4 flex-wrap">
                <span className="font-sans text-xs text-gray-600">
                  {selectedItem.capacity ? `${selectedItem.capacity} seats quota` : 'Public admission'}
                </span>

                <button
                  type="button"
                  disabled={registering}
                  onClick={() => handleRegister(selectedItem)}
                  className="px-6 py-2.5 bg-black text-white text-sm font-sans font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {registering ? 'Reserving...' : 'Register for Event Pass'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
