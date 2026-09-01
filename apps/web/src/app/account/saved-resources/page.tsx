'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SavedResourcesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account/reading-lists');
  }, [router]);

  return <div className="p-8 text-center text-heritage-muted text-sm font-sans">Redirecting to your reading lists…</div>;
}
