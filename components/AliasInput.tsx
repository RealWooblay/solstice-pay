"use client"

import { useState } from "react";
import { Mail, Phone, AtSign, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AliasInputProps {
  value: string;
  onChange: (value: string) => void;
  onResolve: () => void;
  status: "idle" | "resolving" | "verified" | "unverified" | "taken";
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
      case "verified": return "text-success";
      case "unverified": return "text-warning";
      case "taken": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getHelpText = () => {
    if (error) return error;
    if (value.includes("@") && !value.startsWith("@")) return "Enter a valid email address";
    if (value.startsWith("+")) return "Enter a phone number in E.164 format (+1234567890)";
    if (value.startsWith("@")) return "Enter a handle (3-20 characters)";
    return "Enter an email, phone, or handle";
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
            <Icon className="h-4 w-4" />
            {getHelpText()}
          </span>
          {status !== "idle" && (
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", {
              "bg-success/20 text-success": status === "verified",
              "bg-warning/20 text-warning": status === "unverified",
              "bg-destructive/20 text-destructive": status === "taken"
            })}>
              {status === "verified" && "Verified"}
              {status === "unverified" && "Unverified"}
              {status === "taken" && "Taken"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
