"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X, Bell, User, Cpu, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AppShell({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex bg-[#FBFDFF] min-h-screen w-full relative font-inter">
            {/* Desktop Sidebar Matrix */}
            <div className="hidden lg:flex sticky top-0 h-screen shadow-2xl relative z-40">
                <Sidebar />
            </div>

            {/* Mobile Navigation Interface */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[100] lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[101] lg:hidden shadow-[30px_0_60px_-15px_rgba(0,0,0,0.3)] border-r border-slate-100"
                        >
                            <div className="absolute top-8 right-[-5rem] lg:hidden">
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-14 h-14 bg-white rounded-[1.25rem] text-slate-950 flex items-center justify-center shadow-2xl shadow-slate-950/20 active:scale-90 transition-all border border-slate-100/50"
                                >
                                    <X size={28} />
                                </motion.button>
                            </div>
                            <Sidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Core Operational Layer */}
            <main className="flex-1 flex flex-col min-h-screen w-full relative bg-[#FBFDFF]">
                {/* Visual Status Indicator (Mobile Only) */}
                <div className="lg:hidden h-24 px-8 flex items-center justify-between sticky top-0 z-30 bg-white border-b border-slate-50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-slate-900/10 to-transparent" />

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="w-14 h-14 bg-slate-950 text-white rounded-[1.25rem] shadow-2xl shadow-slate-950/30 active:scale-95 transition-all flex items-center justify-center group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <Menu size={24} className="relative z-10" />
                        </button>
                        <h1 className="font-black text-xl tracking-tighter text-slate-950 uppercase leading-none">Personal <span className="text-slate-200">Finance</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-4">
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                ONLINE
                            </span>
                        </div>
                        <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white transition-all shadow-sm">
                            <Bell size={20} />
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xs shadow-xl shadow-slate-950/20">
                            JD
                        </div>
                    </div>
                </div>

                {/* Scoped Content Relay */}
                <div className="flex-1 w-full relative scroll-smooth bg-[#FBFDFF]">
                    {children}
                </div>
            </main>
        </div>
    );
}
