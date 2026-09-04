'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckInLegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/circulation/desk?tab=checkin');
  }, [router]);
  return null;
}
