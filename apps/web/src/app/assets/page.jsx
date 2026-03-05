"use client";

import {
    Building2, Plus, ChevronRight, Loader2, Info, Landmark,
    CreditCard, Coins, Receipt, ArrowUpRight, ArrowDownLeft,
    Activity, ShieldCheck, Wallet, History as HistoryIcon
} from "lucide-react";
import { Button, Input, Label, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAssets, createAsset } from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { useDateRange } from "@/hooks/useDateRange";
import { useState } from "react";

export default function AssetsPage() {
    const queryClient = useQueryClient();
    const { from, to, setFrom, setTo, updateRange, isUpdating: isUpdatingRange } = useDateRange();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data: assets = [], isLoading } = useQuery({
        queryKey: ['assets'],
        queryFn: fetchAssets
    });

    const mutation = useMutation({
        mutationFn: createAsset,
        onSuccess: () => {
            queryClient.invalidateQueries(['assets']);
            setIsAddModalOpen(false);
        }
    });

    const getIcon = (type) => {
        if (type === 'BANK') return <Landmark size={28} />;
        if (type === 'CARD') return <CreditCard size={28} />;
        if (type === 'CASH') return <Coins size={28} />;
        return <Building2 size={28} />;
    };

    if (isLoading && !assets.length) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-[1.5rem] border-4 border-slate-100 border-t-slate-900 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-slate-900">
                        <Building2 size={24} />
                    </div>
                </div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Loading accounts...</p>
            </div>
        );
    }

    const totalPortfolio = assets.reduce((acc, a) => acc + Number(a.balance || 0), 0);

    return (
        <div className="flex flex-col min-h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar
                title="Accounts"
                fromDate={from}
                toDate={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onUpdate={updateRange}
                isUpdating={isUpdatingRange}
            />

            <div className="p-6 lg:p-8 space-y-8 pb-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 px-1">Financial Assets</h3>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Accounts</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="h-12 px-8 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-950/20 hover:translate-y-[-2px] active:scale-95 transition-all border-none text-xs"
                        >
                            <Plus size={18} className="mr-2" /> Add Account
                        </Button>
                    </div>
                </div>

                {/* Total Balance Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-950 p-10 rounded-3xl relative overflow-hidden group shadow-3xl shadow-slate-950/30"
                >
                    <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Portfolio</div>
                                <ShieldCheck size={14} className="text-emerald-400" />
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter leading-none">
                                <span className="text-xl text-slate-500 mr-2">PKR</span>
                                {totalPortfolio.toLocaleString()}
                            </h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-8 flex items-center gap-3">
                                <Activity size={14} className="text-emerald-500" />
                                System Healthy
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1 max-w-md">
                            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl group/card hover:bg-white/10 transition-all">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Total Accounts</p>
                                <div className="text-2xl font-black text-white tracking-tighter">{assets.length}</div>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl group/card hover:bg-white/10 transition-all">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Risk Level</p>
                                <div className="text-2xl font-black text-emerald-400 tracking-tighter">LOW</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Asset Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assets.map((asset, i) => (
                        <motion.div
                            key={asset.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white border border-slate-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer"
                        >
                            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-slate-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

                            <div className="flex items-start justify-between relative z-10 mb-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                    {getIcon(asset.type)}
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Balance</p>
                                    <p className="text-[20px] font-black text-slate-900 tracking-tighter">
                                        <span className="text-[9px] text-slate-300 mr-1 uppercase font-black font-sans">PKR</span>
                                        {Number(asset.balance || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight leading-none mb-3 group-hover:text-primary transition-colors">{asset.name}</h3>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-lg">TYPE: {asset.type}</Badge>
                                    {asset.allowNegative && <Badge className="bg-rose-50 text-rose-500 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-lg">CREDIT</Badge>}
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between text-slate-300 group-hover:text-slate-950 transition-colors">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <HistoryIcon size={12} /> View transaction history
                                </span>
                                <ChevronRight size={18} />
                            </div>
                        </motion.div>
                    ))}

                    {assets.length === 0 && (
                        <div className="col-span-full py-40 text-center border-4 border-dashed border-slate-50 rounded-[4rem]">
                            <Building2 className="mx-auto text-slate-100 mb-8 grayscale" size={80} />
                            <p className="text-slate-400 font-black text-sm uppercase tracking-[0.5em]">No accounts found</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative bg-white border border-slate-100 rounded-[4rem] w-full max-w-lg shadow-3xl p-12 overflow-hidden group/modal"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 grayscale group-hover:opacity-10 transition-all duration-1000 -rotate-12 translate-x-4">
                                <Building2 size={160} className="text-slate-900" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 flex items-center justify-center text-white shadow-2xl shadow-slate-950/20">
                                        <Plus size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Add Account</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-0.5">Create a new bank or cash account</p>
                                    </div>
                                </div>

                                <form className="space-y-10" onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    mutation.mutate({
                                        name: formData.get("name"),
                                        type: formData.get("type"),
                                        allowNegative: formData.get("allowNegative") === "on"
                                    });
                                }}>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Account Name</Label>
                                        <Input name="name" required placeholder="e.g. Bank Alfalah" className="h-16 pl-8 text-xl font-black bg-slate-50 border-none rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none" />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Account Type</Label>
                                        <select name="type" className="w-full h-16 bg-slate-50 rounded-[1.5rem] px-8 font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none cursor-pointer">
                                            <option value="BANK">Bank Account</option>
                                            <option value="CASH">Cash</option>
                                            <option value="CARD">Credit Card</option>
                                            <option value="WALLET">Digital Wallet</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                                        <input type="checkbox" name="allowNegative" id="allowNegative" className="w-8 h-8 rounded-xl text-slate-950 border-slate-200 focus:ring-slate-900 focus:ring-offset-0 transition-all cursor-pointer" />
                                        <div className="flex-1">
                                            <label htmlFor="allowNegative" className="text-xs font-black text-slate-900 uppercase tracking-tight block">Allow Overdraft / Negative Balance</label>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">This account can go below zero (e.g. Credit Card)</p>
                                        </div>
                                        <Info size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="button" variant="ghost" className="flex-1 h-16 rounded-[1.5rem] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-all" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={mutation.isPending} className="flex-1 h-16 rounded-[1.5rem] bg-slate-950 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-950/20 active:scale-95 transition-all">
                                            {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Add Account'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="mt-auto px-10 py-6 border-t border-slate-50 bg-[#FBFDFF] text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Account Management - Secure System</p>
            </div>
        </div>
    );
}
