'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, Shield, Globe, Award, BookOpen } from 'lucide-react';

export default function SettingsResearchProfilePage() {
  const { user } = useAuth();
  const [profileAffiliation, setProfileAffiliation] = useState('Center for West Asian & Malabar Maritime Studies');
  const [profileOrcid, setProfileOrcid] = useState('0000-0002-1825-0097');
  const [profileBio, setProfileBio] = useState(
    'Doctoral Fellow researching Indian Ocean manuscript networks, Shafi’i jurisprudence traditions, and Arabi-Malayalam epigraphy.'
  );
  const [languages, setLanguages] = useState('Arabic, Arabi-Malayalam, Persian, Malayalam, English');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('Research profile and academic credentials updated successfully.');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
          Scholar &amp; Research Profile
        </h2>
        <p className="text-xs sm:text-sm text-heritage-muted mt-1">
          Academic credentials, ORCID iD, primary field of codicological study, and research languages.
        </p>
      </div>

      <div className="double-rule"></div>

      {profileSuccessMsg && (
        <div className="p-3.5 bg-green-50 text-green-800 border border-green-300 text-xs font-semibold flex items-center gap-2 rounded">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{profileSuccessMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="border border-black bg-white rounded p-5 sm:p-6 space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
              Primary Institutional Affiliation
            </label>
            <input
              type="text"
              value={profileAffiliation}
              onChange={(e) => setProfileAffiliation(e.target.value)}
              className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
              ORCID Researcher iD
            </label>
            <input
              type="text"
              value={profileOrcid}
              onChange={(e) => setProfileOrcid(e.target.value)}
              placeholder="0000-0000-0000-0000"
              className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none font-mono"
            />
          </div>

          <div className="col-span-full">
            <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
              Research Languages &amp; Scripts
            </label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
            />
          </div>

          <div className="col-span-full">
            <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
              Scholar Bio &amp; Codicological Research Focus
            </label>
            <textarea
              rows={4}
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
              className="w-full border border-black bg-white p-3 text-sm rounded outline-none font-amiri text-base leading-relaxed"
            ></textarea>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-black text-white rounded font-amiri font-bold text-base hover:bg-heritage-red hover:text-white  transition-colors cursor-pointer"
          >
            Save Research Profile →
          </button>
        </div>
      </form>
    </div>
  );
}
