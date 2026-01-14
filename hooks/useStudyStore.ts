
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Transaction, Account, FinancialSettings, User, Month, Subject, Session, Settings } from '../types';
import { generateId, formatDate } from '../lib/utils';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FinanceState {
  user: User | null;
  isGuest: boolean;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  settings: FinancialSettings & Settings; // Merged for compatibility
  
  // Study Planner State
  months: Month[];
  subjects: Subject[];
  sessions: Session[];
  activeSubjectId: string | null;
  activeScheduleMonths: string[];

  // Actions
  setUser: (user: User | null) => void;
  setGuestMode: (isGuest: boolean) => void;
  loadFromCloud: (uid: string) => Promise<void>;
  
  // Finance Actions (legacy/compatible)
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => void;
  addAccount: (a: Omit<Account, 'id'>) => void;
  
  // Study Actions
  addMonth: (name: string, year: number) => void;
  editMonth: (id: string, name: string) => void;
  deleteMonth: (id: string) => void;
  duplicateMonth: (id: string) => void;
  
  addSubject: (title: string, monthId: string) => void;
  deleteSubject: (id: string) => void;
  getSubjectsByMonthId: (monthId: string) => Subject[];
  getSubjectProgress: (id: string) => number;
  setActiveSubjectId: (id: string | null) => void;
  
  addSubtopic: (subjectId: string, title: string) => void;
  toggleSubtopic: (subjectId: string, subtopicId: string) => void;
  deleteSubtopic: (subjectId: string, subtopicId: string) => void;
  importSubtopics: (subjectId: string, subtopics: string[]) => void;
  
  addSession: (s: Omit<Session, 'id'>) => void;
  deleteSession: (id: string) => void;
  updateSessionStatus: (id: string, status: 'completed' | 'incomplete') => void;
  getSessionsByMonthId: (monthId: string) => Session[];
  
  addActiveScheduleMonth: (monthId: string) => void;
  removeActiveScheduleMonth: (monthId: string) => void;
  toggleSubjectInMonth: (subjectId: string, monthId: string) => void;
  updateSubjectSchedule: (subjectId: string, monthId: string, updates: any) => void;
  toggleSubjectPlannedDay: (subjectId: string, monthId: string, date: string) => void;
  
  updateSettings: (s: Partial<FinancialSettings & Settings>) => void;
  
  // Selectors
  getBalance: () => number;
  getMonthlySpending: (monthStr: string) => number;
  getStreakStats: () => any;
}

const saveToCloud = (state: any) => {
  if (!state.user?.uid) return;
  const data = {
    accounts: state.accounts,
    categories: state.categories,
    transactions: state.transactions,
    settings: state.settings,
    months: state.months,
    subjects: state.subjects,
    sessions: state.sessions,
    activeScheduleMonths: state.activeScheduleMonths,
    lastUpdated: new Date().toISOString()
  };
  setDoc(doc(db, "users_finance", state.user!.uid), data, { merge: true });
};

export const useStudyStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      accounts: [
        { id: 'main', name: 'Conta Principal', type: 'checking', balance: 0 }
      ],
      categories: [
        { id: 'cat-1', title: 'Alimentação', icon: '🍔', color: 'bg-orange-500' },
        { id: 'cat-2', title: 'Moradia', icon: '🏠', color: 'bg-blue-500' },
        { id: 'cat-3', title: 'Lazer', icon: '🎬', color: 'bg-purple-500' },
        { id: 'cat-4', title: 'Salário', icon: '💰', color: 'bg-green-500' }
      ],
      transactions: [],
      
      // Study Initial State
      months: [],
      subjects: [],
      sessions: [],
      activeSubjectId: null,
      activeScheduleMonths: [],

      settings: {
        currency: 'BRL',
        monthlySavingsGoal: 500,
        userName: '',
        healthDegree: 'Medicine',
        finalGoal: '',
        monthlyGoalHours: 40,
        pomodoroDuration: 25,
        shortBreakDuration: 5
      },

      setUser: (user) => set({ user, isGuest: false }),
      setGuestMode: (isGuest) => set({ isGuest }),

      loadFromCloud: async (uid) => {
        const docSnap = await getDoc(doc(db, "users_finance", uid));
        if (docSnap.exists()) {
          set(docSnap.data());
        }
      },

      addTransaction: (t) => {
        const id = generateId();
        set(state => ({ transactions: [...state.transactions, { ...t, id }] }));
        saveToCloud(get());
      },

      deleteTransaction: (id) => {
        set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
        saveToCloud(get());
      },

      addCategory: (c) => {
        set(state => ({ categories: [...state.categories, { ...c, id: generateId() }] }));
        saveToCloud(get());
      },

      addAccount: (a) => {
        set(state => ({ accounts: [...state.accounts, { ...a, id: generateId() }] }));
        saveToCloud(get());
      },

      // Study Planner Actions
      addMonth: (name, year) => {
        const id = generateId();
        set(state => ({ months: [...state.months, { id, name, year }] }));
        saveToCloud(get());
      },
      editMonth: (id, name) => {
        set(state => ({ months: state.months.map(m => m.id === id ? { ...m, name } : m) }));
        saveToCloud(get());
      },
      deleteMonth: (id) => {
        set(state => ({ 
          months: state.months.filter(m => m.id !== id),
          subjects: state.subjects.filter(s => s.monthId !== id)
        }));
        saveToCloud(get());
      },
      duplicateMonth: (id) => {
        const month = get().months.find(m => m.id === id);
        if (!month) return;
        const newId = generateId();
        const newMonth = { ...month, id: newId, name: `${month.name} (Cópia)` };
        const monthSubjects = get().subjects.filter(s => s.monthId === id);
        const newSubjects = monthSubjects.map(s => ({ ...s, id: generateId(), monthId: newId }));
        set(state => ({ 
          months: [...state.months, newMonth],
          subjects: [...state.subjects, ...newSubjects]
        }));
        saveToCloud(get());
      },

      addSubject: (title, monthId) => {
        const id = generateId();
        set(state => ({ subjects: [...state.subjects, { id, title, monthId, subtopics: [], schedules: {} }] }));
        saveToCloud(get());
      },
      deleteSubject: (id) => {
        set(state => ({ subjects: state.subjects.filter(s => s.id !== id) }));
        saveToCloud(get());
      },
      getSubjectsByMonthId: (monthId) => get().subjects.filter(s => s.monthId === monthId),
      getSubjectProgress: (id) => {
        const sub = get().subjects.find(s => s.id === id);
        if (!sub || sub.subtopics.length === 0) return 0;
        const completed = sub.subtopics.filter(t => t.isCompleted).length;
        return Math.round((completed / sub.subtopics.length) * 100);
      },
      setActiveSubjectId: (id) => set({ activeSubjectId: id }),

      addSubtopic: (subjectId, title) => {
        set(state => ({
          subjects: state.subjects.map(s => s.id === subjectId ? {
            ...s, subtopics: [...s.subtopics, { id: generateId(), title, isCompleted: false }]
          } : s)
        }));
        saveToCloud(get());
      },
      toggleSubtopic: (subjectId, subtopicId) => {
        set(state => ({
          subjects: state.subjects.map(s => s.id === subjectId ? {
            ...s, subtopics: s.subtopics.map(t => t.id === subtopicId ? { ...t, isCompleted: !t.isCompleted } : t)
          } : s)
        }));
        saveToCloud(get());
      },
      deleteSubtopic: (subjectId, subtopicId) => {
        set(state => ({
          subjects: state.subjects.map(s => s.id === subjectId ? {
            ...s, subtopics: s.subtopics.filter(t => t.id !== subtopicId)
          } : s)
        }));
        saveToCloud(get());
      },
      importSubtopics: (subjectId, titles) => {
        const newTopics = titles.map(title => ({ id: generateId(), title, isCompleted: false }));
        set(state => ({
          subjects: state.subjects.map(s => s.id === subjectId ? {
            ...s, subtopics: [...s.subtopics, ...newTopics]
          } : s)
        }));
        saveToCloud(get());
      },

      addSession: (s) => {
        const id = generateId();
        set(state => ({ sessions: [...state.sessions, { ...s, id }] }));
        saveToCloud(get());
      },
      deleteSession: (id) => {
        set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }));
        saveToCloud(get());
      },
      updateSessionStatus: (id, status) => {
        set(state => ({ sessions: state.sessions.map(s => s.id === id ? { ...s, status } : s) }));
        saveToCloud(get());
      },
      getSessionsByMonthId: (monthId) => get().sessions.filter(s => s.date.startsWith(monthId)),

      addActiveScheduleMonth: (monthId) => {
        if (!get().activeScheduleMonths.includes(monthId)) {
          set(state => ({ activeScheduleMonths: [...state.activeScheduleMonths, monthId] }));
          saveToCloud(get());
        }
      },
      removeActiveScheduleMonth: (monthId) => {
        set(state => ({ activeScheduleMonths: state.activeScheduleMonths.filter(m => m !== monthId) }));
        saveToCloud(get());
      },
      toggleSubjectInMonth: (subjectId, monthId) => {
        set(state => ({
          subjects: state.subjects.map(s => {
            if (s.id !== subjectId) return s;
            const schedules = { ...s.schedules };
            if (schedules[monthId]) {
              delete schedules[monthId];
            } else {
              schedules[monthId] = { monthlyGoal: 0, plannedDays: [], isCompleted: false };
            }
            return { ...s, schedules };
          })
        }));
        saveToCloud(get());
      },
      updateSubjectSchedule: (subjectId, monthId, updates) => {
        set(state => ({
          subjects: state.subjects.map(s => s.id === subjectId ? {
            ...s, schedules: { ...s.schedules, [monthId]: { ...s.schedules[monthId], ...updates } }
          } : s)
        }));
        saveToCloud(get());
      },
      toggleSubjectPlannedDay: (subjectId, monthId, date) => {
        set(state => ({
          subjects: state.subjects.map(s => {
            if (s.id !== subjectId) return s;
            const sched = s.schedules[monthId];
            const plannedDays = sched.plannedDays.includes(date)
              ? sched.plannedDays.filter(d => d !== date)
              : [...sched.plannedDays, date];
            return { ...s, schedules: { ...s.schedules, [monthId]: { ...sched, plannedDays } } };
          })
        }));
        saveToCloud(get());
      },

      updateSettings: (updates) => {
        set(state => ({ settings: { ...state.settings, ...updates } }));
        saveToCloud(get());
      },

      getBalance: () => {
        const txs = get().transactions;
        return txs.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
      },

      getMonthlySpending: (monthStr) => {
        return get().transactions
          .filter(t => t.date.startsWith(monthStr) && t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0);
      },

      getStreakStats: () => {
        const completedSessions = get().sessions.filter(s => s.status === 'completed');
        const dayMap = new Map<string, number>();
        completedSessions.forEach(s => {
          const mins = (dayMap.get(s.date) || 0) + (s.duration / 60);
          dayMap.set(s.date, mins);
        });

        const sortedDates = Array.from(dayMap.keys()).sort();
        let currentStreak = 0;
        let longestStreak = 0;

        if (sortedDates.length > 0) {
          // Simple streak logic
          currentStreak = 1;
          longestStreak = 1;
          let temp = 1;
          for (let i = 1; i < sortedDates.length; i++) {
            const d1 = new Date(sortedDates[i-1]);
            const d2 = new Date(sortedDates[i]);
            const diff = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24);
            if (diff === 1) {
              temp++;
            } else {
              temp = 1;
            }
            longestStreak = Math.max(longestStreak, temp);
          }
        }

        return { currentStreak, longestStreak, dayMap, totalActiveDays: dayMap.size };
      }
    }),
    { name: 'financia-store' }
  )
);
