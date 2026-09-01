'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, ContentItem, FALLBACK_CONTENT } from '@/lib/api';
import { Award, Briefcase, Calendar, CheckCircle2, Clock, DollarSign, FileText, MapPin, Send, Sparkles } from 'lucide-react';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ContentItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadOpportunities() {
      setLoading(true);
      try {
        const res = await api.getContentItems({ category: 'Opportunities' });
        if (isMounted) {
          setOpportunities(res.items || []);
        }
      } catch {
        if (isMounted) setOpportunities([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOpportunities();
    return () => {
      isMounted = false;
    };
  }, []);

  const filters = ['ALL', 'Fellowship', 'Internship', 'Call for Papers', 'Assistantship'];

  const filteredOpportunities = activeFilter === 'ALL'
    ? opportunities
    : opportunities.filter((o) =>
      o.kicker?.toLowerCase().includes(activeFilter.toLowerCase()) ||
      o.tags?.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()))
    );


  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 sm:mb-3">
          <div>
            <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">
              Fellowships, Grants &amp; Academic Placements
            </p>
            <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] tracking-[-0.015em] max-w-[18ch]">
              Opportunities
            </h1>
          </div>
        </div>

        <div className="double-rule mb-6 sm:mb-8"></div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar font-sans text-sm">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 border transition-all text-xs font-semibold uppercase tracking-wider ${activeFilter === filter
                  ? 'bg-black text-white border-black shadow'
                  : 'bg-white text-gray-700 border-black/20 hover:border-black'
                }`}
            >
              {filter === 'ALL' ? 'All Opportunities' : filter}
            </button>
          ))}
        </div>

        {/* Opportunities List */}
        <div className="space-y-6">
          {filteredOpportunities.map((opp, idx) => (
            <div
              key={opp.id || idx}
              className="bg-white border border-black/20 hover:border-black p-6 sm:p-8 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold">
                    {opp.kicker || 'Opportunity'}
                  </span>
                  <span className="text-xs font-sans text-gray-500 font-semibold bg-black/5 px-2.5 py-0.5 border border-black/10">
                    {opp.date || opp.deadline}
                  </span>
                  {opp.featured && (
                    <span className="text-[10px] font-averia uppercase font-bold bg-amber-100 text-amber-900 px-2 py-0.5 border border-amber-300">
                      High Priority
                    </span>
                  )}
                </div>

                <Link href={`/opportunities/${opp.slug || opp.id}`}><h2 className="font-amiri text-[22px] sm:text-[26px] font-bold leading-tight">
                  {opp.title}
                </h2></Link>

                <p className="text-[15px] sm:text-[17px] text-heritage-body font-sans leading-relaxed">
                  {opp.summary}
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs font-sans text-gray-700">
                  {opp.stipend && (
                    <div className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 border border-emerald-300">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{opp.stipend}</span>
                    </div>
                  )}
                  {opp.venue && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{opp.venue}</span>
                    </div>
                  )}
                  {opp.capacity && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      <span>Positions: {opp.capacity} ({opp.registered || 0} applications received)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[170px] justify-center">
                <Link
                  href={`/opportunities/${opp.slug || opp.id}`}
                  className="bg-black text-white font-amiri font-bold text-[17px] py-2 px-5 hover:bg-heritage-red hover:text-white  transition-colors text-center"
                >
                  Apply Now →
                </Link>
                <Link
                  href={`/opportunities/${opp.id}`}
                  className="border border-black font-amiri text-[16px] py-1.5 px-4 hover:bg-black/5 transition-colors text-center text-black"
                >
                  Guidelines &amp; Terms
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
