'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResearchRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/digital-library/research');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Research Community Directory…</div>;
}
