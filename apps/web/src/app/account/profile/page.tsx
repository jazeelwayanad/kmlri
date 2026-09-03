'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Shield, QrCode, UserCircle, CheckCircle2, Printer, Mail, Phone, Building, Calendar, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [affiliation, setAffiliation] = useState(user?.department || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.updateMyProfile({ phone, department: affiliation });
      await refreshUser();
      setSaveSuccess('Contact details updated successfully.');
      setEditing(false);
      setTimeout(() => setSaveSuccess(''), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to update contact details.');
    } finally {
      setSaving(false);
    }
  };

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

        {/* Card Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-sans text-xs sm:text-sm">
          <div>
            <p className="text-[11px] text-zinc-400 font-averia uppercase tracking-wider">Member Full Name</p>
            <p className="font-amiri text-xl sm:text-2xl font-bold text-white mt-0.5">{user.fullName}</p>
          </div>

          <div>
            <p className="text-[11px] text-zinc-400 font-averia uppercase tracking-wider">Membership Number</p>
            <p className="font-mono text-sm sm:text-base font-bold text-yellow-400 mt-0.5">{user.membershipNumber}</p>
          </div>

          <div>
            <p className="text-[11px] text-zinc-400 font-averia uppercase tracking-wider">Privilege Tier</p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-white mt-1 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              <Shield className="w-3.5 h-3.5 text-heritage-red" />
              <span>{user.role}</span>
            </div>
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
            <div className="p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
              <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Institutional Email</span>
              <p className="font-bold text-black mt-1 font-mono">{user.email}</p>
            </div>
            <div className="p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
              <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Contact Phone</span>
              <p className="font-bold text-black mt-1 font-mono">{phone}</p>
            </div>
            <div className="col-span-full p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded">
              <span className="text-[11px] text-heritage-muted font-bold uppercase font-averia block">Academic Affiliation</span>
              <p className="font-bold text-black mt-1">{affiliation}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveContact} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                  Affiliated Department / College
                </label>
                <input
                  type="text"
                  required
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
