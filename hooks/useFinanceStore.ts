import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Transaction, HistoryItem } from '../types';
import { generateId, formatDate } from '../lib/utils';

interface FinanceStore {
  salary: number;
  categories: Category[];
  expenses: Transaction[];
  history: HistoryItem[];
  annualInterestRate: number; // Taxa anual em %
  projectionMonths: number; // Tempo de projeção
  accumulatedInvestment: number; // Saldo que já existe na caixinha
  caixinhaAmount: number; // Aporte mensal específico da caixinha
  
  // Actions
  setSalary: (amount: number) => void;
  setAnnualInterestRate: (rate: number) => void;
  setProjectionMonths: (months: number) => void;
  setAccumulatedInvestment: (amount: number) => void;
  setCaixinhaAmount: (amount: number) => void;
  addCategory: (name: string, icon: string, amount: number) => void;
  removeCategory: (id: string) => void;
  updateCategoryBudget: (id: string, amount: number) => void;
  addExpense: (description: string, amount: number) => void;
  removeExpense: (id: string) => void;
  closeMonth: () => void;
  removeHistoryItem: (id: string) => void;
  
  // Selectors
  getMonthlyInvestment: () => number;
  getTotalBudgeted: () => number;
  getTotalExpenses: () => number;
  getRemainingBalance: () => number; // Saldo após orçamento fixo
  getFreeBalance: () => number; // Saldo livre real (após orçamento e despesas variáveis)
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      salary: 0,
      annualInterestRate: 12.0, // 12% ao ano default
      projectionMonths: 12,
      accumulatedInvestment: 0,
      caixinhaAmount: 0,
      expenses: [],
      history: [],
      categories: [
        { id: '1', name: 'Aluguel', icon: '🏠', budgetedAmount: 0, color: 'bg-blue-500' },
        { id: '2', name: 'Alimentação', icon: '🛒', budgetedAmount: 0, color: 'bg-orange-500' },
      ],

      setSalary: (salary) => set({ salary }),
      setAnnualInterestRate: (annualInterestRate) => set({ annualInterestRate }),
      setProjectionMonths: (projectionMonths) => set({ projectionMonths }),
      setAccumulatedInvestment: (accumulatedInvestment) => set({ accumulatedInvestment }),
      setCaixinhaAmount: (caixinhaAmount) => set({ caixinhaAmount }),

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

      closeMonth: () => {
        const state = get();
        const now = new Date();
        const monthNames = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        
        const historyItem: HistoryItem = {
          id: generateId(),
          monthName: monthNames[now.getMonth()],
          year: now.getFullYear(),
          salary: state.salary,
          totalBudgeted: state.getTotalBudgeted(),
          totalExpenses: state.getTotalExpenses(),
          freeBalance: state.getFreeBalance(),
          categories: [...state.categories],
          expenses: [...state.expenses],
          date: formatDate(now)
        };

        set((state) => ({
          history: [historyItem, ...state.history],
          // Reset current month data
          expenses: [],
          // We keep categories but maybe reset their budgeted amounts? 
          // Usually users want to keep the budget structure.
          // Let's just clear expenses for now as requested "store in another tab".
        }));
      },

      removeHistoryItem: (id) => set((state) => ({
        history: state.history.filter(h => h.id !== id)
      })),

      getMonthlyInvestment: () => {
        return get().caixinhaAmount;
      },

      getTotalBudgeted: () => {
        return get().categories.reduce((acc, c) => acc + (c.budgetedAmount || 0), 0) + get().caixinhaAmount;
      },

      getTotalExpenses: () => {
        return get().expenses.reduce((acc, e) => acc + e.amount, 0);
      },

      getRemainingBalance: () => {
        return get().salary - get().getTotalBudgeted();
      },

      getFreeBalance: () => {
        return get().getRemainingBalance() - get().getTotalExpenses();
      }
    }),
    { name: 'financia-app-data-storage' }
  )
);
