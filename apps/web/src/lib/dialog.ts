'use client';

/**
 * dialog.ts
 * ---------
 * A tiny imperative replacement for the browser's native `alert()`,
 * `confirm()` and `prompt()`. Call `confirmDialog(...)`, `alertDialog(...)`
 * or `promptDialog(...)` from anywhere (no hook needed) and `await` the
 * result exactly like the native APIs. A single <DialogRoot /> mounted in
 * the root layout renders the on-brand modal and resolves the promise.
 */

import { useEffect, useState } from 'react';

export type DialogVariant = 'default' | 'danger' | 'success' | 'warning' | 'info';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
}

export interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  variant?: DialogVariant;
}

export interface PromptOptions {
  title?: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export type DialogState =
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: 'alert'; options: AlertOptions; resolve: (value: void) => void }
  | { kind: 'prompt'; options: PromptOptions; resolve: (value: string | null) => void }
  | null;

let currentState: DialogState = null;
let listeners: Array<(state: DialogState) => void> = [];

function emit(state: DialogState) {
  currentState = state;
  listeners.forEach((l) => l(state));
}

/** Used only by <DialogRoot /> to subscribe to the active dialog. */
export function useDialogState(): DialogState {
  const [state, setState] = useState<DialogState>(currentState);
  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);
  return state;
}

/** Drop-in async replacement for `window.confirm()`. */
export function confirmDialog(options: ConfirmOptions | string): Promise<boolean> {
  const opts = typeof options === 'string' ? { message: options } : options;
  return new Promise<boolean>((resolve) => {
    emit({
      kind: 'confirm',
      options: opts,
      resolve: (value) => {
        emit(null);
        resolve(value);
      },
    });
  });
}

/** Drop-in async replacement for `window.alert()`. */
export function alertDialog(options: AlertOptions | string): Promise<void> {
  const opts = typeof options === 'string' ? { message: options } : options;
  return new Promise<void>((resolve) => {
    emit({
      kind: 'alert',
      options: opts,
      resolve: () => {
        emit(null);
        resolve();
      },
    });
  });
}

/** Drop-in async replacement for `window.prompt()`. Resolves `null` if cancelled. */
export function promptDialog(options: PromptOptions | string): Promise<string | null> {
  const opts = typeof options === 'string' ? { message: options } : options;
  return new Promise<string | null>((resolve) => {
    emit({
      kind: 'prompt',
      options: opts,
      resolve: (value) => {
        emit(null);
        resolve(value);
      },
    });
  });
}
