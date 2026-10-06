'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, ChevronDown, FileText, Sparkles, Layers } from 'lucide-react';
import { api } from '@/lib/api';
import { FormFrameworkSchema } from './DynamicFormRenderer';

interface AddRecordDropdownProps {
  moduleType: 'ITEM' | 'SERIAL' | 'AUTHORITY' | 'MEMBER' | 'COLLECTION';
  defaultLabel?: string;
  onSelectForm: (framework: FormFrameworkSchema) => void;
  onFallback?: () => void;
  className?: string;
}

export default function AddRecordDropdown({
  moduleType,
  defaultLabel = 'Add Record',
  onSelectForm,
  onFallback,
  className = '',
}: AddRecordDropdownProps) {
  const [frameworks, setFrameworks] = useState<FormFrameworkSchema[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await api.getFormFrameworks(moduleType);
        if (isMounted) {
          setFrameworks(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) setFrameworks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [moduleType]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDisabled = loading || frameworks.length === 0;
  const hasMultiple = frameworks.length > 1;

  const handleClick = () => {
    if (isDisabled) return;
    if (frameworks.length > 1) {
      setIsOpen(!isOpen);
    } else if (frameworks.length === 1) {
      onSelectForm(frameworks[0]);
    } else {
      if (onFallback) onFallback();
    }
  };

  const buttonTitle = loading
    ? 'Loading form frameworks...'
    : frameworks.length === 0
      ? 'No form framework configured. Please create a framework in Settings > Form Frameworks first.'
      : undefined;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        title={buttonTitle}
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
          isDisabled
            ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-75 shadow-none'
            : 'bg-[#A52307] text-white hover:bg-red-800 active:scale-95 cursor-pointer'
        }`}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{hasMultiple || isDisabled ? defaultLabel : frameworks[0]?.name || defaultLabel}</span>
        {hasMultiple && (
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Multi-Form Dropdown Menu */}
      {hasMultiple && isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white border border-[#E2E0DB] z-50 divide-y divide-gray-100 overflow-hidden font-sans animate-in fade-in-50 zoom-in-95">
          <div className="px-3 py-2 bg-[#FAF8F5] text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Select Record Form</span>
            <span className="text-[#A52307]">{frameworks.length} options</span>
          </div>

          <div className="py-1 max-h-64 overflow-y-auto">
            {frameworks.map((fw) => (
              <button
                key={fw.code}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSelectForm(fw);
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#FAF8F5] transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-md bg-amber-50 group-hover:bg-[#A52307] text-[#A52307] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 group-hover:text-[#A52307] truncate transition-colors">
                    {fw.name}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {fw.fields?.length || 0} fields configured
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
