'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { NotificationProvider } from '@/lib/notification-store';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Shield, ShieldAlert, ArrowLeft, LogOut, UserCircle, AlertCircle } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, login, logout, isStaff, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [identifier, setIdentifier] = useState('admin@kmlri.in');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator or staff credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] font-sans text-lg text-gray-500">
        Verifying staff credentials...
      </div>
    );
  }

  // If user is not logged in, render the clean Admin login form in-place (no URL redirection!)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-xl p-8 sm:p-10 max-w-md w-full border border-gray-200 shadow-2xl">
          <div className="text-center mb-8">

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              kmlri Admin Panel
            </h1>
            <p className="text-xs text-gray-500 mt-2">
              Staff access for circulation desk, cataloging repository, and member controls.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-heritage-red mb-6 text-xs font-semibold rounded-lg ring-1 ring-inset ring-red-600/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="flex flex-col gap-4 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                Staff Email or Membership #
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. admin@kmlri.in or librarian@kmlri.in"
                className="border border-gray-200 bg-white h-11 px-3 text-sm outline-none rounded-lg focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-gray-200 bg-white h-11 px-3 text-sm outline-none rounded-lg focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="bg-heritage-red text-white h-11 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer mt-2"
            >
              {submitting ? 'Authenticating...' : 'Sign in to Librarian Desk'}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <Link prefetch href="/" className="hover:underline text-gray-900 flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3 h-3" />
              <span>Public Website</span>
            </Link>
            <span className="font-mono text-[10px] text-gray-400">KMLRI Secure RBAC</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in but has patron role and no admin clearance
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-white rounded-xl border border-gray-200 p-8 md:p-10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-50 text-heritage-red rounded-full flex items-center justify-center mx-auto mb-5 ring-1 ring-inset ring-red-600/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Restricted: Staff Area
          </h1>
          <p className="text-xs uppercase tracking-widest text-heritage-red font-bold mb-4">
            Librarian &amp; Admin Clearance Required
          </p>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-left text-sm mb-6">
            <div className="flex items-center gap-2 mb-2 font-bold text-gray-900">
              <UserCircle className="w-4 h-4 text-heritage-red" />
              <span>Current Session: {user.fullName}</span>
            </div>
            <p className="text-xs text-gray-500 mb-1">
              <strong>Membership ID:</strong> {user.membershipNumber}
            </p>
            <p className="text-xs text-gray-500">
              <strong>Account Privilege Level:</strong> <span className="uppercase text-heritage-red font-semibold">{user.role}</span>
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            You are signed in with patron privileges. Access to the circulation desk, cataloging repository, and member controls requires administrator elevation. User roles and permissions can be updated by an Institute Administrator from the Admin Panel.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm font-semibold">
            <Link prefetch
              href={user ? `/user/${user.username || user.id}` : '/login'}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-heritage-red hover:text-white  transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Patron Portal</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#F3F3F1] flex font-sans text-[rgb(20,20,20)]">
        <AdminSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />
          <main className="p-6 sm:p-10 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  );
}
