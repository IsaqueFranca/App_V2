
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Wallet, PieChart, 
  Info, TrendingUp, AlertCircle, 
  ChevronRight, Calculator, X, History, ArrowUpRight,
  ShoppingBag, ReceiptText, Download, Calendar,
  CheckCircle2, LayoutDashboard
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useFinanceStore } from "./hooks/useFinanceStore";
import { cn, formatCurrency } from "./lib/utils";

// Fixed: Wrapped with React.forwardRef to handle refs from Framer Motion's AnimatePresence (popLayout mode)
const CompactCategory = React.forwardRef<HTMLDivElement, { category: any }>(
  ({ category }, ref) => {
    const { updateCategoryBudget, removeCategory } = useFinanceStore();
    
    return (
      <motion.div 
        ref={ref}
        layout
        className="bg-white border p-2 rounded-xl flex flex-col gap-1.5 group relative transition-all shadow-sm border-slate-100 hover:border-slate-200"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="text-[10px] shrink-0">{category.icon}</span>
            <span className="text-[7px] font-bold uppercase tracking-wider truncate leading-none text-slate-400">
              {category.name}
            </span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); removeCategory(category.id); }}
            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={8} />
          </button>
        </div>
        
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[7px] text-slate-300 font-bold">R$</span>
          <input 
            type="number"
            value={category.budgetedAmount || ""}
            onChange={(e) => updateCategoryBudget(category.id, parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-50 border rounded-lg pl-6 pr-1.5 py-1 text-[9px] font-bold transition-all outline-none border-slate-100 text-slate-900 focus:border-slate-300"
            placeholder="0,00"
          />
        </div>
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
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white border-l border-slate-200 z-[101] p-6 overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Calculator size={12} className="text-slate-900" />
                </div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Simulador Caixinha</h2>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Saldo Atual (R$)</label>
                  <input 
                    type="number" value={accumulatedInvestment || ""}
                    onChange={(e) => setAccumulatedInvestment(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[9px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Aporte Mensal (R$)</label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[9px] font-bold text-slate-900">
                    {formatCurrency(monthlyAporte)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Rendimento Anual (%)</label>
                  <input 
                    type="number" value={annualInterestRate || ""}
                    onChange={(e) => setAnnualInterestRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[9px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Tempo (Meses)</label>
                  <input 
                    type="number" value={projectionMonths || ""}
                    onChange={(e) => setProjectionMonths(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[9px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-2.5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Total Estimado</p>
                    <p className="text-lg font-bold text-slate-900 tracking-tight">{formatCurrency(finalData.total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Lucro Total</p>
                    <p className="text-xs font-bold text-slate-900">+{formatCurrency(finalData.totalProfit)}</p>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900" 
                    style={{ width: `${(finalData.invested / finalData.total) * 100}%` }}
                  />
                </div>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                  Investido: {formatCurrency(finalData.invested)} • Lucro: {((finalData.totalProfit / finalData.invested) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-[7px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <History size={8} /> Evolução Mensal
                </h3>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1.5 custom-scrollbar">
                  {projection.map((step) => (
                    <div key={step.month} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                      <span className="text-[7px] font-bold text-slate-400">MÊS {step.month}</span>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-900">{formatCurrency(step.total)}</p>
                        <p className="text-[6px] font-bold text-slate-400">+{formatCurrency(step.monthlyProfit)} juros</p>
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
    history, closeMonth, removeHistoryItem,
    getTotalBudgeted, getRemainingBalance, getFreeBalance, getMonthlyInvestment,
    annualInterestRate, setAnnualInterestRate,
    projectionMonths, setProjectionMonths,
    accumulatedInvestment, setAccumulatedInvestment,
    caixinhaAmount, setCaixinhaAmount
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'simulation'>('dashboard');
  const [newCatName, setNewCatName] = useState("");
  
  // Expense form state
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<string>("");

  const totalBudgeted = getTotalBudgeted();
  const monthlyAporte = getMonthlyInvestment();
  const remainingBudget = getRemainingBalance();
  const freeBalance = getFreeBalance();
  const isOverBudget = freeBalance < 0;

  const projection = useMemo(() => {
    const data = [];
    const monthlyRate = Math.pow(1 + annualInterestRate / 100, 1 / 12) - 1;
    let balance = accumulatedInvestment;
    let invested = accumulatedInvestment;

    for (let i = 1; i <= projectionMonths; i++) {
      const prevTotal = balance;
      balance = (balance + monthlyAporte) * (1 + monthlyRate);
      invested += monthlyAporte;
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

  const handleCloseMonth = () => {
    if (window.confirm("Deseja fechar o mês atual? Os gastos serão movidos para o histórico e limpos do painel principal.")) {
      closeMonth();
      setActiveTab('history');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Relatório Mensal - FinancIA", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${dateStr}`, 14, 30);
    
    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text("Resumo Financeiro", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Item', 'Valor']],
      body: [
        ['Renda Mensal', formatCurrency(salary)],
        ['Total Orçado (Fixo)', formatCurrency(totalBudgeted)],
        ['Total Compras (Variável)', formatCurrency(expenses.reduce((acc, e) => acc + e.amount, 0))],
        ['Saldo Livre Real', formatCurrency(freeBalance)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] } // Emerald-500
    });
    
    // Categories Section
    doc.text("Distribuição do Orçamento", 14, (doc as any).lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Categoria', 'Valor Orçado']],
      body: categories.map(cat => [cat.name, formatCurrency(cat.budgetedAmount)]),
      theme: 'grid'
    });
    
    // Expenses Section
    if (expenses.length > 0) {
      doc.text("Histórico de Compras", 14, (doc as any).lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Descrição', 'Data', 'Valor']],
        body: expenses.map(exp => [exp.description, exp.date, formatCurrency(exp.amount)]),
        theme: 'striped'
      });
    }
    
    doc.save(`FinancIA_Resumo_${now.getFullYear()}_${now.getMonth() + 1}.pdf`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-4 md:p-8 selection:bg-slate-100">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
              <PieChart size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-slate-900 tracking-tight">FinancIA</h1>
              <p className="text-[6px] font-medium text-slate-400 uppercase tracking-[0.2em]">Minimalist Finance</p>
            </div>
          </div>

          <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-[7px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'dashboard' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutDashboard size={10} />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('simulation')}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-[7px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'simulation' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Calculator size={10} />
              Simulação
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-[7px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'history' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <History size={10} />
              Histórico
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            {/* TOP HUD */}
            <header className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-1 mb-2">
                  <Wallet size={10} className="text-slate-400" />
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Renda Mensal</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[10px] font-medium text-slate-300">R$</span>
                  <input 
                    type="number" value={salary || ""}
                    onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 focus:ring-0 outline-none placeholder:text-slate-200"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className={cn(
                "p-4 rounded-2xl border transition-all shadow-sm",
                isOverBudget ? "bg-red-50 border-red-100" : "bg-white border-slate-100"
              )}>
                <div className="flex items-center gap-1 mb-2">
                  <PieChart size={10} className={isOverBudget ? "text-red-400" : "text-slate-300"} />
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Saldo Livre Real</span>
                </div>
                <p className={cn("text-lg font-bold tracking-tighter", isOverBudget ? "text-red-600" : "text-slate-900")}>
                  {formatCurrency(freeBalance)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-0.5 flex-1 bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-700", isOverBudget ? "bg-red-500" : "bg-slate-900")}
                      style={{ width: `${Math.min(100, (salary > 0 ? (totalBudgeted / salary) * 100 : 0))}%` }}
                    />
                  </div>
                  <span className="text-[7px] font-bold text-slate-400 uppercase">
                    {salary > 0 ? ((totalBudgeted / salary) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            </header>

            {/* MAIN DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* BUDGET DISTRIBUTION */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">Orçamento Fixo</h2>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[7px] font-bold uppercase tracking-widest transition-all border border-slate-200"
                      >
                        <Download size={8} />
                        Exportar
                      </button>
                      <button 
                        onClick={handleCloseMonth}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[7px] font-bold uppercase tracking-widest transition-all shadow-sm"
                      >
                        <CheckCircle2 size={8} />
                        Fechar Mês
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <input 
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      className="h-7 text-[8px] bg-slate-50 border border-slate-200 rounded-lg px-2 w-full sm:w-32 outline-none font-bold focus:border-slate-400 transition-all placeholder:text-slate-300"
                      placeholder="NOVA CATEGORIA..."
                    />
                    <button onClick={handleAddCategory} className="h-7 w-7 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all shadow-sm">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 content-start flex-1 overflow-y-auto pr-1.5 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {categories.map((cat) => (
                      <CompactCategory 
                        key={cat.id} 
                        category={cat} 
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {categories.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-12">
                    <Info size={24} className="mb-2 text-slate-300" />
                    <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Nenhuma categoria ativa</p>
                  </div>
                )}

                <footer className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[7px] font-bold uppercase tracking-widest text-slate-400">
                  <div className="flex gap-8">
                    <div className="flex flex-col gap-0.5">
                      <span className="opacity-60">Total Orçado</span>
                      <span className="text-slate-900 text-xs font-bold">{formatCurrency(totalBudgeted)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="opacity-60">Saldo Pós-Fixo</span>
                      <span className="text-slate-900 text-xs font-bold">{formatCurrency(remainingBudget)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="opacity-60 block mb-0.5">Comprometimento</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-900 text-xs font-bold">{salary > 0 ? ((totalBudgeted / salary) * 100).toFixed(1) : 0}%</span>
                    </div>
                  </div>
                </footer>
              </div>

              {/* EXPENSE CONTROL */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                    <ShoppingBag size={14} className="text-slate-400" />
                  </div>
                  <h2 className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">Gastos Variáveis</h2>
                </div>

                <form onSubmit={handleAddExpense} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                    <input 
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[9px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-all placeholder:text-slate-300"
                      placeholder="Ex: Mercado, iFood..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[9px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-all placeholder:text-slate-300"
                      placeholder="0,00"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[8px] uppercase tracking-[0.2em] py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                  >
                    Registrar Compra
                  </button>
                </form>

                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <ReceiptText size={10} className="text-slate-400" />
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Recentes</span>
                    </div>
                    <span className="text-[7px] font-bold text-slate-300">{expenses.length} itens</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar space-y-2">
                    <AnimatePresence mode="popLayout">
                      {expenses.map((exp) => (
                        <motion.div 
                          key={exp.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl flex justify-between items-center group hover:bg-slate-50 transition-all"
                        >
                          <div className="overflow-hidden">
                            <p className="text-[9px] font-bold text-slate-900 leading-tight truncate">{exp.description}</p>
                            <p className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{exp.date}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] font-bold text-slate-900">{formatCurrency(exp.amount)}</span>
                            <button 
                              onClick={() => removeExpense(exp.id)}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0.5"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {expenses.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 py-12">
                        <ShoppingBag size={20} className="mb-2 text-slate-300" />
                        <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Nenhum gasto</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Total Variável</span>
                    <span className="text-base font-bold text-slate-900">{formatCurrency(expenses.reduce((acc, e) => acc + e.amount, 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'simulation' ? (
          /* SIMULATION VIEW */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 min-h-[500px] flex flex-col shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <Calculator size={20} className="text-slate-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Simulador de Investimento</h2>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Projeção de Rendimentos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Saldo Atual (R$)</label>
                    <input 
                      type="number" value={accumulatedInvestment || ""}
                      onChange={(e) => setAccumulatedInvestment(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[10px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Aporte Mensal (R$)</label>
                    <input 
                      type="number" value={caixinhaAmount || ""}
                      onChange={(e) => setCaixinhaAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[10px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rendimento Anual (%)</label>
                    <input 
                      type="number" value={annualInterestRate || ""}
                      onChange={(e) => setAnnualInterestRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[10px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tempo (Meses)</label>
                    <input 
                      type="number" value={projectionMonths || ""}
                      onChange={(e) => setProjectionMonths(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[10px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Estimado</p>
                      <p className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(finalData.total)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Lucro Total</p>
                      <p className="text-base font-bold text-slate-900">+{formatCurrency(finalData.totalProfit)}</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900" 
                      style={{ width: `${(finalData.invested / finalData.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Investido: {formatCurrency(finalData.invested)} • Lucro: {finalData.invested > 0 ? ((finalData.totalProfit / finalData.invested) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <History size={12} /> Evolução Mensal
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {projection.map((step) => (
                    <div key={step.month} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                      <span className="text-[8px] font-bold text-slate-400">MÊS {step.month}</span>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-900">{formatCurrency(step.total)}</p>
                        <p className="text-[7px] font-bold text-slate-400">+{formatCurrency(step.monthlyProfit)} juros</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* HISTORY VIEW */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 min-h-[500px] flex flex-col shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <Calendar size={16} className="text-slate-400" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 tracking-tight">Histórico Mensal</h2>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Meses Encerrados</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1.5 custom-scrollbar flex-1">
              <AnimatePresence mode="popLayout">
                {history.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white border border-slate-200 p-4 rounded-2xl group relative hover:border-slate-300 transition-all shadow-sm"
                  >
                    <button 
                      onClick={() => removeHistoryItem(item.id)}
                      className="absolute top-4 right-4 p-1 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={10} />
                    </button>

                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[9px]">
                        {item.monthName.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-[10px] font-bold text-slate-900">{item.monthName} {item.year}</h3>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Renda</span>
                        <span className="text-[9px] font-bold text-slate-900">{formatCurrency(item.salary)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Orçado</span>
                        <span className="text-[9px] font-bold text-slate-600">{formatCurrency(item.totalBudgeted)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Gastos</span>
                        <span className="text-[9px] font-bold text-slate-600">{formatCurrency(item.totalExpenses)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[7px] font-bold text-slate-900 uppercase tracking-widest">Saldo Livre</span>
                        <span className="text-xs font-bold text-slate-900">{formatCurrency(item.freeBalance)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {history.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center opacity-30 py-24">
                  <History size={32} className="mb-4 text-slate-200" />
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400">Nenhum mês encerrado</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
