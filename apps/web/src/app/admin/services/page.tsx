'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ServicesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/support-services');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Support Services Desk…</div>;
}
