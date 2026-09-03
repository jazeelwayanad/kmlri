'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssetsMaintenanceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/acquisitions/assets/maintenance');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Maintenance Logs…</div>;
}
