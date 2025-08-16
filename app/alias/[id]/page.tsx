"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifyBadges } from "@/components/VerifyBadges";
import { getProfile, getHistory } from "@/lib/mocks";
import { formatCurrency, formatAddress, formatTimeAgo, maskEmail, maskPhone } from "@/lib/format";
import { Send, Copy, Edit, TrendingUp, Users, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  alias: string;
  address: string;
  email?: string;
  phone?: string;
  github?: string;
  twitter?: string;
  verified: {
    email: boolean;
    phone: boolean;
    github: boolean;
    twitter: boolean;
  };
  totalReceived: string;
  uniquePayers: number;
  streak: number;
  routingRule?: Array<{
    address: string;
    alias?: string;
    share: number;
  }>;
}

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  note?: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  txHash?: string;
}

export default function AliasProfilePage() {
  const params = useParams();
  const alias = params.id as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [alias]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const [profileData, historyData] = await Promise.all([
        getProfile(alias),
        getHistory(alias)
      ]);
      setProfile(profileData);
      setTransactions(historyData);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPayLink = () => {
    navigator.clipboard.writeText(`https://aliaspay.xyz/alias/${alias}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending": return <Clock className="h-4 w-4 text-warning" />;
      case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getDirectionIcon = (dir: 'in' | 'out') => {
    return dir === 'in' ? 
      <ArrowDownLeft className="h-4 w-4 text-success" /> : 
      <ArrowUpRight className="h-4 w-4 text-primary" />;
  };

  const getMaskedAlias = (alias: string) => {
    if (alias.includes('@')) return maskEmail(alias);
    if (alias.startsWith('+')) return maskPhone(alias);
    return alias;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const isTeam = !!profile.routingRule && profile.routingRule.length > 0;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <span className="text-2xl font-bold text-primary">
            {profile.alias[0]?.toUpperCase()}
          </span>
        </div>
        
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{profile.alias}</h1>
          <p className="text-muted-foreground font-mono">{formatAddress(profile.address)}</p>
        </div>

        {/* Verification Badges */}
        <VerifyBadges
          email={profile.verified.email}
          phone={profile.verified.phone}
          github={profile.verified.github}
          twitter={profile.verified.twitter}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-3">
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Send className="h-4 w-4 mr-2" />
            Send PYUSD
          </Button>
          <Button variant="outline" onClick={copyPayLink}>
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(profile.totalReceived)}</p>
            <p className="text-sm text-muted-foreground">Total Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{profile.uniquePayers}</p>
            <p className="text-sm text-muted-foreground">Unique Payers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{profile.streak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Section */}
      {isTeam && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.routingRule?.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-mono">
                      {member.alias || formatAddress(member.address)}
                    </span>
                    <span className="text-muted-foreground">{member.share}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm">Payment history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <ArrowDownLeft className="h-4 w-4 text-success" />
                      <div>
                        <p className="font-medium">+${tx.amount} PYUSD</p>
                        {tx.note && (
                          <p className="text-sm text-muted-foreground">{tx.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(tx.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
