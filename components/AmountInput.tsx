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
            "pl-32 text-left font-mono text-lg",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          disabled={disabled}
        />

        {/* PYUSD token chip and MAX button - positioned on the left */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-blue-500">PYUSD</span>
          </div>
          <Button
            onClick={onMax}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            disabled={disabled}
          >
            MAX
          </Button>
        </div>
      </div>

      {/* Balance and error */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          Available: <span className="font-mono">{balance} PYUSD</span>
        </span>
        {error && (
          <span className="text-red-500 text-xs">{error}</span>
        )}
      </div>
    </div>
  );
}
