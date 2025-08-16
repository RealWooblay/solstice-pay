"use client"

import { useState } from "react";
import { Mail, Phone, AtSign, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AliasInputProps {
  value: string;
  onChange: (value: string) => void;
  onResolve: () => void;
  status: "idle" | "resolving" | "resolved" | "error";
  error?: string;
}

export function AliasInput({ value, onChange, onResolve, status, error }: AliasInputProps) {
  const getIcon = () => {
    if (value.includes("@") && !value.startsWith("@")) return Mail;
    if (value.startsWith("+")) return Phone;
    if (value.startsWith("@")) return AtSign;
    return Mail;
  };

  const Icon = getIcon();

  const getStatusColor = () => {
    switch (status) {
      case "resolved": return "text-green-600 dark:text-green-400";
      case "error": return "text-red-500 dark:text-red-400";
      case "resolving": return "text-yellow-500 dark:text-yellow-400";
      default: return "text-gray-500 dark:text-gray-400";
    }
  };

  const getHelpText = () => {
    if (error) return error;
    if (status === "resolved") return "Alias found! Ready to send payment";
    if (status === "error") return "Alias not found. Try a different one";
    if (value.includes("@") && !value.startsWith("@")) return "Enter a valid email address";
    if (value.startsWith("+")) return "Enter a phone number in E.164 format (+1234567890)";
    if (value.startsWith("@")) return "Enter a handle (3-20 characters)";
    return "Enter an email, phone, or handle";
  };

  const getStatusIcon = () => {
    switch (status) {
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case "resolving": return <Loader2 className="h-4 w-4 animate-spin text-yellow-500 dark:text-yellow-400" />;
      default: return <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="alice@email.com, +1234567890, or @username"
          className="pl-12 pr-32"
        />
        <Button
          onClick={onResolve}
          disabled={!value || status === "resolving"}
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3"
        >
          {status === "resolving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Resolve"
          )}
        </Button>
      </div>

      {value && (
        <div className="flex items-center justify-between text-sm">
          <span className={cn("flex items-center gap-2", getStatusColor())}>
            {getStatusIcon()}
            {getHelpText()}
          </span>
          {status !== "idle" && (
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", {
              "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300": status === "resolved",
              "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300": status === "error",
              "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400": status === "resolving"
            })}>
              {status === "resolved" && "Found"}
              {status === "error" && "Not Found"}
              {status === "resolving" && "Searching..."}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
