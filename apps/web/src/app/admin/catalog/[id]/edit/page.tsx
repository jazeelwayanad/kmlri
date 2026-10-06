'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  Layers,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import DynamicFormRenderer, { FormFrameworkSchema } from '@/components/forms/DynamicFormRenderer';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/ui/LoadingSpinner';

export default function EditCatalogRecordPage() {
  const params = useParams();
  const recordId = params?.id as string;
  const router = useRouter();

  const [record, setRecord] = useState<any>(null);
  const [frameworks, setFrameworks] = useState<FormFrameworkSchema[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<FormFrameworkSchema | null>(null);
  const [initialValues, setInitialValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [rec, fwData] = await Promise.all([
          api.getCatalogItem(recordId),
          api.getFormFrameworks('ITEM'),
        ]);

        if (!isMounted) return;

        setRecord(rec);
        const fwList: FormFrameworkSchema[] = Array.isArray(fwData) ? fwData : [];
        setFrameworks(fwList);

        // Find framework matching record's frameworkCode or fallback to first
        let activeFw: FormFrameworkSchema | undefined;
        if (rec.frameworkCode) {
          activeFw = fwList.find((f) => f.code === rec.frameworkCode);
        }
        if (!activeFw && fwList.length > 0) {
          activeFw = fwList[0];
        }
        setSelectedFramework(activeFw || null);

        // Prepare initial values
        let parsedCustom: Record<string, any> = {};
        if (rec.customFields) {
          try {
            parsedCustom = typeof rec.customFields === 'string' ? JSON.parse(rec.customFields) : rec.customFields;
          } catch {
            parsedCustom = {};
          }
        }

        const mergedValues: Record<string, any> = {
          titleProper: rec.titleLatin,
          titleLatin: rec.titleLatin,
          title: rec.titleLatin,
          name: rec.titleLatin,
          subtitle: rec.subtitle || '',
          uniformTitle: rec.titleArabic || '',
          titleArabic: rec.titleArabic || '',
          author: Array.isArray(rec.authors) ? rec.authors[0] || '' : rec.authors || '',
          authors: rec.authors || [],
          format: rec.format || '',
          language: rec.language || '',
          publisher: rec.publisher || '',
          publicationYear: rec.publicationYear || '',
          year: rec.publicationYear || '',
          shelfmark: rec.shelfmark || '',
          callNumber: rec.callNumber || rec.shelfmark || '',
          isbn: rec.isbn || '',
          edition: rec.edition || '',
          series: rec.series || '',
          extent: rec.extent || '',
          summary: rec.summary || rec.notes || '',
          notes: rec.notes || rec.summary || '',
          description: rec.notes || rec.summary || '',
          digitalAttachment: rec.coverImageUrl || '',
          coverImageUrl: rec.coverImageUrl || '',
          imageUrl: rec.coverImageUrl || '',
          ...parsedCustom,
        };

        setInitialValues(mergedValues);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load record details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [recordId]);

  const handleSubmit = async (values: Record<string, any>) => {
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        titleLatin: values.titleProper || values.title || values.titleLatin || values.name || record.titleLatin,
        subtitle: values.subtitle !== undefined ? values.subtitle : record.subtitle,
        titleArabic: values.uniformTitle || values.titleArabic || undefined,
        authors: values.author || values.authors
          ? Array.isArray(values.author || values.authors)
            ? (values.author || values.authors).filter(Boolean)
            : [values.author || values.authors]
          : record.authors,
        format: values.format || record.format,
        language: values.language || record.language,
        publisher: values.publisher !== undefined ? values.publisher : record.publisher,
        publicationYear: values.publicationYear || values.year || record.publicationYear,
        shelfmark: values.shelfmark || values.callNumber || record.shelfmark,
        isbn: values.isbn !== undefined ? values.isbn : record.isbn,
        edition: values.edition !== undefined ? values.edition : record.edition,
        series: values.series !== undefined ? values.series : record.series,
        extent: values.extent !== undefined ? values.extent : record.extent,
        notes: values.summary || values.notes || values.description || record.notes,
        coverImageUrl: values.digitalAttachment || values.coverImageUrl || values.imageUrl || record.coverImageUrl,
        frameworkCode: selectedFramework?.code || record.frameworkCode,
        customFields: JSON.stringify(values),
      };

      await api.updateCatalogItem(recordId, payload);
      router.push(`/admin/catalog/${recordId}`);
    } catch (err: any) {
      setError(err.message || 'Could not update the record. Please check the required fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingState message="Loading catalogue record for editing..." />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-6 font-sans max-w-4xl mx-auto pb-16">
        <div className="bg-white rounded-xl border border-[#E2E0DB] p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Catalogue Record Not Found</h2>
          <p className="text-sm text-gray-500">The requested record could not be found or may have been deleted.</p>
          <div className="pt-2">
            <Link
              href="/admin/catalog"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#A52307] text-white hover:bg-red-800 transition-colors"
            >
              Back to Catalogues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-20">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/admin/catalog" className="hover:text-[#A52307] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Catalogues
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href={`/admin/catalog/${recordId}`} className="hover:text-[#A52307] transition-colors truncate max-w-[200px]">
            {record.titleLatin}
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">Edit</span>
        </div>

        {/* Framework Selector if multiple exist */}
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
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#A52307] bg-red-50 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              EDIT RECORD
            </span>
            {selectedFramework && (
              <span className="text-xs text-gray-500">
                Framework: <strong className="text-gray-700">{selectedFramework.name}</strong> ({selectedFramework.code})
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {record.titleLatin}
          </h1>
          {record.titleArabic && (
            <div className="text-base text-gray-600 font-arabic mt-0.5" dir="rtl">
              {record.titleArabic}
            </div>
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

      {/* Dynamic Form */}
      {selectedFramework ? (
        <div className="bg-white border border-[#E2E0DB] rounded-xl shadow-sm p-6 sm:p-8">
          <DynamicFormRenderer
            framework={selectedFramework}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/admin/catalog/${recordId}`)}
            isSubmitting={saving}
            submitLabel="Save Changes"
          />
        </div>
      ) : (
        <div className="bg-white border border-[#E2E0DB] rounded-xl p-8 text-center text-sm text-gray-500">
          No form framework available to edit this record.
        </div>
      )}
    </div>
  );
}
