"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AliasInput, RecipientType } from "@/components/AliasInput";
import { AmountInput } from "@/components/AmountInput";
import { Textarea } from "@/components/ui/textarea";
import { AttestationModal } from "@/components/AttestationModal";
import { TxStatusToast } from "@/components/TxStatusToast";
import OnrampModal from "@/components/OnrampModal";
import { resolveAlias, getBalance, sendPayment, getHistory } from "@/lib/mocks";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  CreditCard,
  TrendingUp,
  Shield,
  Globe,
  Send,
  Download,
  DollarSign,
  Euro,
  PoundSterling,
  Wallet,
  History,
  Settings,
  ChevronRight
} from "lucide-react";
import { pregenerateEmailWallet, pregenerateTwitterWallet } from "@/lib/pregen";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { encodeFunctionData, erc20Abi, isAddress } from 'viem';
import { baseSepolia } from "viem/chains";

const currencies = [
  { code: 'PYUSD', name: 'PayPal USD', symbol: '$', balance: '1,247.50', change: '+2.34%', color: 'text-blue-600 dark:text-blue-400' },
  { code: 'xAUD', name: 'Australian Dollar', symbol: 'A$', balance: '2,156.78', change: '+1.87%', color: 'text-green-600 dark:text-green-400' },
  { code: 'xEUR', name: 'Euro', symbol: '€', balance: '1,892.45', change: '-0.45%', color: 'text-purple-600 dark:text-purple-400' },
  { code: 'xGBP', name: 'British Pound', symbol: '£', balance: '1,634.12', change: '+0.92%', color: 'text-red-600 dark:text-red-400' }
];

export default function HomePage() {
  const { ready, authenticated, sendTransaction } = usePrivy();
  const { client: smartWalletClient } = useSmartWallets();

  const [recipientType, setRecipientType] = useState<RecipientType>("email");
  const [alias, setAlias] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState('PYUSD');
  const [isSending, setIsSending] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [showAttestation, setShowAttestation] = useState(false);
  const [showOnramp, setShowOnramp] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'send' | 'request' | 'add' | 'convert'>('overview');

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
      const history = await getHistory("user");
      setRecentActivity(history.slice(0, 5));
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  useEffect(() => {
    loadBalance();
    loadRecentActivity();
  }, []);

  const handleSend = async () => {
    if (!alias || !amount || !ready || !authenticated) return;

    // Resolve alias to address
    let recipientAddress;
    if (recipientType === "email") {
      recipientAddress = await pregenerateEmailWallet(alias);
    } else if (recipientType === "twitter") {
      const twitterUsername = alias.replace("@", "");
      recipientAddress = await pregenerateTwitterWallet(twitterUsername);
    }
    if (!recipientAddress || !isAddress(recipientAddress)) {
      console.error("Invalid recipient address");
      setTxStatus("error");
      return;
    }

    setIsSending(true);
    setTxStatus("pending");

    try {
      // TODO: Get token address from the selected currency
      const token = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // PYUSD
      // TODO: Get decimals from the selected currency
      const decimals = 6;

      const amountUnits = BigInt(Number(amount) * 10 ** decimals);

      const encodedTransferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipientAddress, amountUnits]
      });

      console.log(smartWalletClient);

      const txHash = await smartWalletClient?.sendTransaction({
        to: token,
        data: encodedTransferData,
        chain: baseSepolia,
      });
      console.log(txHash);
      if (!txHash) {
        setTxStatus("error");
        return;
      }
      setTxStatus("success");
      setTxHash(txHash);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTxStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const canSend = alias && amount && parseFloat(amount) > 0;

  const getCurrencyIcon = (code: string) => {
    switch (code) {
      case 'PYUSD': return DollarSign;
      case 'xEUR': return Euro;
      case 'xGBP': return PoundSterling;
      case 'xAUD': return DollarSign;
      default: return DollarSign;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'send':
        setActiveSection('send');
        break;
      case 'request':
        setActiveSection('request');
        break;
      case 'add':
        setActiveSection('add');
        break;
      case 'convert':
        setActiveSection('convert');
        break;
    }
  };

  const renderAddMoney = () => (
    <motion.div
      key="add"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <button
          onClick={() => setActiveSection('overview')}
          className="flex items-center text-blue-500 hover:text-blue-600 mb-4"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
          Back to Overview
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add Money</h2>
        <p className="text-gray-600 dark:text-gray-400">Buy PYUSD and other currencies to fund your account</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Buy PYUSD</h3>
              <p className="text-gray-600 dark:text-gray-400">Purchase PYUSD using your preferred payment method</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Credit/Debit Card</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">2.5% fee • Instant</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Bank Transfer</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">0.5% fee • 1-3 days</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">ACH Transfer</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">0.1% fee • 3-5 days</p>
            </div>
          </div>

          <Button
            onClick={() => setShowOnramp(true)}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
          >
            Start Purchase
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Minimum purchase: $10.00 • Maximum: $10,000.00 per day
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderOverview = () => (
    <>
      {/* Account Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-light text-gray-900 dark:text-white">Welcome back</h1>
          <div className="space-y-2">
            <p className="text-lg text-gray-600 dark:text-gray-400">Total Balance</p>
            <div className="text-6xl font-light text-gray-900 dark:text-white tracking-tight">
              $5,930.85
            </div>
            <p className="text-gray-500 dark:text-gray-400">Across all currencies</p>
          </div>
        </div>

        {/* Currency Overview */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Accounts</h2>
            <div className="space-y-4">
              {currencies.map((currency, index) => {
                const Icon = getCurrencyIcon(currency.code);
                return (
                  <motion.div
                    key={currency.code}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{currency.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{currency.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {currency.symbol}{currency.balance}
                      </p>
                      <p className={`text-sm font-medium ${currency.color}`}>
                        {currency.change}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Send, label: 'Send Money', action: 'send', color: 'bg-blue-500' },
                { icon: Download, label: 'Request Money', action: 'request', color: 'bg-green-500' },
                { icon: CreditCard, label: 'Add Money', action: 'add', color: 'bg-purple-500' },
                { icon: Wallet, label: 'Convert', action: 'convert', color: 'bg-orange-500' }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <button
                      onClick={() => handleQuickAction(action.action)}
                      className="w-full p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-200 text-center group"
                    >
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">No recent activity</p>
                <p className="text-sm">Your transaction history will appear here</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {recentActivity.map((tx, index) => (
                  <div key={tx.id} className={`flex items-center justify-between p-4 ${index !== recentActivity.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                    <div className="flex items-center space-x-4">
                      {tx.from === "user" ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {tx.from === "user" ? `-$${tx.amount}` : `+$${tx.amount}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tx.note || (tx.from === "user" ? 'Payment sent' : 'Payment received')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );

  const renderSendMoney = () => (
    <motion.div
      key="send"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <button
          onClick={() => setActiveSection('overview')}
          className="flex items-center text-blue-500 hover:text-blue-600 mb-4"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
          Back to Overview
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Send Money</h2>
        <p className="text-gray-600 dark:text-gray-400">Send money to anyone, anywhere, instantly</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="space-y-6">
          {/* Currency Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Send from</label>
            <div className="grid grid-cols-2 gap-3">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => setSelectedCurrency(currency.code)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${selectedCurrency === currency.code
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg font-semibold ${currency.color}`}>{currency.code}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currency.symbol}{currency.balance}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Recipient</label>
            <AliasInput
              recipientType={recipientType}
              onRecipientTypeChange={setRecipientType}
              value={alias}
              onValueChange={setAlias}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Amount</label>
            <AmountInput
              value={amount}
              onChange={setAmount}
              balance={balance}
              onMax={() => setAmount(balance)}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
              Available: {currencies.find(c => c.code === selectedCurrency)?.symbol}{currencies.find(c => c.code === selectedCurrency)?.balance}
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">Base</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">~$0.002 gas</span>
            </div>
          </div>

          <Button onClick={handleSend} disabled={!canSend || isSending} className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors">
            {isSending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Sending...
              </>
            ) : (
              'Send Money'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderRequestMoney = () => (
    <motion.div
      key="request"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="mb-6">
        <button
          onClick={() => setActiveSection('overview')}
          className="flex items-center text-blue-500 hover:text-blue-600 mb-4 mx-auto"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
          Back to Overview
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Request Money</h2>
        <p className="text-gray-600 dark:text-gray-400">Generate a payment link to share with others</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="space-y-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">This feature will be available soon</p>
          <Button onClick={() => setActiveSection('overview')} className="bg-green-500 hover:bg-green-600 text-white">
            Back to Overview
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderConvert = () => (
    <motion.div
      key="convert"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="mb-6">
        <button
          onClick={() => setActiveSection('overview')}
          className="flex items-center text-blue-500 hover:text-blue-600 mb-4 mx-auto"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
          Back to Overview
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Convert Currency</h2>
        <p className="text-gray-600 dark:text-gray-400">Exchange between different currencies</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="space-y-6">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
            <Wallet className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">This feature will be available soon</p>
          <Button onClick={() => setActiveSection('overview')} className="bg-orange-500 hover:bg-orange-600 text-white">
            Back to Overview
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'send' && renderSendMoney()}
      {activeSection === 'request' && renderRequestMoney()}
      {activeSection === 'add' && renderAddMoney()}
      {activeSection === 'convert' && renderConvert()}

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
        onConfirm={async (note: string) => {
          console.log("Creating attestation:", note);
          setShowAttestation(false);
        }}
      />

      {/* Onramp Modal */}
      <OnrampModal
        open={showOnramp}
        onOpenChange={setShowOnramp}
      />
    </div>
  );
}
