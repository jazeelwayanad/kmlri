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
      <div className="min-h-screen bg-paper text-black">
        <TopBar />
        <Navbar />
        <section className="max-w-[1100px] mx-auto pt-16 sm:pt-24 pb-24 sm:pb-32 px-5 text-center font-amiri text-xl sm:text-2xl">
          Verifying patron credentials...
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-black">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-10 px-5 pb-16 sm:pb-24">
        <div className="space-y-6">
          {/* Top Patron Banner Card */}
          <div className="bg-white border-2 border-black p-5 sm:p-7 shadow-sm rounded-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                {/* Patron Avatar / Monogram */}
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-black shadow-inner flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-paper flex items-center justify-center font-amiri font-bold text-2xl sm:text-3xl border-2 border-heritage-red flex-shrink-0 shadow-inner">
                    {user.fullName ? user.fullName[0] : 'K'}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                
                    {user.username && (
                      <span className="text-[11px] font-mono text-heritage-muted bg-black/5 px-2 py-0.5 rounded">
                        @{user.username}
                      </span>
                    )}
                  </div>

                  <h1 className="font-amiri text-[28px] sm:text-[36px] md:text-[40px] font-bold leading-tight text-black mt-0.5">
                    Welcome, {user.fullName.split(' ')[0]}
                  </h1>

                  <div className="flex items-center gap-3 text-xs sm:text-sm font-sans text-heritage-body flex-wrap mt-1">
                    <div className="flex items-center gap-1 bg-[#F7F4EF] border border-[#D6CCBC] px-2 py-0.5 rounded font-mono font-bold text-black">
                      <span>{user.membershipNumber}</span>
                      <button
                        type="button"
                        onClick={copyMembershipId}
                        title="Copy Membership ID"
                        className="text-gray-500 hover:text-black"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    {copiedId && <span className="text-xs text-heritage-red font-semibold">Copied!</span>}



                  </div>
                </div>
              </div>

              {/* Right Action Shortcuts */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-start md:self-center">
                {isStaff && (
                  <Link
                    prefetch
                    href="/admin"
                    className="bg-heritage-red text-white h-[36px] sm:h-[40px] px-3.5 sm:px-4 flex items-center justify-center rounded font-amiri font-bold text-[15px] sm:text-[17px] hover:bg-black transition-colors shadow-sm"
                  >
                    Admin Desk →
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-[36px] sm:h-[40px] px-4 sm:px-5 border border-black bg-white flex items-center justify-center gap-1.5 font-amiri text-[15px] sm:text-[16px] font-semibold hover:bg-black hover:text-paper transition-colors rounded cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Layout: Sidebar + Main Child Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
            <div className="lg:col-span-1">
              <AccountNav />
            </div>
            <div className="lg:col-span-3 min-w-0">
              <div className="bg-white border-2 border-black p-5 sm:p-8 shadow-sm rounded-sm min-h-[500px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
