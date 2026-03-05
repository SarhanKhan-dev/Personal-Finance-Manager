import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const KpiCard = ({ title, primaryValue, primaryLabel, secondaryValue, secondaryLabel, tint = "blue", icon }) => {
    const themes = {
        blue: {
            bg: "bg-blue-50/20",
            border: "border-blue-100/50",
            text: "text-blue-600",
            dot: "bg-blue-500",
            light: "bg-blue-100/50"
        },
        yellow: {
            bg: "bg-amber-50/20",
            border: "border-amber-100/50",
            text: "text-amber-600",
            dot: "bg-amber-500",
            light: "bg-amber-100/50"
        },
        emerald: {
            bg: "bg-emerald-50/20",
            border: "border-emerald-100/50",
            text: "text-emerald-600",
            dot: "bg-emerald-500",
            light: "bg-emerald-100/50"
        },
        rose: {
            bg: "bg-rose-50/20",
            border: "border-rose-100/50",
            text: "text-rose-600",
            dot: "bg-rose-500",
            light: "bg-rose-100/50"
        },
        purple: {
            bg: "bg-violet-50/20",
            border: "border-violet-100/50",
            text: "text-violet-600",
            dot: "bg-violet-500",
            light: "bg-violet-100/50"
        },
    };

    const theme = themes[tint] || themes.blue;

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className={cn("bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[220px] group transition-all duration-300 relative overflow-hidden shadow-xl shadow-slate-200/50", theme.bg)}
        >
            <div className="absolute top-8 right-8">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", theme.light, theme.text)}>
                    {icon || <div className={cn("w-2 h-2 rounded-full", theme.dot)} />}
                </div>
            </div>

            <div className="relative z-10">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                    <span className={cn("w-1 h-3 rounded-full", theme.dot)} />
                    {title}
                </h4>
                <div className="flex flex-col gap-1">
                    <h3 className="text-4xl font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors duration-500">
                        {typeof primaryValue === 'number' ? `$${primaryValue.toLocaleString()}` : primaryValue}
                    </h3>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{primaryLabel}</span>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                        {secondaryLabel}
                    </span>
                    <span className={cn("text-sm font-black tracking-tighter", theme.text)}>
                        {secondaryValue}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
