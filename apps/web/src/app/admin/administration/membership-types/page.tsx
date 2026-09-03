'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdministrationMembershipTypesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/members/membership-types');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Membership Types \&amp; Quotas…</div>;
}
