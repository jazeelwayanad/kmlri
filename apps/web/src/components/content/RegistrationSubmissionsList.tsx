'use client';

import { useState, useEffect } from 'react';
import { Download, Paperclip } from 'lucide-react';
import { api } from '@/lib/api';

interface Submission {
  id: string;
  submitterName: string;
  submitterEmail: string;
  data: string;
  createdAt: string;
  files: { id: string; fieldLabel: string; originalName: string; mimeType: string; size: number }[];
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function RegistrationSubmissionsList({ contentItemId }: { contentItemId: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getRegistrations(contentItemId)
      .then((data) => setSubmissions(data || []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [contentItemId]);

  if (loading) return <div className="text-xs text-gray-500 py-4">Loading submissions…</div>;
  if (submissions.length === 0) return <div className="p-6 text-center text-gray-400 text-xs border border-dashed border-gray-300 rounded-lg">No registrations submitted yet.</div>;

  return (
    <div className="space-y-3">
      {submissions.map((s) => {
        let fieldValues: Record<string, string> = {};
        try {
          fieldValues = JSON.parse(s.data);
        } catch {}
        return (
          <div key={s.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{s.submitterName}</h4>
                <span className="text-xs text-gray-500">{s.submitterEmail}</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">{formatDateTime(s.createdAt)}</span>
            </div>

            {Object.keys(fieldValues).length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {Object.entries(fieldValues).map(([label, value]) => (
                  <div key={label}>
                    <span className="text-gray-400">{label}:</span> <span className="text-gray-800 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {s.files.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                {s.files.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => api.downloadRegistrationFile(f.id, f.originalName)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span>{f.originalName}</span>
                    <Download className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
