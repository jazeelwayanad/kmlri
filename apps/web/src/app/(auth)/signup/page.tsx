'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/auth-context';
import { MemberForm } from '@/components/members/MemberForm';
import { CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(`/user/${user.username || user.id}`);
    }
  }, [user, authLoading, router]);

  const handleSignupSuccess = async (res: any) => {
    await refreshUser();
    const slug = res?.user?.username || res?.user?.id || user?.username || user?.id;
    if (slug) {
      router.replace(`/user/${slug}`);
    } else {
      router.replace('/login');
    }
  };

  // Prevent logged-in users from seeing the signup form
  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-amiri text-lg text-black">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p>{user ? 'Redirecting to your account dashboard...' : 'Verifying patron session...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-black flex flex-col justify-between">
      <div>
        <TopBar />
        <Navbar />

        <main className="max-w-[1100px] mx-auto pt-10 sm:pt-14 pb-20 sm:pb-28 px-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Unified Member Registration Form */}
            <div className="lg:col-span-8">
              <p className="font-averia text-[13px] tracking-wide text-[#78716C] mb-1 font-normal">
                Institutional Membership Registry
              </p>
              <h1 className="font-amiri text-[38px] sm:text-[44px] font-bold text-black leading-tight mb-3 tracking-tight">
                Become a member
              </h1>
              <p className="text-[15px] text-[#57534E] font-sans leading-relaxed mb-6">
                Register as an institutional member or independent researcher to gain borrowing rights, reserved study carrels, and access to digitized archival folios.
              </p>

              <MemberForm
                mode="signup"
                submitButtonText="Become a member"
                onSuccess={handleSignupSuccess}
              />
            </div>

            {/* Right Column: "Already a member?" Card & Patron Privileges */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border border-black p-6 sm:p-8 rounded-[2px] bg-transparent">
                <h2 className="font-amiri text-[26px] font-bold text-black mb-3 leading-snug">
                  Already a member?
                </h2>
                <p className="text-[#57534E] text-[14px] font-sans leading-relaxed mb-6">
                  If you already hold an institutional membership or patron credentials, sign in to your dashboard.
                </p>
                <Link
                  prefetch
                  href="/login"
                  className="inline-block border border-black rounded-full px-6 py-2 text-black font-amiri font-bold text-[15px] hover:bg-black hover:text-paper transition-colors"
                >
                  Sign in
                </Link>
              </div>

              <div className="border border-[#D6CCBC] p-6 rounded-[2px] bg-white/50 text-xs font-sans space-y-3.5">
                <p className="font-averia uppercase tracking-widest text-[#78716C] font-bold text-[11px]">
                  Membership Privileges
                </p>
                <div className="flex items-start gap-2.5 text-[#44403C]">
                  <CheckCircle2 className="w-4 h-4 text-heritage-red flex-shrink-0 mt-0.5" />
                  <span>Borrow up to 5 to 10 volumes across general and rare print stacks.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[#44403C]">
                  <CheckCircle2 className="w-4 h-4 text-heritage-red flex-shrink-0 mt-0.5" />
                  <span>Remote access to high-resolution Arabi-Malayalam digital manuscripts.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[#44403C]">
                  <CheckCircle2 className="w-4 h-4 text-heritage-red flex-shrink-0 mt-0.5" />
                  <span>Assigned research carrel desk at the Central Reading Room.</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
