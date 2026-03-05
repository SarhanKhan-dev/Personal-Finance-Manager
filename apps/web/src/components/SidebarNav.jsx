"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const SidebarNav = ({ items }) => {
    const pathname = usePathname();

    return (
        <nav className="space-y-2">
            {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="block group"
                    >
                        <div className={cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                            isActive
                                ? "bg-slate-900 shadow-xl shadow-slate-900/10"
                                : "hover:bg-slate-50"
                        )}>
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-primary"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <div className={cn(
                                "relative z-10 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
                                isActive ? "bg-white/10 text-white" : "text-slate-400 group-hover:text-slate-900 group-hover:bg-white shadow-sm"
                            )}>
                                <item.icon size={18} />
                            </div>

                            <span className={cn(
                                "relative z-10 font-bold text-xs uppercase tracking-[0.15em] transition-colors duration-300",
                                isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                            )}>
                                {item.name}
                            </span>
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
};

