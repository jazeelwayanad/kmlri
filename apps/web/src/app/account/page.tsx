'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AccountRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/user/${user.username || user.id}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center font-amiri text-lg text-black">
      <div className="text-center space-y-2">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Directing to account dashboard...</p>
      </div>
    </div>
  );
}
