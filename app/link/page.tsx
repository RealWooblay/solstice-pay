"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifyBadges } from "@/components/VerifyBadges";
import { verifyEmail, verifyPhone, connectGithub, connectTwitter, setAlias } from "@/lib/mocks";
import { Mail, Phone, Github, Twitter, Shield, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationState {
  email: boolean;
  phone: boolean;
  github: boolean;
  twitter: boolean;
}

export default function LinkPage() {
  const [verifications, setVerifications] = useState<VerificationState>({
    email: false,
    phone: false,
    github: false,
    twitter: false
  });
  const [alias, setAlias] = useState("");
  const [address, setAddress] = useState("0x1234...abcd");
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [claimedAliases, setClaimedAliases] = useState<string[]>([]);

  const handleVerify = async (type: keyof VerificationState) => {
    setIsVerifying(type);
    try {
      let success = false;
      switch (type) {
        case 'email':
          success = await verifyEmail('user@example.com');
          break;
        case 'phone':
          success = await verifyPhone('+1234567890');
          break;
        case 'github':
          success = await connectGithub();
          break;
        case 'twitter':
          success = await connectTwitter();
          break;
      }

      if (success) {
        setVerifications(prev => ({ ...prev, [type]: true }));
      }
    } catch (error) {
      console.error(`Failed to verify ${type}:`, error);
    } finally {
      setIsVerifying(null);
    }
  };

  const handleSaveAlias = async () => {
    if (!alias.trim()) return;

    setIsSaving(true);
    try {
      // TODO: setAlias(bytes32 aliasHash, chainId, token, recipient)
      await setAlias(alias);
      setClaimedAliases(prev => [...prev, alias]);
      setAlias("");
    } catch (error) {
      console.error("Failed to save alias:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const verificationButtons = [
    { key: 'email', icon: Mail, label: 'Verify Email', color: 'text-blue-500' },
    { key: 'phone', icon: Phone, label: 'Verify Phone', color: 'text-green-500' },
    { key: 'github', icon: Github, label: 'Connect GitHub', color: 'text-gray-500' },
    { key: 'twitter', icon: Twitter, label: 'Connect Twitter', color: 'text-sky-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Claim your alias</h1>
        <p className="text-muted-foreground">Prove it's you to receive payments.</p>
      </motion.div>

      {/* Verification Status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <VerifyBadges
              email={verifications.email}
              phone={verifications.phone}
              github={verifications.github}
              twitter={verifications.twitter}
            />

            <div className="grid grid-cols-2 gap-3">
              {verificationButtons.map(({ key, icon: Icon, label, color }) => (
                <Button
                  key={key}
                  variant={verifications[key as keyof VerificationState] ? "outline" : "outline"}
                  onClick={() => handleVerify(key as keyof VerificationState)}
                  disabled={verifications[key as keyof VerificationState] || isVerifying === key}
                  className={cn(
                    "h-auto py-3 px-4 flex-col gap-2",
                    verifications[key as keyof VerificationState] && "border-success text-success"
                  )}
                >
                  {isVerifying === key ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : verifications[key as keyof VerificationState] ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className={cn("h-5 w-5", color)} />
                  )}
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Receiving Address */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Receiving Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="font-mono text-sm">{address}</span>
              <span className="text-xs text-muted-foreground">Current wallet</span>
            </div>

            <div className="space-y-2">
              <label htmlFor="custom-address" className="text-sm font-medium">
                Use different address (optional)
              </label>
              <Input
                id="custom-address"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Claim Alias */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Claim Alias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="alias" className="text-sm font-medium">
                Alias (email, phone, or @handle)
              </label>
              <Input
                id="alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="alice@email.com, +1234567890, or @username"
              />
            </div>

            <Button
              onClick={handleSaveAlias}
              disabled={!alias.trim() || isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Alias"
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Claimed Aliases */}
      {claimedAliases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Aliases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {claimedAliases.map((claimedAlias, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                  >
                    <span className="font-medium">{claimedAlias}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Security Tips</p>
                <p>Only verify accounts you own. Verified aliases are more trusted by senders.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
