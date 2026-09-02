'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function CirculationModeTabs() {
  const pathname = usePathname();
  const isCheckOut = pathname?.startsWith('/admin/circulation/check-out');
  const isCheckIn = pathname?.startsWith('/admin/circulation/check-in');

  return (
    <div className="bg-white border border-[#E2E0DB] p-2 rounded-[2px] shadow-sm flex gap-2">
      <Link
        href="/admin/circulation/check-out"
        className={`flex-1 py-3 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isCheckOut ? 'bg-black text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <ArrowUpRight className="w-4 h-4 text-amber-400" />
        <span>Check Out (Issue Items)</span>
      </Link>

      <Link
        href="/admin/circulation/check-in"
        className={`flex-1 py-3 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isCheckIn ? 'bg-[#A52307] text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <ArrowDownLeft className="w-4 h-4 text-white" />
        <span>Check In (Return Items)</span>
      </Link>
    </div>
  );
}
