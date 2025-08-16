"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AliasInput } from "@/components/AliasInput";
import { AmountInput } from "@/components/AmountInput";
import { Textarea } from "@/components/ui/textarea";
import { AttestationModal } from "@/components/AttestationModal";
import { TxStatusToast } from "@/components/TxStatusToast";
import { resolveAlias, getBalance, sendPayment, getHistory } from "@/lib/mocks";
import { Send, DollarSign, Shield, Zap } from "lucide-react";

export default function HomePage() {
  const [alias, setAlias] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [aliasStatus, setAliasStatus] = useState<"idle" | "resolving" | "resolved" | "error">("idle");
  const [resolvedAlias, setResolvedAlias] = useState<any>(null);
  const [balance, setBalance] = useState("0.00");
  const [isSending, setIsSending] = useState(false);
  const [showAttestation, setShowAttestation] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Load balance on mount
  useState(() => {
    loadBalance();
    loadRecentActivity();
  });

  const loadBalance = async () => {
    try {
      const balanceData = await getBalance();
      setBalance(balanceData.pyusd);
    } catch (error) {
      console.error("Failed to load balance:", error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const history = await getHistory("alice@email.com");
      setRecentActivity(history.slice(0, 3));
    } catch (error) {
      console.error("Failed to load activity:", error);
    }
  };

  const handleAliasResolve = async () => {
    if (!alias.trim()) return;
    
    setAliasStatus("resolving");
    try {
      const result = await resolveAlias(alias);
      if (result) {
        setResolvedAlias(result);
        setAliasStatus("resolved");
      } else {
        setAliasStatus("error");
      }
    } catch (error) {
      setAliasStatus("error");
    }
  };

  const handleSend = async () => {
    if (!resolvedAlias || !amount) return;
    
    setIsSending(true);
    setTxStatus("pending");
    
    try {
      const result = await sendPayment(alias, amount, note);
      if (result.ok) {
        setTxHash(result.txHash || "");
        setTxStatus("success");
        setShowAttestation(true);
        // Reset form
        setAlias("");
        setAmount("");
        setNote("");
        setResolvedAlias(null);
        setAliasStatus("idle");
        // Reload data
        loadBalance();
        loadRecentActivity();
      } else {
        setTxStatus("error");
      }
    } catch (error) {
      setTxStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const canSend = resolvedAlias && amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(balance);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Get paid in crypto, like a bank</h1>
        <p className="text-muted-foreground">PYUSD on Base - no wallet needed</p>
        <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </motion.div>

      {/* Value Props */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="text-center p-4 rounded-xl bg-muted/30">
          <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
          <h3 className="font-medium">Bank-Level Security</h3>
          <p className="text-sm text-muted-foreground">Your money is safe and insured</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-muted/30">
          <Zap className="h-8 w-8 mx-auto mb-2 text-success" />
          <h3 className="font-medium">Instant Payments</h3>
          <p className="text-sm text-muted-foreground">Receive money in seconds</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-muted/30">
          <DollarSign className="h-8 w-8 mx-auto mb-2 text-warning" />
          <h3 className="font-medium">No Fees</h3>
          <p className="text-sm text-muted-foreground">Keep 100% of your money</p>
        </div>
      </motion.div>

      {/* Send Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
            <div className="space-y-2">
              <AliasInput
                value={alias}
                onChange={setAlias}
                onResolve={handleAliasResolve}
                status={aliasStatus}
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <AmountInput
                value={amount}
                onChange={setAmount}
                balance={balance}
                onMax={() => setAmount(balance)}
                disabled={!resolvedAlias}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available: <span className="font-mono">{balance} PYUSD</span></span>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">Note (optional)</label>
              <Textarea
                id="note"
                placeholder="What's this payment for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={120}
                rows={3}
              />
              <div className="text-xs text-muted-foreground text-right">{note.length}/120</div>
            </div>

            {/* Network Info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <span className="text-sm">Network</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">Base</span>
                <span className="text-sm text-muted-foreground">~$0.002 gas</span>
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!canSend || isSending}
              className="w-full h-14"
            >
              {isSending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Sending...
                </>
              ) : (
                'Send PYUSD'
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
                <p className="text-sm">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">+${tx.amount} PYUSD</p>
                      <p className="text-sm text-muted-foreground">{tx.note || 'Payment received'}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction Status Toast */}
      {txStatus !== "idle" && (
        <TxStatusToast
          status={txStatus}
          message={
            txStatus === "pending" ? "Sending payment..." :
            txStatus === "success" ? "Payment sent successfully!" :
            "Payment failed. Please try again."
          }
          txHash={txHash}
          onClose={() => setTxStatus("idle")}
        />
      )}

      {/* Attestation Modal */}
      <AttestationModal
        open={showAttestation}
        onOpenChange={setShowAttestation}
        defaultNote={note}
        onConfirm={() => setShowAttestation(false)}
      />
    </div>
  );
}
