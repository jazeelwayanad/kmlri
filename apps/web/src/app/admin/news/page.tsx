'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/website/news');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to News &amp; Press…</div>;
}
