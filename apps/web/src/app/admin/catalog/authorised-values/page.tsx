'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, ShieldAlert, X, Trash2, Tag } from 'lucide-react';
import { PageHeader, Button, Card, Badge } from '@/components/admin/ui';
import { api } from '@/lib/api';
import { confirmDialog } from '@/lib/dialog';

interface AuthorisedValueCategory {
  id: string;
  category: string;
  description?: string;
  _count?: { values: number };
}

interface AuthorisedValue {
  id: string;
  categoryId: string;
  code: string;
  description: string;
  sortOrder: number;
}

const emptyCategoryForm = { category: '', description: '' };
const emptyValueForm = { code: '', description: '', sortOrder: '0' };

export default function AuthorisedValuesAdminPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [categories, setCategories] = useState<AuthorisedValueCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AuthorisedValueCategory | null>(null);
  const [values, setValues] = useState<AuthorisedValue[]>([]);
  const [loadingValues, setLoadingValues] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [showValueModal, setShowValueModal] = useState(false);
  const [editingValue, setEditingValue] = useState<AuthorisedValue | null>(null);
  const [valueForm, setValueForm] = useState(emptyValueForm);
  const [submitting, setSubmitting] = useState(false);

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await api.getAuthorisedValueCategories();
      setCategories(data || []);
      if (data?.length && !selectedCategory) {
        setSelectedCategory(data[0]);
      }
    } catch (err: any) {
      notify('error', err.message || 'Could not load authorised value categories.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadValues = async (category: AuthorisedValueCategory) => {
    setLoadingValues(true);
    try {
      const data = await api.getAuthorisedValues(category.category);
      setValues(data || []);
    } catch (err: any) {
      notify('error', err.message || 'Could not load authorised values.');
    } finally {
      setLoadingValues(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) loadValues(selectedCategory);
  }, [selectedCategory?.id]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.category.trim()) return;
    setSubmitting(true);
    try {
      const created = await api.createAuthorisedValueCategory({
        category: categoryForm.category,
        description: categoryForm.description || undefined,
      });
      notify('success', `Category "${categoryForm.category}" created.`);
      setShowCategoryModal(false);
      setCategoryForm(emptyCategoryForm);
      await loadCategories();
      setSelectedCategory(created);
    } catch (err: any) {
      notify('error', err.message || 'Could not create the category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (c: AuthorisedValueCategory) => {
    if (!(await confirmDialog({ message: `Permanently remove category "${c.category}"? This cannot be undone.`, variant: 'danger' }))) return;
    try {
      await api.deleteAuthorisedValueCategory(c.id);
      notify('success', `Category "${c.category}" removed.`);
      if (selectedCategory?.id === c.id) setSelectedCategory(null);
      await loadCategories();
    } catch (err: any) {
      notify('error', err.message || 'Could not remove the category.');
    }
  };

  const openCreateValue = () => {
    setEditingValue(null);
    setValueForm(emptyValueForm);
    setShowValueModal(true);
  };

  const openEditValue = (v: AuthorisedValue) => {
    setEditingValue(v);
    setValueForm({ code: v.code, description: v.description, sortOrder: String(v.sortOrder) });
    setShowValueModal(true);
  };

  const handleSubmitValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !valueForm.code.trim() || !valueForm.description.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        code: valueForm.code,
        description: valueForm.description,
        sortOrder: parseInt(valueForm.sortOrder || '0', 10),
      };
      if (editingValue) {
        await api.updateAuthorisedValue(editingValue.id, payload);
        notify('success', `Value "${valueForm.code}" updated.`);
      } else {
        await api.createAuthorisedValue(selectedCategory.id, payload);
        notify('success', `Value "${valueForm.code}" created.`);
      }
      setShowValueModal(false);
      setValueForm(emptyValueForm);
      setEditingValue(null);
      await loadValues(selectedCategory);
      await loadCategories();
    } catch (err: any) {
      notify('error', err.message || 'Could not save the value.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteValue = async (v: AuthorisedValue) => {
    if (!selectedCategory) return;
    if (!(await confirmDialog({ message: `Remove value "${v.code}"?`, variant: 'danger' }))) return;
    try {
      await api.deleteAuthorisedValue(v.id);
      notify('success', `Value "${v.code}" removed.`);
      await loadValues(selectedCategory);
      await loadCategories();
    } catch (err: any) {
      notify('error', err.message || 'Could not remove the value.');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        eyebrow="Catalogue · Controlled Vocabularies"
        title="Authorised Values"
        description="Maintain authorised value categories (e.g. CCODE, LOC, LANG) and the codes within each — used to constrain item copy and MARC field values."
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
        {/* Categories list */}
        <Card padded={false} className="md:col-span-1">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm">Categories</h3>
            <Button variant="outline" icon={Plus} onClick={() => setShowCategoryModal(true)}>
              Add
            </Button>
          </div>
          {loadingCategories ? (
            <div className="p-6 text-center text-gray-500 text-xs">Loading…</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs">No categories yet.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[560px] overflow-y-auto">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={`w-full text-left p-4 flex justify-between items-center gap-2 transition-colors ${
                    selectedCategory?.id === c.id ? 'bg-heritage-red/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-gray-900 text-xs">{c.category}</div>
                    {c.description && <div className="text-[11px] text-gray-500 truncate">{c.description}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="neutral">{c._count?.values ?? 0}</Badge>
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(c);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Values for selected category */}
        <Card padded={false} className="md:col-span-2">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-heritage-red" />
              <h3 className="font-bold text-gray-900 text-sm">
                {selectedCategory ? `Values in ${selectedCategory.category}` : 'Select a category'}
              </h3>
            </div>
            {selectedCategory && (
              <Button variant="primary" icon={Plus} onClick={openCreateValue}>
                Add Value
              </Button>
            )}
          </div>

          {!selectedCategory ? (
            <div className="p-10 text-center text-gray-500 text-xs">Select a category on the left to manage its values.</div>
          ) : loadingValues ? (
            <div className="p-10 text-center text-gray-500 text-xs">Loading values…</div>
          ) : values.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-xs">No values in this category yet.</div>
          ) : (
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Sort Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {values.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{v.code}</td>
                    <td className="py-3.5 px-4 text-gray-700">{v.description}</td>
                    <td className="py-3.5 px-4 text-gray-500">{v.sortOrder}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="outline" onClick={() => openEditValue(v)}>
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteValue(v)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          title="Delete Value"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Add Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Category Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CCODE"
                  value={categoryForm.category}
                  onChange={(e) => setCategoryForm({ ...categoryForm, category: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-heritage-red text-white rounded text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Value Modal */}
      {showValueModal && selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingValue ? 'Edit Value' : 'Add Value'} — {selectedCategory.category}
              </h3>
              <button onClick={() => setShowValueModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitValue} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Code *</label>
                <input
                  type="text"
                  required
                  value={valueForm.code}
                  onChange={(e) => setValueForm({ ...valueForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={valueForm.description}
                  onChange={(e) => setValueForm({ ...valueForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div>
                <label className="font-bold text-gray-800 block mb-1">Sort Order</label>
                <input
                  type="number"
                  value={valueForm.sortOrder}
                  onChange={(e) => setValueForm({ ...valueForm, sortOrder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none focus:border-heritage-red"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowValueModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-heritage-red text-white rounded text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : editingValue ? 'Save Changes' : 'Create Value'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
