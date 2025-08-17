"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AliasInput, RecipientType } from "@/components/AliasInput";
import { AmountInput } from "@/components/AmountInput";
import { AttestationModal } from "@/components/AttestationModal";
import { TxStatusToast } from "@/components/TxStatusToast";
import OnrampModal from "@/components/OnrampModal";
import { resolveAlias, sendPayment, getHistory } from "@/lib/mocks";
import { ethers } from "ethers";
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Send,
  Download,
  DollarSign,
  Euro,
  PoundSterling,
  Wallet,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import LinkedAccountsSection from "@/components/LinkedAccountsSection";
import { pregenerateEmailWallet, pregenerateTwitterWallet } from "@/lib/pregen";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { encodeFunctionData, erc20Abi, isAddress } from 'viem';
import { sepolia } from "viem/chains";

interface Balance {
  pyusd: string;
  usdc: string;
  aud: string;
  cop: string;
  eur: string;
}

// Currency conversion rates from real API
const getExchangeRates = async () => {
  try {
    // Get real-time exchange rates from CoinGecko API
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,paypal-usd&vs_currencies=usd,eur,gbp,aud,cop');
    const data = await response.json();

    return {
      USD: 1,
      AUD: data['usd-coin']?.aud || 1.52,
      EUR: data['usd-coin']?.eur || 0.92,
      GBP: data['usd-coin']?.gbp || 0.79,
      COP: data['usd-coin']?.cop || 0.00026
    };
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    // Fallback to hardcoded rates
    return {
      USD: 1,
      AUD: 1.52,
      EUR: 0.92,
      GBP: 0.79,
      COP: 0.00026
    };
  }
};

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'COP', name: 'Colombian Peso', symbol: '₱', rate: 0.00026 }
];

export default function HomePage() {
  const { user } = usePrivy();
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
  const [balance, setBalance] = useState<Balance>({ pyusd: "", usdc: "", aud: "", cop: "", eur: "" });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'send' | 'request' | 'add' | 'convert'>('overview');
  const [selectedDisplayCurrency, setSelectedDisplayCurrency] = useState('USD');
  const [showCurrencySwitcher, setShowCurrencySwitcher] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    AUD: 1.52,
    EUR: 0.92,
    GBP: 0.79,
    COP: 0.00026
  });
  const [currencies, setCurrencies] = useState([
    {
      code: 'PYUSD',
      name: 'PayPal USD',
      symbol: '$',
      balance: '',
      change: '',
      color: 'text-blue-600 dark:text-blue-400',
      usdValue: 0,
      contractAddress: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9',
      decimals: 6
    },
    {
      code: 'USDC',
      name: 'USD Coin',
      symbol: '$',
      balance: '',
      change: '',
      color: 'text-green-600 dark:text-green-400',
      usdValue: 0,
      contractAddress: '0xa0b86a33e6441b8c4a0b8c4a0b8c4a0b8c4a0b8c',
      decimals: 6
    },
    {
      code: 'EURC',
      name: 'Euro Coin',
      symbol: '€',
      balance: '',
      change: '',
      color: 'text-purple-600 dark:text-purple-400',
      usdValue: 0,
      contractAddress: '0x1aBaEA1f7C830cD89Fc44E4b4a1c13D327e7A9d5',
      decimals: 6
    }
  ]);

  // Load exchange rates on component mount
  useEffect(() => {
    const loadExchangeRates = async () => {
      const rates = await getExchangeRates();
      setExchangeRates(rates);
    };
    loadExchangeRates();
  }, []);

  // Auto-refresh balances and rates every 30 seconds when user has wallet
  useEffect(() => {
    if (!user?.wallet?.address) return;

    // Initial load
    loadBalance();

    // Set up interval for auto-refresh
    const interval = setInterval(() => {
      console.log('Auto-refreshing balances and rates...');
      loadBalance(true); // Pass true for cron refresh
      getExchangeRates().then(setExchangeRates);
    }, 30000); // 30 seconds

    // Cleanup interval on unmount or wallet change
    return () => clearInterval(interval);
  }, [user?.wallet?.address]);

  // Close currency switcher when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.currency-switcher')) {
        setShowCurrencySwitcher(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadBalance = async (isCronRefresh = false) => {
    try {
      // Only load real blockchain balances if user has wallet
      if (user?.smartWallet?.address) {
        // Only show loading spinner on initial load, not cron refreshes
        if (!isCronRefresh) {
          setIsLoadingBalances(true);
        }

        console.log('Fetching real balances for wallet:', user.smartWallet.address);

        // Fetch real stablecoin balances from blockchain
        const realBalances = await getStablecoinBalances(user.smartWallet.address);

        // Update balance state with real data
        setBalance({
          pyusd: realBalances.pyusd,
          usdc: realBalances.usdc,
          aud: "0.00", // Not implemented yet
          cop: "0.00", // Not implemented yet
          eur: realBalances.eurc
        });

        // Update currencies array with real balances
        const updatedCurrencies = currencies.map(currency => {
          let balance = "0.00";
          let usdValue = 0;

          switch (currency.code) {
            case 'PYUSD':
              balance = realBalances.pyusd;
              usdValue = parseFloat(realBalances.pyusd);
              break;
            case 'USDC':
              balance = realBalances.usdc;
              usdValue = parseFloat(realBalances.usdc);
              break;
            case 'EURC':
              balance = realBalances.eurc;
              usdValue = parseFloat(realBalances.eurc) * 1.08; // Approx EUR to USD rate
              break;
          }

          return {
            ...currency,
            balance,
            usdValue,
            change: usdValue > 0 ? '+0.00%' : '0.00%'
          };
        });

        // Filter currencies: show PYUSD always, others only if > 1
        const filteredCurrencies = updatedCurrencies.filter(currency => {
          if (currency.code === 'PYUSD') return true; // Always show PYUSD
          return parseFloat(currency.balance) > 1; // Show others only if > 1
        });

        // Update the currencies state
        setCurrencies(filteredCurrencies);

        // Calculate total balance from real data
        const total = updatedCurrencies.reduce((sum, curr) => sum + curr.usdValue, 0);
        setTotalBalance(total);

        console.log('Real balances loaded:', realBalances);
        console.log('Total balance:', total);

        // Mark initial load as complete
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
      // No fallback to mock data - only show real balances when wallet connected
    } catch (error) {
      console.error("Failed to load balance:", error);
    } finally {
      if (!isCronRefresh) {
        setIsLoadingBalances(false);
      }
    }
  };

  const getDisplayBalance = () => {
    if (selectedDisplayCurrency === 'USD') return totalBalance;

    const rate = exchangeRates[selectedDisplayCurrency as keyof typeof exchangeRates];
    if (!rate) return totalBalance;

    return totalBalance * rate;
  };

  const getCurrencySymbol = () => {
    switch (selectedDisplayCurrency) {
      case 'USD': return '$';
      case 'AUD': return 'A$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'COP': return '₱';
      default: return '$';
    }
  };

  const formatBalance = (balance: number) => {
    // Show full number for total balance
    return `${getCurrencySymbol()}${balance.toFixed(2)}`;
  };

  const formatCurrencyBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return num.toFixed(2);
    }
  };

  // Real blockchain integration functions using ethers.js
  const getTokenBalance = async (address: string, contractAddress: string, decimals: number = 6): Promise<string> => {
    try {
      // Create provider for Ethereum Sepolia testnet using Alchemy
      const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/demo');

      // ERC20 ABI for balanceOf and decimals
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
      ];

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, erc20Abi, provider);

      // Get balance and decimals
      const [balance, contractDecimals] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals()
      ]);

      // Format balance with proper decimals
      const formattedBalance = ethers.formatUnits(balance, contractDecimals || decimals);

      console.log(`Balance for ${contractAddress}: ${formattedBalance}`);
      return formattedBalance;

    } catch (error) {
      console.error(`Failed to fetch token balance for ${contractAddress}:`, error);
      return "0.00";
    }
  };

  const getStablecoinBalances = async (address: string) => {
    try {
      // Fetch real balances for the three main stablecoins on Sepolia testnet
      const [pyusdBalance, usdcBalance, eurcBalance] = await Promise.all([
        getTokenBalance(address, '0x6c3ea90364068520000e5c6104c4aac4e8c8d956', 6), // PYUSD (Sepolia)
        getTokenBalance(address, '0x1c7D4B196Cb0C7B01d743FbcD6D5C4c5C5C5C5C5', 6), // USDC (Sepolia placeholder)
        getTokenBalance(address, '0x1aBaEA1f7C830cD89Fc44E4b4a1c13D327e7A9d5', 6)  // EURC (Sepolia)
      ]);

      return {
        pyusd: pyusdBalance,
        usdc: usdcBalance,
        eurc: eurcBalance
      };
    } catch (error) {
      console.error("Failed to fetch stablecoin balances:", error);
      return {
        pyusd: "0.00",
        usdc: "0.00",
        eurc: "0.00"
      };
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
        chain: sepolia,
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
            <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-700/50">
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
            <div className="flex items-center justify-center space-x-3">
              <p className="text-lg text-gray-600 dark:text-gray-400">Total Balance</p>
              {/* Subtle Currency Switcher */}
              <div className="relative currency-switcher">
                <button
                  onClick={() => setShowCurrencySwitcher(!showCurrencySwitcher)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                >
                  <span className="font-medium">
                    {getCurrencySymbol()} {selectedDisplayCurrency}
                  </span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${showCurrencySwitcher ? 'rotate-180' : ''}`} />
                </button>

                {showCurrencySwitcher && (
                  <div className="absolute top-full left-0 mt-1 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    {Object.entries(exchangeRates).map(([code, rate]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setSelectedDisplayCurrency(code);
                          setShowCurrencySwitcher(false);
                        }}
                        className={`w-full px-2 py-1 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedDisplayCurrency === code
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {getCurrencySymbol()} {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-refresh every 30 seconds when app is open */}
            </div>
            <div className="text-6xl font-light text-gray-900 dark:text-white tracking-tight cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => {
                if (user?.smartWallet?.address) {
                  window.open(`https://sepolia.etherscan.io/address/${user.smartWallet.address}`, '_blank');
                }
              }}>
              {isLoadingBalances ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-2xl">Loading...</span>
                </div>
              ) : user?.smartWallet?.address ? (
                formatBalance(getDisplayBalance())
              ) : (
                <span className="text-gray-400 text-2xl">No wallet</span>
              )}
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
                    onClick={() => {
                      if (currency.contractAddress) {
                        window.open(`https://sepolia.etherscan.io/token/${currency.contractAddress}`, '_blank');
                      }
                    }}
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
                        {currency.balance ? (
                          `${currency.symbol}${formatCurrencyBalance(currency.balance)}`
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </p>
                      <p className={`text-sm font-medium ${currency.change ? currency.color : 'text-gray-400'}`}>
                        {currency.change || '-'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currency.usdValue > 0 ? (
                          `${getCurrencySymbol()}${currency.usdValue.toFixed(2)} ${selectedDisplayCurrency}`
                        ) : (
                          '-'
                        )}
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
              balance={balance[selectedCurrency.toLowerCase() as keyof Balance] || "0.00"}
              onMax={() => setAmount(balance[selectedCurrency.toLowerCase() as keyof Balance] || "0.00")}
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
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Request Money</h2>
        <p className="text-gray-600 dark:text-gray-400">Generate payment links using your linked accounts</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="space-y-6">
          {/* Linked Accounts Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Where People Can Send You Money</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">These are the accounts people can use to send you money directly</p>
            <LinkedAccountsSection />
          </div>

          {/* Generate Payment Link */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Payment Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>

              <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                Generate Payment Link
              </Button>
            </div>
          </div>
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
