import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const DataPanel = ({ title, badge, children, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("dashboard-card overflow-hidden flex flex-col h-full", className)}
        >
            <div className="p-8 pb-4 flex justify-between items-center bg-white">
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
                    <div className="h-1 w-8 bg-primary rounded-full mt-1.5" />
                </div>
                {badge && (
                    <span className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {badge}
                    </span>
                )}
            </div>
            <div className="flex-1 px-2">
                {children}
            </div>
        </motion.div>
    );
};

