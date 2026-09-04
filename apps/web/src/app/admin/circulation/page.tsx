'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CirculationRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/circulation/desk');
  }, [router]);
  return null;
}
