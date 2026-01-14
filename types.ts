
export interface Category {
  id: string;
  name: string;
  icon: string;
  budgetedAmount: number;
  color: string;
}

// Added HealthDegree type for study planner customization
export type HealthDegree = 
  | 'Medicine' 
  | 'Pharmacy' 
  | 'Nursing' 
  | 'Dentistry' 
  | 'Physiotherapy' 
  | 'Biomedicine' 
  | 'Nutrition' 
  | 'Clinical Analysis' 
  | 'Radiology';

// Comprehensive Settings interface including study planner specific goals
export interface Settings {
  userName: string;
  healthDegree: HealthDegree;
  finalGoal: string;
  monthlyGoalHours: number;
  pomodoroDuration: number;
  shortBreakDuration: number;
  currency: string;
  monthlySavingsGoal: number;
  monthlyIncomeGoal: number;
  monthlyExpenseLimit: number;
}

export interface FinanceSettings {
  salary: number;
  emergencyFundMonths: number;
  currency: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  categoryId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
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
  tag?: string;
  subtopics: Subtopic[];
  schedules: Record<string, SubjectSchedule>;
}

export interface Month {
  id: string;
  name: string;
  year: number;
}

export interface Session {
  id: string;
  subjectId: string;
  startTime: number;
  duration: number;
  date: string;
  status: 'completed' | 'incomplete';
}

export interface FinanceState {
  categories: Category[];
  settings: FinanceSettings;
}
