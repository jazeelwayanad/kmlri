'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Lock,
  Globe,
  Users,
  Search,
  BookOpen,
  UserCheck,
  Building,
  Upload,
} from 'lucide-react';
import { api } from '@/lib/api';

export interface FormFieldSchema {
  id?: string;
  name: string;
  label: string;
  type: string; // text, textarea, number, select, multiselect, date, datetime, checkbox, radio, file, url, email, authority, record, member, collection
  required?: boolean;
  defaultValue?: string;
  options?: string | { label: string; value: string }[];
  visibility?: 'PUBLIC' | 'MEMBERS' | 'ADMIN' | string;
  multiplicity?: boolean;
  referenceSource?: string;
  showInTable?: boolean;
  sortOrder?: number;
}

export interface FormFrameworkSchema {
  id?: string;
  code: string;
  name: string;
  recordType: string;
  description?: string;
  isDefault?: boolean;
  fields: FormFieldSchema[];
}

interface DynamicFormRendererProps {
  framework: FormFrameworkSchema;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  userRole?: 'ADMIN' | 'STAFF' | 'MEMBER' | 'PUBLIC';
  readOnly?: boolean;
  previewMode?: boolean;
}

export default function DynamicFormRenderer({
  framework,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save Record',
  isSubmitting = false,
  userRole = 'ADMIN',
  readOnly = false,
  previewMode = false,
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = { ...initialValues };
    (framework.fields || []).forEach((field) => {
      if (init[field.name] === undefined) {
        if (field.multiplicity) {
          init[field.name] = field.defaultValue ? [field.defaultValue] : [''];
        } else if (field.type === 'checkbox') {
          init[field.name] = field.defaultValue === 'true' || (field.defaultValue as any) === true;
        } else if (field.type === 'multiselect') {
          init[field.name] = [];
        } else {
          init[field.name] = field.defaultValue || '';
        }
      }
    });
    return init;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lookup caches for reference fields
  const [authoritiesList, setAuthoritiesList] = useState<any[]>([]);
  const [recordsList, setRecordsList] = useState<any[]>([]);
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingRefs(true);
      try {
        const [authData, recData, colData, memData] = await Promise.allSettled([
          api.searchAuthorities(),
          api.searchCatalog({ limit: 100 }).catch(() => ({ records: [] })),
          api.getCollections().catch(() => []),
          api.getUsers().catch(() => ({ data: [] })),
        ]);

        if (!cancelled) {
          if (authData.status === 'fulfilled' && Array.isArray(authData.value)) {
            setAuthoritiesList(authData.value);
          }
          if (recData.status === 'fulfilled') {
            const val = recData.value;
            setRecordsList(Array.isArray(val) ? val : val?.records || []);
          }
          if (colData.status === 'fulfilled' && Array.isArray(colData.value)) {
            setCollectionsList(colData.value);
          }
          if (memData.status === 'fulfilled') {
            const val = memData.value;
            setMembersList(Array.isArray(val) ? val : val?.data || []);
          }
        }
      } catch (err) {
        // Silently tolerate reference fetch errors
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const parseOptions = (optionsRaw?: any): { label: string; value: string }[] => {
    if (!optionsRaw) return [];
    if (Array.isArray(optionsRaw)) return optionsRaw;
    try {
      const parsed = JSON.parse(optionsRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleFieldChange = (fieldName: string, value: any, index?: number) => {
    setFormData((prev) => {
      if (index !== undefined) {
        const list = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [''];
        list[index] = value;
        return { ...prev, [fieldName]: list };
      }
      return { ...prev, [fieldName]: value };
    });

    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleAddRepeaterItem = (fieldName: string) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [''];
      return { ...prev, [fieldName]: [...current, ''] };
    });
  };

  const handleRemoveRepeaterItem = (fieldName: string, index: number) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [''];
      if (current.length <= 1) {
        return { ...prev, [fieldName]: [''] };
      }
      const updated = current.filter((_, i) => i !== index);
      return { ...prev, [fieldName]: updated };
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    (framework.fields || []).forEach((f) => {
      if (f.required) {
        const val = formData[f.name];
        if (f.multiplicity) {
          if (!Array.isArray(val) || val.length === 0 || !val.some((v) => v && String(v).trim() !== '')) {
            errs[f.name] = `${f.label} is required.`;
          }
        } else if (val === undefined || val === null || String(val).trim() === '') {
          errs[f.name] = `${f.label} is required.`;
        }
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  // Visibility Clearance Filter
  const canViewField = (field: FormFieldSchema) => {
    if (previewMode || userRole === 'ADMIN' || userRole === 'STAFF') return true;
    if (userRole === 'MEMBER' && (field.visibility === 'PUBLIC' || field.visibility === 'MEMBERS')) return true;
    return field.visibility === 'PUBLIC';
  };

  const renderVisibilityBadge = (visibility?: string) => {
    if (visibility === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Lock className="w-2.5 h-2.5" /> Admin Only
        </span>
      );
    }
    if (visibility === 'MEMBERS') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <Users className="w-2.5 h-2.5" /> Members Only
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        <Globe className="w-2.5 h-2.5 text-gray-400" /> Public
      </span>
    );
  };

  // Render single atomic input widget
  const renderFieldInput = (field: FormFieldSchema, value: any, onChange: (v: any) => void, placeholder?: string) => {
    const opts = parseOptions(field.options);

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className="w-full border border-gray-300 rounded h-9 px-3 text-xs font-sans text-gray-900 bg-white focus:border-[#A52307] focus:ring-1 focus:ring-[#A52307] outline-none transition-all disabled:bg-gray-50"
          >
            <option value="">— Select an option —</option>
            {opts.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'datetime':
      case 'date':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className="w-full border border-gray-300 rounded h-9 px-3 text-xs font-sans text-gray-900 focus:border-[#A52307] focus:ring-1 focus:ring-[#A52307] outline-none transition-all disabled:bg-gray-50"
          />
        );

      case 'file':
        return (
          <div className="border border-dashed border-gray-300 rounded p-3 bg-gray-50/60 text-center">
            <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste file URI / attachment URL or choose file…"
              className="w-full border border-gray-200 rounded h-8 px-2 text-xs bg-white text-gray-800"
            />
          </div>
        );

      // VARIABLE / REFERENCE FIELDS
      case 'authority': {
        const sourceFilter = field.referenceSource?.toUpperCase();
        const filteredAuths = authoritiesList.filter((a) => {
          if (!sourceFilter || sourceFilter === 'ANY') return true;
          if (sourceFilter === 'AUTHOR') return a.headingType === 'PERSONAL_NAME' || a.headingType === 'CORPORATE_NAME';
          if (sourceFilter === 'PUBLICATION') return a.headingType === 'PUBLISHER' || a.headingType === 'SERIES';
          return a.headingType === sourceFilter;
        });

        return (
          <div className="space-y-1">
            <div className="relative">
              <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                className="w-full border border-amber-300 bg-amber-50/20 rounded h-9 px-3 text-xs font-sans text-gray-900 focus:border-[#A52307] focus:ring-1 focus:ring-[#A52307] outline-none transition-all"
              >
                <option value="">
                  {`— Select ${sourceFilter === 'AUTHOR' ? 'Author' : sourceFilter === 'PUBLICATION' ? 'Publication' : 'Authority'} Heading —`}
                </option>
                {filteredAuths.map((auth) => (
                  <option key={auth.id} value={auth.heading}>
                    {auth.heading} ({auth.headingType.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
            {value && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                <BookOpen className="w-3 h-3 text-[#A52307] flex-shrink-0" />
                <span className="font-semibold">Linked Authority:</span>
                <span className="font-mono">{value}</span>
              </div>
            )}
          </div>
        );
      }

      case 'record': {
        return (
          <div className="space-y-1">
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              className="w-full border border-blue-300 bg-blue-50/20 rounded h-9 px-3 text-xs font-sans text-gray-900 focus:border-[#A52307] focus:ring-1 focus:ring-[#A52307] outline-none transition-all"
            >
              <option value="">— Search & Select Library Record —</option>
              {recordsList.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.titleLatin || rec.titleArabic || rec.titleProper || 'Untitled'} {rec.shelfmark ? `[${rec.shelfmark}]` : ''}
                </option>
              ))}
            </select>
          </div>
        );
      }

      case 'member': {
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className="w-full border border-emerald-300 bg-emerald-50/20 rounded h-9 px-3 text-xs font-sans text-gray-900 focus:border-[#A52307] focus:ring-1 focus:ring-[#A52307] outline-none transition-all"
          >
            <option value="">— Select Registered Member —</option>
            {membersList.map((mem) => (
              <option key={mem.id} value={mem.id}>
                {mem.fullName || mem.name} ({mem.membershipNumber || mem.email})
              </option>
            ))}
          </select>
        );
      }

      case 'collection': {
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className="w-full border border-purple-300 bg-purple-50/20 rounded h-9 px-3 text-xs font-sans text-gray-900 focus:border-[#A52307] focus:ring-1 focus:ring-[#A52307] outline-none transition-all"
          >
            <option value="">— Select Collection —</option>
            {collectionsList.map((col) => (
              <option key={col.id} value={col.id || col.name}>
                {col.name} {col.recordCount ? `(${col.recordCount} items)` : ''}
              </option>
            ))}
          </select>
        );
      }

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            placeholder={placeholder || 'Enter value…'}
            className="w-full border border-gray-300 rounded h-9 px-3 text-xs font-sans text-gray-900 focus:border-[#A52307] focus:ring-1 focus:ring-[#A52307] outline-none transition-all disabled:bg-gray-50"
          />
        );
    }
  };

  const fieldsToRender = (framework.fields || []).filter(canViewField);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      {fieldsToRender.map((field) => {
        const hasError = Boolean(errors[field.name]);
        const isRepeater = Boolean(field.multiplicity);
        const repeaterValues = isRepeater
          ? Array.isArray(formData[field.name])
            ? formData[field.name]
            : [formData[field.name] || '']
          : [];

        return (
          <div
            key={field.name}
            className={`p-4 rounded-lg border transition-all ${
              hasError
                ? 'bg-red-50/40 border-red-300'
                : 'bg-white border-[#E2E0DB] hover:border-gray-300'
            }`}
          >
            {/* Field Header */}
            <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
              <label className="block text-xs font-bold text-gray-900">
                {field.label}
                {field.required && <span className="text-[#A52307] ml-1">*</span>}
              </label>
              <div className="flex items-center gap-2">
                {isRepeater && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Multi-entry
                  </span>
                )}
                {renderVisibilityBadge(field.visibility)}
              </div>
            </div>

            {/* Field Inputs */}
            {isRepeater ? (
              <div className="space-y-2">
                {repeaterValues.map((val: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      {renderFieldInput(
                        field,
                        val,
                        (newVal) => handleFieldChange(field.name, newVal, idx),
                        `${field.label} #${idx + 1}`
                      )}
                    </div>
                    {!readOnly && repeaterValues.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRepeaterItem(field.name, idx)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Remove entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleAddRepeaterItem(field.name)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A52307] hover:text-red-800 pt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another {field.label}</span>
                  </button>
                )}
              </div>
            ) : (
              <div>
                {renderFieldInput(
                  field,
                  formData[field.name],
                  (newVal) => handleFieldChange(field.name, newVal)
                )}
              </div>
            )}

            {/* Error Message */}
            {hasError && (
              <p className="text-[11px] font-semibold text-red-600 mt-1.5">{errors[field.name]}</p>
            )}
          </div>
        );
      })}

      {!readOnly && !previewMode && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#A52307] hover:bg-red-800 text-white text-xs font-bold rounded shadow transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
