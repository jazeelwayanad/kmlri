'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InventoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/acquisitions/inventory');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Inventory \&amp; Shelf Auditing…</div>;
}
