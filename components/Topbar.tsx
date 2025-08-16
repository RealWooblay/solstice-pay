"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sun, Moon, X, User, Mail, Phone, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { resolveAlias } from "@/lib/mocks";

interface SearchResult {
  type: 'alias' | 'address';
  value: string;
  display: string;
  icon: React.ReactNode;
}

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        // Search for aliases
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
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold gradient-text">AliasPay</h1>
          <div className="h-4 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
          <span className="text-sm text-muted-foreground hidden md:block">Get paid in crypto, like a bank</span>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Find someone to pay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </form>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
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
            className="hover:bg-accent/50"
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
          className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md"
        >
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Find someone to pay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {result.icon}
                      <span className="text-sm font-medium">{result.display}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </motion.div>
      )}
    </header>
  );
}
