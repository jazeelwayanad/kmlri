'use client';

import { useState } from 'react';
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
  X,
  ArrowRight
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function CatalogueCollectionsPage() {
  const [collections, setCollections] = useState([
    {
      id: 'COL-01',
      title: 'Ponnāni Makhdūm Archival Manuscripts',
      titleArabic: 'مخطوطات مخدوم بوناني',
      curator: 'Archival Research Unit',
      recordCount: 142,
      accessTier: 'RESTRICTED_RESEARCH',
      description: 'Original codices, jurisprudence rulings, and seafaring trade treatises from the Makhdūm library lineage.',
      featured: true,
    },
    {
      id: 'COL-02',
      title: 'Classical Arabi-Malayalam Lithographs & Prints',
      titleArabic: 'مطبوعات عربية ملايبارية قديمة',
      curator: 'Linguistic Heritage Desk',
      recordCount: 88,
      accessTier: 'PUBLIC_DIGITAL',
      description: '19th and early 20th century lithographed devotional poetry, medical texts, and historical chronicles in Arabi-Malayalam script.',
      featured: true,
    },
    {
      id: 'COL-03',
      title: 'Malabar Coastal Inscriptions & Epigraphy',
      titleArabic: 'نقوش سواحل مليبار',
      curator: 'Maritime Studies Group',
      recordCount: 34,
      accessTier: 'PUBLIC_DIGITAL',
      description: 'Tombstone epigraphs, mosque foundation tablets, and maritime charter manuscripts.',
      featured: false,
    },
  ]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleArabic, setNewTitleArabic] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAccessTier, setNewAccessTier] = useState('PUBLIC_DIGITAL');
  const [notification, setNotification] = useState<string | null>(null);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const newCol = {
      id: `COL-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      titleArabic: newTitleArabic,
      curator: 'Staff Curator',
      recordCount: 0,
      accessTier: newAccessTier,
      description: newDescription,
      featured: false,
    };
    setCollections([newCol, ...collections]);
    setShowModal(false);
    setNewTitle('');
    setNewTitleArabic('');
    setNewDescription('');
    setNotification(`Collection "${newTitle}" created successfully.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete/archive collection "${title}"?`)) {
      setCollections(collections.filter((c) => c.id !== id));
      setNotification(`Collection "${title}" archived.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filtered = collections.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Curated Collections"
        title="Collections Management"
        description="Organize bibliographic records into thematic, archival, and research collections for discovery and institutional preservation."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
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

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm flex flex-col justify-between hover:border-black transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded">
                  {c.id}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  c.accessTier === 'PUBLIC_DIGITAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {c.accessTier.replace(/_/g, ' ')}
                </span>
              </div>

              <h3 className="font-amiri text-xl font-bold text-gray-900 leading-tight">
                {c.title}
              </h3>
              {c.titleArabic && (
                <p className="font-amiri text-sm text-gray-500 mt-0.5" dir="rtl">
                  {c.titleArabic}
                </p>
              )}

              <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E0DB] flex justify-between items-center text-xs">
              <span className="font-bold text-gray-900 font-mono">
                {c.recordCount} Titles
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
                  onClick={() => handleDelete(c.id, c.title)}
                  className="p-1 text-gray-400 hover:text-[#A52307]"
                  title="Archive Collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl p-6 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Create Catalogue Collection</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Collection Title (English)*</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Title (Arabic Script)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={newTitleArabic}
                  onChange={(e) => setNewTitleArabic(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-sm font-amiri"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded outline-none focus:border-[#A52307] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Access Tier</label>
                <select
                  value={newAccessTier}
                  onChange={(e) => setNewAccessTier(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded outline-none focus:border-[#A52307] text-xs"
                >
                  <option value="PUBLIC_DIGITAL">Public Digital Access</option>
                  <option value="RESTRICTED_RESEARCH">Restricted Academic Research</option>
                  <option value="CURATORIAL_VAULT">Curatorial Vault Only</option>
                </select>
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
                  className="px-5 py-2 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
