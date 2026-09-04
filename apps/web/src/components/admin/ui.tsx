'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

/**
 * Shared modern admin UI primitives. Keep the admin console visually
 * distinct from the ornate public site: neutral surfaces, sans-serif
 * type, one accent color (heritage-red) used sparingly.
 */

export type BadgeVariant = 'danger' | 'warning' | 'success' | 'info' | 'neutral' | 'accent';

const badgeStyles: Record<BadgeVariant, string> = {
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
  neutral: 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/10',
  accent: 'bg-heritage-red/10 text-heritage-red ring-1 ring-inset ring-heritage-red/20',
};

export function Badge({ variant = 'neutral', children }: { variant?: BadgeVariant; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}

export function Card({
  children,
  className = '',
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${padded ? 'p-5 sm:p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-heritage-red mb-1">{eyebrow}</p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1.5 max-w-2xl leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}

type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost';

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-heritage-red text-white hover:bg-red-700 shadow-sm',
  dark: 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm',
  outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
};

export function Button({
  children,
  variant = 'outline',
  href,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  disabled,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}) {
  const classes = `inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none ${buttonStyles[variant]} ${className}`;
  if (href) {
    return (
      <Link prefetch href={href} className={classes}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
}

export function StatCard({
  label,
  value,
  hint,
  hintTone = 'neutral',
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  hintTone?: 'neutral' | 'positive' | 'negative' | 'warning';
  icon?: LucideIcon;
}) {
  const hintColor = {
    neutral: 'text-gray-400',
    positive: 'text-emerald-600',
    negative: 'text-heritage-red',
    warning: 'text-amber-700',
  }[hintTone];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
      <div className="flex items-start justify-between">
        <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">{label}</span>
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      </div>
      <div className="text-xl font-bold text-gray-900 mt-1">{value}</div>
      {hint && <div className={`text-[11px] font-medium mt-0.5 ${hintColor}`}>{hint}</div>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card className="text-center py-14">
      <p className="text-base font-semibold text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    </Card>
  );
}

export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link prefetch href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 hover:text-heritage-red transition-colors group">
      <span>{children}</span>
      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
