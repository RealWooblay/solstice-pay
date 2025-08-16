"use client"

import { Home, Link as LinkIcon, Users, Send } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Send, label: "Send", mobileIcon: Send },
  { href: "/link", icon: LinkIcon, label: "Get Paid", mobileIcon: LinkIcon },
  { href: "/team", icon: Users, label: "Team", mobileIcon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-border/50">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.mobileIcon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 px-3 py-2 transition-all duration-200 relative",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="h-6 w-6" />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
                
                {/* Active background pill */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20 -z-10" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
