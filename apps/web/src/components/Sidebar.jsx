"use client";

import React from "react";
import {
    LayoutDashboard,
    History,
    BarChart3,
    Wallet,
    Tags,
    Store,
    Settings,
    LogOut,
    TrendingUp,
    ChevronRight,
    Users,
    Briefcase,
    Building2,
    ShieldCheck,
    Cpu
} from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { motion } from "framer-motion";

const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: History },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Debts & Loans", href: "/debts", icon: Wallet },
    { name: "People", href: "/people", icon: Users },
    { name: "Owners", href: "/owners", icon: Briefcase },
    { name: "Assets", href: "/assets", icon: Building2 },
    { name: "Categories", href: "/categories", icon: Tags },
    { name: "Merchants", href: "/merchants", icon: Store },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    return (
        <aside className="w-[260px] bg-white border-r border-slate-100 flex flex-col h-full shrink-0 relative z-20 shadow-[2px_0_30px_rgba(0,0,0,0.02)] transition-all">
            {/* Brand Matrix */}
            <div className="p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4 mb-4"
                >
                    <div className="w-11 h-11 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-2xl shadow-slate-950/20 relative overflow-hidden group/logo">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/logo:translate-x-[100%] transition-transform duration-1000" />
                        <TrendingUp size={22} className="relative z-10" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-tighter text-slate-950 uppercase leading-none">Personal Finance</h1>
                    </div>
                </motion.div>
                <div className="flex items-center gap-2 mt-4 px-1">
                    <Badge className="bg-slate-950 text-white border-none text-[7px] font-black uppercase tracking-[0.3em] px-2 py-0.5">CORE_v2.1</Badge>
                    <div className="h-0.5 flex-1 bg-slate-50" />
                </div>
            </div>

            <div className="flex-1 px-4 overflow-y-auto CustomScrollbar">
                <SidebarNav items={menuItems} />
            </div>

            {/* Operational Status */}
            <div className="p-6 mt-auto space-y-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group cursor-pointer transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Integrity</p>
                        <ShieldCheck size={12} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-900 tracking-tight uppercase">Premium Tier node</span>
                        <ChevronRight size={12} className="text-slate-200 group-hover:text-slate-950 transition-colors" />
                    </div>
                </motion.div>

                <button className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all duration-500 text-slate-400 font-black text-[9px] uppercase tracking-[0.3em] group border border-transparent hover:border-rose-100">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 group-hover:bg-rose-100 transition-all duration-500">
                        <LogOut size={16} className="text-slate-400 group-hover:text-rose-600 transition-transform group-hover:rotate-12" />
                    </div>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

import { Badge } from "./ui";
