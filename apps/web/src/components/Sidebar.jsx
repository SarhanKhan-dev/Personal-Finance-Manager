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
    ChevronRight
} from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { motion } from "framer-motion";

const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: History },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Debts", href: "/debts", icon: Wallet },
    { name: "Categories", href: "/categories", icon: Tags },
    { name: "Merchants", href: "/merchants", icon: Store },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    return (
        <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col h-full shrink-0 relative z-20 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
            {/* Brand area */}
            <div className="p-8 pb-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 mb-3"
                >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-tighter text-slate-900 leading-none">FINANCE</h1>
                        <div className="h-1 w-6 bg-primary rounded-full mt-1" />
                    </div>
                </motion.div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pl-1">Executive System v1.0</p>
            </div>

            <div className="flex-1 px-4">
                <SidebarNav items={menuItems} />
            </div>

            {/* Logout button at bottom */}
            <div className="p-6 mt-auto">
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Premium Analytics</span>
                        <ChevronRight size={14} className="text-slate-300" />
                    </div>
                </div>

                <button className="flex items-center gap-3 w-full px-4 py-4 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 text-slate-400 font-bold text-xs uppercase tracking-widest group border border-transparent hover:border-rose-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 group-hover:bg-rose-100 transition-colors">
                        <LogOut size={16} className="text-slate-400 group-hover:text-rose-600" />
                    </div>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

