"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TransactionModal from "@/components/TransactionModal";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-bg-950 text-white min-h-screen flex`}>
        <Sidebar onAddTransaction={() => setIsModalOpen(true)} />
        <main className="flex-1 flex flex-col relative overflow-hidden h-screen">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            {children}
          </div>
        </main>
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => window.location.reload()} // Simple refresh for now
        />
      </body>
    </html>
  );
}
