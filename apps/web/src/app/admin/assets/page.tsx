'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssetsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/acquisitions/assets');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Asset Registry \&amp; Equipment…</div>;
}
