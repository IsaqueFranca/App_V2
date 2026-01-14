
export type TransactionType = 'income' | 'expense';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'investment' | 'cash';
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  date: string; // ISO YYYY-MM-DD
  notes?: string;
}

export interface FinanceSettings {
  userName: string;
  monthlyIncomeGoal: number;
  monthlyExpenseLimit: number;
  currency: string;
}

// Aliasing for compatibility with useStudyStore
export type FinancialSettings = FinanceSettings;

export type HealthDegree = 'Medicine' | 'Pharmacy' | 'Nursing' | 'Dentistry' | 'Physiotherapy' | 'Biomedicine' | 'Nutrition' | 'Clinical Analysis' | 'Radiology';

export interface Settings {
  userName: string;
  healthDegree: HealthDegree;
  finalGoal: string;
  monthlyGoalHours: number;
  pomodoroDuration: number;
  shortBreakDuration: number;
  currency: string;
  monthlySavingsGoal: number;
}

export interface Month {
  id: string;
  name: string;
  year: number;
}

export interface Subtopic {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface SubjectSchedule {
  monthlyGoal: number;
  plannedDays: string[];
  isCompleted: boolean;
  notes?: string;
}

export interface Subject {
  id: string;
  title: string;
  monthId: string;
  subtopics: Subtopic[];
  schedules: Record<string, SubjectSchedule>;
  tag?: string;
}

export interface Session {
  id: string;
  subjectId: string;
  startTime: number;
  duration: number;
  date: string;
  status: 'completed' | 'incomplete';
}
