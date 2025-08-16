"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AliasInput } from "@/components/AliasInput";
import { AmountInput } from "@/components/AmountInput";
import { VerifyBadges } from "@/components/VerifyBadges";
import { TxStatusToast } from "@/components/TxStatusToast";
import { AttestationModal } from "@/components/AttestationModal";
import { resolveAlias, getBalance, sendPayment, getHistory } from "@/lib/mocks";
import { formatCurrency, formatTimeAgo } from "@/lib/format";
import { Send, TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AliasResolution {
  alias: string;
  address: string;
  verified: {
    email: boolean;
    phone: boolean;
    github: boolean;
    twitter: boolean;
  };
  isTeam: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface Transaction {
  id: string;
  dir: 'in' | 'out';
  counterparty: string;
  amount: string;
  note?: string;
  status: 'pending' | 'success' | 'failed';
  time: string;
  txHash?: string;
}

export default function HomePage() {
  const [alias, setAlias] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [resolution, setResolution] = useState<AliasResolution | null>(null);
  const [status, setStatus] = useState<"idle" | "resolving" | "verified" | "unverified" | "taken">("idle");
  const [balance, setBalance] = useState("0.00");
  const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"pending" | "success" | "error" | null>(null);
  const [txMessage, setTxMessage] = useState("");
  const [txHash, setTxHash] = useState("");
  const [showAttestationModal, setShowAttestationModal] = useState(false);

  useEffect(() => {
    loadBalance();
    loadRecentActivity();
  }, []);

  const loadBalance = async () => {
    try {
      const bal = await getBalance();
      setBalance(bal.pyusd);
    } catch (error) {
      console.error("Failed to load balance:", error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // TODO: load user's recent transactions
      const history = await getHistory("user");
      setRecentActivity(history.slice(0, 5));
    } catch (error) {
      console.error("Failed to load recent activity:", error);
    }
  };

  const handleResolve = async () => {
    if (!alias.trim()) return;
    
    setStatus("resolving");
    try {
      const result = await resolveAlias(alias);
      if (result) {
        setResolution(result);
        setStatus(result.verified.email || result.verified.phone || result.verified.github || result.verified.twitter ? "verified" : "unverified");
      } else {
        setStatus("taken");
        setResolution(null);
      }
    } catch (error) {
      setStatus("unverified");
      setResolution(null);
    }
  };

  const handleSend = async () => {
    if (!alias || !amount || !resolution) return;
    
    setIsSubmitting(true);
    setTxStatus("pending");
    setTxMessage("Approving PYUSD...");
    
    try {
      // TODO: approve PYUSD (ERC20) using wallet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTxMessage("Transferring...");
      const result = await sendPayment(alias, amount, note);
      
      if (result.ok) {
        setTxStatus("success");
        setTxMessage("Payment sent successfully!");
        setTxHash(result.txHash || "");
        
        // Reset form
        setAlias("");
        setAmount("");
        setNote("");
        setResolution(null);
        setStatus("idle");
        
        // Reload data
        loadBalance();
        loadRecentActivity();
        
        // Show attestation modal
        setTimeout(() => setShowAttestationModal(true), 1000);
      } else {
        setTxStatus("error");
        setTxMessage("Transaction failed. Please try again.");
      }
    } catch (error) {
      setTxStatus("error");
      setTxMessage("Transaction failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttestation = async (note: string) => {
    // TODO: write EAS attestation
    console.log("Creating attestation with note:", note);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending": return <TrendingUp className="h-4 w-4 text-warning" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getDirectionIcon = (dir: 'in' | 'out') => {
    return dir === 'in' ? 
      <ArrowDownLeft className="h-4 w-4 text-success" /> : 
      <ArrowUpRight className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-semibold tracking-tight">
          Pay anyone, by alias.
        </h1>
        <p className="text-muted-foreground">PYUSD on Base (mock)</p>
        <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>

      {/* Send Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send PYUSD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alias Input */}
            <AliasInput
              value={alias}
              onChange={setAlias}
              onResolve={handleResolve}
              status={status}
            />

            {/* Resolution Status */}
            {resolution && (
              <div className="space-y-3 p-4 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resolved to:</span>
                  <span className="font-mono text-sm">{resolution.address}</span>
                </div>
                <VerifyBadges
                  email={resolution.verified.email}
                  phone={resolution.verified.phone}
                  github={resolution.verified.github}
                  twitter={resolution.verified.twitter}
                  size="sm"
                />
                {resolution.riskLevel === 'high' && (
                  <div className="flex items-center gap-2 text-warning text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    High risk - proceed with caution
                  </div>
                )}
              </div>
            )}

            {/* Amount Input */}
            <AmountInput
              value={amount}
              onChange={setAmount}
              balance={balance}
              onMax={() => setAmount(balance)}
              disabled={!resolution}
            />

            {/* Note */}
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                Note (optional)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's this payment for?"
                maxLength={120}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
              />
              <div className="text-xs text-muted-foreground text-right">
                {note.length}/120
              </div>
            </div>

            {/* Network Info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <span className="text-sm">Network</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  Base
                </span>
                <span className="text-sm text-muted-foreground">
                  ~$0.002 gas
                </span>
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!resolution || !amount || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Sending..." : "Send PYUSD"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {getDirectionIcon(tx.dir)}
                      <div>
                        <p className="font-medium text-sm">
                          {tx.dir === 'in' ? 'Received from' : 'Sent to'} {tx.counterparty}
                        </p>
                        {tx.note && (
                          <p className="text-xs text-muted-foreground">{tx.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-mono font-medium",
                        tx.dir === 'in' ? 'text-success' : 'text-primary'
                      )}>
                        {tx.dir === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(tx.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
                <p className="text-sm">Your payment history will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction Status Toast */}
      {txStatus && (
        <TxStatusToast
          status={txStatus}
          message={txMessage}
          txHash={txHash}
          onClose={() => setTxStatus(null)}
        />
      )}

      {/* Attestation Modal */}
      <AttestationModal
        open={showAttestationModal}
        onOpenChange={setShowAttestationModal}
        defaultNote={note}
        onConfirm={handleAttestation}
      />
    </div>
  );
}
