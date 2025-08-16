"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Link as LinkIcon, Users, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/link", icon: LinkIcon, label: "Link" },
  { href: "/team", icon: Users, label: "Team" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card/50 backdrop-blur-md border-r border-border/50">
        <div className="p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-muted-foreground mb-6">Navigation</h2>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
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
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-medium hover:from-primary/90 hover:to-primary/70 transition-all duration-200">
                <Send className="h-4 w-4" />
                <span>Send Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
