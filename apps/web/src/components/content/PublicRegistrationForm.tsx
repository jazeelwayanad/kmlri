'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface RegField {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  options?: string;
}

export function PublicRegistrationForm({ contentItemId, title }: { contentItemId: string; title: string }) {
  const { user } = useAuth();
  const [fields, setFields] = useState<RegField[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.fullName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    api
      .getRegistrationFields(contentItemId)
      .then((data) => setFields(data || []))
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  }, [contentItemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      await api.submitRegistration(contentItemId, name, email, values, files);
      setResult({ type: 'success', text: `You're registered for "${title}". A confirmation has been recorded.` });
      setValues({});
      setFiles({});
    } catch (err: any) {
      setResult({ type: 'error', text: err.message || 'Could not submit your registration.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-sm text-heritage-muted py-4">Loading registration form…</div>;

  if (result?.type === 'success') {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-sm text-emerald-800 font-semibold">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span>{result.text}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {result?.type === 'error' && (
        <div className="p-3 bg-red-50 border border-heritage-red/30 rounded text-xs text-heritage-red font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {result.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-heritage-muted">Full Name*</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="border border-black h-10 px-3 rounded text-sm outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-heritage-muted">Email*</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-black h-10 px-3 rounded text-sm outline-none" />
        </label>
      </div>

      {fields.map((f) => (
        <label key={f.id} className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-heritage-muted">
            {f.label}
            {f.required && '*'}
          </span>

          {f.fieldType === 'TEXTAREA' ? (
            <textarea
              required={f.required}
              rows={3}
              value={values[f.label] || ''}
              onChange={(e) => setValues({ ...values, [f.label]: e.target.value })}
              className="border border-black p-3 rounded text-sm outline-none resize-y"
            />
          ) : f.fieldType === 'SELECT' ? (
            <select
              required={f.required}
              value={values[f.label] || ''}
              onChange={(e) => setValues({ ...values, [f.label]: e.target.value })}
              className="border border-black h-10 px-3 rounded text-sm outline-none bg-white"
            >
              <option value="">Select…</option>
              {(f.options ? JSON.parse(f.options) : []).map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : f.fieldType === 'CHECKBOX' ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                required={f.required}
                checked={values[f.label] === 'true'}
                onChange={(e) => setValues({ ...values, [f.label]: e.target.checked ? 'true' : 'false' })}
                className="w-4 h-4 accent-heritage-red"
              />
              <span>Yes</span>
            </label>
          ) : f.fieldType === 'FILE' ? (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-2 border border-black rounded text-xs font-bold cursor-pointer hover:bg-black hover:text-white transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{files[f.label]?.name || 'Choose file'}</span>
                <input
                  type="file"
                  required={f.required && !files[f.label]}
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setFiles({ ...files, [f.label]: e.target.files[0] })}
                />
              </label>
            </div>
          ) : (
            <input
              type={f.fieldType === 'EMAIL' ? 'email' : f.fieldType === 'PHONE' ? 'tel' : f.fieldType === 'NUMBER' ? 'number' : 'text'}
              required={f.required}
              value={values[f.label] || ''}
              onChange={(e) => setValues({ ...values, [f.label]: e.target.value })}
              className="border border-black h-10 px-3 rounded text-sm outline-none"
            />
          )}
        </label>
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 bg-black text-white rounded-full font-bold text-sm hover:bg-heritage-red transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit Registration'}
      </button>
    </form>
  );
}
