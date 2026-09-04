'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Calendar,
  QrCode,
  Shield,
  Clock,
  Sparkles,
  Camera
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminProfilePage() {
  const { user, refreshUser } = useAuth();

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status feedback
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDesignation(user.designation || '');
      setDepartment(user.department || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setNotification(null);

    try {
      if (user?.id) {
        await api.updateUser(user.id, {
          fullName,
          email,
          phone,
          designation,
          department,
          bio,
        });
      }
      // Also update local storage cached user for immediate reflection
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('kmlri_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          const updated = { ...parsed, fullName, email, phone, designation, department, bio };
          localStorage.setItem('kmlri_user', JSON.stringify(updated));
        }
      }
      await refreshUser();
      setNotification({
        type: 'success',
        message: 'Your profile and contact details have been updated successfully!',
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update profile details.',
      });
    } finally {
      setProfileSaving(false);
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'New password and confirmation do not match.',
      });
      return;
    }
    if (newPassword.length < 8) {
      setNotification({
        type: 'error',
        message: 'New password must be at least 8 characters long.',
      });
      return;
    }

    setPasswordSaving(true);
    setNotification(null);

    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotification({
        type: 'success',
        message: 'Your account password was updated successfully. Please use the new password on your next login.',
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Could not update password.',
      });
    } finally {
      setPasswordSaving(false);
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    }
  };

  const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user?.id) return;

    setAvatarUploading(true);
    setNotification(null);
    try {
      const { url } = await api.uploadImage(file);
      await api.updateUser(user.id, { avatarUrl: url });
      setAvatarUrl(url);
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('kmlri_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          localStorage.setItem('kmlri_user', JSON.stringify({ ...parsed, avatarUrl: url }));
        }
      }
      await refreshUser();
      setNotification({ type: 'success', message: 'Profile photo updated successfully!' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to upload profile photo.' });
    } finally {
      setAvatarUploading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8 font-sans pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-averia uppercase tracking-widest text-heritage-red font-bold">
            <User className="w-4 h-4" />
            <span>Staff Account &amp; Credentials</span>
          </div>
          <h1 className="font-amiri text-4xl font-bold text-black mt-1">
            My Profile &amp; User Details
          </h1>
          <p className="text-sm text-heritage-muted mt-1 max-w-2xl">
            Manage your administrator profile, official contact details, role clearances, and security credentials.
          </p>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 border rounded-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in duration-200 ${notification.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
            }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Profile Summary Card */}
      <div className="bg-white border border-[#D6CCBC] rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-heritage-red text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white">
                {getInitials(fullName)}
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarSelected}
            />
            <button
              type="button"
              disabled={avatarUploading}
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-black text-white rounded-full hover:bg-heritage-red hover:text-white transition-colors shadow disabled:opacity-50"
              title="Update profile picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-amiri text-3xl font-bold text-black leading-none">{fullName}</h2>
              <span className="bg-black text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                {user?.role || 'SUPER_ADMIN'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Membership ID: <strong className="text-gray-900">{user?.membershipNumber}</strong> · Email: <strong className="text-gray-900">{email}</strong>
            </p>
            {designation && (
              <p className="text-xs text-heritage-muted mt-1 font-semibold">
                {designation}
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E1D6] text-xs text-gray-600 space-y-1 font-mono">
          <div><strong className="text-black">Authority:</strong> Master Institutional Admin</div>
          <div><strong className="text-black">Quota Limit:</strong> {user?.maxBorrowLimit || 50} Volumes</div>
          <div><strong className="text-black">Session:</strong> Verified SSL 256-bit</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Edit Details Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal & Professional Details Form */}
          <div className="bg-white border border-[#D6CCBC] rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h3 className="font-amiri text-2xl font-bold text-black">Edit User Details</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your contact details and professional profile shown to other staff members.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="col-span-full sm:col-span-1">
                  <label className="block font-bold text-gray-700 uppercase font-averia mb-1.5">
                    Full Name*
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-xs outline-none focus:border-black font-semibold text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="col-span-full sm:col-span-1">
                  <label className="block font-bold text-gray-700 uppercase font-averia mb-1.5">
                    Official Email Address*
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-xs outline-none focus:border-black font-semibold text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="col-span-full sm:col-span-1">
                  <label className="block font-bold text-gray-700 uppercase font-averia mb-1.5">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98470 XXXXX"
                      className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-xs outline-none focus:border-black font-semibold text-gray-900 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="col-span-full sm:col-span-1">
                  <label className="block font-bold text-gray-700 uppercase font-averia mb-1.5">
                    Official Designation / Title
                  </label>
                  <div className="relative">
                    <Sparkles className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-xs outline-none focus:border-black font-semibold text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase font-averia mb-1.5">
                    Department / Research Unit
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-xs outline-none focus:border-black font-semibold text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block font-bold text-gray-700 uppercase font-averia mb-1.5">
                    Academic Bio &amp; Research Focus
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-xs outline-none focus:border-black text-gray-900 bg-white leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-black text-white px-6 py-2.5 rounded-lg font-amiri font-bold text-base hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white border border-[#D6CCBC] rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h3 className="font-amiri text-2xl font-bold text-black">Change Security Password</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ensure your account uses a strong, unique password to prevent unauthorized staff elevation.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase font-averia mb-1.5">
                    Current Password*
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 h-10 border border-gray-300 rounded-lg text-xs outline-none focus:border-black bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase font-averia mb-1.5">
                    New Password*
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 h-10 border border-gray-300 rounded-lg text-xs outline-none focus:border-black bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase font-averia mb-1.5">
                    Confirm New Password*
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 h-10 border border-gray-300 rounded-lg text-xs outline-none focus:border-black bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="bg-heritage-red text-white px-6 py-2.5 rounded-lg font-amiri font-bold text-base hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Institutional Credentials & Clearance Card */}
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#E8E1D6] rounded-xl p-6 font-sans text-xs space-y-4">
            <h4 className="font-amiri text-2xl font-bold text-black border-b border-[#E8E1D6] pb-3">
              Privileges &amp; Security Clearance
            </h4>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 block">Root System Administrator</strong>
                  <span className="text-gray-500 leading-tight block mt-0.5">Unrestricted master clearance across circulation, repository, and server controls.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 block">Active 2FA Authentication</strong>
                  <span className="text-gray-500 leading-tight block mt-0.5">Time-based one-time password (TOTP) enabled for this session.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 block">Session Expiration Window</strong>
                  <span className="text-gray-500 leading-tight block mt-0.5">60 minutes rolling inactivity lock.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E1D6]">
              <Link
                prefetch
                href="/admin/system/security"
                className="text-heritage-red font-bold hover:underline block text-center text-xs"
              >
                Configure Security Policies →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
