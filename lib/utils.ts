
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Added for study planner components
export function getMonthIndex(monthName: string): number {
  const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return months.indexOf(monthName.toLowerCase());
}

// Added for study planner components
export function generateYearDays(): Date[] {
  const days: Date[] = [];
  const start = new Date(new Date().getFullYear(), 0, 1);
  const end = new Date(new Date().getFullYear(), 11, 31);
  let current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

// Added for study planner components
export function getIntensityLevel(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

export const CATEGORY_ICONS: Record<string, string> = {
  'Food': '🍔',
  'Transport': '🚗',
  'Health': '🏥',
  'Entertainment': '🎬',
  'Leisure': '🏖️',
  'Home': '🏠',
  'Education': '📚',
  'Salary': '💰',
  'Investment': '📈',
  'Other': '📦'
};
