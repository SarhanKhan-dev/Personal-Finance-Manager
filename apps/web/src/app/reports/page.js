"use client";

import {
    DownloadCloud, CalendarDays, BarChart, FileText, ArrowUpRight,
    ArrowDownRight, TrendingUp, PieChart, Loader2, Sparkles,
    Filter, Activity, LayoutGrid, Building2, Wallet, Users,
    ChevronDown, ChevronRight, Info
} from "lucide-react";
import { Button, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchReportRange } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useDateRange } from "@/hooks/useDateRange";
import { TopBar } from "@/components/TopBar";

export default function ReportsPage() {
    const { from, to, setFrom, setTo, updateRange, isUpdating } = useDateRange();

    const { data: report, isLoading } = useQuery({
        queryKey: ['reports', 'range', from, to],
        queryFn: () => fetchReportRange(from, to),
    });

    if (isLoading && !report) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl border-4 border-slate-100 border-t-slate-900 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart className="text-slate-900" size={24} />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-slate-900 font-black uppercase tracking-[0.4em] text-[10px] mb-1">Generating Report</p>
                    <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Analyzing your financial data...</p>
                </div>
            </div>
        );
    }

    const { incomeItems = [], expenseItems = [], categoryBreakdown = [], merchantBreakdown = [], assetBreakdown = [], debtMovement = [] } = report || {};

    const safeIncome = Array.isArray(incomeItems) ? incomeItems : [];
    const safeExpense = Array.isArray(expenseItems) ? expenseItems : [];
    const safeCatBreakdown = Array.isArray(categoryBreakdown) ? categoryBreakdown : [];
    const safeMerchBreakdown = Array.isArray(merchantBreakdown) ? merchantBreakdown : [];
    const safeAssetBreakdown = Array.isArray(assetBreakdown) ? assetBreakdown : [];
    const safeDebtMovement = Array.isArray(debtMovement) ? debtMovement : [];

    const totalIncome = safeIncome.reduce((acc, i) => acc + (i?.amount || 0), 0);
    const totalExpense = safeExpense.reduce((acc, i) => acc + (i?.amount || 0), 0);
    const net = totalIncome - totalExpense;

    return (
        <div className="flex flex-col min-h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar
                title="Reports"
                fromDate={from}
                toDate={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onUpdate={updateRange}
                isUpdating={isUpdating}
            />

            <div className="p-6 lg:p-8 space-y-8 pb-32">
                {/* Summary Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden p-10 rounded-3xl bg-slate-950 text-white shadow-3xl shadow-slate-900/30 group"
                >
                    <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start lg:items-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-2xl">
                            <Sparkles size={28} className="animate-pulse" />
                        </div>
                        <div className="space-y-6 flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Overview</h3>
                                <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/10">SYNCED</div>
                            </div>
                            <p className="text-lg md:text-xl font-black text-slate-100 leading-tight tracking-tight">
                                During this period, you earned <span className="text-emerald-400 font-black">PKR {totalIncome.toLocaleString()}</span> from <span className="underline decoration-slate-700 underline-offset-8 decoration-2">{safeIncome.length} sources</span>.
                                Total spending was <span className="text-rose-400 font-black">PKR {totalExpense.toLocaleString()}</span>, leaving you with a net balance of <span className={cn("font-black underline decoration-2 underline-offset-8", net >= 0 ? "text-emerald-400 decoration-emerald-900" : "text-rose-400 decoration-rose-900")}>PKR {Math.abs(net).toLocaleString()}</span>.
                                Most of your spending went to <span className="text-blue-400">{safeCatBreakdown[0]?.name || 'N/A'}</span>.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Primary Data Grids */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    {/* Categories Breakdown */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/40 flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                                    <LayoutGrid size={20} />
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Spending by Category</h3>
                                    <p className="text-[9px] font-black text-slate-300 uppercase mt-1 tracking-widest">How you allocate your budget</p>
                                </div>
                            </div>
                            <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[8px] uppercase tracking-widest h-7 px-3">{categoryBreakdown.length} Categories</Badge>
                        </div>
                        <div className="p-8 space-y-6">
                            {safeCatBreakdown.map((cat, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">CATEGORY</span>
                                            <span className="text-base font-black text-slate-800 tracking-tighter uppercase group-hover:text-blue-600 transition-colors">{cat.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block opacity-50">{cat.percentage}% OF TOTAL</span>
                                            <span className="text-lg font-black text-slate-950 tracking-tighter">PKR {cat.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 1.5, ease: "circOut" }}
                                            className="h-full bg-slate-900 rounded-full shadow-lg"
                                        />
                                    </div>
                                </div>
                            ))}
                            {categoryBreakdown.length === 0 && (
                                <div className="py-20 text-center">
                                    <PieChart size={48} className="mx-auto text-slate-100 mb-6" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No data for this period</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Merchant / Provider Breakdown */}
                    <div className="bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 flex flex-col">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Top Merchants</h3>
                                    <p className="text-[10px] font-black text-slate-300 uppercase mt-1 tracking-widest">Where you spend most often</p>
                                </div>
                            </div>
                            <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[9px] uppercase tracking-widest h-8 px-4">{merchantBreakdown.length} Merchants</Badge>
                        </div>
                        <div className="p-10 space-y-8">
                            {safeMerchBreakdown.map((m, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">MERCHANT</span>
                                            <span className="text-lg font-black text-slate-800 tracking-tighter uppercase group-hover:text-emerald-600 transition-colors">{m.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block opacity-50">{m.count} TRANSACTIONS</span>
                                            <span className="text-xl font-black text-slate-950 tracking-tighter">PKR {m.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: `${(m.amount / totalExpense) * 100}%` }} transition={{ duration: 1.5, ease: "circOut" }}
                                            className="h-full bg-slate-400 rounded-full shadow-lg"
                                        />
                                    </div>
                                </div>
                            ))}
                            {merchantBreakdown.length === 0 && (
                                <div className="py-20 text-center">
                                    <Users size={48} className="mx-auto text-slate-100 mb-6" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No data for this period</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Insights Strip */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Asset Impact */}
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/30">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <Wallet size={20} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Spending by Account</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {safeAssetBreakdown.map((a, i) => (
                                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100/50 group hover:bg-white hover:shadow-xl transition-all">
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter block mb-1">ACCOUNT: {a.type}</span>
                                    <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors block leading-tight">{a.name}</span>
                                    <div className="mt-4 text-xl font-black text-slate-950 tracking-tighter">PKR {a.amount.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Debt Management Overview */}
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/30">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Debt Activity</h3>
                        </div>
                        <div className="space-y-4">
                            {safeDebtMovement.map((d, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", d.type === 'LENT' || d.type === 'RECEIVED_BACK' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500')}>
                                            {d.type === 'LENT' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                        </div>
                                        <div>
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight block">{d.entity}</span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{d.type} Action</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-base font-black text-slate-900 tracking-tighter block">PKR {d.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                            {debtMovement.length === 0 && (
                                <div className="py-12 text-center text-slate-200">
                                    <Info className="mx-auto mb-2 opacity-30" size={32} />
                                    <p className="text-[9px] font-black uppercase tracking-widest">No debt activity found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Control Strip */}
            <div className="mt-auto px-10 py-6 border-t border-slate-50 bg-[#fcfdfe] text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Financial Report - End of Page</p>
            </div>
        </div>
    );
}
