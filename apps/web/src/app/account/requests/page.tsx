'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { FileText, Plus, Download, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      type: 'DIGITAL_SCAN',
      title: 'Tuḥfat al-Mujāhidīn (Folios 12r–24v High-Res Scan)',
      format: 'TIFF / 600 DPI',
      purpose: 'Academic Publication Citation',
      status: 'READY_FOR_DOWNLOAD',
      date: '25 Aug 2026',
      progressStep: 4
    },
    {
      id: 'req-2',
      type: 'ACQUISITION_PROPOSAL',
      title: 'Al-Iklīl fī Istinbāṭ al-Tanzīl (Rare Cairo 1904 Edition)',
      format: 'PRINTED BOOK',
      purpose: 'Institutional Library Collection Addition',
      status: 'UNDER_LIBRARIAN_REVIEW',
      date: '14 Aug 2026',
      progressStep: 2
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqType, setReqType] = useState('DIGITAL_SCAN');
  const [reqPurpose, setReqPurpose] = useState('');
  const [reqFormat, setReqFormat] = useState('PDF / 300 DPI');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;
    const newReq = {
      id: `req-${Date.now()}`,
      type: reqType,
      title: reqTitle,
      format: reqFormat,
      purpose: reqPurpose || 'Private Scholarly Study',
      status: 'SUBMITTED',
      date: 'Just now',
      progressStep: 1
    };
    setRequests([newReq, ...requests]);
    setShowModal(false);
    setReqTitle('');
    setReqPurpose('');
    setSubmitSuccess('Your research request has been submitted to the conservation desk.');
    setTimeout(() => setSubmitSuccess(''), 4000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Research &amp; Reproduction Requests
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Track high-resolution manuscript scans, archival photography permissions, and purchase recommendations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Submit New Request</span>
        </button>
      </div>

      <div className="double-rule"></div>

      {submitSuccess && (
        <div className="p-3 bg-green-50 text-green-800 border border-green-300 text-xs font-semibold flex items-center gap-2 rounded">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{submitSuccess}</span>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="border-2 border-black bg-white rounded p-5 sm:p-6 shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                <span className="text-[10px] bg-black text-paper px-2 py-0.5 rounded font-averia uppercase font-bold">
                  {req.type.replace('_', ' ')}
                </span>
                <h3 className="font-amiri text-2xl font-bold text-black mt-1.5 leading-snug">
                  {req.title}
                </h3>
                <p className="text-xs text-heritage-muted mt-0.5">
                  Format: <strong>{req.format}</strong> · Purpose: {req.purpose} · Submitted: {req.date}
                </p>
              </div>

              <div>
                {req.status === 'READY_FOR_DOWNLOAD' ? (
                  <button
                    onClick={() => alert(`Downloading high-resolution digitized plates for "${req.title}"...`)}
                    className="px-3.5 py-1.5 bg-green-700 text-white rounded text-xs font-bold hover:bg-green-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Scans (TIFF)</span>
                  </button>
                ) : (
                  <span className="text-xs bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded font-bold">
                    {req.status.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Step Progression */}
            <div className="pt-2 border-t border-gray-100">
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-averia uppercase font-bold">
                <span className={req.progressStep >= 1 ? 'text-black' : 'text-gray-300'}>1. Submitted</span>
                <span className={req.progressStep >= 2 ? 'text-black' : 'text-gray-300'}>2. Conservation Review</span>
                <span className={req.progressStep >= 3 ? 'text-black' : 'text-gray-300'}>3. Studio Digitizing</span>
                <span className={req.progressStep >= 4 ? 'text-green-700 font-bold' : 'text-gray-300'}>4. Scans Ready</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-black h-full transition-all"
                  style={{ width: `${(req.progressStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-lg w-full p-6 shadow-2xl font-sans rounded space-y-4">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <p className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold">Conservation Studio</p>
                <h3 className="font-amiri text-2xl font-bold text-black">Submit Reproduction Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                  Request Type*
                </label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                >
                  <option value="DIGITAL_SCAN">Digital Folio Scan (Manuscript / Rare Book)</option>
                  <option value="ACQUISITION_PROPOSAL">Purchase / Acquisition Recommendation</option>
                  <option value="HIGH_RES_PLATES">High-Resolution Color Plates (Publication Quality)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                  Document Title &amp; Shelfmark Reference*
                </label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Tuḥfat al-Mujāhidīn (MS 0012, folios 10–25)"
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                    Output Format
                  </label>
                  <select
                    value={reqFormat}
                    onChange={(e) => setReqFormat(e.target.value)}
                    className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                  >
                    <option value="PDF / 300 DPI">Research PDF (300 DPI)</option>
                    <option value="TIFF / 600 DPI">Archival TIFF (600 DPI Uncompressed)</option>
                    <option value="JPEG / High-Res">High-Res JPEG Web Plates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                    Research Purpose
                  </label>
                  <input
                    type="text"
                    value={reqPurpose}
                    onChange={(e) => setReqPurpose(e.target.value)}
                    placeholder="e.g. Dissertation chapter citation"
                    className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors cursor-pointer"
                >
                  Submit Request →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
