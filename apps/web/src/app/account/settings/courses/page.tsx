'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { GraduationCap, BookOpen, ArrowRight, UserCheck } from 'lucide-react';

export default function SettingsCourseReadingListsPage() {
  const { user } = useAuth();

  const courseLists = [
    {
      code: 'ISL-601',
      title: 'Advanced Islamic Manuscript Studies & Codicology',
      instructor: 'Dr. Abdul Qadir / KMLRI Research Faculty',
      term: 'Autumn Session 2026',
      itemsCount: 14,
      readings: [
        { title: 'Codicology of Islamic Manuscripts (Déroche)', call: 'REF 0102' },
        { title: 'Fatḥ al-Muʿīn Manuscript Stems', call: 'MS 0908' },
      ]
    },
    {
      code: 'MAL-402',
      title: 'Arabi-Malayalam Linguistic History & Epigraphy',
      instructor: 'Prof. K. M. Parappur',
      term: 'Autumn Session 2026',
      itemsCount: 9,
      readings: [
        { title: 'Muḥyiddīn Mālā Philology', call: 'AM 0311' },
        { title: 'Kappappāṭṭu Palm Leaf Transcription', call: 'MS 0089' },
      ]
    }
  ];

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Academic Course Reading Reserves
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Curriculum reading lists and reserved shelf stacks assigned to your institutional courses and seminars.
          </p>
        </div>

        <span className="text-xs font-mono text-heritage-body bg-[#F7F4EF] px-3 py-1.5 border border-[#D6CCBC] rounded">
          Enrolled Term: Autumn 2026
        </span>
      </div>

      <div className="double-rule"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courseLists.map((course) => (
          <div
            key={course.code}
            className="border-2 border-black bg-white rounded p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs bg-black text-paper font-mono font-bold px-2 py-0.5 rounded">
                  {course.code}
                </span>
                <span className="text-xs text-heritage-muted font-averia">{course.term}</span>
              </div>

              <h3 className="font-amiri text-2xl font-bold text-black leading-snug">{course.title}</h3>
              <p className="text-xs text-heritage-body mt-1">Instructor: {course.instructor}</p>

              {/* Reserved Readings Preview */}
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                <p className="text-[11px] font-averia uppercase font-bold text-heritage-muted">Key Reserves:</p>
                {course.readings.map((r, i) => (
                  <div key={i} className="flex justify-between text-xs text-heritage-body">
                    <span className="truncate max-w-[220px] font-semibold">• {r.title}</span>
                    <span className="font-mono text-heritage-muted text-[11px]">{r.call}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs">
              <span className="font-bold text-black font-mono">{course.itemsCount} Reserved Items</span>
              <Link
                href="/search"
                className="px-3.5 py-1.5 bg-black text-white rounded font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1"
              >
                <span>Access Reserves</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
