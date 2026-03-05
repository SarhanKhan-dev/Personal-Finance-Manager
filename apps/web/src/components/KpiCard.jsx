import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const KpiCard = ({ title, primaryValue, primaryLabel, secondaryValue, secondaryLabel, tint = "blue" }) => {
    const themes = {
        blue: {
            bg: "bg-blue-50/50",
            border: "border-blue-100",
            text: "text-blue-600",
            dot: "bg-blue-500",
            light: "bg-blue-50"
        },
        yellow: {
            bg: "bg-amber-50/50",
            border: "border-amber-100",
            text: "text-amber-600",
            dot: "bg-amber-500",
            light: "bg-amber-50"
        },
        purple: {
            bg: "bg-violet-50/50",
            border: "border-violet-100",
            text: "text-violet-600",
            dot: "bg-violet-500",
            light: "bg-violet-50"
        },
        green: {
            bg: "bg-emerald-50/50",
            border: "border-emerald-100",
            text: "text-emerald-600",
            dot: "bg-emerald-500",
            light: "bg-emerald-50"
        },
    };

    const theme = themes[tint] || themes.blue;

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className={cn("dashboard-card p-8 flex flex-col justify-between min-h-[180px] group transition-all duration-300 relative overflow-hidden", theme.bg, theme.border)}
        >
            <div className="absolute top-0 right-0 p-8">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", theme.dot)} />
            </div>

            <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <span className={cn("w-1 h-3 rounded-full", theme.dot)} />
                    {title}
                </h4>
                <div className="flex flex-col gap-1">
                    <h3 className="text-4xl font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors duration-500">
                        {primaryValue}
                    </h3>
                    {primaryLabel && (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{primaryLabel}</span>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/50 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                        {secondaryLabel}
                    </span>
                    <span className={cn("text-sm font-black tracking-tighter", theme.text)}>
                        {secondaryValue}
                    </span>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0", theme.light)}>
                    <div className={cn("w-5 h-1 rounded-full", theme.dot)} />
                </div>
            </div>
        </motion.div>
    );
};

