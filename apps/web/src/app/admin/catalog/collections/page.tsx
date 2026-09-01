'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderPlus,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { records: number };
}

export default function CatalogueCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadCollections = () => {
    setLoading(true);
    setError(null);
    api
      .getCollections()
      .then((data) => setCollections(data))
      .catch((err: any) => setError(err.message || 'Failed to load collections'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCollections();
  }, []);

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
    if (!confirm(`Are you sure you want to delete collection "${name}"?`)) return;
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

  const filtered = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Curated Collections"
        title="Collections Management"
        description="Organize bibliographic records into thematic, archival, and research collections for discovery and institutional preservation."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            New Collection
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-gray-500 font-semibold">Loading collections...</div>
      ) : (
        <>
          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div key={c.id} className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm flex flex-col justify-between hover:border-black transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded">
                      {c.slug}
                    </span>
                  </div>

                  <h3 className="font-amiri text-xl font-bold text-gray-900 leading-tight">
                    {c.name}
                  </h3>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E0DB] flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-900 font-mono">
                    {c._count?.records ?? 0} Titles
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href="/admin/catalog"
                      className="px-2.5 py-1 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors"
                    >
                      Manage Titles
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-1 text-gray-400 hover:text-gray-900"
                      title="Edit Collection"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1 text-gray-400 hover:text-[#A52307]"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-xs text-gray-500 font-semibold">No collections found.</div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? 'Edit Catalogue Collection' : 'Create Catalogue Collection'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
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
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
