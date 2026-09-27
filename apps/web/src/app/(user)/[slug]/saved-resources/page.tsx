'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SavedResourcesRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string) || 'patron';

  useEffect(() => {
    router.replace(`/${slug}/reading-lists`);
  }, [router, slug]);

  return (
    <div className="py-20 flex justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
