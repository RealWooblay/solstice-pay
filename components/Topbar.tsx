"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sun, Moon, X, User, Send, Link as LinkIcon, Users, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { resolveAlias } from "@/lib/mocks";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SearchResult {
  type: 'alias' | 'address';
  value: string;
  display: string;
  icon: React.ReactNode;
}

const navItems = [
  { href: "/", icon: Send, label: "Send" },
  { href: "/earn", icon: TrendingUp, label: "Earn" },
  { href: "/team", icon: Users, label: "Team" },
];

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        const aliasResult = await resolveAlias(searchQuery);
        const results: SearchResult[] = [];

        if (aliasResult) {
          results.push({
            type: 'alias',
            value: searchQuery,
            display: `${searchQuery} → ${aliasResult.address}`,
            icon: <User className="h-4 w-4" />
          });
        }

        setSearchResults(results);
        if (results.length > 0) {
          setIsSearchOpen(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'alias') {
      window.location.href = `/alias/${result.value}`;
    }
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold gradient-text">SolsticePay</h1>
          <div className="h-4 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">Get paid in crypto, like a bank</span>
        </div>

        {/* Center - Search and Navigation */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 items-center space-x-4">
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 relative",
                    isActive
                      ? "bg-blue-500/10 text-blue-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-blue-500" : "text-gray-500 dark:text-gray-400")} />
                  <span className="font-medium">{item.label}</span>
                  {item.label === "Team" && (
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium border border-blue-200 dark:border-blue-800">beta</span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Find someone to pay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </form>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Login trigger (you will wire the modal) */}
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            Login
          </Button>

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile search bar */}
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
        >
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Find someone to pay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12"
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {searchResults.map((result) => (
                  <Button
                    key={result.value}
                    variant="ghost"
                    className="w-full text-left p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    {result.icon}
                    <span className="ml-2">{result.display}</span>
                  </Button>
                ))}
              </div>
            )}
          </form>
        </motion.div>
      )}
    </header>
  );
}
