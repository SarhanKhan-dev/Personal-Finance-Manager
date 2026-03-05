"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AppShell({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex bg-slate-50 min-h-screen w-full relative font-inter">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex sticky top-0 h-screen">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[101] lg:hidden shadow-2xl"
                        >
                            <div className="absolute top-6 right-6 lg:hidden">
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-500 active:scale-90 transition-all shadow-sm border border-slate-100">
                                    <X size={20} />
                                </button>
                            </div>
                            <Sidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen w-full relative overflow-hidden bg-[#FBFDFF]">
                {/* Mobile Header / Top Header Bar */}
                <div className="lg:hidden h-20 px-6 flex items-center justify-between sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all">
                            <Menu size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Bell size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                            JD
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto w-full h-full relative scroll-smooth CustomScrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}

