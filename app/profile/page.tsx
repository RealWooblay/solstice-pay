"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ThemeProvider";
import { Wallet, Sun, Moon, Database, Info, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleWalletToggle = () => {
    // TODO: WalletConnect / RainbowKit integration point
    setIsConnected(!isConnected);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      // TODO: seed mock transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Failed to seed data:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      // TODO: reset mock state
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to reset data:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText("0x1234567890abcdef1234567890abcdef12345678");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </motion.div>

      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-success" : "bg-muted-foreground"
                )} />
                <span className="font-mono text-sm">
                  {isConnected ? "0x1234...abcd" : "Not connected"}
                </span>
              </div>
              <Button
                onClick={handleWalletToggle}
                variant={isConnected ? "destructive" : "default"}
                size="sm"
              >
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>
            
            {isConnected && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyAddress}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Copied!" : "Copy Address"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme by default</p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme("system")}
                className={cn(
                  theme === "system" && "border-primary text-primary"
                )}
              >
                System
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme("light")}
                className={cn(
                  theme === "light" && "border-primary text-primary"
                )}
              >
                Light
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme("dark")}
                className={cn(
                  theme === "dark" && "border-primary text-primary"
                )}
              >
                Dark
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Demo Data */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Demo Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleSeedData}
                disabled={isSeeding}
                variant="outline"
                className="w-full"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  "Seed Mock Transactions"
                )}
              </Button>
              
              <Button
                onClick={handleResetData}
                disabled={isResetting}
                variant="outline"
                className="w-full"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset State"
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              These actions only affect the demo environment
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              About AliasPay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>PYUSD</strong> is a regulated digital currency backed by US dollars, 
                designed for fast, secure, and cost-effective payments.
              </p>
              <p>
                <strong>Base</strong> is a secure, low-cost, developer-friendly Ethereum L2 
                built to bring the next billion users to web3.
              </p>
              <p>
                This is a demo application. All transactions and data are simulated for 
                demonstration purposes only.
              </p>
            </div>
            
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Version 0.1.0 • Built with Next.js, TypeScript, and Tailwind CSS
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
