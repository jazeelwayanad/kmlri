'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface FieldDraft {
  id: string; // client-only key
  label: string;
  fieldType: string;
  required: boolean;
  options: string; // comma-separated, for SELECT
}

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Short Text' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'TEXTAREA', label: 'Long Text' },
  { value: 'SELECT', label: 'Dropdown' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'FILE', label: 'File Attachment' },
];

export function RegistrationFieldsBuilder({ contentItemId }: { contentItemId: string }) {
  const [fields, setFields] = useState<FieldDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api
      .getRegistrationFields(contentItemId)
      .then((data: any[]) =>
        setFields(
          (data || []).map((f) => ({
            id: f.id,
            label: f.label,
            fieldType: f.fieldType,
            required: f.required,
            options: f.options ? JSON.parse(f.options).join(', ') : '',
          })),
        ),
      )
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  }, [contentItemId]);

  const addField = () => {
    setFields([...fields, { id: `new-${Date.now()}`, label: '', fieldType: 'TEXT', required: false, options: '' }]);
  };

  const updateField = (id: string, patch: Partial<FieldDraft>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...fields];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFields(next);
  };

  const handleSave = async () => {
    if (fields.some((f) => !f.label.trim())) {
      setMessage({ type: 'error', text: 'Every field needs a label.' });
      return;
    }
    setSaving(true);
    try {
      await api.setRegistrationFields(
        contentItemId,
        fields.map((f) => ({
          label: f.label.trim(),
          fieldType: f.fieldType,
          required: f.required,
          options: f.fieldType === 'SELECT' ? f.options.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
        })),
      );
      setMessage({ type: 'success', text: 'Registration form saved.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not save the registration form.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) return <div className="text-xs text-gray-500 py-4">Loading registration form…</div>;

  return (
    <div className="space-y-3">
      {message && (
        <div
          className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {message.text}
        </div>
      )}

      {fields.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-xs border border-dashed border-gray-300 rounded-lg">
          No custom fields yet. Registrants will only be asked for their name and email.
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={f.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-start gap-2">
              <div className="flex flex-col gap-0.5 pt-2 text-gray-300">
                <button type="button" onClick={() => move(i, -1)} className="hover:text-gray-600" title="Move up">
                  ▲
                </button>
                <GripVertical className="w-3 h-3" />
                <button type="button" onClick={() => move(i, 1)} className="hover:text-gray-600" title="Move down">
                  ▼
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2">
                <input
                  type="text"
                  value={f.label}
                  onChange={(e) => updateField(f.id, { label: e.target.value })}
                  placeholder="Field label, e.g. Institution Name"
                  className="border border-gray-200 h-9 px-2.5 rounded text-xs outline-none focus:border-heritage-red bg-white"
                />
                <select
                  value={f.fieldType}
                  onChange={(e) => updateField(f.id, { fieldType: e.target.value })}
                  className="border border-gray-200 h-9 px-2 rounded text-xs outline-none bg-white"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 whitespace-nowrap px-1">
                  <input type="checkbox" checked={f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })} className="accent-heritage-red" />
                  Required
                </label>

                {f.fieldType === 'SELECT' && (
                  <input
                    type="text"
                    value={f.options}
                    onChange={(e) => updateField(f.id, { options: e.target.value })}
                    placeholder="Options, comma separated (e.g. Student, Faculty, Public)"
                    className="border border-gray-200 h-9 px-2.5 rounded text-xs outline-none focus:border-heritage-red bg-white sm:col-span-3"
                  />
                )}
              </div>

              <button type="button" onClick={() => removeField(f.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-2">
        <button type="button" onClick={addField} className="text-xs font-bold text-heritage-red hover:underline flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Field
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save Registration Form'}
        </button>
      </div>
    </div>
  );
}
