'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OpportunitiesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/website/opportunities');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Fellowships &amp; Grants…</div>;
}
