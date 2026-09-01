'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountNav } from '@/components/account/AccountNav';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, Shield, Copy, LogOut, ExternalLink, Sparkles } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, login, logout, isStaff, loading: authLoading } = useAuth();
  const [identifier, setIdentifier] = useState('rashid@kmlri.in');
  const [password, setPassword] = useState('Member@123456');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid membership number, email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const copyMembershipId = () => {
    if (user?.membershipNumber) {
      navigator.clipboard.writeText(user.membershipNumber);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  if (authLoading) {
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
        {!user ? (
          /* ================= SIGNED OUT VIEW ================= */
          <div>
            <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase mb-2 sm:mb-3 font-bold">
              Institutional Access
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-14 items-start pt-2">
              <div>
                <h1 className="font-amiri text-[36px] sm:text-[52px] font-bold leading-[1.08] mb-3 sm:mb-[18px] tracking-[-0.015em]">
                  Sign in
                </h1>
                <p className="text-[16px] sm:text-[18px] text-heritage-body font-sans leading-relaxed mb-6">
                  Sign in with your membership number or registered institutional email to access loans, reservations, and reading lists.
                </p>

                {loginError && (
                  <div className="p-3.5 bg-red-50 text-heritage-red mb-5 text-sm font-sans font-semibold border border-heritage-red">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleSignIn} className="flex flex-col gap-4 sm:gap-[18px] max-w-[420px] font-sans">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">
                      Membership number or email
                    </span>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. rashid@kmlri.in or KMLRI-2026-0001"
                      className="border-[1.5px] border-black bg-white h-11 sm:h-12 px-3 sm:px-[14px] text-sm sm:text-base outline-none rounded"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">
                        Password
                      </span>
                      <Link href="/ask" className="text-xs text-heritage-red font-semibold hover:underline">
                        Forgotten password?
                      </Link>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="border-[1.5px] border-black bg-white h-11 sm:h-12 px-3 sm:px-[14px] text-sm sm:text-base outline-none rounded"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="bg-black text-paper border-none h-[46px] sm:h-[50px] rounded-full font-amiri text-[17px] sm:text-[19px] font-bold cursor-pointer mt-2 hover:bg-heritage-red hover:text-white  transition-colors disabled:opacity-50"
                  >
                    {loginLoading ? 'Signing in...' : 'Sign in to Account'}
                  </button>
                </form>

                <div className="mt-6 sm:mt-8 bg-[#F7F4EF] p-4 border border-[#D6CCBC] text-xs font-sans max-w-[420px]">
                  <p className="font-bold text-black uppercase tracking-wider mb-2 font-averia">Demo Credentials:</p>
                  <div className="space-y-1 text-heritage-body">
                    <p><strong>Admin / Staff:</strong> admin@kmlri.in / Admin@123456</p>
                    <p><strong>Patron / Researcher:</strong> rashid@kmlri.in / Member@123456</p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-black p-6 sm:p-8 md:p-10 bg-white shadow-md">
                <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase mb-2 font-bold">Membership Registry</p>
                <h2 className="font-amiri text-[26px] sm:text-[32px] font-bold mb-3">Institutional Membership</h2>
                <p className="text-[16px] sm:text-[18px] leading-[1.55] text-heritage-body mb-6 font-sans">
                  Membership gives scholars and students borrowing rights across general and rare collections, remote access to the digital manuscript reading room, and reserved research desks.
                </p>

                <div className="space-y-3 font-sans text-xs sm:text-sm text-heritage-body border-t border-[#D6CCBC] pt-4 sm:pt-6 mb-6">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-heritage-red flex-shrink-0" />
                    <span>Borrow up to 10 volumes from print &amp; periodical stacks</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-heritage-red flex-shrink-0" />
                    <span>High-resolution folio reproductions &amp; codicological scans</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-heritage-red flex-shrink-0" />
                    <span>Assigned quiet study carrels in the Rare Reading Room</span>
                  </div>
                </div>

                <Link
                  href="/ask"
                  className="inline-block border-[1.5px] border-black font-amiri font-bold text-[16px] sm:text-[18px] py-2 sm:py-2.5 px-5 sm:px-7 rounded-full hover:bg-black hover:text-paper transition-colors"
                >
                  Request or Renew Membership →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ================= SIGNED IN: HERO PATRON PASS BANNER & SUBPAGES ================= */
          <div className="space-y-6">
            {/* Top Patron Banner Card */}
            <div className="bg-white border-2 border-black p-5 sm:p-7 shadow-sm rounded-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  {/* Patron Monogram Crest */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-paper flex items-center justify-center font-amiri font-bold text-2xl sm:text-3xl border-2 border-heritage-red flex-shrink-0 shadow-inner">
                    {user.fullName ? user.fullName[0] : 'K'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-averia text-[11px] sm:text-xs uppercase tracking-widest text-heritage-muted font-bold">
                        Central Research Reading Room
                      </span>
                      <span className="text-[10px] bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded font-sans font-bold uppercase">
                        Active Patron
                      </span>
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

                      <span>·</span>
                      <span className="flex items-center gap-1 font-semibold text-black uppercase">
                        <Shield className="w-3.5 h-3.5 text-heritage-red" />
                        <span>{user.role}</span>
                      </span>
                      <span>·</span>
                      <span className="text-heritage-muted">Quota: {user.maxBorrowLimit || 10} Concurrent Items</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Shortcuts */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-start md:self-center">
                  {isStaff && (
                    <Link
                      href="/admin"
                      className="bg-heritage-red text-white h-[36px] sm:h-[40px] px-3.5 sm:px-4 flex items-center justify-center rounded font-amiri font-bold text-[15px] sm:text-[17px] hover:bg-black transition-colors shadow-sm"
                    >
                      Admin Desk →
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="h-[36px] sm:h-[40px] px-4 sm:px-5 border border-black bg-white flex items-center justify-center gap-1.5 font-amiri text-[15px] sm:text-[16px] font-semibold hover:bg-black hover:text-paper transition-colors rounded cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Layout: Redesigned Sidebar + Main Child Viewport */}
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
        )}
      </section>

      <Footer />
    </div>
  );
}
