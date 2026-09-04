'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RenewalsLegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/circulation/desk?tab=renewals');
  }, [router]);
  return null;
}
