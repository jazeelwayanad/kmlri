'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  Edit3,
  Shield,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { MemberForm } from '@/components/members/MemberForm';
import { api } from '@/lib/api';
import { getMemberIdentifier } from '@/lib/slugs';
import { LoadingState } from '@/components/ui/LoadingSpinner';

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string;

  const [member, setMember] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const [userData, rolesList] = await Promise.all([
          api.getUser(memberId),
          api.getRoles().catch(() => []),
        ]);
        if (isMounted) {
          setMember(userData);
          setRoles(rolesList || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load member details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  const handleSuccess = (updatedUser: any) => {
    const identifier = getMemberIdentifier(updatedUser || member) || memberId;
    router.push(`/admin/members/${identifier}`);
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingState message="Loading member profile..." />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6 font-sans max-w-4xl mx-auto pb-16">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/admin/members" className="hover:text-gray-900 transition-colors">
            Members
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">Edit Member</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E0DB] p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Member Not Found</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {error || 'Unable to locate member record for editing.'}
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/admin/members"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors"
            >
              Back to Members Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const memberIdentifier = getMemberIdentifier(member);

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto pb-20">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/admin/members" className="hover:text-[#A52307] transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Members
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href={`/admin/members/${memberIdentifier}`} className="hover:text-[#A52307] transition-colors font-medium">
            {member.fullName}
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">Edit Profile</span>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-[#FAF8F5] border border-[#E2E0DB] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#A52307] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Edit Member Record
            </span>
            <span className="text-xs text-gray-500 font-mono">
              ID: {member.membershipNumber || member.id}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {member.fullName}
          </h1>
          <p className="text-xs text-gray-600 mt-0.5 font-mono">
            {member.email} · {member.role || 'STUDENT'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600 bg-white px-3.5 py-2.5 rounded-lg border border-[#E2E0DB] shadow-sm flex-shrink-0">
          <Shield className="w-4 h-4 text-[#A52307]" />
          <span>
            Status: <strong className={member.status === 'ACTIVE' ? 'text-emerald-700' : 'text-heritage-red'}>{member.status}</strong>
          </span>
        </div>
      </div>

      {/* Member Form Card */}
      <div className="bg-white border border-[#E2E0DB] rounded-xl shadow-sm p-6 sm:p-8">
        <MemberForm
          mode="admin-edit"
          initialData={member}
          rolesList={roles}
          submitButtonText="Save Member Changes"
          onSuccess={handleSuccess}
          onCancel={() => router.push(`/admin/members/${memberIdentifier}`)}
        />
      </div>
    </div>
  );
}
