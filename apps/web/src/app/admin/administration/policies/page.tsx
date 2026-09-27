'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CirculationPoliciesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/circulation/configuration');
  }, [router]);

  return (
    <div className="py-20 flex justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
