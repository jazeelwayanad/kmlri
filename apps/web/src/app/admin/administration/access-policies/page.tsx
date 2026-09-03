'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdministrationAccessPoliciesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/members/access-policies');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Access Policies \&amp; Clearances…</div>;
}
