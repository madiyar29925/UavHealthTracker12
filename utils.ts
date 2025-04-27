import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString();
}

// Format number with suffix (K, M, B)
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  return (num / 1000000000).toFixed(1) + 'B';
}

// Get color class based on percentage value
export function getColorClassByValue(value: number, isInverse: boolean = false): string {
  if (isInverse) {
    if (value < 30) return 'success';
    if (value < 70) return 'warning';
    return 'critical';
  } else {
    if (value > 70) return 'success';
    if (value > 30) return 'warning';
    return 'critical';
  }
}
