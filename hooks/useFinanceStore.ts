
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Transaction, Category, Account, FinanceSettings } from '../types';
import { generateId } from '../lib/utils';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FinanceState {
  user: User | null;
  isGuest: boolean;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  settings: FinanceSettings;

  // Actions
  setUser: (user: User | null) => void;
  setGuestMode: (isGuest: boolean) => void;
  loadFromCloud: (uid: string) => Promise<void>;
  
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  updateSettings: (s: Partial<FinanceSettings>) => void;
  
  // Selectors
  getBalance: () => number;
  getMonthlyTotal: (type: 'income' | 'expense', monthStr: string) => number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Alimentação', icon: '🍔', color: 'bg-orange-500' },
  { id: 'cat-2', name: 'Moradia', icon: '🏠', color: 'bg-blue-500' },
  { id: 'cat-3', name: 'Transporte', icon: '🚗', color: 'bg-purple-500' },
  { id: 'cat-4', name: 'Salário', icon: '💰', color: 'bg-green-500' },
  { id: 'cat-5', name: 'Lazer', icon: '🏖️', color: 'bg-pink-500' }
];

const saveToCloud = (state: any) => {
  if (!state.user?.uid) return;
  const data = {
    transactions: state.transactions,
    settings: state.settings,
    accounts: state.accounts,
    lastUpdated: new Date().toISOString()
  };
  setDoc(doc(db, "users_finance", state.user!.uid), data, { merge: true });
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      accounts: [
        { id: 'acc-main', name: 'Carteira Principal', balance: 0, type: 'cash' }
      ],
      settings: {
        userName: '',
        monthlyIncomeGoal: 0,
        monthlyExpenseLimit: 0,
        currency: 'BRL'
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
        set(state => ({ transactions: [ ...state.transactions, { ...t, id } ] }));
        saveToCloud(get());
      },

      deleteTransaction: (id) => {
        set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
        saveToCloud(get());
      },

      updateSettings: (updates) => {
        set(state => ({ settings: { ...state.settings, ...updates } }));
        saveToCloud(get());
      },

      getBalance: () => {
        return get().transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
      },

      getMonthlyTotal: (type, monthStr) => {
        return get().transactions
          .filter(t => t.type === type && t.date.startsWith(monthStr))
          .reduce((acc, t) => acc + t.amount, 0);
      }
    }),
    { name: 'financia-storage' }
  )
);
