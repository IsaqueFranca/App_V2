
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, PieChart, ArrowUpCircle, ArrowDownCircle, Settings, 
  Menu, Sparkles, Plus, History, Home, TrendingUp, X, Bot
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useStudyStore } from "./hooks/useStudyStore"; // useFinanceStore
import LoginPage from "./components/auth/LoginPage";
import { Button } from "./components/ui/button";
import { cn, formatCurrency } from "./lib/utils";

type Tab = "dashboard" | "transactions" | "budgets" | "advisor" | "settings";

const Sidebar = ({ tab, setTab, user, onLogout }: any) => (
  <div className="flex flex-col h-screen bg-white border-r border-zinc-100 w-64 p-6">
    <div className="flex items-center gap-3 mb-10">
      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
        <Wallet className="text-white w-6 h-6" />
      </div>
      <h1 className="font-bold text-xl text-zinc-900">FinancIA</h1>
    </div>

    <nav className="flex-1 space-y-2">
      {[
        { id: 'dashboard', label: 'Resumo', icon: Home },
        { id: 'transactions', label: 'Transações', icon: History },
        { id: 'budgets', label: 'Orçamentos', icon: PieChart },
        { id: 'advisor', label: 'IA Consultor', icon: Bot },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setTab(item.id)}
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
        <Settings className="w-5 h-5" /> Ajustes
      </button>
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl">
        <X className="w-5 h-5" /> Sair
      </button>
    </div>
  </div>
);

const App = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { user, setUser, isGuest, getBalance, transactions } = useStudyStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) setUser({ uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL });
    });
    return unsub;
  }, []);

  if (!user && !isGuest) return <LoginPage onLoginSuccess={() => {}} />;

  return (
    <div className="flex h-screen bg-zinc-50 font-sans selection:bg-emerald-200">
      <div className="hidden md:block">
        <Sidebar tab={tab} setTab={setTab} user={user} onLogout={() => signOut(auth)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md p-6 flex justify-between items-center border-b border-zinc-100">
          <div>
            <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Saldo Atual</h2>
            <p className="text-2xl font-black text-zinc-900">{formatCurrency(getBalance())}</p>
          </div>
          <div className="flex gap-2">
             <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-full h-12 px-6 shadow-lg shadow-emerald-200">
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
              className="max-w-5xl mx-auto"
            >
              {tab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col justify-center items-center">
                      <TrendingUp className="w-12 h-12 text-emerald-500 mb-4" />
                      <h3 className="text-zinc-500 text-sm font-bold uppercase">Rendimento Mensal</h3>
                      <p className="text-4xl font-black text-zinc-900">+12%</p>
                   </div>
                   <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-zinc-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/20 rounded-lg"><Sparkles className="text-emerald-400 w-5 h-5" /></div>
                        <h3 className="font-bold">IA Insight</h3>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Seus gastos com alimentação subiram 15% esta semana. Que tal preparar marmitas para economizar cerca de R$ 200 este mês?
                      </p>
                   </div>
                   <div className="md:col-span-2 bg-white rounded-[2.5rem] border border-zinc-100 p-8">
                      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <History className="w-5 h-5 text-zinc-400" /> Atividade Recente
                      </h3>
                      <div className="space-y-4">
                        {transactions.length === 0 ? (
                           <p className="text-center py-10 text-zinc-400 italic">Nenhuma transação encontrada.</p>
                        ) : (
                          transactions.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                               <div className="flex items-center gap-4">
                                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                                     {t.type === 'income' ? <ArrowUpCircle /> : <ArrowDownCircle />}
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
                          ))
                        )}
                      </div>
                   </div>
                </div>
              )}
              {tab === 'advisor' && (
                <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 min-h-[500px] flex flex-col shadow-sm">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Bot className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Consultor FinancIA</h3>
                        <p className="text-sm text-zinc-500">Inteligência Artificial aplicada às suas finanças.</p>
                      </div>
                   </div>
                   <div className="flex-1 bg-zinc-50 rounded-2xl p-6 mb-6">
                      <p className="text-zinc-600 text-center italic">Como posso ajudar com suas finanças hoje?</p>
                   </div>
                   <div className="relative">
                      <input className="w-full h-16 pl-6 pr-14 rounded-2xl bg-zinc-100 border-none focus:ring-2 ring-emerald-500" placeholder="Pergunte ou registre um gasto via texto..." />
                      <button className="absolute right-3 top-3 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                        <Plus />
                      </button>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
