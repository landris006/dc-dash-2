import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeToLevel(timeSpent: number) {
  console.log(timeSpent);

  if (timeSpent < 1) {
    return 1;
  }

  return Math.trunc(Math.log2(timeSpent / (1000 * 60 * 60))) + 1;
}
export function levelToTime(level: number) {
  if (level < 1) {
    return 0;
  }

  return 2 ** (level - 1) * 1000 * 60 * 60;
}

export function levelToColor(level: number) {
  return {
    0: '#bdb5b5',
    1: '#70b3e0',
    2: '#66d194',
    3: '#f2f266',
    4: '#E67E22',
    5: '#db867d',
    6: '#b783cc',
    7: '#ba5b85',
    8: '#95A5A6',
    9: '#e36691',
  }[level % 10];
}
