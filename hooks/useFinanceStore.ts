
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category } from '../types';
import { generateId } from '../lib/utils';

interface FinanceStore {
  salary: number;
  categories: Category[];
  emergencyFundMonths: number;
  annualInterestRate: number; // Taxa anual em %
  projectionMonths: number; // Tempo de projeção
  accumulatedInvestment: number; // Saldo que já existe na caixinha
  
  // Actions
  setSalary: (amount: number) => void;
  setEmergencyFundMonths: (months: number) => void;
  setAnnualInterestRate: (rate: number) => void;
  setProjectionMonths: (months: number) => void;
  setAccumulatedInvestment: (amount: number) => void;
  addCategory: (name: string, icon: string, amount: number) => void;
  removeCategory: (id: string) => void;
  updateCategoryBudget: (id: string, amount: number) => void;
  
  // Selectors
  getMonthlyInvestment: () => number;
  getTotalBudgeted: () => number;
  getRemainingBalance: () => number;
  getEmergencyFundGoal: () => number;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      salary: 0,
      emergencyFundMonths: 6,
      annualInterestRate: 12.0, // 12% ao ano default
      projectionMonths: 12,
      accumulatedInvestment: 0,
      categories: [
        { id: '1', name: 'Aluguel', icon: '🏠', budgetedAmount: 0, color: 'bg-blue-500' },
        { id: '2', name: 'Alimentação', icon: '🛒', budgetedAmount: 0, color: 'bg-orange-500' },
        { id: 'caixinha', name: 'Caixinha', icon: '📦', budgetedAmount: 0, color: 'bg-cyan-500' },
      ],

      setSalary: (salary) => set({ salary }),
      setEmergencyFundMonths: (emergencyFundMonths) => set({ emergencyFundMonths }),
      setAnnualInterestRate: (annualInterestRate) => set({ annualInterestRate }),
      setProjectionMonths: (projectionMonths) => set({ projectionMonths }),
      setAccumulatedInvestment: (accumulatedInvestment) => set({ accumulatedInvestment }),

      addCategory: (name, icon, budgetedAmount) => set((state) => ({
        categories: [...state.categories, { 
          id: generateId(), 
          name, 
          icon, 
          budgetedAmount, 
          color: name.toLowerCase() === 'caixinha' ? 'bg-cyan-500' : 'bg-emerald-500' 
        }]
      })),

      removeCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),

      updateCategoryBudget: (id, amount) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, budgetedAmount: amount } : c)
      })),

      getMonthlyInvestment: () => {
        const caixinha = get().categories.find(c => c.name.toLowerCase().includes('caixinha'));
        return caixinha ? (caixinha.budgetedAmount || 0) : 0;
      },

      getTotalBudgeted: () => {
        return get().categories.reduce((acc, c) => acc + (c.budgetedAmount || 0), 0);
      },

      getRemainingBalance: () => {
        return get().salary - get().getTotalBudgeted();
      },

      getEmergencyFundGoal: () => {
        const monthlyEssentials = get().categories
          .filter(c => !c.name.toLowerCase().includes('caixinha'))
          .reduce((acc, c) => acc + (c.budgetedAmount || 0), 0);
        return monthlyEssentials * get().emergencyFundMonths;
      }
    }),
    { name: 'financia-core-v5-storage' }
  )
);
