"use client";

import React from "react";
import { Button } from "./ui";
import { Loader2, RefreshCw, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export const TopBar = ({
    title,
    fromDate,
    toDate,
    onFromChange,
    onToChange,
    onUpdate,
    isUpdating
}) => {
    return (
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 bg-white/50 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                    <span>Main Console</span>
                    <ChevronRight size={10} />
                    <span className="text-slate-400">Personal Ledger</span>
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">{title}</h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-4"
            >
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors group">
                        <Calendar size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                        <div className="flex flex-col">
                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Start Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => onFromChange(e.target.value)}
                                className="bg-transparent text-xs font-black text-slate-900 outline-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-100 mx-1" />

                    <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors group">
                        <Calendar size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                        <div className="flex flex-col">
                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">End Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => onToChange(e.target.value)}
                                className="bg-transparent text-xs font-black text-slate-900 outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <Button
                    onClick={onUpdate}
                    disabled={isUpdating}
                    className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all border-none"
                >
                    {isUpdating ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    )}
                    Synchronize
                </Button>
            </motion.div>
        </header>
    );
};

