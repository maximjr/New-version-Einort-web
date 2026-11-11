import { cn } from "../../lib/utils";
import React from "react";
import { motion, HTMLMotionProps } from "motion/react";

export interface ButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "ref" | "children"
> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-primary text-white shadow-[0_0_20px_-5px_rgba(10,102,194,0.4)] hover:shadow-[0_0_30px_-5px_rgba(10,102,194,0.6)] border border-primary/50",
      secondary:
        "bg-surface text-white border border-white/10 hover:border-white/20 hover:bg-white/5",
      outline:
        "border border-white/10 bg-transparent text-white hover:bg-white/5 hover:border-white/20",
      ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-sm font-medium",
      lg: "px-8 py-4 text-base font-semibold",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.96, opacity: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
        className={cn(
          "inline-flex items-center justify-center rounded-[12px] transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center">
          {children}
        </span>
        {variant === "primary" && (
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
        )}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
