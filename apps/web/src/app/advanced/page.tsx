'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { FormFrameworkSchema } from '@/components/forms/DynamicFormRenderer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdvancedSearchPage() {
  const router = useRouter();
  const [frameworks, setFrameworks] = useState<FormFrameworkSchema[]>([]);
  const [selectedFrameworkCode, setSelectedFrameworkCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await api.getFormFrameworks('ITEM');
        if (isMounted && Array.isArray(data)) {
          setFrameworks(data);
          if (data.length > 0) {
            setSelectedFrameworkCode(data[0].code);
          }
        }
      } catch (err) {
        console.warn('Failed to load form frameworks for advanced search:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeFramework =
    frameworks.find((f) => f.code === selectedFrameworkCode) || frameworks[0];

  // Strictly filter only fields with PUBLIC visibility (or default public)
  const publicFields = (activeFramework?.fields || []).filter(
    (field) => !field.visibility || field.visibility === 'PUBLIC'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    let customTitle: string | undefined = undefined;
    let customAuthor: string | undefined = undefined;
    let customShelfmark: string | undefined = undefined;
    let customFormat: string | undefined = undefined;
    let customLanguage: string | undefined = undefined;
    const generalTerms: string[] = [];

    Object.entries(fieldValues).forEach(([key, val]) => {
      if (!val || !val.trim()) return;
      const clean = val.trim();
      if (['titleProper', 'titleLatin', 'title', 'name'].includes(key)) {
        customTitle = clean;
      } else if (['author', 'authors', 'scribe'].includes(key)) {
        customAuthor = clean;
      } else if (['shelfmark', 'callNumber'].includes(key)) {
        customShelfmark = clean;
      } else if (['format', 'itemType'].includes(key)) {
        customFormat = clean;
      } else if (['language', 'script'].includes(key)) {
        customLanguage = clean;
      } else {
        generalTerms.push(clean);
      }
    });

    if (customTitle) queryParams.set('title', customTitle);
    if (customAuthor) queryParams.set('author', customAuthor);
    if (customShelfmark) queryParams.set('shelfmark', customShelfmark);
    if (customFormat) queryParams.set('format', customFormat);
    if (customLanguage) queryParams.set('script', customLanguage);
    if (generalTerms.length > 0) queryParams.set('q', generalTerms.join(' '));
    if (activeFramework?.code) queryParams.set('frameworkCode', activeFramework.code);

    router.push(`/search?${queryParams.toString()}`);
  };

  const handleReset = () => {
    setFieldValues({});
  };

  return (
    <div className="min-h-screen bg-paper text-black font-amiri">
      <TopBar />
      <Navbar />

      <section className="max-w-[1100px] mx-auto pt-6 sm:pt-14 px-4 sm:px-5 pb-20">
        <p className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted mb-2 sm:mb-3 uppercase font-bold">
          Search
        </p>
        <h1 className="font-amiri text-[36px] sm:text-[60px] font-bold leading-[1.05] mb-3 sm:mb-[18px] tracking-[-0.015em]">
          Advanced Catalogue Search
        </h1>
        <div className="double-rule mb-6 sm:mb-[34px]" />

        {loading ? (
          <div className="py-16 text-center">
            <LoadingSpinner size="md" />
            <p className="mt-2 text-xs font-sans text-stone-500">Loading form search fields…</p>
          </div>
        ) : frameworks.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-300 rounded font-sans text-sm text-stone-600">
            No form frameworks currently configured.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            onReset={handleReset}
            className="space-y-6 font-sans"
          >
            {/* Framework Selector if multiple exist */}
            {frameworks.length > 1 && (
              <div className="flex items-center gap-3 p-3 bg-white border border-stone-300 rounded-sm">
                <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">
                  Select Catalogue Form:
                </span>
                <select
                  value={selectedFrameworkCode}
                  onChange={(e) => {
                    setSelectedFrameworkCode(e.target.value);
                    setFieldValues({});
                  }}
                  className="border border-stone-400 bg-white h-9 px-3 text-sm font-semibold rounded outline-none"
                >
                  {frameworks.map((fw) => (
                    <option key={fw.code} value={fw.code}>
                      {fw.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Public Fields from Framework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[30px] gap-y-4 sm:gap-y-[26px]">
              {publicFields.map((field) => (
                <label key={field.name} className="flex flex-col gap-1.5">
                  <span className="font-averia text-[12px] sm:text-[13px] tracking-[0.06em] text-heritage-muted uppercase font-bold">
                    {field.label} {field.required ? '*' : ''}
                  </span>
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={`Search by ${field.label.toLowerCase()}…`}
                    value={fieldValues[field.name] || ''}
                    onChange={(e) =>
                      setFieldValues({
                        ...fieldValues,
                        [field.name]: e.target.value,
                      })
                    }
                    className="border-[1.5px] border-black bg-white h-11 sm:h-12 px-3 sm:px-[14px] text-sm sm:text-base outline-none w-full rounded"
                  />
                </label>
              ))}
            </div>

            <div className="col-span-full flex gap-3 pt-4 flex-wrap">
              <button
                type="submit"
                className="bg-black text-paper border-none h-[46px] sm:h-[50px] px-6 sm:px-[38px] rounded-full font-amiri text-[17px] sm:text-[19px] font-bold cursor-pointer hover:bg-heritage-red hover:text-white transition-colors"
              >
                Search Catalogue →
              </button>
              <button
                type="reset"
                className="bg-transparent border-[1.5px] border-black h-[46px] sm:h-[50px] px-5 sm:px-[30px] rounded-full font-amiri text-[16px] sm:text-[17px] font-semibold cursor-pointer hover:bg-black hover:text-paper transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </form>
        )}
      </section>

      <Footer />
    </div>
  );
}
