import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ["latin"], variable: '--font-montserrat', weight: ['400', '700', '900'] });

export const metadata = {
    title: "CM ANALYTICS | Executive Dashboard",
    description: "Advanced Financial Analytics System",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
            <body className="bg-[#fcfdfe] text-slate-800 min-h-screen flex text-sm antialiased">
                <Providers>
                    <AppShell>
                        {children}
                    </AppShell>
                </Providers>
            </body>
        </html>
    );
}
