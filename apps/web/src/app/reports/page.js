"use client";

import { useState } from "react";
import { DownloadCloud, CalendarDays, BarChart, FileText, ArrowUpRight, ArrowDownRight, TrendingUp, PieChart, Loader2, Sparkles, Filter } from "lucide-react";
import { Card, Stat, Badge, Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchSummary } from "@/lib/api";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export default function Reports() {
    const [range, setRange] = useState({
        from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });

    const { data: summary, isLoading } = useQuery({
        queryKey: ['summary', range.from, range.to],
        queryFn: () => fetchSummary(range.from, range.to)
    });

    if (isLoading) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generating intelligence report...</p>
            </div>
        );
    }

    const { totals, byCategory, byMerchant, topTransactions } = summary || {
        totals: { income: 0, expense: 0, net: 0 },
        byCategory: [],
        byMerchant: [],
        topTransactions: []
    };

    const topCategory = byCategory[0]?.categoryName || 'N/A';
    const topMerchant = byMerchant[0]?.merchantName || 'N/A';

    return (
        <div className="p-10 space-y-12 max-w-[1600px] mx-auto animate-fade-in pb-32">

            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-slate-50 pb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Summaries</h1>
                        <p className="text-xs font-bold text-slate-400 tracking-wide mt-1 uppercase">Financial Intelligence Report</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 h-12 shadow-sm">
                        <CalendarDays size={18} className="text-slate-400" />
                        <Input
                            type="date"
                            className="border-none h-full focus:ring-0 text-xs font-bold bg-transparent p-0"
                            value={range.from}
                            onChange={e => setRange({ ...range, from: e.target.value })}
                        />
                        <span className="text-slate-300 mx-1">—</span>
                        <Input
                            type="date"
                            className="border-none h-full focus:ring-0 text-xs font-bold bg-transparent p-0"
                            value={range.to}
                            onChange={e => setRange({ ...range, to: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" className="px-6 h-12 border-slate-200">
                            <DownloadCloud size={16} className="mr-2" /> Export
                        </Button>
                    </div>
                </div>
            </div>

            {/* AI Summary Section */}
            <div className="relative overflow-hidden p-8 rounded-[2rem] bg-indigo-50/30 border border-indigo-100 shadow-sm">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/20 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
                        <Sparkles size={28} />
                    </div>
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Executive Snapshot</h3>
                            <Badge variant="accent" className="bg-indigo-600 text-white border-none py-1 px-3">AI GENERATED</Badge>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            For this period, your total inflow was <span className="text-indigo-600 font-black">PKR {totals.income.toLocaleString()}</span> against an outflow of <span className="text-rose-600 font-black">PKR {totals.expense.toLocaleString()}</span>.
                            The primary cost driver was <span className="text-slate-800 font-black underline decoration-indigo-300 underline-offset-4">{topCategory}</span>, while <span className="text-slate-800 font-black underline decoration-indigo-300 underline-offset-4">{topMerchant}</span>
                            remains your most frequented vendor. Your net surplus stands at <span className={cn("font-black", totals.net >= 0 ? "text-emerald-600" : "text-rose-600")}>PKR {totals.net.toLocaleString()}</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <Stat
                    title="Revenue Inflow"
                    amount={totals.income}
                    icon={ArrowUpRight}
                    colorClass="emerald"
                    trendLabel="Gross Monthly Income"
                />
                <Stat
                    title="Economic Outflow"
                    amount={totals.expense}
                    icon={ArrowDownRight}
                    colorClass="rose"
                    trendLabel="System Liquidity Drain"
                />
                <Stat
                    title="Net Liquidity"
                    amount={totals.net}
                    icon={TrendingUp}
                    colorClass="blue"
                    trendLabel="Operational Surplus"
                />
                <Stat
                    title="Audit Count"
                    amount={topTransactions.length}
                    icon={Sparkles}
                    colorClass="amber"
                    trendLabel="Total Items Scanned"
                    isCurrency={false}
                />
            </div>


            {/* Categorical & Vendor Split */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <BreakdownCard
                    title="Sectoral Distribution"
                    data={byCategory}
                    type="category"
                    accentColor="bg-blue-500"
                />
                <BreakdownCard
                    title="Vendor Analysis"
                    data={byMerchant}
                    type="merchant"
                    accentColor="bg-amber-500"
                />
            </div>

        </div>
    );
}

function BreakdownCard({ title, data, type, accentColor }) {
    const total = data.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="dashboard-card overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-[#fcfdfe]">
                <div className="flex items-center gap-4">
                    <div className={cn("w-1.5 h-6 rounded-full", accentColor)} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-200 text-slate-400 font-black">{data.length} Nodes</Badge>
                </div>
            </div>

            <div className="p-8 space-y-6">
                {data.length > 0 ? data.sort((a, b) => b.amount - a.amount).slice(0, 8).map((item, i) => {
                    const percentage = ((item.amount / (total || 1)) * 100).toFixed(0);
                    const label = type === 'category' ? item.categoryName : item.merchantName;

                    return (
                        <div key={i} className="group cursor-default">
                            <div className="flex justify-between items-end mb-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{type} NODE</span>
                                    <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{label || 'Unassigned'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block opacity-50">{percentage}% SHARE</span>
                                    <span className="text-base font-black text-slate-900 tracking-tighter">
                                        <span className="text-[10px] mr-1">PKR</span>
                                        {item.amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden border border-slate-100/50">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn("h-full rounded-full shadow-sm", accentColor)}
                                />
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                            <PieChart size={32} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No data records found for this sector</p>
                    </div>
                )}
            </div>

            {/* View More Button */}
            {data.length > 8 && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <button className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors">Expand Intelligence Report</button>
                </div>
            )}
        </div>
    );
}

