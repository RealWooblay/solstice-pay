"use client"

import { Search, Wallet, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";

export function Topbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold gradient-text">AliasPay</h1>
          <div className="h-4 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Search - hidden on mobile */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          {/* Wallet button */}
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Wallet className="h-4 w-4 mr-2" />
            Connect
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
