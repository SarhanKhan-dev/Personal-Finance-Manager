import React from "react";
import { cn } from "@/lib/utils";

export const MiniBar = ({ percentage, color = "bg-blue-600", className }) => {
    return (
        <div className={cn("w-full h-1.5 bg-slate-100 rounded-full overflow-hidden", className)}>
            <div
                className={cn("h-full transition-all duration-1000 ease-out", color)}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
        </div>
    );
};
