'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';

export function ImageUploadField({
  value,
  onChange,
  label = 'Featured Image',
  aspectClass = 'aspect-video',
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  aspectClass?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      onChange(res.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">{label}</label>
      <div
        className={`relative w-full ${aspectClass} border-2 border-dashed rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 ${
          value ? 'border-gray-200' : 'border-gray-300 hover:border-heritage-red cursor-pointer'
        }`}
        onClick={() => !value && !uploading && inputRef.current?.click()}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : uploading ? (
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        ) : (
          <div className="text-center text-gray-400">
            <ImageIcon className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Click to upload an image</span>
          </div>
        )}

        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-[11px] font-semibold text-heritage-red hover:underline flex items-center gap-1"
        >
          <Upload className="w-3 h-3" /> Replace image
        </button>
      )}

      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
