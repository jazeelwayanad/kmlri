'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MembersRolesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/system/roles');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Roles &amp; Permissions…</div>;
}
