"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const SidebarNav = ({ items }) => {
    const pathname = usePathname();

    return (
        <nav className="space-y-3 py-4">
            {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="block group px-2"
                    >
                        <div className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500 relative overflow-hidden",
                            isActive
                                ? "bg-slate-900 shadow-2xl shadow-slate-900/10 scale-[1.02]"
                                : "hover:bg-slate-50"
                        )}>
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-glow"
                                    className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                />
                            )}

                            <div className={cn(
                                "relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-slate-400 group-hover:text-slate-950 group-hover:bg-white shadow-sm"
                            )}>
                                <item.icon size={16} className={cn("transition-transform duration-500", !isActive && "group-hover:scale-110")} />
                            </div>

                            <span className={cn(
                                "relative z-10 font-black text-[9px] uppercase tracking-[0.2em] transition-colors duration-500",
                                isActive ? "text-white" : "text-slate-500 group-hover:text-slate-950"
                            )}>
                                {item.name}
                            </span>

                            {!isActive && (
                                <ChevronRight
                                    size={12}
                                    className="ml-auto text-slate-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                                />
                            )}
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
};

import { ChevronRight } from "lucide-react";
