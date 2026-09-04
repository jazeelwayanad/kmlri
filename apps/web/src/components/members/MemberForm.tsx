'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api, User } from '@/lib/api';
import {
  Eye,
  EyeOff,
  User as UserIcon,
  Camera,
  AlertCircle,
  CheckCircle2,
  Shield,
  Users,
  Building,
  Mail,
  Phone,
  Lock,
  Sparkles
} from 'lucide-react';

export type MemberFormMode = 'signup' | 'admin-create' | 'admin-edit' | 'patron-edit' | 'relative';

export interface MemberFormProps {
  mode: MemberFormMode;
  initialData?: Partial<User> | null;
  guarantorId?: string;
  guarantorName?: string;
  rolesList?: any[];
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  className?: string;
}

export function MemberForm({
  mode,
  initialData,
  guarantorId,
  guarantorName,
  rolesList = [],
  onSuccess,
  onCancel,
  submitButtonText,
  className = '',
}: MemberFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [usernameEdited, setUsernameEdited] = useState(Boolean(initialData?.username));
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [institution, setInstitution] = useState(initialData?.institution || initialData?.department || '');
  const [gender, setGender] = useState(initialData?.gender || '');
  const [researchInterest, setResearchInterest] = useState(initialData?.researchInterest || '');

  // Admin & Relative Fields
  const [role, setRole] = useState(initialData?.role || 'STUDENT');
  const [membershipNumber, setMembershipNumber] = useState(
    initialData?.membershipNumber || (mode === 'admin-create' || mode === 'relative' ? `MEM-${Date.now().toString().slice(-4)}` : '')
  );
  const [maxBorrowLimit, setMaxBorrowLimit] = useState(initialData?.maxBorrowLimit || 5);
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'EXPIRED'>(
    initialData?.status || 'ACTIVE'
  );
  const [relationship, setRelationship] = useState(initialData?.relationship || (mode === 'relative' ? 'Child' : ''));

  // Password Fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Image & Upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(initialData?.avatarUrl || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Roles lookup if not provided
  const [availableRoles, setAvailableRoles] = useState<any[]>(rolesList);
  useEffect(() => {
    if (availableRoles.length === 0 && (mode === 'admin-create' || mode === 'admin-edit' || mode === 'relative')) {
      api.getRoles().then(setAvailableRoles).catch(() => []);
    }
  }, [mode, availableRoles.length]);

  // Sync initialData changes
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setUsername(initialData.username || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
      setInstitution(initialData.institution || initialData.department || '');
      setGender(initialData.gender || '');
      setResearchInterest(initialData.researchInterest || '');
      setAvatarPreview(initialData.avatarUrl || '');
      if (initialData.role) setRole(initialData.role);
      if (initialData.membershipNumber) setMembershipNumber(initialData.membershipNumber);
      if (initialData.maxBorrowLimit) setMaxBorrowLimit(initialData.maxBorrowLimit);
      if (initialData.status) setStatus(initialData.status);
      if (initialData.relationship) setRelationship(initialData.relationship);
    }
  }, [initialData]);

  // Status & Feedback
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Autogenerate username from full name if not manually edited
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);

    if (!usernameEdited) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setUsername(slug);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameEdited(true);
    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(cleaned);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile image must be less than 5MB.');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validations
    if (!fullName.trim()) {
      setError('Please provide the member full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    // Password validation for create modes
    const requiresPassword = mode === 'signup' || ((mode === 'admin-create' || mode === 'relative') && password.length > 0);
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (requiresPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password field.');
      return;
    }
    if (mode === 'admin-edit' && changePasswordOpen) {
      if (password.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);

    try {
      // 1. Upload Avatar if selected
      let finalAvatarUrl = avatarPreview;
      if (avatarFile) {
        setUploadingImage(true);
        try {
          const uploadRes = await api.uploadImage(avatarFile, 'avatars');
          if (uploadRes?.url) {
            finalAvatarUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn('Server avatar upload failed, falling back to data URL:', uploadErr);
          try {
            finalAvatarUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(avatarFile);
            });
          } catch {}
        } finally {
          setUploadingImage(false);
        }
      }

      // 2. Prepare payload
      const payload: any = {
        fullName: fullName.trim(),
        username: username.trim() || undefined,
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        institution: institution.trim() || undefined,
        gender: gender || undefined,
        researchInterest: researchInterest.trim() || undefined,
        avatarUrl: finalAvatarUrl || undefined,
      };

      if (mode === 'admin-create' || mode === 'admin-edit' || mode === 'relative') {
        payload.role = role;
        payload.status = status;
        payload.maxBorrowLimit = Number(maxBorrowLimit);
        if (membershipNumber.trim()) payload.membershipNumber = membershipNumber.trim();
      }

      if (mode === 'relative') {
        payload.relationship = relationship;
        if (guarantorId) payload.guarantorId = guarantorId;
      }

      // Password attachment
      if (password) {
        payload.password = password;
      } else if (mode === 'admin-create' || mode === 'relative') {
        payload.password = 'Member@123456'; // Default temporary password if staff didn't specify one
      }

      // 3. Dispatch action based on mode
      let resultUser: any = null;

      if (mode === 'signup') {
        resultUser = await api.register(payload);
      } else if (mode === 'admin-create' || mode === 'relative') {
        resultUser = await api.register(payload);
      } else if (mode === 'admin-edit') {
        if (!initialData?.id) throw new Error('Member ID is missing for update');
        resultUser = await api.updateUser(initialData.id, payload);
      } else if (mode === 'patron-edit') {
        resultUser = await api.updateMyProfile({
          fullName: payload.fullName,
          phone: payload.phone,
          department: payload.institution,
          avatarUrl: payload.avatarUrl,
          address: payload.address,
          institution: payload.institution,
          gender: payload.gender,
          researchInterest: payload.researchInterest,
          username: payload.username,
        } as any);
      }

      if (onSuccess) {
        onSuccess(resultUser);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save member information.');
    } finally {
      setSubmitting(false);
    }
  };

  const defaultSubmitText =
    submitButtonText ||
    (mode === 'signup'
      ? 'Become a member'
      : mode === 'admin-create'
      ? 'Create Member Record'
      : mode === 'relative'
      ? 'Register & Link Relative'
      : 'Save Member Details');

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 font-sans text-xs ${className}`}>
      {/* Relative Mode Banner */}
      {mode === 'relative' && guarantorName && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>
            Adding relative linked to primary patron: <strong>{guarantorName}</strong>
          </span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-heritage-red border border-heritage-red/40 text-xs font-sans font-semibold rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Patron Photograph / Avatar */}
      <div className="p-4 bg-white/70 border border-black/80 rounded-[3px]">
        <label className="block text-[11px] font-averia uppercase tracking-wider text-[#78716C] font-bold mb-3">
          Patron Profile Photograph
        </label>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-black shadow"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EAE3D8] border-2 border-dashed border-black/60 flex flex-col items-center justify-center text-heritage-muted shadow-inner">
                <UserIcon className="w-7 h-7 sm:w-8 sm:h-8 text-black/40" />
                <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Photo</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-black text-white rounded-full hover:bg-heritage-red transition shadow cursor-pointer"
              title="Upload Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 border border-black rounded text-xs font-bold font-serif hover:bg-black hover:text-white transition cursor-pointer"
            >
              {avatarPreview ? 'Change Photo' : 'Upload Profile Image'}
            </button>
            <p className="text-[11px] text-[#78716C]">
              JPG, PNG, or WebP. Displayed on the patron ID pass and circulation desk records.
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
        </div>
      </div>

      {/* 2. Full Name & Username Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="formFullName" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
            Full Name <span className="text-heritage-red">*</span>
          </label>
          <input
            id="formFullName"
            type="text"
            required
            value={fullName}
            onChange={handleFullNameChange}
            placeholder="e.g. Dr. Ahmed Hassan"
            className="w-full border border-black bg-transparent h-[42px] px-3.5 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
          />
        </div>

        <div>
          <label htmlFor="formUsername" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
            Username<span className="text-heritage-red">*</span>
          </label>
          <input
            id="formUsername"
            type="text"
            required
            value={username}
            onChange={handleUsernameChange}
            placeholder="e.g. ahmed-hassan"
            className="w-full border border-black bg-transparent h-[42px] px-3.5 rounded-[3px] text-black font-mono text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
          />
         
        </div>
      </div>

      {/* 3. Email Address & Single Phone Number (NO Country Code Selector) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="formEmail" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
            Email Address <span className="text-heritage-red">*</span>
          </label>
          <input
            id="formEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="scholar@kmlri.in"
            className="w-full border border-black bg-transparent h-[42px] px-3.5 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
          />
        </div>

        <div>
          <label htmlFor="formPhone" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
            Phone Number
          </label>
          <input
            id="formPhone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full border border-black bg-transparent h-[42px] px-3.5 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
          />
        </div>
      </div>

      {/* 4. Institution & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="formInstitution" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
            Institution / University / Organization
          </label>
          <input
            id="formInstitution"
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. University of Calicut / Independent Scholar"
            className="w-full border border-black bg-transparent h-[42px] px-3.5 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
          />
        </div>

        <div>
          <label htmlFor="formGender" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
            Gender
          </label>
          <select
            id="formGender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border border-black bg-transparent h-[42px] px-3 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black cursor-pointer"
          >
            <option value="" className="text-gray-500 bg-white">Select Gender</option>
            <option value="Male" className="text-black bg-white">Male</option>
            <option value="Female" className="text-black bg-white">Female</option>
            <option value="Non-binary / Other" className="text-black bg-white">Non-binary / Other</option>
            <option value="Prefer not to say" className="text-black bg-white">Prefer not to say</option>
          </select>
        </div>
      </div>

      {/* 5. Mailing Address */}
      <div>
        <label htmlFor="formAddress" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
          Mailing &amp; Residential Address
        </label>
        <textarea
          id="formAddress"
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Postal address for official notices and library correspondence"
          className="w-full border border-black bg-transparent p-3 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors resize-y"
        />
      </div>

      {/* 6. Research Interests */}
      <div>
        <label htmlFor="formResearchInterest" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
          Research Interests / Academic Fields
        </label>
        <input
          id="formResearchInterest"
          type="text"
          value={researchInterest}
          onChange={(e) => setResearchInterest(e.target.value)}
          placeholder="e.g. Arabi-Malayalam Codicology, Shafi'i Jurisprudence, Malabar Maritime History"
          className="w-full border border-black bg-transparent h-[42px] px-3.5 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
        />
      </div>

      {/* 7. Relative-Specific Relationship Selector */}
      {mode === 'relative' && (
        <div className="p-4 bg-[#F7F4EF] border border-[#D6CCBC] rounded-[3px]">
          <label htmlFor="formRelationship" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
            Relationship to Primary Member <span className="text-heritage-red">*</span>
          </label>
          <select
            id="formRelationship"
            required
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full border border-black bg-white h-[42px] px-3 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black cursor-pointer font-medium"
          >
            <option value="Child">Child / Dependent</option>
            <option value="Spouse">Spouse</option>
            <option value="Parent">Parent / Guardian</option>
            <option value="Sibling">Sibling</option>
            <option value="Academic Supervisor">Academic Supervisor</option>
            <option value="Research Scholar">Research Scholar / Supervisee</option>
            <option value="Colleague">Institutional Colleague</option>
            <option value="Other">Other Relation</option>
          </select>
        </div>
      )}

      {/* 8. Admin Controls (Role, Card Number, Quota, Status) */}
      {(mode === 'admin-create' || mode === 'admin-edit' || mode === 'relative') && (
        <div className="p-4 bg-[#F7F4EF] border border-black rounded-[3px] space-y-4">
          <p className="font-averia uppercase tracking-wider text-[11px] font-bold text-black flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-heritage-red" />
            <span>Circulation &amp; Institutional Governance</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] uppercase font-bold text-heritage-muted mb-1">
                Membership ID
              </label>
              <input
                type="text"
                required
                value={membershipNumber}
                onChange={(e) => setMembershipNumber(e.target.value)}
                className="w-full border border-black bg-white h-9 px-2 text-xs font-mono font-bold rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-heritage-muted mb-1">
                Patron Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-black bg-white h-9 px-2 text-xs font-bold rounded outline-none uppercase"
              >
                {availableRoles.length > 0 ? (
                  availableRoles.map((r) => (
                    <option key={r.id || r.slug} value={r.slug || r.name}>
                      {r.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="STUDENT">Student / Reader</option>
                    <option value="RESEARCHER">Researcher</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="LIBRARIAN">Librarian</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-heritage-muted mb-1">
                Borrow Limit
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={maxBorrowLimit}
                onChange={(e) => setMaxBorrowLimit(Number(e.target.value))}
                className="w-full border border-black bg-white h-9 px-2 text-xs font-bold rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-heritage-muted mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'SUSPENDED' | 'EXPIRED')}
                className="w-full border border-black bg-white h-9 px-2 text-xs font-bold rounded outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 9. Passwords */}
      {mode === 'signup' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="signupPassword" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
              Create Password <span className="text-heritage-red">*</span>
            </label>
            <div className="relative">
              <input
                id="signupPassword"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full border border-black bg-transparent h-[42px] px-3.5 pr-10 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="signupConfirmPassword" className="block text-[12px] text-[#78716C] font-normal mb-1.5">
              Confirm Password <span className="text-heritage-red">*</span>
            </label>
            <div className="relative">
              <input
                id="signupConfirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full border border-black bg-transparent h-[42px] px-3.5 pr-10 rounded-[3px] text-black text-sm outline-none focus:ring-1 focus:ring-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Create / Relative Password Option */}
      {(mode === 'admin-create' || mode === 'relative') && (
        <div className="border border-[#D6CCBC] p-4 bg-[#FBF9F6] rounded-[3px] space-y-3">
          <p className="font-bold text-black text-xs">Patron Account Password</p>
          <p className="text-[11px] text-gray-600">
            You can specify an initial password or leave it blank to assign standard default credentials (
            <code className="bg-black/5 px-1 py-0.5 rounded font-mono">Member@123456</code>).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Initial password (optional)"
                className="w-full border border-black bg-white h-9 px-3 pr-9 text-xs rounded outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm initial password"
                className="w-full border border-black bg-white h-9 px-3 pr-9 text-xs rounded outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Password Reset Toggle */}
      {mode === 'admin-edit' && (
        <div className="border border-gray-200 p-3.5 bg-gray-50/70 rounded-[3px]">
          {!changePasswordOpen ? (
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="text-xs font-bold text-heritage-red hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Reset Patron Password</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-black">Reset Patron Password</span>
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordOpen(false);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-[11px] text-gray-500 hover:text-black"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full border border-black bg-white h-9 px-3 pr-9 text-xs rounded outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full border border-black bg-white h-9 px-3 pr-9 text-xs rounded outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-black bg-white text-black rounded-full font-serif font-bold hover:bg-black/5 transition cursor-pointer text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="px-8 py-2.5 bg-black text-white rounded-full font-amiri font-bold text-[16px] hover:bg-neutral-800 transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          {uploadingImage ? 'Uploading photo...' : submitting ? 'Saving...' : defaultSubmitText}
        </button>
      </div>
    </form>
  );
}
