'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StoriesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/website/stories');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Stories &amp; Articles…</div>;
}
