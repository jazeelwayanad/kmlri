'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import GoogleFormsBuilder from '@/components/forms/GoogleFormsBuilder';

const MODULE_OPTIONS = [
  {
    type: 'ITEM',
    title: 'Item Record Creation',
    desc: 'Cataloguing books, manuscripts, codices, theses, and media assets.',
    icon: BookOpen,
    badge: 'Catalogues',
    color: 'bg-amber-50 text-amber-900 border-amber-200',
    iconColor: 'text-[#A52307]',
  },
  {
    type: 'SERIAL',
    title: 'Serial Record Creation',
    desc: 'Periodicals, journals, recurring subscriptions, and volume issues.',
    icon: Bookmark,
    badge: 'Serials',
    color: 'bg-blue-50 text-blue-900 border-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    type: 'AUTHORITY',
    title: 'Authority Record Creation',
    desc: 'Controlled headings for Authors (Scholars/Scribes) and Publications (Publishers/Series).',
    icon: UserCheck,
    badge: 'Authorities',
    color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
];

function CreateFrameworkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialModule = searchParams.get('module')?.toUpperCase();

  const [selectedModule, setSelectedModule] = useState<string | null>(
    initialModule && MODULE_OPTIONS.some((m) => m.type === initialModule) ? initialModule : null
  );

  if (selectedModule) {
    return <GoogleFormsBuilder initialRecordType={selectedModule} isEditing={false} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 font-sans space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="space-y-1">
          <Link
            href="/admin/catalog/frameworks"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-semibold transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Frameworks
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Select Target Module</h1>
          <p className="text-xs text-gray-500">
            Choose which library section this record-creation form framework will be built for:
          </p>
        </div>
      </div>

      {/* Module Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULE_OPTIONS.map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.type}
              type="button"
              onClick={() => {
                setSelectedModule(mod.type);
                router.replace(`/admin/catalog/frameworks/new?module=${mod.type}`);
              }}
              className="group p-5 bg-white hover:bg-[#FAF8F5] border border-[#E2E0DB] hover:border-[#A52307] rounded-xl text-left transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                    <Icon className={`w-5 h-5 ${mod.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#A52307] transition-colors">
                      {mod.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border mt-1 ${mod.color}`}>
                      {mod.badge}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#A52307] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{mod.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateFrameworkPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">Loading form studio…</div>}>
      <CreateFrameworkContent />
    </Suspense>
  );
}
