"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Link as LinkIcon, Users, User, Home, Wallet, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/link", icon: LinkIcon, label: "Link & Profile" },
  { href: "/team", icon: Users, label: "Team" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar - Simplified like PayPal */}
      <div className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card/50 backdrop-blur-md border-r border-border/50">
        <div className="p-4">
          {/* Quick Actions - Smaller and more functional */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center space-x-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
              >
                <Send className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Send Payment</span>
              </Link>
              
              <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 transition-colors">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">View Balance</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 transition-colors">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Transaction History</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h3>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
