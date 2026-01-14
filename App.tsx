
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Shield, 
  Wallet, PieChart, Info, 
  TrendingUp, TrendingDown,
  AlertCircle, ChevronRight
} from "lucide-react";
import { useFinanceStore } from "./hooks/useFinanceStore";
import { Button } from "./components/ui/button";
import { cn, formatCurrency } from "./lib/utils";

// Fixed: Added key to the prop type to avoid "Property 'key' does not exist" error during component mapping
const CompactCategory = ({ category }: { category: any; key?: React.Key }) => {
  const { updateCategoryBudget, removeCategory } = useFinanceStore();
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl flex flex-col gap-2 group relative transition-all hover:border-zinc-700"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-sm shrink-0">{category.icon}</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter truncate leading-none">
            {category.name}
          </span>
        </div>
        <button 
          onClick={() => removeCategory(category.id)}
          className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={12} />
        </button>
      </div>
      
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 font-bold">R$</span>
        <input 
          type="number"
          value={category.budgetedAmount || ""}
          onChange={(e) => updateCategoryBudget(category.id, parseFloat(e.target.value) || 0)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-zinc-100 focus:ring-1 ring-emerald-500/50 transition-all outline-none"
          placeholder="0,00"
        />
      </div>
    </motion.div>
  );
};

const App = () => {
  const { 
    salary, setSalary, 
    categories, addCategory,
    emergencyFundMonths, setEmergencyFundMonths,
    getTotalBudgeted, getRemainingBalance, getEmergencyFundGoal 
  } = useFinanceStore();

  const [newCatName, setNewCatName] = useState("");
  const totalBudgeted = getTotalBudgeted();
  const remaining = getRemainingBalance();
  const emergencyGoal = getEmergencyFundGoal();
  const isOverBudget = remaining < 0;

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCategory(newCatName, "•", 0);
      setNewCatName("");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-500/30 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP HUD - FIXED SUMMARY */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet size={12} className="text-emerald-500" />
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Renda Disponível</span>
            </div>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg font-black text-zinc-600">R$</span>
              <input 
                type="number"
                value={salary || ""}
                onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent border-none pl-8 py-0 text-3xl font-black text-white focus:ring-0 outline-none"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className={cn(
            "p-4 rounded-2xl border transition-colors flex flex-col justify-center",
            isOverBudget ? "bg-red-500/5 border-red-500/20" : "bg-zinc-900 border-zinc-800"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PieChart size={12} className={isOverBudget ? "text-red-400" : "text-zinc-500"} />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status do Orçamento</span>
              </div>
              {isOverBudget && <AlertCircle size={12} className="text-red-500 animate-pulse" />}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-black tracking-tighter", isOverBudget ? "text-red-500" : "text-emerald-500")}>
                {formatCurrency(remaining)}
              </span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase">
                {isOverBudget ? "Excedido" : "Livre"}
              </span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500", isOverBudget ? "bg-red-500" : "bg-emerald-500")}
                style={{ width: `${Math.min(100, (totalBudgeted / (salary || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden">
            <Shield size={60} className="absolute -right-4 -bottom-4 text-zinc-800/50 pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reserva ({emergencyFundMonths}m)</span>
              <div className="flex gap-1 z-10">
                {[6, 12, 24].map(m => (
                  <button 
                    key={m}
                    onClick={() => setEmergencyFundMonths(m)}
                    className={cn(
                      "text-[9px] font-black px-1.5 py-0.5 rounded border transition-all",
                      emergencyFundMonths === m ? "bg-white text-black border-white" : "border-zinc-700 text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{formatCurrency(emergencyGoal)}</p>
            <p className="text-[9px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter">
              Custo de Vida: {formatCurrency(totalBudgeted)}/mês
            </p>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5 md:p-8 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Planejamento de Gastos</h2>
            </div>
            
            <div className="flex gap-2">
              <input 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                className="h-8 text-[10px] bg-zinc-950 border border-zinc-800 rounded-lg px-3 w-32 focus:border-zinc-600 outline-none font-bold"
                placeholder="NOME DA CATEGORIA..."
              />
              <button 
                onClick={handleAddCategory}
                className="h-8 w-8 bg-zinc-100 text-zinc-950 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 flex-1 content-start overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {categories.map((cat) => (
                <CompactCategory key={cat.id} category={cat} />
              ))}
            </AnimatePresence>
          </div>

          {categories.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-800 opacity-50">
              <Info size={32} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Sem gastos listados</p>
            </div>
          )}

          {/* FOOTER STATS */}
          <footer className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total Alocado</p>
              <p className="text-sm font-black text-white">{formatCurrency(totalBudgeted)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Eficiência</p>
              <p className="text-sm font-black text-emerald-500">
                {salary > 0 ? ((totalBudgeted / salary) * 100).toFixed(1) : "0"}%
              </p>
            </div>
            <div className="col-span-1 md:col-span-2 flex items-center justify-end">
              <div className="text-right">
                <p className="text-[9px] text-zinc-600 font-bold uppercase">FinancIA Core v3.0</p>
                <p className="text-[10px] text-zinc-500">Dados salvos localmente no dispositivo</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
