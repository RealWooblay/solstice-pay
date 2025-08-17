"use client"

import { Mail, Phone, Twitter, MessageCircle, Instagram, Linkedin } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export type RecipientType = "email" | "phone" | "discord" | "twitter" | "instagram" | "linkedin";

interface AliasInputProps {
  recipientType: RecipientType;
  onRecipientTypeChange: (type: RecipientType) => void;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
}

export function AliasInput({ recipientType, onRecipientTypeChange, value, onValueChange, error }: AliasInputProps) {
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

  const getPlaceholder = () => {
    if (recipientType === "email") return "jack@email.com";
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
          onClick={() => onRecipientTypeChange("email")}
          className="h-8 px-2 text-xs"
        >
          <Mail className="h-3 w-3 mr-1" />
          Email
        </Button>
        <Button
          variant={recipientType === "phone" ? "default" : "outline"}
          size="sm"
          onClick={() => onRecipientTypeChange("phone")}
          className="h-8 px-2 text-xs"
        >
          <Phone className="h-3 w-3 mr-1" />
          Phone
        </Button>
        <Button
          variant={recipientType === "twitter" ? "default" : "outline"}
          size="sm"
          onClick={() => onRecipientTypeChange("twitter")}
          className="h-8 px-2 text-xs"
        >
          <Twitter className="h-3 w-3 mr-1" />
          Twitter
        </Button>
        <Button
          variant={recipientType === "instagram" ? "default" : "outline"}
          size="sm"
          onClick={() => onRecipientTypeChange("instagram")}
          className="h-8 px-2 text-xs"
        >
          <Instagram className="h-3 w-3 mr-1" />
          Instagram
        </Button>
        <Button
          variant={recipientType === "discord" ? "default" : "outline"}
          size="sm"
          onClick={() => onRecipientTypeChange("discord")}
          className="h-8 px-2 text-xs"
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          Discord
        </Button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={getPlaceholder()}
          className="pl-12"
        />
      </div>
    </div>
  );
}
