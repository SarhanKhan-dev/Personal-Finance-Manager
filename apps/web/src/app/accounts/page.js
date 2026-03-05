"use client";

import { Wallet, Landmark, CreditCard, Coins, Plus, ChevronRight, Loader2 } from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchAssets, fetchSources } from "@/lib/api";

export default function Accounts() {
    const { data: assets = [], isLoading: loadingAssets } = useQuery({
        queryKey: ['assets'],
        queryFn: fetchAssets
    });

    const { data: sources = [], isLoading: loadingSources } = useQuery({
        queryKey: ['sources'],
        queryFn: fetchSources
    });

    const isLoading = loadingAssets || loadingSources;

    if (isLoading) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl border-4 border-slate-100 border-t-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                        <Landmark size={24} />
                    </div>
                </div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Loading accounts...</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in pb-32">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/5 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                        <Landmark size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none">Accounts</h1>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 ml-0.5">Manage your assets and funding sources</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 font-black text-[9px] text-slate-600 hover:bg-slate-50 uppercase tracking-widest">
                        History
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20 border-none text-[9px] uppercase tracking-widest">
                        <Plus size={16} className="mr-2" /> Add New
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">

                {/* Assets Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                            <div className="w-1 h-4 bg-blue-500 rounded-full" />
                            Your Assets
                        </h2>
                        <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold">{assets.length} Accounts</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {assets.map(asset => (
                            <AccountCard
                                key={asset.id}
                                name={asset.name}
                                balance={asset.balance}
                                type={asset.type}
                                theme="blue"
                            />
                        ))}
                    </div>
                    {assets.length === 0 && (
                        <div className="p-12 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No assets found</p>
                        </div>
                    )}
                </div>

                {/* Sources Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                            Funding Sources
                        </h2>
                        <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold">{sources.length} Sources</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {sources.map(source => (
                            <AccountCard
                                key={source.id}
                                name={source.name}
                                balance={source.balance}
                                type={source.type}
                                theme="emerald"
                            />
                        ))}
                    </div>
                    {sources.length === 0 && (
                        <div className="p-12 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No funding sources found</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function AccountCard({ name, balance, type, theme }) {
    const isBlue = theme === 'blue';
    const Icon = type === 'BANK' ? Landmark : (type === 'CARD' ? CreditCard : (type === 'CASH' ? Coins : Wallet));

    return (
        <div className="dashboard-card group hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden p-6 bg-white border border-slate-100">
            <div className="flex items-start justify-between">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                    isBlue ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                        "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                )}>
                    <Icon size={18} />
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                    <p className="text-lg font-black text-slate-800 tracking-tighter">
                        <span className="text-[9px] text-slate-400 mr-1 uppercase font-black font-sans">PKR</span>
                        {balance.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div>
                    <h3 className="font-black text-slate-800 text-base uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-none">{name}</h3>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{type}</p>
                </div>
                <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                    isBlue ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                )}>
                    <ChevronRight size={14} />
                </div>
            </div>

            {/* Accent Line */}
            <div className={cn(
                "absolute bottom-0 left-0 w-full h-[3px] opacity-0 group-hover:opacity-100 transition-opacity",
                isBlue ? "bg-blue-600" : "bg-emerald-600"
            )} />
        </div>
    );
}
