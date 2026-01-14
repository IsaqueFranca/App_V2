
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, FinanceSettings } from '../types';
import { generateId } from '../lib/utils';

interface FinanceStore {
  salary: number;
  categories: Category[];
  emergencyFundMonths: number;
  
  // Actions
  setSalary: (amount: number) => void;
  setEmergencyFundMonths: (months: number) => void;
  addCategory: (name: string, icon: string, amount: number) => void;
  removeCategory: (id: string) => void;
  updateCategoryBudget: (id: string, amount: number) => void;
  
  // Selectors
  getTotalBudgeted: () => number;
  getRemainingBalance: () => number;
  getEmergencyFundGoal: () => number;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      salary: 0,
      emergencyFundMonths: 6,
      categories: [
        { id: '1', name: 'Aluguel', icon: '🏠', budgetedAmount: 0, color: 'bg-blue-500' },
        { id: '2', name: 'Alimentação', icon: '🛒', budgetedAmount: 0, color: 'bg-orange-500' },
        { id: '3', name: 'Lazer', icon: '🎬', budgetedAmount: 0, color: 'bg-purple-500' },
      ],

      setSalary: (salary) => set({ salary }),
      setEmergencyFundMonths: (emergencyFundMonths) => set({ emergencyFundMonths }),

      addCategory: (name, icon, budgetedAmount) => set((state) => ({
        categories: [...state.categories, { 
          id: generateId(), 
          name, 
          icon, 
          budgetedAmount, 
          color: 'bg-emerald-500' 
        }]
      })),

      removeCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),

      updateCategoryBudget: (id, amount) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, budgetedAmount: amount } : c)
      })),

      getTotalBudgeted: () => {
        return get().categories.reduce((acc, c) => acc + (c.budgetedAmount || 0), 0);
      },

      getRemainingBalance: () => {
        return get().salary - get().getTotalBudgeted();
      },

      getEmergencyFundGoal: () => {
        const monthlyCost = get().getTotalBudgeted();
        return monthlyCost * get().emergencyFundMonths;
      }
    }),
    { name: 'financia-core-storage' }
  )
);
