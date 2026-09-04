'use client';

import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  bordered?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-lg font-amiri',
  xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl font-amiri',
};

export function UserAvatar({
  src,
  name,
  size = 'sm',
  className = '',
  bordered = true,
}: UserAvatarProps) {
  const [error, setError] = useState(false);

  const getInitials = (n?: string | null) => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const borderClass = bordered ? 'border border-black/30' : '';

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        onError={() => setError(true)}
        className={`${sizeClass} rounded-full object-cover shadow-xs flex-shrink-0 ${borderClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-black text-white font-bold flex items-center justify-center flex-shrink-0 shadow-xs select-none ${borderClass} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
