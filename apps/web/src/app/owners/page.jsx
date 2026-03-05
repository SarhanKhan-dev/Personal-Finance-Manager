"use client";

import { Briefcase, Plus, ChevronRight, Loader2, Info, Building2, UserCircle, PieChart } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOwners, createOwner } from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { useDateRange } from "@/hooks/useDateRange";
import { useState } from "react";

export default function OwnersPage() {
    const queryClient = useQueryClient();
    const { from, to, setFrom, setTo, updateRange, isUpdating: isUpdatingRange } = useDateRange();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data: owners = [], isLoading } = useQuery({
        queryKey: ['owners'],
        queryFn: fetchOwners
    });

    const mutation = useMutation({
        mutationFn: createOwner,
        onSuccess: () => {
            queryClient.invalidateQueries(['owners']);
            setIsAddModalOpen(false);
        }
    });

    if (isLoading && !owners.length) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-slate-950" size={32} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading owners...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar
                title="Owners"
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
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 px-1">Manage financial entities</h3>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Account Owners</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="h-12 px-8 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-950/20 hover:translate-y-[-2px] active:scale-95 transition-all border-none text-[10px]"
                        >
                            <Plus size={16} className="mr-2" /> Add Owner
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {owners.map((owner, i) => (
                        <motion.div
                            key={owner.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white border border-slate-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer"
                        >
                            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-slate-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

                            <div className="flex items-start justify-between relative z-10 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">
                                    <UserCircle size={22} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Total Balance</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">
                                        <span className="text-[9px] text-slate-300 mr-1 uppercase font-black">PKR</span>
                                        {owner.balance?.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight leading-none mb-2">{owner.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 bg-slate-50 rounded text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">{owner.type}</span>
                                    {owner.allowNegative && <span className="px-2.5 py-1 bg-rose-50 text-rose-500 rounded text-[8px] font-black uppercase tracking-widest border border-rose-100">Overdraft</span>}
                                </div>
                            </div>

                            <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between text-slate-300 group-hover:text-slate-950 transition-colors">
                                <span className="text-[8px] font-black uppercase tracking-widest">Status: ACTIVE</span>
                                <ChevronRight size={14} />
                            </div>
                        </motion.div>
                    ))}

                    {owners.length === 0 && (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                            <PieChart className="mx-auto text-slate-100 mb-6" size={48} />
                            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">No owners found</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-10 overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-xl shadow-slate-950/20">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Add Owner</h2>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">New accounting entity</p>
                                </div>
                            </div>

                            <form className="space-y-8" onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                mutation.mutate({
                                    name: formData.get("name"),
                                    type: formData.get("type"),
                                    allowNegative: formData.get("allowNegative") === "on"
                                });
                            }}>
                                <div className="space-y-3">
                                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</Label>
                                    <Input name="name" required placeholder="e.g. Personal, Business" className="h-14 pl-6 text-lg font-bold bg-slate-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none" />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</Label>
                                    <select name="type" className="w-full h-14 bg-slate-50 rounded-xl px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-sm appearance-none cursor-pointer">
                                        <option value="OWNED">Personal</option>
                                        <option value="SAVINGS">Savings</option>
                                        <option value="LOAN_RECEIVABLE">Loan (Receivable)</option>
                                        <option value="LOAN_PAYABLE">Loan (Payable)</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100 group">
                                    <input type="checkbox" name="allowNegative" id="allowNegative" className="w-5 h-5 rounded text-slate-950 border-slate-200 focus:ring-slate-900 focus:ring-offset-0 cursor-pointer" />
                                    <div className="flex-1">
                                        <label htmlFor="allowNegative" className="text-[11px] font-black text-slate-950 uppercase tracking-tight block cursor-pointer">Allow Negative</label>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Overdraft / Loan support</p>
                                    </div>
                                    <Info size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="ghost" className="flex-1 h-14 rounded-xl font-black text-slate-400 uppercase tracking-widest transition-all hover:bg-slate-50 text-[10px]" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={mutation.isPending} className="flex-1 h-14 rounded-xl bg-slate-950 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-950/20 active:scale-95 transition-all text-[10px]">
                                        {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Save Owner'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="mt-auto px-10 py-6 border-t border-slate-50 bg-[#FBFDFF] text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Owner Management - Secure System</p>
            </div>
        </div>
    );
}
