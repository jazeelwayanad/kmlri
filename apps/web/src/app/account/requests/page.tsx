'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface AcquisitionRequest {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  estimatedPrice?: number;
  reason?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'ORDERED' | 'REJECTED';
  createdAt: string;
}

const STEP_MAP: Record<string, number> = { SUBMITTED: 1, APPROVED: 2, ORDERED: 3, REJECTED: 0 };

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AcquisitionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqAuthor, setReqAuthor] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getAcquisitionRequests();
      setRequests(data || []);
    } catch {
      setMessage({ type: 'error', text: 'Could not load your requests from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadRequests();
  }, [user]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;
    setSubmitting(true);
    try {
      await api.createAcquisitionRequest({ title: reqTitle, author: reqAuthor || undefined, reason: reqReason || undefined });
      setShowModal(false);
      setReqTitle('');
      setReqAuthor('');
      setReqReason('');
      setMessage({ type: 'success', text: 'Your acquisition recommendation has been submitted to the collection development desk.' });
      await loadRequests();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not submit your request.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Acquisition Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Recommend titles for the collection development committee to review.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Recommend a Title</span>
        </button>
      </div>

      <div className="double-rule"></div>

      {message && (
        <div
          className={`p-3 text-xs font-semibold flex items-center gap-2 rounded border ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-heritage-red border-heritage-red/30'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="border-2 border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">Loading your requests…</div>
      ) : requests.length === 0 ? (
        <div className="border-2 border-black bg-white rounded p-8 text-center text-heritage-muted text-sm">
          You haven&apos;t submitted any acquisition recommendations yet.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="border-2 border-black bg-white rounded p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <h3 className="font-amiri text-2xl font-bold text-black leading-snug">{req.title}</h3>
                  <p className="text-xs text-heritage-muted mt-0.5">
                    {req.author && <>Author: <strong>{req.author}</strong> · </>}
                    Submitted: {formatDate(req.createdAt)}
                  </p>
                  {req.reason && <p className="text-xs text-heritage-body mt-1">{req.reason}</p>}
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded font-bold border ${
                    req.status === 'REJECTED'
                      ? 'bg-red-50 text-heritage-red border-heritage-red/30'
                      : req.status === 'ORDERED'
                      ? 'bg-green-50 text-green-800 border-green-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {req.status}
                </span>
              </div>

              {req.status !== 'REJECTED' && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-averia uppercase font-bold">
                    <span className={STEP_MAP[req.status] >= 1 ? 'text-black' : 'text-gray-300'}>1. Submitted</span>
                    <span className={STEP_MAP[req.status] >= 2 ? 'text-black' : 'text-gray-300'}>2. Approved</span>
                    <span className={STEP_MAP[req.status] >= 3 ? 'text-green-700 font-bold' : 'text-gray-300'}>3. Ordered</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-black h-full transition-all" style={{ width: `${(STEP_MAP[req.status] / 3) * 100}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-lg w-full p-6 shadow-2xl font-sans rounded space-y-4">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <p className="font-averia text-xs uppercase tracking-wider text-heritage-red font-bold">Collection Development</p>
                <h3 className="font-amiri text-2xl font-bold text-black">Recommend a Title</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">Title*</label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Al-Iklīl fī Istinbāṭ al-Tanzīl"
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">Author</label>
                <input
                  type="text"
                  value={reqAuthor}
                  onChange={(e) => setReqAuthor(e.target.value)}
                  placeholder="e.g. Suyūṭī"
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">Reason for recommendation</label>
                <input
                  type="text"
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="e.g. Fills a gap in our tafsir holdings"
                  className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
                />
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
                  disabled={submitting}
                  className="px-5 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit Request →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
