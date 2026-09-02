'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CirculationDeskRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/circulation/check-out');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Check Out…</div>;
}
