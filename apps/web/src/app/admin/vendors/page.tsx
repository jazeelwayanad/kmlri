'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/acquisitions/vendors');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Vendors \&amp; Publisher Partners…</div>;
}
