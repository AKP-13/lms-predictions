import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const disabledOptions = [
  'Man City',
  'Spurs',
  'Arsenal',
  'Man Utd',
  'Liverpool',
  'Newcastle',
  'Brighton'
];
