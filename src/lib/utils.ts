import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(2);
}

export function formatUsd(value: number | string | undefined): string {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (n == null || !Number.isFinite(n)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
