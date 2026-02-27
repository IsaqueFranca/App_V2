
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Shield, Wallet, PieChart, 
  Info, TrendingUp, AlertCircle, 
  ChevronRight, Calculator, X, History, ArrowUpRight,
  ShoppingBag, ReceiptText
} from "lucide-react";
import { useFinanceStore } from "./hooks/useFinanceStore";
import { cn, formatCurrency } from "./lib/utils";

// Fixed: Wrapped with React.forwardRef to handle refs from Framer Motion's AnimatePresence (popLayout mode)
const CompactCategory = React.forwardRef<HTMLDivElement, { category: any; onOpenDetails: () => void }>(
  ({ category, onOpenDetails }, ref) => {
    const { updateCategoryBudget, removeCategory } = useFinanceStore();
    const isCaixinha = category.name.toLowerCase().includes('caixinha');
    
    return (
      <motion.div 
        ref={ref}
        layout
        className={cn(
          "bg-zinc-900/50 border p-3 rounded-xl flex flex-col gap-2 group relative transition-all",
          isCaixinha ? "border-cyan-500/40 cursor-pointer hover:bg-cyan-500/5 shadow-lg shadow-cyan-500/5" : "border-zinc-800 hover:border-zinc-700"
        )}
        onClick={() => isCaixinha && onOpenDetails()}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-sm shrink-0">{category.icon}</span>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-tighter truncate leading-none",
              isCaixinha ? "text-cyan-400" : "text-zinc-400"
            )}>
              {category.name}
            </span>
          </div>
          {!isCaixinha && (
            <button 
              onClick={(e) => { e.stopPropagation(); removeCategory(category.id); }}
              className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          )}
          {isCaixinha && <ArrowUpRight size={10} className="text-cyan-500" />}
        </div>
        
        <div className="relative" onClick={(e) => isCaixinha && e.stopPropagation()}>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 font-bold">R$</span>
          <input 
            type="number"
            value={category.budgetedAmount || ""}
            onChange={(e) => updateCategoryBudget(category.id, parseFloat(e.target.value) || 0)}
            className={cn(
              "w-full bg-zinc-950 border rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold transition-all outline-none",
              isCaixinha ? "border-cyan-500/40 text-cyan-50" : "border-zinc-800 text-zinc-100 focus:ring-1 ring-emerald-500/50"
            )}
            placeholder="0,00"
          />
        </div>
        {isCaixinha && (
          <div className="text-[8px] font-black text-cyan-500 uppercase tracking-widest text-center animate-pulse">
            Toque para Projetar Rendimento
          </div>
        )}
      </motion.div>
    );
  }
);

// Fixed: Added React.FC type for consistency and to avoid potential prop validation issues
const CaixinhaModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    getMonthlyInvestment, 
    annualInterestRate, setAnnualInterestRate,
    projectionMonths, setProjectionMonths,
    accumulatedInvestment, setAccumulatedInvestment
  } = useFinanceStore();

  const monthlyAporte = getMonthlyInvestment();

  const projection = useMemo(() => {
    const data = [];
    const monthlyRate = Math.pow(1 + annualInterestRate / 100, 1 / 12) - 1;
    let balance = accumulatedInvestment;
    let invested = accumulatedInvestment;

    for (let i = 1; i <= projectionMonths; i++) {
      const prevTotal = balance;
      // O rendimento incide sobre o saldo anterior + o aporte do mês
      balance = (balance + monthlyAporte) * (1 + monthlyRate);
      invested += monthlyAporte;
      
      // Lucro específico deste mês = Saldo final - (Saldo inicial + Aporte)
      const monthlyProfit = balance - (prevTotal + monthlyAporte);
      
      data.push({
        month: i,
        total: balance,
        invested: invested,
        totalProfit: balance - invested,
        monthlyProfit: monthlyProfit
      });
    }
    return data;
  }, [accumulatedInvestment, monthlyAporte, annualInterestRate, projectionMonths]);

  const finalData = projection[projection.length - 1] || { total: 0, invested: 0, totalProfit: 0 };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-[101] p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Calculator size={16} className="text-cyan-500" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Simulador Caixinha</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase">Saldo Atual (R$)</label>
                  <input 
                    type="number" value={accumulatedInvestment || ""}
                    onChange={(e) => setAccumulatedInvestment(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase">Aporte Mensal (R$)</label>
                  <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-xs font-bold text-cyan-500">
                    {formatCurrency(monthlyAporte)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase">Rendimento Anual (%)</label>
                  <input 
                    type="number" value={annualInterestRate || ""}
                    onChange={(e) => setAnnualInterestRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase">Tempo (Meses)</label>
                  <input 
                    type="number" value={projectionMonths || ""}
                    onChange={(e) => setProjectionMonths(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-cyan-500/60 uppercase">Total Estimado</p>
                    <p className="text-2xl font-black text-cyan-400 tracking-tight">{formatCurrency(finalData.total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-500/60 uppercase">Lucro Total Acumulado</p>
                    <p className="text-lg font-black text-emerald-400">+{formatCurrency(finalData.totalProfit)}</p>
                  </div>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500" 
                    style={{ width: `${(finalData.invested / finalData.total) * 100}%` }}
                  />
                </div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase">
                  Investido: {formatCurrency(finalData.invested)} • Lucro: {((finalData.totalProfit / finalData.invested) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={12} /> Evolução Mensal (Juros por Mês)
                </h3>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {projection.map((step) => (
                    <div key={step.month} className="flex justify-between items-center p-2 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 group transition-all">
                      <span className="text-[10px] font-bold text-zinc-500">MÊS {step.month}</span>
                      <div className="text-right">
                        <p className="text-[11px] font-black text-zinc-200">{formatCurrency(step.total)}</p>
                        <p className="text-[8px] font-bold text-emerald-500">+{formatCurrency(step.monthlyProfit)} juros no mês</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const App = () => {
  const { 
    salary, setSalary, 
    categories, addCategory,
    expenses, addExpense, removeExpense,
    emergencyFundMonths, setEmergencyFundMonths,
    getTotalBudgeted, getRemainingBalance, getFreeBalance, getEmergencyFundGoal, getMonthlyInvestment 
  } = useFinanceStore();

  const [newCatName, setNewCatName] = useState("");
  const [isCaixinhaOpen, setIsCaixinhaOpen] = useState(false);
  
  // Expense form state
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<string>("");

  const totalBudgeted = getTotalBudgeted();
  const monthlyAporte = getMonthlyInvestment();
  const remainingBudget = getRemainingBalance();
  const freeBalance = getFreeBalance();
  const emergencyGoal = getEmergencyFundGoal();
  const isOverBudget = freeBalance < 0;

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCategory(newCatName, "•", 0);
      setNewCatName("");
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (expenseDesc.trim() && !isNaN(amount)) {
      addExpense(expenseDesc, amount);
      setExpenseDesc("");
      setExpenseAmount("");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans p-4 md:p-6 selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP HUD */}
        <header className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={12} className="text-emerald-500" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Renda Mensal</span>
            </div>
            <input 
              type="number" value={salary || ""}
              onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent border-none p-0 text-2xl font-black text-white focus:ring-0 outline-none"
              placeholder="0,00"
            />
          </div>

          <div className={cn(
            "p-4 rounded-2xl border transition-colors flex flex-col justify-center",
            isOverBudget ? "bg-red-500/5 border-red-500/20" : "bg-zinc-900 border-zinc-800"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <PieChart size={12} className={isOverBudget ? "text-red-400" : "text-zinc-500"} />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Saldo Livre Real</span>
            </div>
            <p className={cn("text-2xl font-black tracking-tighter", isOverBudget ? "text-red-500" : "text-emerald-500")}>
              {formatCurrency(freeBalance)}
            </p>
            <p className="text-[8px] font-bold text-zinc-500 uppercase mt-1">
              Pós Orçamento: {formatCurrency(remainingBudget)}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={12} className="text-cyan-500" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Aporte Caixinha</span>
            </div>
            <p className="text-2xl font-black text-cyan-400">{formatCurrency(monthlyAporte)}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={12} className="text-zinc-500" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reserva ({emergencyFundMonths}m)</span>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{formatCurrency(emergencyGoal)}</p>
          </div>
        </header>

        {/* MAIN DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* BUDGET DISTRIBUTION */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 md:p-8 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Distribuição do Orçamento</h2>
              <div className="flex gap-2">
                <input 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  className="h-8 text-[10px] bg-zinc-950 border border-zinc-800 rounded-lg px-3 w-32 outline-none font-bold"
                  placeholder="NOVA CATEGORIA..."
                />
                <button onClick={handleAddCategory} className="h-8 w-8 bg-zinc-100 text-zinc-950 rounded-lg flex items-center justify-center hover:bg-white transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 content-start flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {categories.map((cat) => (
                  <CompactCategory 
                    key={cat.id} 
                    category={cat} 
                    onOpenDetails={() => setIsCaixinhaOpen(true)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {categories.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                <Info size={40} className="mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma categoria ativa</p>
              </div>
            )}

            <footer className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <div className="flex gap-6">
                <div>Total Orçado: <span className="text-white ml-1">{formatCurrency(totalBudgeted)}</span></div>
                <div>Comprometimento: <span className="text-white ml-1">{salary > 0 ? ((totalBudgeted / salary) * 100).toFixed(1) : 0}%</span></div>
              </div>
            </footer>
          </div>

          {/* EXPENSE CONTROL */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ShoppingBag size={16} className="text-emerald-500" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Controle de Compras</h2>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase">Descrição</label>
                <input 
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
                  placeholder="Ex: Mercado, iFood, Cinema..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase">Valor (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
                  placeholder="0,00"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
              >
                Adicionar Gasto
              </button>
            </form>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3">
                <ReceiptText size={12} className="text-zinc-500" />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Últimas Compras</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                <AnimatePresence mode="popLayout">
                  {expenses.map((exp) => (
                    <motion.div 
                      key={exp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl flex justify-between items-center group hover:border-zinc-700 transition-all"
                    >
                      <div>
                        <p className="text-[11px] font-bold text-white leading-tight">{exp.description}</p>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">{exp.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-zinc-200">{formatCurrency(exp.amount)}</span>
                        <button 
                          onClick={() => removeExpense(exp.id)}
                          className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {expenses.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                    <History size={24} className="mb-2" />
                    <p className="text-[8px] font-black uppercase tracking-widest">Sem gastos registrados</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-zinc-500">Total Variável:</span>
                <span className="text-white">{formatCurrency(expenses.reduce((acc, e) => acc + e.amount, 0))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CaixinhaModal isOpen={isCaixinhaOpen} onClose={() => setIsCaixinhaOpen(false)} />
    </div>
  );
};

export default App;
