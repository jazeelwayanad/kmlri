'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AcquisitionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/acquisitions/recommendations');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Acquisition Recommendations…</div>;
}
