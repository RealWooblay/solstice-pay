"use client"

import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TxStatusToastProps {
  status: "pending" | "success" | "error";
  message: string;
  txHash?: string;
  onClose?: () => void;
}

export function TxStatusToast({ status, message, txHash, onClose }: TxStatusToastProps) {
  const getIcon = () => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "border-primary/20 bg-primary/5";
      case "success":
        return "border-success/20 bg-success/5";
      case "error":
        return "border-destructive/20 bg-destructive/5";
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border p-4 shadow-lg backdrop-blur-md",
        getStatusColor()
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View on explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
