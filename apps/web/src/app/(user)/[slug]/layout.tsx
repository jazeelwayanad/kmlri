'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountNav } from '@/components/account/AccountNav';
import { useAuth } from '@/lib/auth-context';
import { Shield, Copy, LogOut, CheckCircle2, User as UserIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isStaff, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.replace('/login');
    }
  }, [mounted, authLoading, user, router]);

  const copyMembershipId = () => {
    if (user?.membershipNumber) {
      navigator.clipboard.writeText(user.membershipNumber);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!mounted || authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-stone-900 font-sans flex flex-col justify-between">
      <div>
        <TopBar />
        <Navbar />
        <main className="max-w-[1100px] mx-auto px-4 sm:px-5 pt-6 sm:pt-9 pb-24 lg:pb-9">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            <div className="w-full lg:w-64 flex-shrink-0">
              <AccountNav />
            </div>
            <div className="flex-1 min-w-0 w-full">
              {children}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
