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
      <div className="min-h-screen bg-[#F5F2EB] text-black font-serif flex flex-col justify-between">
        <div>
          <TopBar />
          <Navbar />
          <div className="max-w-[1100px] mx-auto py-24 px-4 sm:px-5 text-center space-y-3">
            <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-amiri text-lg text-stone-700">Verifying patron credentials...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-stone-900 font-sans flex flex-col justify-between">
      <div>
        <TopBar />
        <Navbar />

        <main className="max-w-[1100px] mx-auto px-4 sm:px-5 py-6 sm:py-9">
          {/* Top Header Section matching design */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* User Identity Banner */}
            <div className="flex items-start gap-4">
              {/* User Avatar Circle */}
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-black shadow-xs flex-shrink-0 bg-white"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-white flex items-center justify-center font-amiri font-bold text-2xl border border-black flex-shrink-0 shadow-xs">
                  {user.fullName ? user.fullName[0] : 'U'}
                </div>
              )}

              <div className="flex flex-col items-start">
                {/* Username Tag */}
                {user.username && (
                  <span className="text-[11px] font-mono text-stone-600 bg-[#EAE6DE] px-2 py-0.5 rounded font-semibold self-start">
                    @{user.username}
                  </span>
                )}

                {/* Greeting Heading */}
                <h1 className="font-amiri font-bold text-3xl sm:text-4xl text-black leading-tight tracking-tight mt-0.5">
                  Welcome, {user.fullName?.split(' ')[0] || 'Patron'}
                </h1>

                {/* Membership ID Badge */}
                <div className="inline-flex items-center gap-1.5 bg-[#EAE6DE] px-2.5 py-1 rounded font-mono text-xs font-bold text-black shadow-2xs mt-1.5">
                  <span>{user.membershipNumber}</span>
                  <button
                    type="button"
                    onClick={copyMembershipId}
                    title="Copy Membership ID"
                    className="text-stone-500 hover:text-black cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {copiedId && <span className="text-[10px] text-emerald-700 font-sans font-bold ml-1">Copied!</span>}
                </div>
              </div>
            </div>

            {/* Right Action Shortcuts */}
            <div className="flex items-center gap-3 self-start sm:self-center flex-wrap">
              {/* {isStaff && (
                <Link
                  prefetch
                  href="/admin"
                  className="text-xs font-sans bg-heritage-red text-white px-3.5 py-2 rounded font-bold hover:bg-black transition-colors shadow-2xs"
                >
                  Admin Desk →
                </Link>
              )} */}
              <button
                type="button"
                onClick={handleLogout}
                className="border border-black bg-white hover:bg-black hover:text-white px-4 py-2 text-xs font-sans font-bold rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>

          {/* Full-Width Crisp Horizontal Rule */}
          <div className="border-b border-black my-7 sm:my-8 w-full" />

          {/* Main Content Layout: Sidebar + Page Content */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            {/* Left Column: Fixed-Width AccountNav Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <AccountNav />
            </div>

            {/* Right Column: Page Children (Sits directly on the warm background) */}
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
