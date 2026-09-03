'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AskALibrarianRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/support-services/ask');
  }, [router]);

  return (
    <div className="p-12 text-center text-gray-500 font-sans text-sm">
      Redirecting to the Ask-a-Librarian helpdesk…
    </div>
  );
}
