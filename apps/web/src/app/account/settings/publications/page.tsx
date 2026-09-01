'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { BookMarked, Plus, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

export default function SettingsPublicationsPage() {
  const { user } = useAuth();
  const [publications, setPublications] = useState([
    {
      id: 'pub-1',
      title: 'Textual Traditions of Shafiʿī Jurisprudence in Pre-Colonial Malabar',
      journal: 'Journal of Indian Ocean Studies, Vol. 14',
      year: '2025',
      doi: '10.1080/jios.2025.0412',
      type: 'Journal Article'
    },
    {
      id: 'pub-2',
      title: 'Arabi-Malayalam Epigraphy and Manuscript Rubrication: A Codicological Study',
      journal: 'KMLRI Working Paper Series, No. 03',
      year: '2026',
      doi: 'kmlri-wp-2026-03',
      type: 'Monograph'
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [journal, setJournal] = useState('');
  const [doi, setDoi] = useState('');
  const [type, setType] = useState('Journal Article');
  const [depositSuccess, setDepositSuccess] = useState('');

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setPublications([
      {
        id: `pub-${Date.now()}`,
        title,
        journal: journal || 'KMLRI Repository Working Paper',
        year: '2026',
        doi: doi || `kmlri-rep-${Date.now()}`,
        type
      },
      ...publications
    ]);
    setShowModal(false);
    setTitle('');
    setJournal('');
    setDoi('');
    setDepositSuccess('Your research publication has been deposited into the KMLRI institutional repository.');
    setTimeout(() => setDepositSuccess(''), 4000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Deposited Publications
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Academic articles, conference dissertations, and institutional working papers linked to your profile.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Deposit New Paper</span>
        </button>
      </div>

      <div className="double-rule"></div>

      {depositSuccess && (
        <div className="p-3.5 bg-green-50 text-green-800 border border-green-300 text-xs font-semibold flex items-center gap-2 rounded">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{depositSuccess}</span>
        </div>
      )}

      <div className="space-y-3">
        {publications.map((pub) => (
          <div
            key={pub.id}
            className="border-2 border-black bg-white rounded p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <span className="text-[10px] bg-[#F5F2EC] text-black border border-[#D6CCBC] px-2 py-0.5 rounded font-bold font-averia">
                {pub.type} ({pub.year})
              </span>
              <h3 className="font-amiri text-xl sm:text-2xl font-bold text-black mt-1 leading-snug">
                {pub.title}
              </h3>
              <p className="text-xs text-heritage-muted mt-0.5">
                {pub.journal} · DOI: <span className="font-mono text-heritage-red font-bold">{pub.doi}</span>
              </p>
            </div>

            <button
              onClick={() => alert(`Opening repository copy for DOI: ${pub.doi}`)}
              className="px-3.5 py-1.5 border border-black rounded text-xs font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1 self-start sm:self-center cursor-pointer"
            >
              <span>Repository View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Deposit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 shadow-2xl font-sans rounded space-y-4">
            <h3 className="font-amiri text-2xl font-bold text-black">Deposit Research Paper</h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                  Publication Title*
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Codicology of 18th-century Parappur Manuscripts"
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                  Journal / Conference / Publisher
                </label>
                <input
                  type="text"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  placeholder="e.g. Journal of Islamic Manuscripts, Vol. 8"
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                    Publication Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-black bg-white h-11 px-2.5 text-xs rounded outline-none"
                  >
                    <option value="Journal Article">Journal Article</option>
                    <option value="Monograph">Monograph</option>
                    <option value="Dissertation">Dissertation</option>
                    <option value="Working Paper">Working Paper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                    DOI or Handle
                  </label>
                  <input
                    type="text"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    placeholder="10.1080/..."
                    className="w-full border border-black bg-white h-11 px-3 text-xs rounded outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors"
                >
                  Deposit Paper →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
