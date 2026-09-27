'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  CheckCircle2,
  Edit3,
  X,
  ExternalLink,
  BookOpen,
  Award,
  Globe,
  Building,
  Save,
} from 'lucide-react';

export default function SettingsResearchProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);

  // Form State
  const [profileAffiliation, setProfileAffiliation] = useState(user?.department || user?.institution || '');
  const [profileOrcid, setProfileOrcid] = useState(user?.orcid || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [languages, setLanguages] = useState(user?.researchLanguages || '');
  const [researchInterest, setResearchInterest] = useState(user?.researchInterest || '');

  const [saving, setSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Sync state when user updates
  useEffect(() => {
    if (user) {
      setProfileAffiliation(user.department || user.institution || '');
      setProfileOrcid(user.orcid || '');
      setProfileBio(user.bio || '');
      setLanguages(user.researchLanguages || '');
      setResearchInterest(user.researchInterest || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.updateMyProfile({
        department: profileAffiliation,
        institution: profileAffiliation,
        orcid: profileOrcid,
        bio: profileBio,
        researchLanguages: languages,
        researchInterest: researchInterest,
      } as any);
      await refreshUser();
      setProfileSuccessMsg('Research profile and academic credentials updated successfully.');
      setEditing(false);
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update research profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Title and Edit Action */}
      <div className="flex justify-between items-baseline flex-wrap gap-4">
        <div>
          <h2 className="font-amiri text-3xl sm:text-[34px] font-bold text-black m-0 leading-tight">
            Scholar &amp; Research Profile
          </h2>
         
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setError('');
              setEditing(true);
            }}
            className="px-4 py-2 border border-black bg-white hover:bg-black hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
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

      {/* Alert Notifications */}
      {profileSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-semibold flex items-center gap-2 rounded">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{profileSuccessMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 text-red-800 border border-red-300 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {!editing ? (
        /* Preview Mode */
        <div className="space-y-6">
          {/* Specification Key-Value List */}
          <div className="space-y-4 text-xs sm:text-sm font-serif">
            {/* Primary Institutional Affiliation */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-48 sm:w-64 flex-shrink-0 font-normal">
                Primary Institutional Affiliation
              </span>
              <span className="text-stone-900 font-serif font-medium text-xs sm:text-sm">
                {user.department || user.institution || 'Independent Scholar'}
              </span>
            </div>

            {/* ORCID Researcher ID */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-48 sm:w-64 flex-shrink-0 font-normal">
                ORCID Researcher iD
              </span>
              {user.orcid ? (
                <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-stone-900">
                  <span className="font-bold text-emerald-800">{user.orcid}</span>
                  <a
                    href={`https://orcid.org/${user.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-500 hover:text-black inline-flex items-center gap-1 font-sans text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View ORCID</span>
                  </a>
                </div>
              ) : (
                <span className="text-stone-400 font-serif italic text-xs sm:text-sm">
                  Not registered
                </span>
              )}
            </div>

            {/* Research Languages & Scripts */}
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-stone-500 font-sans text-xs w-48 sm:w-64 flex-shrink-0 font-normal">
                Research Languages &amp; Scripts
              </span>
              <span className="text-stone-900 font-serif text-xs sm:text-sm">
                {user.researchLanguages || 'Not specified'}
              </span>
            </div>

            {/* Research Interests */}
            {user.researchInterest && (
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-48 sm:w-64 flex-shrink-0 font-normal">
                  Research Focus &amp; Interests
                </span>
                <span className="text-stone-900 font-serif text-xs sm:text-sm leading-relaxed">
                  {user.researchInterest}
                </span>
              </div>
            )}
          </div>

          {/* Dividing Rule */}
          <div className="border-t border-stone-300 w-full" />

          {/* Scholar Bio & Codicological Focus */}
          <div className="space-y-2">
            <span className="text-stone-500 font-sans text-xs uppercase tracking-wider font-bold block">
              Scholar Bio &amp; Codicological Research Focus
            </span>
            {user.bio ? (
              <div className="bg-white border border-stone-300 rounded-sm p-5 shadow-2xs">
                <p className="font-serif text-sm sm:text-base text-stone-900 leading-relaxed whitespace-pre-line">
                  {user.bio}
                </p>
              </div>
            ) : (
              <div className="bg-[#FAF8F5] border border-dashed border-stone-300 rounded-sm p-6 text-center space-y-2">
                <p className="text-stone-500 font-serif italic text-xs sm:text-sm">
                  No scholar biography or research focus statement has been added yet.
                </p>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-4 py-1.5 border border-stone-800 bg-white hover:bg-black hover:text-white rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  Add Bio &amp; Research Statement
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Mode Form */
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Affiliation */}
            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-stone-600 mb-1">
                Primary Institutional Affiliation
              </label>
              <input
                type="text"
                value={profileAffiliation}
                onChange={(e) => setProfileAffiliation(e.target.value)}
                placeholder="e.g. Department of Arabic Studies, University of Calicut"
                className="w-full border border-black bg-white h-10 px-3 text-xs rounded outline-none"
              />
            </div>

            {/* ORCID iD */}
            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-stone-600 mb-1">
                ORCID Researcher iD
              </label>
              <input
                type="text"
                value={profileOrcid}
                onChange={(e) => setProfileOrcid(e.target.value)}
                placeholder="0000-0000-0000-0000"
                className="w-full border border-black bg-white h-10 px-3 text-xs rounded outline-none font-mono"
              />
            </div>

            {/* Languages & Scripts */}
            <div className="col-span-full">
              <label className="block text-[10px] font-mono uppercase font-bold text-stone-600 mb-1">
                Research Languages &amp; Scripts
              </label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. Classical Arabic, Arabi-Malayalam, Persian, Ottoman Turkish"
                className="w-full border border-black bg-white h-10 px-3 text-xs rounded outline-none"
              />
            </div>

            {/* Research Interests */}
            <div className="col-span-full">
              <label className="block text-[10px] font-mono uppercase font-bold text-stone-600 mb-1">
                Research Interests &amp; Codicological Subjects
              </label>
              <input
                type="text"
                value={researchInterest}
                onChange={(e) => setResearchInterest(e.target.value)}
                placeholder="e.g. Malabar Coast Islamic jurisprudence, Shafi'i glosses, 18th-century paper watermarks"
                className="w-full border border-black bg-white h-10 px-3 text-xs rounded outline-none"
              />
            </div>

            {/* Scholar Bio */}
            <div className="col-span-full">
              <label className="block text-[10px] font-mono uppercase font-bold text-stone-600 mb-1">
                Scholar Bio &amp; Codicological Research Focus
              </label>
              <textarea
                rows={5}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Describe your ongoing research projects, codicological specializations, or manuscript collections you study..."
                className="w-full border border-black bg-white p-3 text-xs sm:text-sm rounded outline-none font-serif leading-relaxed"
              ></textarea>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-300 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-black text-white rounded-full font-bold text-xs hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Saving…' : 'Save Research Profile →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
