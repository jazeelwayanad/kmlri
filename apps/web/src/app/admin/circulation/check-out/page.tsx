'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckOutLegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/circulation/desk?tab=checkout');
  }, [router]);
  return null;
}
