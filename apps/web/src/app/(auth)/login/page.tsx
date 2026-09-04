'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/auth-context';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

function LoginForm() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (redirectUrl) {
        router.replace(redirectUrl);
      } else {
        router.replace(`/${user.username || user.id}`);
      }
    }
  }, [user, authLoading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
      // AuthProvider updates user state, which triggers useEffect redirect
    } catch (err: any) {
      setError(err?.message || 'Invalid membership number, email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError('');
  };

  // Prevent logged-in users from seeing the sign-in form
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

        <main className="max-w-[1100px] mx-auto pt-10 sm:pt-16 pb-20 sm:pb-28 px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left Column: Sign In Form */}
            <div className="max-w-[420px] w-full">
              <p className="font-averia text-[13px] tracking-wide text-[#78716C] mb-1 font-normal">
                My Account
              </p>
              <h1 className="font-amiri text-[44px] font-bold text-black leading-tight mb-6 tracking-tight">
                Sign in
              </h1>

              {error && (
                <div className="p-3 bg-red-50 text-heritage-red border border-heritage-red/40 text-xs font-sans font-semibold rounded mb-5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-[13px] text-[#78716C] font-normal mb-1.5"
                  >
                    Membership number or email
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full border border-black bg-transparent h-[44px] px-3.5 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-[13px] text-[#78716C] font-normal mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-black bg-transparent h-[44px] px-3.5 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-black text-white h-[44px] rounded-full font-amiri font-bold text-[16px] hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mt-4">
                <Link
                  prefetch
                  href="/ask"
                  className="text-[#C2410C] font-serif text-sm hover:underline inline-block"
                >
                  Forgotten your password?
                </Link>
              </div>


            </div>

            {/* Right Column: "Not a member yet?" Card */}
            <div className="w-full flex justify-start md:justify-end sticky top-10">
              <div className="border border-black p-8 sm:p-10 rounded-[2px] bg-transparent max-w-[460px] w-full">
                <h2 className="font-amiri text-[28px] font-bold text-black mb-3 leading-snug">
                  Not a member yet?
                </h2>
                <p className="text-[#57534E] text-[15px] font-sans leading-relaxed mb-8">
                  Membership gives you borrowing rights, remote access to the digital reading room and a reserved desk on request.
                </p>
                <Link
                  prefetch
                  href="/signup"
                  className="inline-block border border-black rounded-full px-6 py-2 text-black font-amiri font-bold text-[15px] hover:bg-black hover:text-paper transition-colors"
                >
                  Become a member
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center font-amiri text-lg">
          Loading sign-in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
