'use client';

import { useState, useEffect } from 'react';
import {
  FolderPlus,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';
import { CollectionRecordPicker } from '@/components/content/CollectionRecordPicker';
import { confirmDialog } from '@/lib/dialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { records: number };
}

const PAGE_SIZE = 10;

export default function CatalogueCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [managingCollection, setManagingCollection] = useState<Collection | null>(null);

  const loadCollections = () => {
    setLoading(true);
    setError(null);
    api
      .getCollections()
      .then((data) => {
        setCollections(data);
        setSelectedIds([]);
      })
      .catch((err: any) => setError(err.message || 'Failed to load collections'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openCreateModal = () => {
    setEditingId(null);
    setNewName('');
    setNewDescription('');
    setShowModal(true);
  };

  const openEditModal = (c: Collection) => {
    setEditingId(c.id);
    setNewName(c.name);
    setNewDescription(c.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await api.updateCollection(editingId, { name: newName, description: newDescription });
        setNotification(`Collection "${newName}" updated successfully.`);
      } else {
        await api.createCollection({ name: newName, description: newDescription });
        setNotification(`Collection "${newName}" created successfully.`);
      }
      setShowModal(false);
      setNewName('');
      setNewDescription('');
      setEditingId(null);
      loadCollections();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirmDialog({
      title: 'Delete Collection',
      message: `Are you sure you want to delete collection "${name}"?`,
      tone: 'danger',
    });
    if (!ok) return;
    setError(null);
    try {
      await api.deleteCollection(id);
      setNotification(`Collection "${name}" deleted.`);
      loadCollections();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete collection');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirmDialog({
      title: 'Bulk Delete Collections',
      message: `Are you sure you want to delete ${selectedIds.length} selected collection(s)? This cannot be undone.`,
      tone: 'danger',
    });
    if (!ok) return;
    for (const id of selectedIds) {
      try {
        await api.deleteCollection(id);
      } catch (e) {
        console.error(e);
      }
    }
    setSelectedIds([]);
    loadCollections();
  };

  const filtered = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedCollections = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Curated Collections"
        title="Collections Management"
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            New Collection
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar Container */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search collections by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 border border-[#E2E0DB] rounded-lg text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>

        <div className="text-xs text-gray-500 font-semibold">
          Total: <span className="text-gray-900 font-bold">{collections.length}</span> collection(s)
        </div>
      </div>

      {/* Staff Results Table */}
      <div className="space-y-4">
        {/* Pagination Bar (Top) */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 my-2 overflow-x-auto pb-1">
            {page > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  « First
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  ‹ Prev
                </button>
              </>
            )}

            {pageNumbers.map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => setPage(pNum)}
                className={`min-w-[32px] px-2.5 py-1.5 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                  pNum === page
                    ? 'bg-[#A52307] text-white font-bold shadow-sm'
                    : 'border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                {pNum}
              </button>
            ))}

            {page < totalPages && (
              <>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Next ›
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-1.5 text-xs border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Last »
                </button>
              </>
            )}
          </div>
        )}

        {/* Main Table Container */}
        <div className="bg-white border border-[#E2E0DB] rounded-xl shadow-sm overflow-hidden text-xs">
          {/* Bulk Action Header */}
          {selectedIds.length > 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between">
              <span className="font-semibold text-amber-900 text-xs">
                {selectedIds.length} of {filtered.length} collection(s) selected
              </span>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center text-gray-500">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-xs font-medium">Loading collections…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-500 space-y-2">
              <p className="text-sm font-bold text-gray-700">No collections found</p>
              <p className="text-xs">Create a new collection to curate and group catalogue records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-700 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4 w-10 text-center border-r border-[#E2E0DB]">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onChange={() => {
                          if (selectedIds.length === filtered.length) {
                            setSelectedIds([]);
                          } else {
                            setSelectedIds(filtered.map((r) => r.id));
                          }
                        }}
                        className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307] cursor-pointer"
                        title="Select all"
                      />
                    </th>
                    <th className="py-3.5 px-4 font-bold border-r border-[#E2E0DB] w-[48%]">Collection Details</th>
                    <th className="py-3.5 px-4 font-bold border-r border-[#E2E0DB] w-[32%]">Titles &amp; Holdings</th>
                    <th className="py-3.5 px-4 font-bold w-[20%] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE7]">
                  {paginatedCollections.map((c, idx) => {
                    const itemIndex = (page - 1) * PAGE_SIZE + idx + 1;
                    const isSel = selectedIds.includes(c.id);
                    const recordCount = c._count?.records ?? 0;

                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                          isSel ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td className="py-4 px-3 text-center align-top pt-4 border-r border-[#EEECE7]">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => {
                              setSelectedIds((prev) =>
                                prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                              );
                            }}
                            className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307] cursor-pointer"
                          />
                        </td>

                        {/* 1. Results / Collection Details */}
                        <td className="py-4 px-4 border-r border-[#EEECE7] align-top space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-gray-400 font-mono text-xs mt-0.5">{itemIndex}.</span>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-gray-900 text-sm leading-snug block font-sans">
                                {c.name}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                                <span className="font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold">
                                  {c.slug}
                                </span>
                              </div>
                            </div>
                          </div>

                          {c.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-[#FAF8F5] p-2 rounded border border-[#E2E0DB]/60">
                              {c.description}
                            </p>
                          )}
                        </td>

                        {/* 2. Titles & Holdings */}
                        <td className="py-4 px-4 border-r border-[#EEECE7] align-top space-y-2.5">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                              <span>{recordCount} {recordCount === 1 ? 'Title Assigned' : 'Titles Assigned'}</span>
                            </span>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => setManagingCollection(c)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FAF8F5] hover:bg-gray-100 text-gray-800 border border-[#E2E0DB] transition-all cursor-pointer shadow-2xs"
                            >
                              <Layers className="w-3.5 h-3.5 text-[#A52307]" />
                              <span>Manage Collection Titles</span>
                            </button>
                          </div>
                        </td>

                        {/* 3. Actions */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="flex flex-col gap-1.5 items-center justify-center max-w-[140px] mx-auto">
                            <button
                              type="button"
                              onClick={() => setManagingCollection(c)}
                              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white text-gray-800 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                              title="Manage Titles"
                            >
                              <Layers className="w-3.5 h-3.5 text-[#A52307]" />
                              <span>Manage</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(c)}
                              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                              title="Edit Collection"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(c.id, c.name)}
                              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E2E0DB] bg-white text-red-600 hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                              title="Delete Collection"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Bar (Bottom) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} collections
            </span>
            <div className="flex items-center gap-1.5">
              {pageNumbers.map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setPage(pNum)}
                  className={`min-w-[32px] px-2.5 py-1.5 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                    pNum === page
                      ? 'bg-[#A52307] text-white font-bold shadow-sm'
                      : 'border border-[#E2E0DB] bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {pNum}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#E2E0DB] shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? 'Edit Catalogue Collection' : 'Create Catalogue Collection'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Collection Name*</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-[#E2E0DB] h-9 px-3 rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 border border-[#E2E0DB] rounded-lg outline-none focus:border-[#A52307] text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#E2E0DB] rounded-lg font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A52307] text-white rounded-lg font-bold hover:bg-red-800 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Titles Modal */}
      {managingCollection && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-[#E2E0DB] shadow-2xl p-6 font-sans text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#E2E0DB] pb-3 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A52307]">Collection Contents</p>
                <h3 className="text-base font-bold text-gray-900">{managingCollection.name}</h3>
              </div>
              <button onClick={() => setManagingCollection(null)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <CollectionRecordPicker collectionId={managingCollection.id} onChanged={loadCollections} />
          </div>
        </div>
      )}
    </div>
  );
}
