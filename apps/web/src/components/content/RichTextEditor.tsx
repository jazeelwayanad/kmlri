'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading2, Quote } from 'lucide-react';
import { api } from '@/lib/api';

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  title: string;
}

function ToolbarButton({ icon: Icon, onClick, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="p-1.5 rounded hover:bg-gray-200 text-gray-700 hover:text-black transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    emitChange();
  };

  const insertLink = () => {
    const url = window.prompt('Link URL:');
    if (url) exec('createLink', url);
  };

  const insertImage = () => fileInputRef.current?.click();

  const handleImageSelected = async (file: File | undefined) => {
    if (!file) return;
    try {
      const res = await api.uploadImage(file);
      exec('insertImage', res.url);
    } catch (err: any) {
      window.alert(err.message || 'Image upload failed.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 flex-wrap">
        <ToolbarButton icon={Bold} title="Bold" onClick={() => exec('bold')} />
        <ToolbarButton icon={Italic} title="Italic" onClick={() => exec('italic')} />
        <ToolbarButton icon={Underline} title="Underline" onClick={() => exec('underline')} />
        <span className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton icon={Heading2} title="Heading" onClick={() => exec('formatBlock', 'h3')} />
        <ToolbarButton icon={Quote} title="Quote" onClick={() => exec('formatBlock', 'blockquote')} />
        <span className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton icon={List} title="Bullet list" onClick={() => exec('insertUnorderedList')} />
        <ToolbarButton icon={ListOrdered} title="Numbered list" onClick={() => exec('insertOrderedList')} />
        <span className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton icon={LinkIcon} title="Insert link" onClick={insertLink} />
        <ToolbarButton icon={ImageIcon} title="Insert image" onClick={insertImage} />
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className="prose prose-sm max-w-none p-4 min-h-[220px] text-sm text-gray-900 outline-none [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mt-3 [&_h3]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-heritage-red [&_a]:underline [&_img]:max-w-full [&_img]:rounded [&_img]:my-2 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
      />

      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => handleImageSelected(e.target.files?.[0])} />
    </div>
  );
}
