'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SavedResourcesRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string) || 'patron';

  useEffect(() => {
    router.replace(`/${slug}/reading-lists`);
  }, [router, slug]);

  return <div className="p-8 text-center text-heritage-muted text-sm font-sans">Redirecting to your reading lists…</div>;
}
