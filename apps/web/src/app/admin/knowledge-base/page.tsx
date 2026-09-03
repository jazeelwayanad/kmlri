'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KnowledgeBaseRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/digital-library/knowledge-base');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Knowledge Base \&amp; Research Guides…</div>;
}
