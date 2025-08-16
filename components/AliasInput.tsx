"use client"

import { useState } from "react";
import { Mail, Phone, AtSign, Loader2, CheckCircle, XCircle, Twitter, MessageCircle, Instagram, Linkedin, Youtube, Facebook } from "lucide-react";
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
  const [recipientType, setRecipientType] = useState<"email" | "phone" | "discord" | "twitter" | "instagram" | "linkedin">("email");

  const getIcon = () => {
    if (recipientType === "email") return Mail;
    if (recipientType === "phone") return Phone;
    if (recipientType === "discord") return MessageCircle;
    if (recipientType === "twitter") return Twitter;
    if (recipientType === "instagram") return Instagram;
    if (recipientType === "linkedin") return Linkedin;
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
    if (recipientType === "email") return "Enter email address";
    if (recipientType === "phone") return "Enter phone number (+1234567890)";
    if (recipientType === "discord") return "Enter Discord username";
    if (recipientType === "twitter") return "Enter Twitter handle";
    if (recipientType === "instagram") return "Enter Instagram handle";
    if (recipientType === "linkedin") return "Enter LinkedIn identifier";
    return "";
  };

  const getStatusIcon = () => {
    switch (status) {
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case "resolving": return <Loader2 className="h-4 w-4 animate-spin text-yellow-500 dark:text-yellow-400" />;
      default: return <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getPlaceholder = () => {
    if (recipientType === "email") return "alice@email.com";
    if (recipientType === "phone") return "+1234567890";
    if (recipientType === "discord") return "username#1234";
    if (recipientType === "twitter") return "@username";
    if (recipientType === "instagram") return "@username";
    if (recipientType === "linkedin") return "username";
    return "";
  };

  return (
    <div className="space-y-3">
      {/* Recipient Type Selection */}
      <div className="flex gap-1">
        <Button
          variant={recipientType === "email" ? "default" : "outline"}
          size="sm"
          onClick={() => setRecipientType("email")}
          className="h-8 px-2 text-xs"
        >
          <Mail className="h-3 w-3 mr-1" />
          Email
        </Button>
        <Button
          variant={recipientType === "phone" ? "default" : "outline"}
          size="sm"
          onClick={() => setRecipientType("phone")}
          className="h-8 px-2 text-xs"
        >
          <Phone className="h-3 w-3 mr-1" />
          Phone
        </Button>
        <Button
          variant={recipientType === "discord" ? "default" : "outline"}
          size="sm"
          onClick={() => setRecipientType("discord")}
          className="h-8 px-2 text-xs"
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          Discord
        </Button>
        <Button
          variant={recipientType === "twitter" ? "default" : "outline"}
          size="sm"
          onClick={() => setRecipientType("twitter")}
          className="h-8 px-2 text-xs"
        >
          <Twitter className="h-3 w-3 mr-1" />
          Twitter
        </Button>
        <Button
          variant={recipientType === "instagram" ? "default" : "outline"}
          size="sm"
          onClick={() => setRecipientType("instagram")}
          className="h-8 px-2 text-xs"
        >
          <Instagram className="h-3 w-3 mr-1" />
          IG
        </Button>
        <Button
          variant={recipientType === "linkedin" ? "default" : "outline"}
          size="sm"
          onClick={() => setRecipientType("linkedin")}
          className="h-8 px-2 text-xs"
        >
          <Linkedin className="h-3 w-3 mr-1" />
          LI
        </Button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getPlaceholder()}
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
    </div>
  );
}
