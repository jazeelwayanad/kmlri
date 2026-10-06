'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Layers,
  AlertCircle,
  FileText,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader, Button } from '@/components/admin/ui';
import DynamicFormRenderer, { FormFrameworkSchema } from '@/components/forms/DynamicFormRenderer';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/ui/LoadingSpinner';

function CreateCatalogRecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFrameworkCode = searchParams.get('framework');

  const [frameworks, setFrameworks] = useState<FormFrameworkSchema[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<FormFrameworkSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await api.getFormFrameworks('ITEM');
        if (isMounted) {
          const list: FormFrameworkSchema[] = Array.isArray(data) ? data : [];
          setFrameworks(list);
          if (list.length > 0) {
            const matched = list.find((fw) => fw.code === initialFrameworkCode) || list[0];
            setSelectedFramework(matched);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load form frameworks.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [initialFrameworkCode]);

  const handleSubmit = async (values: Record<string, any>) => {
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        titleLatin: values.titleProper || values.title || values.titleLatin || values.name || 'Untitled Record',
        subtitle: values.subtitle || undefined,
        titleArabic: values.uniformTitle || values.titleArabic || undefined,
        authors: values.author || values.authors
          ? Array.isArray(values.author || values.authors)
            ? (values.author || values.authors).filter(Boolean)
            : [values.author || values.authors]
          : undefined,
        format: values.format || undefined,
        language: values.language || undefined,
        publisher: values.publisher || undefined,
        publicationYear: values.publicationYear || values.year || undefined,
        shelfmark: values.shelfmark || values.callNumber || undefined,
        isbn: values.isbn || undefined,
        edition: values.edition || undefined,
        series: values.series || undefined,
        extent: values.extent || undefined,
        notes: values.summary || values.notes || values.description || undefined,
        coverImageUrl: values.digitalAttachment || values.coverImageUrl || values.imageUrl || undefined,
        frameworkCode: selectedFramework?.code || undefined,
        customFields: JSON.stringify(values),
        initialCopiesCount: 0,
      };

      await api.createCatalogItem(payload);
      router.push('/admin/catalog');
    } catch (err: any) {
      setError(err.message || 'Could not save the record. Please check the required fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingState message="Loading catalog form framework..." />
      </div>
    );
  }

  if (frameworks.length === 0) {
    return (
      <div className="space-y-6 font-sans max-w-4xl mx-auto pb-16">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/admin/catalog" className="hover:text-gray-900 transition-colors">
            Catalogues
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">New Record</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E0DB] p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">No Form Framework Configured</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Before creating catalogue records, please configure a form framework for Catalog Items.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/admin/catalog"
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E2E0DB] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Catalogues
            </Link>
            <Link
              href="/admin/catalog/frameworks/new"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#A52307] text-white hover:bg-red-800 transition-colors"
            >
              Create New Framework
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-20">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/admin/catalog" className="hover:text-[#A52307] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalogues
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">Create New Record</span>
        </div>

        {/* Framework Selector Switcher */}
        {frameworks.length > 1 && (
          <div className="flex items-center gap-2 bg-[#FAF8F5] p-1 rounded-lg border border-[#E2E0DB]">
            <span className="text-[11px] font-semibold text-gray-500 pl-2">Form Framework:</span>
            <div className="flex gap-1">
              {frameworks.map((fw) => {
                const isActive = selectedFramework?.code === fw.code;
                return (
                  <button
                    key={fw.code}
                    type="button"
                    onClick={() => setSelectedFramework(fw)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      isActive
                        ? 'bg-white text-[#A52307] shadow-sm border border-[#E2E0DB]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {fw.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Header Card */}
      <div className="bg-[#FAF8F5] border border-[#E2E0DB] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#A52307] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              {selectedFramework?.recordType || 'ITEM'} FORM
            </span>
            <span className="text-xs text-gray-500">
              Code: <code className="font-mono text-gray-700">{selectedFramework?.code}</code>
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {selectedFramework?.name || 'New Bibliographic Record'}
          </h1>
          {selectedFramework?.description && (
            <p className="text-xs text-gray-600 mt-0.5">{selectedFramework.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-[#E2E0DB]">
          <Layers className="w-4 h-4 text-[#A52307]" />
          <span>
            <strong className="text-gray-900">{selectedFramework?.fields?.length || 0}</strong> configured fields
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Form Card */}
      {selectedFramework && (
        <div className="bg-white border border-[#E2E0DB] rounded-xl shadow-sm p-6 sm:p-8">
          <DynamicFormRenderer
            framework={selectedFramework}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/catalog')}
            isSubmitting={saving}
            submitLabel="Save Bibliographic Record"
          />
        </div>
      )}
    </div>
  );
}

export default function CreateCatalogRecordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center">
          <LoadingState message="Loading catalog form..." />
        </div>
      }
    >
      <CreateCatalogRecordContent />
    </Suspense>
  );
}
