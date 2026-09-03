'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdministrationDepartmentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/system/departments');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 text-sm font-sans">Redirecting to Departments \&amp; Programs…</div>;
}
