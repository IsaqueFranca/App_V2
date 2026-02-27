import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Transaction } from '../types';
import { generateId, formatDate } from '../lib/utils';

interface FinanceStore {
  salary: number;
  categories: Category[];
  expenses: Transaction[];
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
  addExpense: (description: string, amount: number) => void;
  removeExpense: (id: string) => void;
  
  // Selectors
  getMonthlyInvestment: () => number;
  getTotalBudgeted: () => number;
  getTotalExpenses: () => number;
  getRemainingBalance: () => number; // Saldo após orçamento fixo
  getFreeBalance: () => number; // Saldo livre real (após orçamento e despesas variáveis)
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
      expenses: [],
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

      addExpense: (description, amount) => set((state) => ({
        expenses: [{
          id: generateId(),
          description,
          amount,
          type: 'expense',
          date: formatDate(new Date())
        }, ...state.expenses]
      })),

      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      getMonthlyInvestment: () => {
        const caixinha = get().categories.find(c => c.name.toLowerCase().includes('caixinha'));
        return caixinha ? (caixinha.budgetedAmount || 0) : 0;
      },

      getTotalBudgeted: () => {
        return get().categories.reduce((acc, c) => acc + (c.budgetedAmount || 0), 0);
      },

      getTotalExpenses: () => {
        return get().expenses.reduce((acc, e) => acc + e.amount, 0);
      },

      getRemainingBalance: () => {
        return get().salary - get().getTotalBudgeted();
      },

      getFreeBalance: () => {
        return get().getRemainingBalance() - get().getTotalExpenses();
      },

      getEmergencyFundGoal: () => {
        const monthlyEssentials = get().categories
          .filter(c => !c.name.toLowerCase().includes('caixinha'))
          .reduce((acc, c) => acc + (c.budgetedAmount || 0), 0);
        return monthlyEssentials * get().emergencyFundMonths;
      }
    }),
    { name: 'financia-core-v6-storage' }
  )
);
