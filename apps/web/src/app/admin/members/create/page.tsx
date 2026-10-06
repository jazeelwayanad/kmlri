'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  UserPlus,
  Shield,
  Users,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { MemberForm } from '@/components/members/MemberForm';
import { api } from '@/lib/api';
import { getMemberIdentifier } from '@/lib/slugs';
import { LoadingState } from '@/components/ui/LoadingSpinner';

export default function CreateMemberPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const rolesList = await api.getRoles().catch(() => []);
        if (isMounted) {
          setRoles(rolesList || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load roles list.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSuccess = (createdUser: any) => {
    const identifier = getMemberIdentifier(createdUser) || createdUser?.id;
    if (identifier) {
      router.push(`/admin/members/${identifier}`);
    } else {
      router.push('/admin/members');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingState message="Loading member registration form..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto pb-20">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/admin/members" className="hover:text-[#A52307] transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Members
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">New Registration</span>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-[#FAF8F5] border border-[#E2E0DB] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#A52307] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Patron Enrollment
            </span>
            <span className="text-xs text-gray-500 font-mono">
              Directory &amp; Circulation Access
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Register New Member
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Enroll a new reader, researcher, faculty scholar, or library patron with institutional credentials and borrowing quotas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600 bg-white px-3.5 py-2.5 rounded-lg border border-[#E2E0DB] shadow-sm flex-shrink-0">
          <Shield className="w-4 h-4 text-[#A52307]" />
          <span>
            Standard Quota: <strong className="text-gray-900">5 Books</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Member Form Card */}
      <div className="bg-white border border-[#E2E0DB] rounded-xl shadow-sm p-6 sm:p-8">
        <MemberForm
          mode="admin-create"
          rolesList={roles}
          submitButtonText="Create Member Record"
          onSuccess={handleSuccess}
          onCancel={() => router.push('/admin/members')}
        />
      </div>
    </div>
  );
}
