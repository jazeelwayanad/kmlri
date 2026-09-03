'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, ShieldAlert, X, Trash2, Star, FileCode2 } from 'lucide-react';
import { PageHeader, Button, Card, Badge } from '@/components/admin/ui';
import { api } from '@/lib/api';
import { confirmDialog } from '@/lib/dialog';

interface MarcFrameworkField {
  id: string;
  frameworkId: string;
  tag: string;
  subfield?: string | null;
  label: string;
  mappedField?: string | null;
  mandatory: boolean;
  repeatable: boolean;
  hidden: boolean;
  defaultValue?: string | null;
  authorisedValueCategory?: string | null;
  sortOrder: number;
}

interface MarcFramework {
  id: string;
  code: string;
  description: string;
  materialType?: string | null;
  isDefault: boolean;
  fields?: MarcFrameworkField[];
  _count?: { fields: number };
}

const emptyFrameworkForm = { code: '', description: '', materialType: '', isDefault: false };
const emptyFieldForm = {
  tag: '',
  subfield: '',
  label: '',
  mappedField: '',
  mandatory: false,
  repeatable: false,
  hidden: false,
  defaultValue: '',
  authorisedValueCategory: '',
  sortOrder: '0',
};

export default function MarcFrameworksAdminPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [frameworks, setFrameworks] = useState<MarcFramework[]>([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<MarcFramework | null>(null);
  const [loadingFramework, setLoadingFramework] = useState(false);

  const [showFrameworkModal, setShowFrameworkModal] = useState(false);
  const [frameworkForm, setFrameworkForm] = useState(emptyFrameworkForm);

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState<MarcFrameworkField | null>(null);
  const [fieldForm, setFieldForm] = useState(emptyFieldForm);

  const [submitting, setSubmitting] = useState(false);

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadFrameworks = async () => {
    setLoadingFrameworks(true);
    try {
      const data = await api.getMarcFrameworks();
      setFrameworks(data || []);
      if (data?.length && !selectedCode) setSelectedCode(data[0].code);
    } catch (err: any) {
      notify('error', err.message || 'Could not load MARC frameworks.');
    } finally {
      setLoadingFrameworks(false);
    }
  };

  const loadFramework = async (code: string) => {
    setLoadingFramework(true);
    try {
      const data = await api.getMarcFramework(code);
      setSelectedFramework(data);
    } catch (err: any) {
      notify('error', err.message || 'Could not load this MARC framework.');
    } finally {
      setLoadingFramework(false);
    }
  };

  useEffect(() => {
    loadFrameworks();
  }, []);

  useEffect(() => {
    if (selectedCode) loadFramework(selectedCode);
  }, [selectedCode]);

  const handleCreateFramework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frameworkForm.code.trim() || !frameworkForm.description.trim()) return;
    setSubmitting(true);
    try {
      const created = await api.createMarcFramework({
        code: frameworkForm.code,
        description: frameworkForm.description,
        materialType: frameworkForm.materialType || undefined,
        isDefault: frameworkForm.isDefault,
      });
      notify('success', `Framework "${frameworkForm.code}" created.`);
      setShowFrameworkModal(false);
      setFrameworkForm(emptyFrameworkForm);
      await loadFrameworks();
      setSelectedCode(created.code);
    } catch (err: any) {
      notify('error', err.message || 'Could not create the framework.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFramework = async (fw: MarcFramework) => {
    if (!(await confirmDialog({ message: `Permanently remove framework "${fw.code}"? This cannot be undone.`, variant: 'danger' }))) return;
    try {
      await api.deleteMarcFramework(fw.code);
      notify('success', `Framework "${fw.code}" removed.`);
      if (selectedCode === fw.code) setSelectedCode(null);
      await loadFrameworks();
    } catch (err: any) {
      notify('error', err.message || 'Could not remove the framework.');
    }
  };

  const openCreateField = () => {
    setEditingField(null);
    setFieldForm(emptyFieldForm);
    setShowFieldModal(true);
  };

  const openEditField = (f: MarcFrameworkField) => {
    setEditingField(f);
    setFieldForm({
      tag: f.tag,
      subfield: f.subfield || '',
      label: f.label,
      mappedField: f.mappedField || '',
      mandatory: f.mandatory,
      repeatable: f.repeatable,
      hidden: f.hidden,
      defaultValue: f.defaultValue || '',
      authorisedValueCategory: f.authorisedValueCategory || '',
      sortOrder: String(f.sortOrder),
    });
    setShowFieldModal(true);
  };

  const handleSubmitField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFramework || !fieldForm.tag.trim() || !fieldForm.label.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        tag: fieldForm.tag,
        subfield: fieldForm.subfield || undefined,
        label: fieldForm.label,
        mappedField: fieldForm.mappedField || undefined,
        mandatory: fieldForm.mandatory,
        repeatable: fieldForm.repeatable,
        hidden: fieldForm.hidden,
        defaultValue: fieldForm.defaultValue || undefined,
        authorisedValueCategory: fieldForm.authorisedValueCategory || undefined,
        sortOrder: parseInt(fieldForm.sortOrder || '0', 10),
      };
      if (editingField) {
        await api.updateMarcFrameworkField(editingField.id, payload);
        notify('success', `Field ${fieldForm.tag}${fieldForm.subfield ? '$' + fieldForm.subfield : ''} updated.`);
      } else {
        await api.addMarcFrameworkField(selectedFramework.code, payload);
        notify('success', `Field ${fieldForm.tag}${fieldForm.subfield ? '$' + fieldForm.subfield : ''} added.`);
      }
      setShowFieldModal(false);
      setFieldForm(emptyFieldForm);
      setEditingField(null);
      await loadFramework(selectedFramework.code);
      await loadFrameworks();
    } catch (err: any) {
      notify('error', err.message || 'Could not save the field.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteField = async (f: MarcFrameworkField) => {
    if (!selectedFramework) return;
    if (!(await confirmDialog({ message: `Remove field ${f.tag}${f.subfield ? '$' + f.subfield : ''}?`, variant: 'danger' }))) return;
    try {
      await api.removeMarcFrameworkField(f.id);
      notify('success', 'Field removed.');
      await loadFramework(selectedFramework.code);
      await loadFrameworks();
    } catch (err: any) {
      notify('error', err.message || 'Could not remove the field.');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Catalogue · MARC Cataloguing"
        title="MARC Frameworks"
        description="Configure MARC frameworks and their field definitions — tag, subfield, mandatory/repeatable/hidden flags, default values, and authorised value constraints used when cataloguing a record."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowFrameworkModal(true)}>
            Add Framework
          </Button>
        }
      />

      {notification && (
        <div
          className={`p-4 rounded-lg text-sm font-semibold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
              : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Frameworks list */}
        <Card padded={false} className="md:col-span-1">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">Frameworks</h3>
          </div>
          {loadingFrameworks ? (
            <div className="p-6 text-center text-gray-500 text-xs">Loading…</div>
          ) : frameworks.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs">No frameworks yet.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[620px] overflow-y-auto">
              {frameworks.map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => setSelectedCode(fw.code)}
                  className={`w-full text-left p-4 flex justify-between items-start gap-2 transition-colors ${
                    selectedCode === fw.code ? 'bg-heritage-red/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-gray-900 text-xs">{fw.code}</span>
                      {fw.isDefault && <Star className="w-3 h-3 text-amber-500 fill-amber-400" />}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{fw.description}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="neutral">{fw._count?.fields ?? 0} fields</Badge>
                    {!fw.isDefault && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFramework(fw);
                        }}
                        className="p-1.5 text-red-500 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Delete Framework"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Field table for selected framework */}
        <Card padded={false} className="md:col-span-2">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2 min-w-0">
              <FileCode2 className="w-4 h-4 text-heritage-red shrink-0" />
              <h3 className="font-bold text-gray-900 text-sm truncate">
                {selectedFramework ? `${selectedFramework.code} — ${selectedFramework.description}` : 'Select a framework'}
              </h3>
            </div>
            {selectedFramework && (
              <Button variant="primary" icon={Plus} onClick={openCreateField}>
                Add Field
              </Button>
            )}
          </div>

          {!selectedFramework ? (
            <div className="p-10 text-center text-gray-500 text-xs">Select a framework on the left to manage its fields.</div>
          ) : loadingFramework ? (
            <div className="p-10 text-center text-gray-500 text-xs">Loading fields…</div>
          ) : (selectedFramework.fields || []).length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-xs">No fields defined on this framework yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold">
                    <th className="py-3 px-4">Tag</th>
                    <th className="py-3 px-4">Label</th>
                    <th className="py-3 px-4">Mandatory</th>
                    <th className="py-3 px-4">Repeatable</th>
                    <th className="py-3 px-4">Hidden</th>
                    <th className="py-3 px-4">Default</th>
                    <th className="py-3 px-4">Auth. Category</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(selectedFramework.fields || [])
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                          {f.tag}
                          {f.subfield && <span className="text-heritage-red">${f.subfield}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-gray-700">{f.label}</td>
                        <td className="py-3.5 px-4">
                          {f.mandatory ? <Badge variant="danger">Required</Badge> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="py-3.5 px-4">{f.repeatable ? 'Yes' : 'No'}</td>
                        <td className="py-3.5 px-4">{f.hidden ? 'Yes' : 'No'}</td>
                        <td className="py-3.5 px-4 text-gray-500">{f.defaultValue || '—'}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-500">{f.authorisedValueCategory || '—'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button variant="outline" onClick={() => openEditField(f)}>
                              Edit
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDeleteField(f)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                              title="Delete Field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Framework Modal */}
      {showFrameworkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Add Framework</h3>
              <button onClick={() => setShowFrameworkModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFramework} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. THESIS"
                  value={frameworkForm.code}
                  onChange={(e) => setFrameworkForm({ ...frameworkForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={frameworkForm.description}
                  onChange={(e) => setFrameworkForm({ ...frameworkForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Material Type</label>
                <input
                  type="text"
                  placeholder="matches BibliographicRecord.format, e.g. THESIS"
                  value={frameworkForm.materialType}
                  onChange={(e) => setFrameworkForm({ ...frameworkForm, materialType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={frameworkForm.isDefault}
                  onChange={(e) => setFrameworkForm({ ...frameworkForm, isDefault: e.target.checked })}
                />
                <span className="font-bold text-gray-800">Set as default framework</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowFrameworkModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-heritage-red text-white rounded text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Create Framework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Field Modal */}
      {showFieldModal && selectedFramework && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingField ? 'Edit Field' : 'Add Field'} — {selectedFramework.code}
              </h3>
              <button onClick={() => setShowFieldModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitField} className="p-6 space-y-4 text-xs font-sans max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">MARC Tag * (3 chars)</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. 245"
                    value={fieldForm.tag}
                    onChange={(e) => setFieldForm({ ...fieldForm, tag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Subfield (lowercase letter)</label>
                  <input
                    type="text"
                    maxLength={1}
                    placeholder="e.g. a"
                    value={fieldForm.subfield}
                    onChange={(e) => setFieldForm({ ...fieldForm, subfield: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Label *</label>
                <input
                  type="text"
                  required
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Mapped Field</label>
                <input
                  type="text"
                  placeholder="e.g. titleLatin"
                  value={fieldForm.mappedField}
                  onChange={(e) => setFieldForm({ ...fieldForm, mappedField: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={fieldForm.mandatory}
                    onChange={(e) => setFieldForm({ ...fieldForm, mandatory: e.target.checked })}
                  />
                  <span className="font-bold text-gray-800">Mandatory</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={fieldForm.repeatable}
                    onChange={(e) => setFieldForm({ ...fieldForm, repeatable: e.target.checked })}
                  />
                  <span className="font-bold text-gray-800">Repeatable</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={fieldForm.hidden}
                    onChange={(e) => setFieldForm({ ...fieldForm, hidden: e.target.checked })}
                  />
                  <span className="font-bold text-gray-800">Hidden</span>
                </label>
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Default Value</label>
                <input
                  type="text"
                  value={fieldForm.defaultValue}
                  onChange={(e) => setFieldForm({ ...fieldForm, defaultValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Authorised Value Category</label>
                <input
                  type="text"
                  placeholder="e.g. CCODE"
                  value={fieldForm.authorisedValueCategory}
                  onChange={(e) => setFieldForm({ ...fieldForm, authorisedValueCategory: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Sort Order</label>
                <input
                  type="number"
                  value={fieldForm.sortOrder}
                  onChange={(e) => setFieldForm({ ...fieldForm, sortOrder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-heritage-red text-white rounded text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : editingField ? 'Save Changes' : 'Add Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
