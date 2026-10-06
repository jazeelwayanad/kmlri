'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import GoogleFormsBuilder from '@/components/forms/GoogleFormsBuilder';
import { FormFrameworkSchema } from '@/components/forms/DynamicFormRenderer';

export default function EditFrameworkPage() {
  const params = useParams();
  const router = useRouter();
  const idOrCode = params?.id as string;

  const [framework, setFramework] = useState<FormFrameworkSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrCode) return;
    (async () => {
      setLoading(true);
      try {
        const data = await api.getFormFramework(idOrCode);
        if (data) {
          setFramework(data);
        } else {
          setError('Framework not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load framework');
      } finally {
        setLoading(false);
      }
    })();
  }, [idOrCode]);

  if (loading) {
    return (
      <div className="py-24 text-center font-sans">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#A52307] mb-3"></div>
        <p className="text-xs text-gray-500">Loading form builder studio…</p>
      </div>
    );
  }

  if (error || !framework) {
    return (
      <div className="p-12 text-center font-sans space-y-3">
        <p className="text-sm font-bold text-red-600">{error || 'Framework not found.'}</p>
        <button
          type="button"
          onClick={() => router.push('/admin/catalog/frameworks')}
          className="px-4 py-2 bg-black text-white text-xs font-bold rounded"
        >
          Back to Frameworks
        </button>
      </div>
    );
  }

  return <GoogleFormsBuilder initialFramework={framework} isEditing={true} />;
}
