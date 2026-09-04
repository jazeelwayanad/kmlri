'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Shield, QrCode, UserCircle, CheckCircle2, Printer, Mail, Phone, Building, Calendar, Edit3 } from 'lucide-react';
import { MemberForm } from '@/components/members/MemberForm';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePrint = () => {
    window.print();
  };

  if (!user) return null;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Patron Identity Pass &amp; Credentials
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Official institutional pass for Reading Room consultation, physical stacks borrowing, and digital archive clearance.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="px-3.5 py-1.5 border border-black bg-[#F7F4EF] rounded text-xs font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save ID Pass</span>
        </button>
      </div>

      <div className="double-rule"></div>

      {saveSuccess && (
        <div className="p-3 bg-green-50 text-green-800 border border-green-300 text-xs font-semibold flex items-center gap-2 rounded">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-300 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {/* Photorealistic Archival Library Identity Pass */}
      <div className="max-w-xl mx-auto bg-gradient-to-br from-black via-zinc-900 to-black text-paper p-6 sm:p-8 border-2 border-black rounded-lg shadow-xl font-amiri relative overflow-hidden">
        {/* Subtle Watermark Overlay */}
        <div className="absolute right-0 top-0 w-56 h-56 bg-heritage-red/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header of the Card */}
        <div className="flex justify-between items-start border-b border-zinc-800 pb-4 mb-4 flex-wrap gap-3">
          <div>
            <span className="font-averia text-[10px] sm:text-xs uppercase tracking-widest text-heritage-red font-bold block">
              Kunhīn Musliyār Library &amp; Research Institute
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-0.5 tracking-tight">
              Researcher Identity Pass
            </h3>
          </div>
          <div className="w-14 h-14 bg-white p-1 rounded flex items-center justify-center flex-shrink-0 shadow">
            <QrCode className="w-full h-full text-black" />
          </div>
        </div>

        {/* Pass Top Section: Photo + Full Name */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-zinc-800">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover border-2 border-yellow-500/80 shadow-lg flex-shrink-0 bg-black"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center text-zinc-400 font-amiri font-bold text-3xl flex-shrink-0 shadow-inner">
              {user.fullName ? user.fullName[0] : 'K'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-zinc-400 font-averia uppercase tracking-wider">Member Full Name</p>
            <p className="font-amiri text-2xl sm:text-3xl font-bold text-white mt-0.5 truncate">{user.fullName}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                <Shield className="w-3 h-3 text-heritage-red" />
                <span>{user.role}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                @{user.username || 'patron'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-sans text-xs sm:text-sm">
          <div>
            <p className="text-[11px] text-zinc-400 font-averia uppercase tracking-wider">Membership Number</p>
            <p className="font-mono text-sm sm:text-base font-bold text-yellow-400 mt-0.5">{user.membershipNumber}</p>
          </div>

          <div>
            <p className="text-[11px] text-zinc-400 font-averia uppercase tracking-wider">Quota Allowance</p>
            <p className="text-xs text-zinc-200 mt-1 font-mono font-bold">
              {user.maxBorrowLimit || 10} Concurrent Volumes (14 Days)
            </p>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-6 pt-3 border-t border-zinc-800 flex justify-between items-center text-[11px] font-sans text-zinc-400 flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
            <strong className="text-green-400">VERIFIED RESEARCH FELLOW</strong>
          </span>
          <span>Valid for Academic Year 2026–2027</span>
        </div>
      </div>

      {/* Profile & Affiliation Details Form */}
      <div className="border border-black bg-white rounded p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-amiri text-2xl font-bold text-black m-0">Contact &amp; Affiliation</h3>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-bold text-heritage-red hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Info</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs font-bold text-gray-500 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        {!editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="col-span-full p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded flex items-center gap-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-black shadow flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-black text-paper flex items-center justify-center font-bold text-lg font-amiri border-2 border-black flex-shrink-0">
                  {user.fullName ? user.fullName[0] : 'P'}
                </div>
              )}
              <div>
                <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">
                  Profile Photograph
                </span>
                <p className="text-xs text-black mt-0.5">
                  {user.avatarUrl ? 'Photo is active and verified on institutional credentials.' : 'No photo uploaded. Click "Update Info" to upload a photograph.'}
                </p>
              </div>
            </div>
            <div className="p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
              <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Patron Slug / Username</span>
              <p className="font-bold text-black mt-1 font-mono">@{user.username || 'unassigned'}</p>
              <p className="text-[11px] text-heritage-muted font-mono mt-0.5">kmlri.in/user/{user.username || user.id}</p>
            </div>
            <div className="p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
              <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Institutional Email</span>
              <p className="font-bold text-black mt-1 font-mono">{user.email}</p>
            </div>
            <div className="p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
              <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Contact Phone</span>
              <p className="font-bold text-black mt-1 font-mono">{user.phone || 'Not provided'}</p>
            </div>
            <div className="p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
              <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Gender</span>
              <p className="font-bold text-black mt-1 capitalize">{user.gender || 'Not specified'}</p>
            </div>
            <div className="col-span-full p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
              <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Institution / Organization</span>
              <p className="font-bold text-black mt-1">{user.institution || user.department || 'Independent Scholar'}</p>
            </div>
            {user.researchInterest && (
              <div className="col-span-full p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
                <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Research Interests</span>
                <p className="font-bold text-black mt-1">{user.researchInterest}</p>
              </div>
            )}
            {user.address && (
              <div className="col-span-full p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
                <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Mailing / Library Address</span>
                <p className="text-black mt-1 whitespace-pre-line">{user.address}</p>
              </div>
            )}
          </div>
        ) : (
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
    </div>
  );
}
