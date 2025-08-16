"use client"

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  balance: string;
  onMax: () => void;
  error?: string;
  disabled?: boolean;
}

export function AmountInput({ value, onChange, balance, onMax, error, disabled }: AmountInputProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className={cn(
            "pr-32 text-right font-mono text-lg",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          disabled={disabled}
        />
        
        {/* PYUSD token chip */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button
            onClick={onMax}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            disabled={disabled}
          >
            MAX
          </Button>
          <div className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-1">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-xs font-medium text-indigo-500">PYUSD</span>
          </div>
        </div>
      </div>
      
      {/* Balance and error */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Available: <span className="font-mono">{balance} PYUSD</span>
        </span>
        {error && (
          <span className="text-destructive text-xs">{error}</span>
        )}
      </div>
    </div>
  );
}
