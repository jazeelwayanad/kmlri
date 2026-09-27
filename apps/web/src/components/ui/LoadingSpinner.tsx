'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'muted' | 'white' | 'current';
  label?: string;
  centered?: boolean;
}

const sizeClasses = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-[#A52307]',
  muted: 'text-[#7E7365]',
  white: 'text-white',
  current: 'text-current',
};

export function LoadingSpinner({
  size = 'md',
  className = '',
  color = 'primary',
  centered = false,
}: LoadingSpinnerProps) {
  return (
    <div className={`inline-flex items-center justify-center ${centered ? 'w-full' : ''}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
    </div>
  );
}

export function LoadingState({
  minHeight = '140px',
  size = 'lg',
  color = 'primary',
  className = '',
}: {
  message?: string;
  minHeight?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'muted' | 'white' | 'current';
  className?: string;
}) {
  return (
    <div
      style={{ minHeight }}
      className={`flex items-center justify-center p-6 text-center ${className}`}
    >
      <Loader2 className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
    </div>
  );
}

export function LoadingTableRow({
  colSpan = 5,
}: {
  colSpan?: number;
  message?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center">
        <div className="flex items-center justify-center">
          <Loader2 className={`animate-spin ${sizeClasses['md']} ${colorClasses['primary']}`} />
        </div>
      </td>
    </tr>
  );
}
