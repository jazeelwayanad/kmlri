'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FinesPaymentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/circulation/fines');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Fines &amp; Cashier Payments…</div>;
}
