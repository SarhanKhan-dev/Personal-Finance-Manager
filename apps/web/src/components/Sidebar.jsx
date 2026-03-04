"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    LayoutDashboard,
    Receipt,
    Wallet,
    Users,
    HandCoins,
    Settings,
    PlusCircle,
    TrendingDown,
    TrendingUp,
    CreditCard
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function Sidebar({ onAddTransaction }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/" },
        { name: "Transactions", icon: Receipt, path: "/transactions" },
        { name: "Accounts", icon: Wallet, path: "/accounts" },
        { name: "Debt Dashboard", icon: HandCoins, path: "/debt" },
        { name: "Persons", icon: Users, path: "/persons" },
        { name: "Reports", icon: BarChart3, path: "/reports" },
    ];

    return (
        <aside className="w-64 bg-bg-900 border-r border-bg-800 flex flex-col h-screen shrink-0 relative z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
                    <TrendingUp className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight">Finance App</span>
            </div>

            <div className="px-4 py-2">
                <button
                    onClick={onAddTransaction}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-glow-sm"
                >
                    <PlusCircle size={18} />
                    <span>Add Transaction</span>
                </button>
            </div>

            <nav className="flex-1 px-3 mt-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-bg-800 text-white shadow-soft shadow-black/50"
                                    : "text-gray-400 hover:bg-bg-800 hover:text-gray-200"
                            )}
                        >
                            <item.icon
                                size={18}
                                className={cn(
                                    isActive ? "text-accent-500" : "text-gray-500 group-hover:text-accent-400"
                                )}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto p-4 border-t border-bg-800 bg-bg-950/50 backdrop-blur-sm">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                        pathname === "/settings" ? "bg-bg-800 text-white" : "text-gray-400 hover:bg-bg-800 hover:text-gray-200"
                    )}
                >
                    <Settings size={18} className="text-gray-500 group-hover:text-gray-300" />
                    Settings
                </Link>
                <div className="mt-4 px-4 py-2">
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Storage</p>
                    <p className="text-[11px] text-accent-500 font-semibold mt-1">Cloud Sync Active</p>
                </div>
            </div>
        </aside>
    );
}
