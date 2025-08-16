"use client"

import { Mail, Phone, Github, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifyBadgesProps {
  email: boolean;
  phone: boolean;
  github: boolean;
  twitter: boolean;
  size?: "sm" | "md";
}

export function VerifyBadges({ email, phone, github, twitter, size = "md" }: VerifyBadgesProps) {
  const sizeClasses = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  const badges = [
    { icon: Mail, verified: email, label: "Email", color: "text-blue-500" },
    { icon: Phone, verified: phone, label: "Phone", color: "text-green-500" },
    { icon: Github, verified: github, label: "GitHub", color: "text-gray-500" },
    { icon: Twitter, verified: twitter, label: "Twitter", color: "text-sky-500" },
  ];

  return (
    <div className="flex items-center gap-2">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors",
            badge.verified
              ? "bg-success/20 text-success"
              : "bg-muted/50 text-muted-foreground"
          )}
        >
          <badge.icon className={cn(sizeClasses, badge.verified ? badge.color : "text-muted-foreground")} />
          <span className={cn("font-medium", textSize)}>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
