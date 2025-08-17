"use client"

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  balance: string;
  onMax: () => void;
  tokenSymbol?: string;
  error?: string;
  disabled?: boolean;
}

export function AmountInput({ value, onChange, balance, onMax, tokenSymbol = "PYUSD", error, disabled }: AmountInputProps) {
  const tokenChipRef = useRef<HTMLDivElement>(null);
  const [leftPadding, setLeftPadding] = useState(24);

  useEffect(() => {
    if (tokenChipRef.current) {
      const width = tokenChipRef.current.offsetWidth;
      // Add some extra padding (16px) for spacing
      setLeftPadding(width + 16);
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className={cn(
            "text-left font-mono text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          style={{ paddingLeft: `${leftPadding}px`, paddingRight: '80px' }}
          disabled={disabled}
        />

        {/* Token chip - positioned on the left */}
        <div ref={tokenChipRef} className="absolute left-2 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-blue-500">{tokenSymbol}</span>
          </div>
        </div>

        {/* MAX button - positioned on the right */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button
            onClick={onMax}
            variant="outline"
            size="sm"
            className="h-6 px-2 text-sm"
            disabled={disabled}
          >
            MAX
          </Button>
        </div>
      </div>

      {/* Balance and error */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          Available: <span className="font-mono">{balance} {tokenSymbol}</span>
        </span>
        {error && (
          <span className="text-red-500 text-xs">{error}</span>
        )}
      </div>
    </div>
  );
}
