
export type TransactionType = 'income' | 'expense';

// HealthDegree used for AI personalization in the study planner
export type HealthDegree = 'Medicine' | 'Pharmacy' | 'Nursing' | 'Dentistry' | 'Physiotherapy' | 'Biomedicine' | 'Nutrition' | 'Clinical Analysis' | 'Radiology';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  budgetLimit?: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash';
  balance: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  date: string; // ISO YYYY-MM-DD
  isRecurring: boolean;
  notes?: string;
}

export interface FinancialSettings {
  currency: string;
  monthlySavingsGoal: number;
  userName: string;
  primaryAccount?: string;
}

// --- Study Planner Types ---

export interface Subtopic {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface SubjectSchedule {
  monthlyGoal: number; // in hours
  plannedDays: string[]; // YYYY-MM-DD
  isCompleted: boolean;
  notes?: string;
}

export interface Subject {
  id: string;
  title: string;
  monthId: string; // The parent Month ID
  tag?: string;
  subtopics: Subtopic[];
  schedules: Record<string, SubjectSchedule>; // Key is monthId (YYYY-MM)
}

export interface Month {
  id: string; // YYYY-MM
  name: string;
  year: number;
}

export interface Session {
  id: string;
  subjectId: string;
  startTime: number; // timestamp
  duration: number; // seconds
  date: string; // YYYY-MM-DD
  status: 'completed' | 'incomplete';
}

export interface Settings {
  userName: string;
  healthDegree: HealthDegree;
  finalGoal: string;
  monthlyGoalHours: number;
  pomodoroDuration: number;
  shortBreakDuration: number;
}
