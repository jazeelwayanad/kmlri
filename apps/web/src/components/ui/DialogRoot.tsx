'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, Info, X } from 'lucide-react';
import { useDialogState, type DialogVariant } from '@/lib/dialog';

const ICONS: Record<DialogVariant, typeof Info> = {
  default: HelpCircle,
  danger: AlertTriangle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const ICON_STYLES: Record<DialogVariant, string> = {
  default: 'bg-gray-100 text-gray-600',
  danger: 'bg-red-50 text-heritage-red',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-blue-50 text-blue-600',
};

const CONFIRM_BUTTON_STYLES: Record<DialogVariant, string> = {
  default: 'bg-gray-900 text-white hover:bg-gray-800',
  danger: 'bg-heritage-red text-white hover:bg-red-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  warning: 'bg-amber-600 text-white hover:bg-amber-700',
  info: 'bg-blue-600 text-white hover:bg-blue-700',
};

/**
 * Mounted once in the root layout. Renders whatever dialog is currently
 * active in the global `dialog.ts` store (confirm / alert / prompt) as an
 * on-brand modal, replacing the browser's native dialogs everywhere.
 */
export function DialogRoot() {
  const state = useDialogState();
  const [promptValue, setPromptValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.kind === 'prompt') {
      setPromptValue(state.options.defaultValue || '');
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setTimeout(() => cancelRef.current?.focus(), 10);
    }
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.kind === 'confirm') state.resolve(false);
        else if (state.kind === 'alert') state.resolve();
        else if (state.kind === 'prompt') state.resolve(null);
      }
      if (e.key === 'Enter' && state.kind === 'prompt') {
        e.preventDefault();
        state.resolve(promptValue.trim() || null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state, promptValue]);

  if (!state) return null;

  const variant: DialogVariant =
    state.kind === 'prompt' ? 'default' : (state.options.variant as DialogVariant) || 'default';
  const Icon = ICONS[variant];
  const title = state.options.title || (state.kind === 'confirm' ? 'Please confirm' : state.kind === 'prompt' ? 'Input required' : 'Notice');

  const handleBackdropClick = () => {
    if (state.kind === 'confirm') state.resolve(false);
    else if (state.kind === 'alert') state.resolve();
    else if (state.kind === 'prompt') state.resolve(null);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-[dialog-overlay-in_150ms_ease-out]"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 p-5 sm:p-6 animate-[dialog-card-in_160ms_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="flex items-start gap-3.5">
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${ICON_STYLES[variant]}`}>
            <Icon className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <h2 id="dialog-title" className="text-base font-bold text-gray-900 leading-snug">
              {title}
            </h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed whitespace-pre-line">
              {state.kind === 'prompt' ? state.options.message : state.options.message}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBackdropClick}
            aria-label="Close"
            className="shrink-0 text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {state.kind === 'prompt' && (
          <input
            ref={inputRef}
            type="text"
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            placeholder={state.options.placeholder}
            className="mt-4 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heritage-red/30 focus:border-heritage-red"
          />
        )}

        <div className="flex items-center justify-end gap-2.5 mt-5">
          {state.kind === 'confirm' && (
            <>
              <button
                ref={cancelRef}
                type="button"
                onClick={() => state.resolve(false)}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                {state.options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => state.resolve(true)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors ${CONFIRM_BUTTON_STYLES[variant]}`}
              >
                {state.options.confirmText || 'Confirm'}
              </button>
            </>
          )}

          {state.kind === 'alert' && (
            <button
              ref={cancelRef}
              type="button"
              onClick={() => state.resolve()}
              className={`text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors ${CONFIRM_BUTTON_STYLES[variant]}`}
            >
              {state.options.buttonText || 'OK'}
            </button>
          )}

          {state.kind === 'prompt' && (
            <>
              <button
                ref={cancelRef}
                type="button"
                onClick={() => state.resolve(null)}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                {state.options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => state.resolve(promptValue.trim() || null)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors ${CONFIRM_BUTTON_STYLES.default}`}
              >
                {state.options.confirmText || 'OK'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
