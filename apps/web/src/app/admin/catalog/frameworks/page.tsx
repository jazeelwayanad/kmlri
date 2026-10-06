'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Sliders,
  Edit3,
  Trash2,
  Copy,
  Layers,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Bookmark,
  UserCheck,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import { api } from '@/lib/api';
import { FormFrameworkSchema } from '@/components/forms/DynamicFormRenderer';

export default function FrameworksListPage() {
  const [frameworks, setFrameworks] = useState<FormFrameworkSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFrameworks = useCallback(async () => {
    setLoading(true);
    try {
      const typeParam = selectedType === 'ALL' ? undefined : selectedType;
      const data = await api.getFormFrameworks(typeParam);
      setFrameworks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to load record frameworks.' });
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  const handleDeleteFramework = async (fw: FormFrameworkSchema) => {
    if (!confirm(`Are you sure you want to delete the framework "${fw.name}"?`)) return;

    try {
      await api.deleteFormFramework(fw.code || (fw as any).id);
      setFrameworks((prev) => prev.filter((item) => item.code !== fw.code && (item as any).id !== (fw as any).id));
      setNotification({ type: 'success', text: `Framework "${fw.name}" deleted successfully.` });
      await fetchFrameworks();
    } catch (err: any) {
      alert(err.message || 'Could not delete framework.');
    }
  };

  const handleDuplicateFramework = async (fw: FormFrameworkSchema) => {
    try {
      const newCode = `${fw.code}_COPY_${Date.now().toString().slice(-4)}`;
      const newName = `${fw.name} (Copy)`;
      await api.createFormFramework({
        code: newCode,
        name: newName,
        recordType: fw.recordType,
        description: '',
        isDefault: false,
        fields: fw.fields,
      });
      setNotification({ type: 'success', text: `Duplicated framework as "${newName}".` });
      await fetchFrameworks();
    } catch (err: any) {
      alert(err.message || 'Could not duplicate framework.');
    }
  };

  const getRecordTypeBadge = (type: string) => {
    switch (type) {
      case 'ITEM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <BookOpen className="w-3 h-3 text-[#A52307]" /> Item Creation
          </span>
        );
      case 'SERIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
            <Bookmark className="w-3 h-3 text-blue-600" /> Serial Creation
          </span>
        );
      case 'AUTHORITY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" /> Authority Creation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
            <FileText className="w-3 h-3" /> {type}
          </span>
        );
    }
  };

  const filteredFrameworks = frameworks.filter((fw) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = fw.name?.toLowerCase().includes(q);
      const matchCode = fw.code?.toLowerCase().includes(q);
      const matchDesc = fw.description?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans pb-16 max-w-[1440px]">
      <PageHeader
        eyebrow="Catalogue · Form Frameworks"
        title="Record Creation Frameworks"
        actions={
          <Link href="/admin/catalog/frameworks/new">
            <Button variant="primary" icon={Plus}>
              Create Framework
            </Button>
          </Link>
        }
      />

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

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-[#E2E0DB] rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Record Type Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: 'ALL', label: 'All Frameworks' },
            { key: 'ITEM', label: 'Items' },
            { key: 'SERIAL', label: 'Serials' },
            { key: 'AUTHORITY', label: 'Authorities' },
          ].map((tab) => {
            const isSel = selectedType === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedType(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#A52307] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-gray-700 hover:bg-gray-100 border border-[#E2E0DB]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search frameworks by title or code…"
            className="w-full border border-gray-300 rounded-lg h-9 pl-9 pr-3 text-xs font-sans text-gray-900 focus:border-[#A52307] outline-none"
          />
        </div>
      </div>

      {/* Frameworks Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading record frameworks…</div>
        ) : filteredFrameworks.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 space-y-3">
            <p className="font-semibold text-gray-700">No frameworks found.</p>
            <p>Click <strong>Create Framework</strong> to design a new form.</p>
            <Link href="/admin/catalog/frameworks/new" className="inline-block mt-2">
              <Button variant="primary" icon={Plus}>
                Create First Framework
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                  <th className="py-3.5 px-4">Framework Title</th>
                  <th className="py-3.5 px-4">Module Target</th>
                  <th className="py-3.5 px-4">Fields Configured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEECE7]">
                {filteredFrameworks.map((fw) => {
                  const fieldCount = fw.fields?.length || 0;

                  return (
                    <tr key={fw.code} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900 text-sm">{fw.name}</div>
                      </td>

                      <td className="py-4 px-4">{getRecordTypeBadge(fw.recordType)}</td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {fieldCount} {fieldCount === 1 ? 'Field' : 'Fields'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/catalog/frameworks/${encodeURIComponent(fw.code)}`}
                            className="px-3 py-1.5 bg-black hover:bg-[#A52307] text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Form</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDuplicateFramework(fw)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Duplicate Framework"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFramework(fw)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Framework"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
