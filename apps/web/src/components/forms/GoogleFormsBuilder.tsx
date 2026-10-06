'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Sliders,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  MoveUp,
  MoveDown,
  Lock,
  Globe,
  Users,
  ChevronDown,
  FileText,
  List,
  Clock,
  Upload,
  BookOpen,
  UserCheck,
  FolderOpen,
} from 'lucide-react';
import { api } from '@/lib/api';
import DynamicFormRenderer, { FormFrameworkSchema, FormFieldSchema } from './DynamicFormRenderer';

const FIELD_TYPES_CONFIG = [
  { value: 'text', label: 'Text', icon: FileText, desc: 'Text input' },
  { value: 'select', label: 'Dropdown', icon: List, desc: 'Single select dropdown menu' },
  { value: 'datetime', label: 'Date & Time', icon: Clock, desc: 'Date and time picker' },
  { value: 'file', label: 'File Upload', icon: Upload, desc: 'Document or media attachment upload' },
  { value: 'authority', label: 'Authority Variable Field', icon: UserCheck, desc: 'Connects to Authors / Publications registry' },
  { value: 'record', label: 'Record Selection Variable Field', icon: BookOpen, desc: 'Connects to Catalogue Library Records' },
  { value: 'member', label: 'Member Variable Field', icon: Users, desc: 'Connects to Registered Members registry' },
  { value: 'collection', label: 'Collection Variable Field', icon: FolderOpen, desc: 'Connects to Curated Collections' },
];

interface GoogleFormsBuilderProps {
  initialFramework?: FormFrameworkSchema;
  initialRecordType?: string;
  isEditing?: boolean;
}

export default function GoogleFormsBuilder({
  initialFramework,
  initialRecordType,
  isEditing = false,
}: GoogleFormsBuilderProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showTableColumnsModal, setShowTableColumnsModal] = useState(false);
  const [savedFrameworkCode, setSavedFrameworkCode] = useState<string | null>(null);

  // Framework metadata
  const [frameworkName, setFrameworkName] = useState(initialFramework?.name || '');
  const [recordType, setRecordType] = useState(initialFramework?.recordType || initialRecordType || 'ITEM');
  const [frameworkCode, setFrameworkCode] = useState(initialFramework?.code || '');

  // Fields stack
  const [fields, setFields] = useState<FormFieldSchema[]>(() => {
    if (initialFramework?.fields && initialFramework.fields.length > 0) {
      return JSON.parse(JSON.stringify(initialFramework.fields));
    }
    return [
      {
        name: 'titleProper',
        label: 'Title Proper',
        type: 'text',
        required: true,
        visibility: 'PUBLIC',
        multiplicity: false,
        showInTable: true,
        sortOrder: 1,
      },
    ];
  });

  // Auto-generate code if creating
  useEffect(() => {
    if (!isEditing && frameworkName) {
      const generated = `${recordType}_${frameworkName
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 24)}`;
      setFrameworkCode(generated);
    }
  }, [frameworkName, recordType, isEditing]);

  // Options Helper
  const getFieldOptions = (field: FormFieldSchema): { label: string; value: string }[] => {
    if (!field.options) return [];
    if (Array.isArray(field.options)) return field.options;
    try {
      const parsed = JSON.parse(field.options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const updateField = (index: number, patch: Partial<FormFieldSchema>) => {
    setFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  // Add new Question Field immediately below active or at the end
  const handleAddField = () => {
    const newField: FormFieldSchema = {
      name: `field_${Date.now().toString().slice(-4)}`,
      label: 'Untitled Question',
      type: 'text',
      required: false,
      visibility: 'PUBLIC',
      multiplicity: false,
      showInTable: true,
      sortOrder: fields.length + 1,
    };

    const targetIndex = activeCardIndex >= 0 ? activeCardIndex + 1 : fields.length;
    const newFields = [...fields.slice(0, targetIndex), newField, ...fields.slice(targetIndex)];
    newFields.forEach((f, i) => (f.sortOrder = i + 1));
    setFields(newFields);
    setActiveCardIndex(targetIndex);
  };

  const handleDuplicateField = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const source = fields[index];
    const cloned: FormFieldSchema = {
      ...JSON.parse(JSON.stringify(source)),
      id: undefined,
      name: `${source.name}_copy`,
      label: `${source.label} (Copy)`,
      showInTable: source.showInTable ?? true,
      sortOrder: index + 2,
    };
    const newFields = [...fields.slice(0, index + 1), cloned, ...fields.slice(index + 1)];
    newFields.forEach((f, i) => (f.sortOrder = i + 1));
    setFields(newFields);
    setActiveCardIndex(index + 1);
  };

  const handleDeleteField = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (fields.length <= 1) {
      alert('A framework must have at least one field.');
      return;
    }
    const newFields = fields.filter((_, i) => i !== index);
    newFields.forEach((f, i) => (f.sortOrder = i + 1));
    setFields(newFields);
    setActiveCardIndex(Math.max(0, index - 1));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= fields.length) return;

    const next = [...fields];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    next.forEach((f, i) => (f.sortOrder = i + 1));
    setFields(next);
    setActiveCardIndex(target);
  };

  // Option row management for choices
  const handleAddOption = (fieldIndex: number) => {
    const current = getFieldOptions(fields[fieldIndex]);
    const optionNumber = current.length + 1;
    const next = [...current, { label: `Option ${optionNumber}`, value: `OPTION_${optionNumber}` }];
    updateField(fieldIndex, { options: next });
  };

  const handleUpdateOption = (fieldIndex: number, optIndex: number, label: string, value?: string) => {
    const current = getFieldOptions(fields[fieldIndex]);
    const next = [...current];
    const val = value !== undefined ? value : label.toUpperCase().replace(/\s+/g, '_');
    next[optIndex] = { label, value: val };
    updateField(fieldIndex, { options: next });
  };

  const handleRemoveOption = (fieldIndex: number, optIndex: number) => {
    const current = getFieldOptions(fields[fieldIndex]);
    if (current.length <= 1) return;
    const next = current.filter((_, i) => i !== optIndex);
    updateField(fieldIndex, { options: next });
  };

  // Save / Publish
  const handleSaveFramework = async (openTableConfig: boolean = true) => {
    const shouldOpenConfig = typeof openTableConfig === 'boolean' ? openTableConfig : true;
    if (!frameworkName.trim()) {
      setNotification({ type: 'error', text: 'Please enter a title for the framework.' });
      return;
    }
    if (fields.length === 0) {
      setNotification({ type: 'error', text: 'Please add at least one field to the framework.' });
      return;
    }

    setSaving(true);
    try {
      const codeToUse =
        isEditing && initialFramework?.code
          ? initialFramework.code
          : `${recordType}_${frameworkName
              .trim()
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '_')
              .slice(0, 20)}_${Date.now().toString().slice(-4)}`;

      const payload = {
        code: codeToUse,
        name: frameworkName.trim(),
        recordType,
        description: '',
        isDefault: false,
        fields: fields.map((f, i) => ({
          ...f,
          name: f.name.trim() || f.label.toLowerCase().replace(/[^a-z0-9]/g, '_') || `field_${i + 1}`,
          label: f.label.trim(),
          showInTable: f.showInTable !== false,
          sortOrder: i + 1,
        })),
      };

      if (isEditing && initialFramework?.code) {
        await api.updateFormFramework(initialFramework.code, payload);
      } else {
        await api.createFormFramework(payload);
      }

      setSavedFrameworkCode(codeToUse);

      if (shouldOpenConfig) {
        setSaving(false);
        setShowTableColumnsModal(true);
      } else {
        setNotification({ type: 'success', text: `Framework "${payload.name}" saved successfully!` });
        setTimeout(() => {
          router.push('/admin/catalog/frameworks');
        }, 800);
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to save framework.' });
      setSaving(false);
    }
  };

  // Save Table Columns Configuration & Finish
  const handleSaveTableColumns = async () => {
    const code = savedFrameworkCode || initialFramework?.code || frameworkCode;
    if (!code) {
      router.push('/admin/catalog/frameworks');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fields: fields.map((f, i) => ({
          ...f,
          name: f.name.trim() || f.label.toLowerCase().replace(/[^a-z0-9]/g, '_') || `field_${i + 1}`,
          label: f.label.trim(),
          showInTable: f.showInTable !== false,
          sortOrder: i + 1,
        })),
      };
      await api.updateFormFramework(code, payload);
      setShowTableColumnsModal(false);
      setNotification({ type: 'success', text: 'Table view details configured successfully!' });
      setTimeout(() => {
        router.push('/admin/catalog/frameworks');
      }, 700);
    } catch (err: any) {
      alert(err.message || 'Failed to save table view configuration.');
    } finally {
      setSaving(false);
    }
  };

  const previewFrameworkObject: FormFrameworkSchema = {
    code: frameworkCode || 'PREVIEW_CODE',
    name: frameworkName || 'Untitled Form Framework',
    recordType,
    description: '',
    isDefault: false,
    fields,
  };

  return (
    <div className="space-y-6 font-sans pb-24 max-w-[1100px] mx-auto">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2E0DB] shadow-sm sticky top-4 z-30 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/catalog/frameworks"
            className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            title="Back to Frameworks"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A52307] block">
              {isEditing ? 'Editing Framework' : 'Create New Framework'}
            </span>
            <h1 className="text-base font-bold text-gray-900 truncate max-w-md">
              {frameworkName || 'Untitled Form Framework'}
            </h1>
          </div>
        </div>

        {/* Mode Tabs & Save CTA */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-[#FAF8F5] border border-[#E2E0DB] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-white text-gray-900 shadow-sm border border-[#E2E0DB]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Questions / Fields
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm border border-[#E2E0DB]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSaveFramework(true)}
            disabled={saving}
            className="px-5 py-2 bg-[#A52307] hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Publish Framework'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* TAB 1: FORM BUILDER (Google Forms Functional Interaction Model) */}
      {activeTab === 'builder' && (
        <div className="space-y-4">
          {/* Form Header Card (Google Forms Style: Title Only) */}
          <div className="bg-white border-t-8 border-t-[#A52307] border-x border-b border-[#E2E0DB] rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <BookOpen className="w-3.5 h-3.5 text-[#A52307]" />
                {recordType === 'ITEM'
                  ? 'Item Record Form'
                  : recordType === 'SERIAL'
                  ? 'Serial Record Form'
                  : recordType === 'AUTHORITY'
                  ? 'Authority Record Form'
                  : recordType === 'MEMBER'
                  ? 'Member Registration Form'
                  : recordType === 'COLLECTION'
                  ? 'Collection Definition Form'
                  : `${recordType} Form`}
              </span>
            </div>

            <input
              type="text"
              value={frameworkName}
              onChange={(e) => setFrameworkName(e.target.value)}
              placeholder="Form Framework Title (e.g., Arabic Manuscript Accession Form)"
              className="w-full text-2xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-[#A52307] outline-none pb-1 transition-colors"
            />
          </div>

          {/* Question / Field Cards Stack */}
          <div className="space-y-4 relative">
            {fields.map((field, idx) => {
              const isActive = activeCardIndex === idx;
              const opts = getFieldOptions(field);

              return (
                <div
                  key={idx}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`bg-white rounded-xl border transition-all duration-150 ${
                    isActive
                      ? 'border-l-4 border-l-[#A52307] border-y border-r border-[#E2E0DB] shadow-md ring-1 ring-black/5 p-6'
                      : 'border-[#E2E0DB] hover:border-gray-400 p-5 shadow-sm cursor-pointer'
                  }`}
                >
                  {isActive ? (
                    /* ================= ACTIVE / EXPANDED QUESTION CARD ================= */
                    <div className="space-y-5">
                      {/* Top Bar: Reorder buttons & Question Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Field #{idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-gray-400">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => handleMoveField(idx, 'up', e)}
                            className="p-1 hover:text-black rounded hover:bg-gray-100 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === fields.length - 1}
                            onClick={(e) => handleMoveField(idx, 'down', e)}
                            className="p-1 hover:text-black rounded hover:bg-gray-100 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Main Question Label & Field Type Selector */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const newLabel = e.target.value;
                              updateField(idx, {
                                label: newLabel,
                                name: field.name.startsWith('field_')
                                  ? newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')
                                  : field.name,
                              });
                            }}
                            placeholder="Question / Field Title (e.g., Primary Author)"
                            className="w-full text-base font-bold text-gray-900 border-b-2 border-gray-200 focus:border-[#A52307] bg-transparent outline-none pb-1.5 transition-colors"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const newType = e.target.value;
                              const patch: Partial<FormFieldSchema> = { type: newType };
                              if (newType === 'select' && opts.length === 0) {
                                patch.options = [
                                  { label: 'Option 1', value: 'OPTION_1' },
                                  { label: 'Option 2', value: 'OPTION_2' },
                                ];
                              }
                              if (newType === 'authority' && !field.referenceSource) {
                                patch.referenceSource = 'AUTHOR';
                              }
                              updateField(idx, patch);
                            }}
                            className="w-full border border-gray-300 rounded-lg h-10 px-3 text-xs font-semibold bg-white text-gray-900 focus:border-[#A52307] outline-none"
                          >
                            {FIELD_TYPES_CONFIG.map((ft) => (
                              <option key={ft.value} value={ft.value}>
                                {ft.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Dynamic Field Configuration Body */}
                      <div className="pt-2">
                        {/* 1. DROPDOWN CHOICES OPTION BUILDER */}
                        {field.type === 'select' && (
                          <div className="space-y-2.5 p-4 bg-[#FAF8F5] rounded-lg border border-[#E2E0DB]">
                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                              Dropdown Choices / Options
                            </span>
                            {opts.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 w-5 text-center">
                                  {optIdx + 1}.
                                </span>
                                <input
                                  type="text"
                                  value={opt.label}
                                  onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                                  placeholder={`Option ${optIdx + 1}`}
                                  className="flex-1 border-b border-gray-300 focus:border-[#A52307] bg-transparent text-xs py-1 outline-none"
                                />
                                <input
                                  type="text"
                                  value={opt.value}
                                  onChange={(e) => handleUpdateOption(idx, optIdx, opt.label, e.target.value)}
                                  placeholder="Value Code"
                                  className="w-36 border border-gray-200 bg-white rounded h-7 px-2 text-[11px] font-mono text-gray-600 outline-none"
                                />
                                {opts.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(idx, optIdx)}
                                    className="text-gray-400 hover:text-red-600 p-1"
                                    title="Remove option"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddOption(idx)}
                              className="text-xs font-bold text-[#A52307] hover:text-red-800 flex items-center gap-1.5 pt-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Option
                            </button>
                          </div>
                        )}

                        {/* 2. AUTHORITY VARIABLE FIELD CONFIG */}
                        {field.type === 'authority' && (
                          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                              <UserCheck className="w-4 h-4 text-[#A52307]" />
                              <span>Authority Variable Reference Settings</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div>
                                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                                  Authority Registry Filter
                                </label>
                                <select
                                  value={field.referenceSource || 'AUTHOR'}
                                  onChange={(e) => updateField(idx, { referenceSource: e.target.value })}
                                  className="w-full border border-amber-300 bg-white rounded h-8 px-2 text-xs font-medium text-gray-900"
                                >
                                  <option value="AUTHOR">Author Authorities (Scholars / Scribes / Personal / Corporate)</option>
                                  <option value="PUBLICATION">Publication Authorities (Publishers / Presses / Series)</option>
                                  <option value="ANY">All Authority Headings</option>
                                </select>
                              </div>
                              <div className="text-[11px] text-amber-800 flex items-center">
                                When creating a record, cataloguers will search &amp; select from controlled authority headings dynamically.
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. RECORD SELECTION VARIABLE FIELD CONFIG */}
                        {field.type === 'record' && (
                          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                              <BookOpen className="w-4 h-4 text-blue-700" />
                              <span>Catalogue Record Selection Field</span>
                            </div>
                            <p className="text-[11px] text-blue-800">
                              Users will search and select an existing library record (e.g. for linking Serials to master Bibliographic entries).
                            </p>
                          </div>
                        )}

                      </div>

                      {/* Google Forms Bottom Action Toolbar for the Active Card */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                        {/* Left: Duplicate & Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleDuplicateField(idx, e)}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Duplicate Field"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteField(idx, e)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Field"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Right: Visibility, Multiplicity & Required Toggles */}
                        <div className="flex items-center gap-4 flex-wrap">
                          {/* Visibility Selector */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-gray-500 uppercase">Visibility:</span>
                            <select
                              value={field.visibility || 'PUBLIC'}
                              onChange={(e) => updateField(idx, { visibility: e.target.value })}
                              className="border border-gray-300 rounded h-8 px-2 text-xs bg-white text-gray-800 font-semibold focus:border-[#A52307] outline-none"
                            >
                              <option value="PUBLIC">Public</option>
                              <option value="MEMBERS">Members Only</option>
                              <option value="ADMIN">Admin Only</option>
                            </select>
                          </div>

                          <div className="h-4 w-px bg-gray-300" />

                          {/* Multiplicity Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer" title="Enable multiple repeated entries (e.g. Author 1, Author 2...)">
                            <input
                              type="checkbox"
                              checked={Boolean(field.multiplicity)}
                              onChange={(e) => updateField(idx, { multiplicity: e.target.checked })}
                              className="rounded text-[#A52307] focus:ring-[#A52307]"
                            />
                            <span className="text-xs font-bold text-gray-700">Multiplicity</span>
                          </label>

                          <div className="h-4 w-px bg-gray-300" />

                          {/* Show in Table View Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer" title="Display this field as a column in the table view">
                            <input
                              type="checkbox"
                              checked={field.showInTable !== false}
                              onChange={(e) => updateField(idx, { showInTable: e.target.checked })}
                              className="rounded text-[#A52307] focus:ring-[#A52307]"
                            />
                            <span className="text-xs font-bold text-gray-700">Show in Table</span>
                          </label>

                          <div className="h-4 w-px bg-gray-300" />

                          {/* Required Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(field.required)}
                              onChange={(e) => updateField(idx, { required: e.target.checked })}
                              className="rounded text-[#A52307] focus:ring-[#A52307]"
                            />
                            <span className="text-xs font-bold text-gray-900">Required</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ================= INACTIVE / COLLAPSED QUESTION CARD ================= */
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-900">{field.label || 'Untitled Field'}</span>
                            {field.required && <span className="text-[#A52307] font-bold">*</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {field.type}
                        </span>
                        {field.showInTable !== false && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Table Column
                          </span>
                        )}
                        {field.multiplicity && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Multi-entry
                          </span>
                        )}
                        {field.visibility === 'ADMIN' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                        {field.visibility === 'MEMBERS' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" /> Members
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Add Question Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleAddField}
                className="px-6 py-3 bg-white hover:bg-[#FAF8F5] border-2 border-dashed border-gray-300 hover:border-[#A52307] rounded-xl text-xs font-bold text-gray-700 hover:text-[#A52307] transition-all flex items-center gap-2 mx-auto shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question / Field</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-white border border-[#E2E0DB] rounded-xl p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">{frameworkName || 'Untitled Form Framework'}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                Record Type: {recordType}
              </span>
            </div>
          </div>

          <DynamicFormRenderer
            framework={previewFrameworkObject}
            userRole="ADMIN"
            previewMode={false}
            readOnly={false}
            onSubmit={(values) => {
              alert(`Form Submitted Successfully in Preview Mode:\n\n${JSON.stringify(values, null, 2)}`);
            }}
            submitLabel={`Create ${recordType} Record`}
          />
        </div>
      )}

      {/* MODAL: POST-SAVE TABLE DISPLAY COLUMNS CONFIGURATION */}
      {showTableColumnsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#A52307] text-white flex items-center justify-center shadow-sm">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Table Display Columns</h3>
                  <p className="text-[11px] text-gray-500">Configure what details show in the table view</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-600">
                Choose which details from <strong>{frameworkName || 'this form'}</strong> should be displayed as columns in the table:
              </p>

              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-72 overflow-y-auto bg-gray-50/40 p-1">
                {fields.map((f, idx) => {
                  const isChecked = f.showInTable !== false;
                  return (
                    <label
                      key={idx}
                      className="flex items-center justify-between p-3 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            updateField(idx, { showInTable: e.target.checked });
                          }}
                          className="w-4 h-4 rounded text-[#A52307] focus:ring-[#A52307]"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{f.label || `Field ${idx + 1}`}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">{f.type}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isChecked
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {isChecked ? 'Show in Table' : 'Hidden'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#FAF8F5] border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const allSelected = fields.every((f) => f.showInTable !== false);
                  setFields(fields.map((f) => ({ ...f, showInTable: !allSelected })));
                }}
                className="text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
              >
                {fields.every((f) => f.showInTable !== false) ? 'Deselect All' : 'Select All'}
              </button>

              <button
                type="button"
                onClick={handleSaveTableColumns}
                disabled={saving}
                className="px-5 py-2 bg-[#A52307] text-white text-xs font-bold rounded-lg hover:bg-red-800 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save &amp; Finish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
