'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CirculationHoldsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/reservations');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Reservations &amp; Item Holds…</div>;
}
