
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, PieChart, ArrowUpCircle, ArrowDownCircle, Settings, 
  Sparkles, Plus, History, Home, TrendingUp, X, Bot, LogOut
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useFinanceStore } from "./hooks/useFinanceStore";
import LoginPage from "./components/auth/LoginPage";
import { Button } from "./components/ui/button";
import { cn, formatCurrency, formatDate } from "./lib/utils";

type Tab = "dashboard" | "transactions" | "advisor" | "settings";

const Sidebar = ({ tab, setTab, onLogout }: any) => (
  <div className="flex flex-col h-screen bg-white border-r border-zinc-100 w-64 p-6 shrink-0">
    <div className="flex items-center gap-3 mb-10">
      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
        <Wallet className="text-white w-6 h-6" />
      </div>
      <h1 className="font-bold text-xl text-zinc-900">FinancIA</h1>
    </div>

    <nav className="flex-1 space-y-2">
      {[
        { id: 'dashboard', label: 'Início', icon: Home },
        { id: 'transactions', label: 'Extrato', icon: History },
        { id: 'advisor', label: 'Consultor IA', icon: Bot },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setTab(item.id as Tab)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
            tab === item.id ? "bg-emerald-50 text-emerald-700" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </button>
      ))}
    </nav>

    <div className="pt-6 border-t border-zinc-100 space-y-2">
      <button onClick={() => setTab('settings')} className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 rounded-xl">
        <Settings className="w-5 h-5" /> Configurações
      </button>
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl">
        <LogOut className="w-5 h-5" /> Sair
      </button>
    </div>
  </div>
);

const App = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { user, setUser, isGuest, getBalance, transactions, getMonthlyTotal } = useFinanceStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) {
        setUser({ uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL });
      }
    });
    return unsub;
  }, []);

  if (!user && !isGuest) return <LoginPage onLoginSuccess={() => {}} />;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const income = getMonthlyTotal('income', currentMonth);
  const expenses = getMonthlyTotal('expense', currentMonth);

  return (
    <div className="flex h-screen bg-zinc-50 font-sans selection:bg-emerald-200 overflow-hidden">
      <Sidebar tab={tab} setTab={setTab} onLogout={() => signOut(auth)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md p-6 flex justify-between items-center border-b border-zinc-100 shrink-0">
          <div>
            <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Saldo Disponível</h2>
            <p className="text-3xl font-black text-zinc-900">{formatCurrency(getBalance())}</p>
          </div>
          <div className="flex gap-2">
             <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-full h-12 px-6 shadow-lg shadow-emerald-200"
             >
                <Plus className="w-5 h-5 mr-2" /> Nova Transação
             </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {tab === 'dashboard' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <ArrowUpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase">Ganhos no Mês</p>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(income)}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                            <ArrowDownCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase">Gastos no Mês</p>
                            <p className="text-xl font-bold text-red-600">{formatCurrency(expenses)}</p>
                        </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-emerald-400 w-6 h-6" />
                        <h3 className="font-bold text-lg">FinancIA Insights</h3>
                      </div>
                      <p className="text-zinc-400 leading-relaxed italic">
                        "Seu gasto com lazer este mês está 12% maior que o normal. Que tal reservar o próximo final de semana para atividades gratuitas e garantir sua meta de economia?"
                      </p>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                           <History className="w-5 h-5 text-zinc-400" /> Últimas Atividades
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setTab('transactions')}>Ver tudo</Button>
                      </div>
                      <div className="space-y-4">
                        {transactions.slice(-5).reverse().map(t => (
                           <div key={t.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                 )}>
                                    {t.type === 'income' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}
                                 </div>
                                 <div>
                                    <p className="font-bold text-zinc-900">{t.description}</p>
                                    <p className="text-xs text-zinc-500">{t.date}</p>
                                 </div>
                              </div>
                              <p className={cn("font-bold", t.type === 'income' ? "text-emerald-600" : "text-red-600")}>
                                 {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                              </p>
                           </div>
                        ))}
                      </div>
                  </div>
                </>
              )}

              {tab === 'advisor' && (
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 h-[600px] flex flex-col shadow-sm">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Bot className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Consultor FinancIA</h3>
                        <p className="text-sm text-zinc-500">Inteligência Artificial aplicada às suas finanças.</p>
                      </div>
                   </div>
                   <div className="flex-1 bg-zinc-50 rounded-2xl p-6 mb-6 flex flex-col justify-end">
                      <div className="bg-emerald-100 text-emerald-800 p-4 rounded-2xl rounded-bl-none max-w-[80%] mb-4">
                         Olá! Posso te ajudar a analisar seus gastos, criar orçamentos ou registrar despesas apenas com texto. O que deseja agora?
                      </div>
                   </div>
                   <div className="relative">
                      <input 
                        className="w-full h-16 pl-6 pr-20 rounded-2xl bg-zinc-100 border-none focus:ring-2 ring-emerald-500 text-zinc-900 font-medium" 
                        placeholder="Ex: Quanto gastei com comida esse mês?" 
                      />
                      <button className="absolute right-3 top-3 h-10 px-4 bg-emerald-600 text-white rounded-xl flex items-center gap-2 font-bold shadow-md">
                        <Sparkles size={16}/> Enviar
                      </button>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modal Nova Transação (Simplificado) */}
      <AnimatePresence>
        {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6"
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Nova Transação</h3>
                        <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}><X/></Button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400 uppercase">Valor</label>
                            <input type="number" className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-xl px-4 font-bold text-lg" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400 uppercase">Descrição</label>
                            <input type="text" className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-xl px-4" placeholder="Mercado, Salário, etc." />
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <Button className="h-12 bg-emerald-600 font-bold">Ganho (+)</Button>
                            <Button className="h-12 bg-red-600 font-bold">Gasto (-)</Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
