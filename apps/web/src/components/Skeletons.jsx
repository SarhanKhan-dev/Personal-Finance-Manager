import React from "react";
import { cn } from "@/lib/utils";

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-xl bg-slate-200", className)}
            {...props}
        />
    );
};

export const KpiSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 h-[160px] flex flex-col justify-between shadow-premium">
                <div>
                    <Skeleton className="h-3 w-24 mb-4" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between">
                    <Skeleton className="h-2 w-16" />
                    <Skeleton className="h-2 w-12" />
                </div>
            </div>
        ))}
    </div>
);

export const TableSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden h-full shadow-premium">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </div>
    </div>
);
