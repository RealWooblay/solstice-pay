import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  if (variant === "gradient") {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/50 to-indigo-400/50 p-[1px] pointer-events-none" />
        <div className="relative rounded-2xl bg-card p-5">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-2xl bg-card shadow-lg border border-white/10", className)}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-[1px] pointer-events-none" />
      <div className="relative rounded-2xl bg-card p-5">
        {children}
      </div>
    </div>
  );
}
