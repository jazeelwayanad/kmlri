'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, Edit3, X, Copy } from 'lucide-react';
import { MemberForm } from '@/components/members/MemberForm';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(false);

  if (!user) return null;

  const copyPublicUrl = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/user/${user.username || user.id}`;
      navigator.clipboard.writeText(url);
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Title and Edit Action */}
      <div className="flex justify-between items-baseline flex-wrap gap-4">
        <div>
          <h2 className="font-amiri text-3xl sm:text-[34px] font-bold text-black m-0 leading-tight">
            Profile &amp; Identity
          </h2>
          <p className="text-xs text-stone-600 mt-1 font-sans">
            Personal identity, institutional affiliation, and account details.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-4 py-2 border border-black bg-white hover:bg-black hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Details</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 border border-stone-300 bg-white hover:bg-stone-100 rounded text-xs font-bold text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Oxford Double-Line Divider Rule */}
      <div className="border-t-2 border-b border-black py-0.5 my-6 w-full" />

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-semibold flex items-center gap-2 rounded">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {!editing ? (
        <div className="space-y-6">
          {/* Top Identity Row: Avatar + Name + Core Badges */}
          <div className="flex items-start gap-4 sm:gap-5 pb-2">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-black shadow-xs flex-shrink-0 bg-white"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black text-white flex items-center justify-center font-bold text-2xl font-amiri border border-black flex-shrink-0 shadow-xs">
                {user.fullName ? user.fullName[0] : 'U'}
              </div>
            )}

            <div className="flex flex-col items-start min-w-0">
              <h3 className="font-amiri font-bold text-2xl sm:text-3xl text-black leading-tight truncate">
                {user.fullName}
              </h3>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {user.username && (
                  <span className="text-[11px] font-mono text-stone-600 bg-[#EAE6DE] px-2 py-0.5 rounded font-semibold">
                    @{user.username}
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-black px-2 py-0.5 rounded font-bold">
                  {user.role}
                </span>
                <span className="text-[11px] font-mono font-bold text-stone-800 bg-[#EAE6DE] px-2 py-0.5 rounded">
                  {user.membershipNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Dividing Rule */}
          <div className="border-t border-stone-300 w-full" />

          {/* Simple Clean Specification Details (No boxed tiles or cards) */}
          <div className="space-y-4 text-xs sm:text-sm font-serif">
            {/* Membership ID */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-44 sm:w-56 flex-shrink-0 font-normal">
                Membership Number
              </span>
              <span className="text-stone-900 font-mono font-bold text-xs sm:text-sm">
                {user.membershipNumber}
              </span>
            </div>

            {/* Username */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-44 sm:w-56 flex-shrink-0 font-normal">
                Username / Slug
              </span>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-stone-900 flex-wrap">
                <span>@{user.username || 'unassigned'}</span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-600 text-xs">/user/{user.username || user.id}</span>
                <button
                  type="button"
                  onClick={copyPublicUrl}
                  title="Copy Profile URL"
                  className="text-stone-500 hover:text-black cursor-pointer inline-flex items-center gap-1 font-sans text-xs"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSlug ? 'Copied!' : 'Copy link'}</span>
                </button>
              </div>
            </div>

            {/* Institutional Email */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-44 sm:w-56 flex-shrink-0 font-normal">
                Institutional Email
              </span>
              <span className="text-stone-900 font-mono text-xs sm:text-sm">
                {user.email}
              </span>
            </div>

            {/* Contact Phone */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-44 sm:w-56 flex-shrink-0 font-normal">
                Contact Phone
              </span>
              <span className="text-stone-900 font-mono text-xs sm:text-sm">
                {user.phone || '—'}
              </span>
            </div>

            {/* Gender */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-44 sm:w-56 flex-shrink-0 font-normal">
                Gender
              </span>
              <span className="text-stone-900 font-serif capitalize text-xs sm:text-sm">
                {user.gender || '—'}
              </span>
            </div>

            {/* Institution / Organization */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-44 sm:w-56 flex-shrink-0 font-normal">
                Institution / Organization
              </span>
              <span className="text-stone-900 font-serif text-xs sm:text-sm font-medium">
                {user.institution || user.department || 'Independent Scholar'}
              </span>
            </div>

            {/* Research Interests */}
            {user.researchInterest && (
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-44 sm:w-56 flex-shrink-0 font-normal">
                  Research Interests
                </span>
                <span className="text-stone-900 font-serif text-xs sm:text-sm leading-relaxed">
                  {user.researchInterest}
                </span>
              </div>
            )}

            {/* Mailing Address */}
            {user.address && (
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-44 sm:w-56 flex-shrink-0 font-normal">
                  Mailing / Library Address
                </span>
                <span className="text-stone-900 font-serif text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                  {user.address}
                </span>
              </div>
            )}

            {/* Borrowing Limit */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-44 sm:w-56 flex-shrink-0 font-normal">
                Borrowing Quota
              </span>
              <span className="text-stone-900 font-serif text-xs sm:text-sm">
                {user.maxBorrowLimit || 5} concurrent volumes
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Details Form */
        <div className="pt-2">
          <MemberForm
            mode="patron-edit"
            initialData={user}
            onCancel={() => setEditing(false)}
            onSuccess={async () => {
              await refreshUser();
              setSaveSuccess('Profile details updated successfully.');
              setEditing(false);
              setTimeout(() => setSaveSuccess(''), 3500);
            }}
          />
        </div>
      )}
    </div>
  );
}
