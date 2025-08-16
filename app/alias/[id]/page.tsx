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
  verified: {
    email: boolean;
    phone: boolean;
    github: boolean;
    twitter: boolean;
  };
  stats: {
    totalReceived: string;
    uniquePayers: number;
    streak: number;
  };
  isTeam: boolean;
  teamMembers?: Array<{
    address: string;
    alias?: string;
    share: number;
  }>;
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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
          <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-muted rounded-full w-16 mx-auto" />
              <div className="h-6 bg-muted rounded w-1/3 mx-auto" />
              <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Alias not found</h1>
        <p className="text-muted-foreground">The alias "{alias}" could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center mx-auto">
          <span className="text-white text-xl font-semibold">
            {profile.alias[0] === '@' ? profile.alias[1] : profile.alias[0]}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.alias}</h1>
          <p className="text-muted-foreground font-mono text-sm">
            {getMaskedAlias(profile.alias)}
          </p>
        </div>
        
        <VerifyBadges
          email={profile.verified.email}
          phone={profile.verified.phone}
          github={profile.verified.github}
          twitter={profile.verified.twitter}
        />

        <div className="flex gap-3 justify-center">
          <Button size="lg">
            <Send className="h-4 w-4 mr-2" />
            Send PYUSD
          </Button>
          <Button variant="outline" onClick={copyPayLink}>
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy Pay Link"}
          </Button>
          {profile.alias.startsWith('@') && (
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-mono text-success">
                {formatCurrency(profile.stats.totalReceived)}
              </div>
              <p className="text-xs text-muted-foreground">Total Received</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-mono">
                {profile.stats.uniquePayers}
              </div>
              <p className="text-xs text-muted-foreground">Unique Payers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-mono text-warning">
                {profile.stats.streak}
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Team Members */}
      {profile.isTeam && profile.teamMembers && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Split Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary text-sm font-medium">
                          {member.alias ? member.alias[1] : member.address.slice(2, 4)}
                        </span>
                      </div>
                      <span className="font-medium">
                        {member.alias || formatAddress(member.address)}
                      </span>
                    </div>
                    <span className="font-mono text-sm">{member.share}%</span>
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
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
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
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <p className={cn(
                          "font-mono font-medium",
                          tx.dir === 'in' ? 'text-success' : 'text-primary'
                        )}>
                          {tx.dir === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(tx.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Transaction history will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
