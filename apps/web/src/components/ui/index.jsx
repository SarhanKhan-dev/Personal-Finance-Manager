import React from 'react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Button Component
export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group active:scale-95";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-6",
    ghost: "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
  };

  const sizes = {
    default: "h-11 px-6 py-2 text-sm",
    sm: "h-8 rounded-lg px-3 text-xs",
    lg: "h-14 rounded-2xl px-10 text-base tracking-wide",
    icon: "h-11 w-11",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
});
Button.displayName = "Button";

// Card Component
export const Card = ({ className, children, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={cn("dashboard-card", className)}
    {...props}
  >
    {children}
  </motion.div>
);

// Badge Component
export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 border border-slate-200",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    danger: "bg-rose-50 text-rose-600 border border-rose-100",
    accent: "bg-blue-50 text-blue-600 border border-blue-100",
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest", variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

// Input Component
export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Label Component
export const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2.5 px-1", className)}
      {...props}
    />
  );
});
Label.displayName = "Label";

// Selected Card Component
export const SelectCard = ({ selected, icon: Icon, title, description, onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group",
      selected
        ? "bg-blue-50 border-blue-200 shadow-md"
        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50",
      className
    )}
  >
    {Icon && (
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm",
        selected ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
      )}>
        <Icon size={22} />
      </div>
    )}
    <div>
      <h4 className={cn("text-sm font-black tracking-wide transition-colors duration-300", selected ? "text-blue-900" : "text-slate-500 group-hover:text-slate-900")}>{title}</h4>
      {description && <p className="text-xs text-slate-400 mt-1 font-medium">{description}</p>}
    </div>
  </button>
);

// Stat Component
export const Stat = ({ title, amount, icon: Icon, trend, trendLabel, colorClass = "accent" }) => {
  const themes = {
    accent: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: "bg-blue-600 text-white" },
    emerald: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: "bg-emerald-600 text-white" },
    rose: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: "bg-rose-600 text-white" },
  };

  const theme = themes[colorClass] || themes.accent;

  return (
    <Card className={cn("p-8 group shadow-sm hover:shadow-xl")}>
      <div className="flex justify-between items-start mb-8 relative">
        {Icon && (
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", theme.icon)}>
            <Icon size={26} />
          </div>
        )}

        {trend !== undefined && (
          <Badge variant={trend > 0 ? 'success' : 'danger'} className={cn(!Icon && "ml-auto")}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Badge>
        )}
      </div>

      <div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">{title}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-slate-400 uppercase">PKR</span>
          <h3 className="text-4xl font-black tracking-tighter text-slate-900">
            {amount.toLocaleString()}
          </h3>
        </div>
        {trendLabel && <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">{trendLabel}</p>}
      </div>
    </Card>
  );
};

