'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AskRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/support-services/ask');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Ask-a-Librarian Desk…</div>;
}
