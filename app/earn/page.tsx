"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Search, DollarSign, BarChart3, ArrowRight, Activity, Zap } from "lucide-react";

const protocols = [
    {
        name: "Aave",
        description: "Lend and borrow with variable rates",
        apy: "3.2%",
        tvl: "$12.4B",
        risk: "Low",
        tag: "Lending",
        url: "https://aave.com"
    },
    {
        name: "Solstice Yield",
        description: "Optimized yield strategies on Base",
        apy: "8.7%",
        tvl: "$89M",
        risk: "Medium",
        tag: "Yield",
        url: "https://solsticelabs.io"
    },
    {
        name: "Compound",
        description: "Algorithmic interest rate protocol",
        apy: "2.8%",
        tvl: "$2.1B",
        risk: "Low",
        tag: "Lending",
        url: "https://compound.finance"
    },
    {
        name: "Yearn Finance",
        description: "Automated yield optimization",
        apy: "12.4%",
        tvl: "$450M",
        risk: "High",
        tag: "Yield",
        url: "https://yearn.finance"
    }
];

const stocks = [
    {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: "$189.84",
        change: "+2.34%",
        changeValue: "+$4.34",
        marketCap: "$2.98T",
        sector: "Technology"
    },
    {
        symbol: "TSLA",
        name: "Tesla Inc.",
        price: "$248.50",
        change: "-1.23%",
        changeValue: "-$3.10",
        marketCap: "$789B",
        sector: "Automotive"
    },
    {
        symbol: "MSFT",
        name: "Microsoft Corp.",
        price: "$378.85",
        change: "+0.87%",
        changeValue: "+$3.27",
        marketCap: "$2.81T",
        sector: "Technology"
    },
    {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: "$142.56",
        change: "+1.45%",
        changeValue: "+$2.04",
        marketCap: "$1.79T",
        sector: "Technology"
    },
    {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        price: "$145.80",
        change: "-0.67%",
        changeValue: "-$0.98",
        marketCap: "$1.51T",
        sector: "Consumer"
    },
    {
        symbol: "NVDA",
        name: "NVIDIA Corp.",
        price: "$485.09",
        change: "+3.21%",
        changeValue: "+$15.09",
        marketCap: "$1.19T",
        sector: "Technology"
    }
];

export default function EarnPage() {
    const [activeTab, setActiveTab] = useState<'defi' | 'stocks'>('defi');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStocks = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-3">
                    Invest & Earn
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Put your money to work with DeFi protocols and tokenized stocks
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('defi')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'defi'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <Zap className="h-4 w-4 inline mr-2" />
                        DeFi
                    </button>
                    <button
                        onClick={() => setActiveTab('stocks')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'stocks'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <BarChart3 className="h-4 w-4 inline mr-2" />
                        Stocks
                    </button>
                </div>
            </div>

            {/* DeFi Protocols Tab */}
            {activeTab === 'defi' && (
                <motion.div
                    key="defi"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            DeFi Protocols
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Access the best yields across trusted DeFi protocols
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {protocols.map((protocol, index) => (
                            <motion.div
                                key={protocol.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                                            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                {protocol.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {protocol.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {protocol.description}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                                        {protocol.tag}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center">
                                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">{protocol.apy}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">APY</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{protocol.tvl}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">TVL</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-xs font-medium px-2 py-1 rounded ${protocol.risk === 'Low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                                protocol.risk === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                            }`}>
                                            {protocol.risk}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Risk</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => window.open(protocol.url, '_blank')}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
                                >
                                    Start Earning
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Stocks Tab */}
            {activeTab === 'stocks' && (
                <motion.div
                    key="stocks"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Tokenized Stocks
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Trade real stocks as tokens with instant settlement
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search stocks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Market Overview */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mb-3">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$2.98T</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Market Cap</p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3">
                                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">+1.2%</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Change</p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3">
                                    <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">6</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Stocks</p>
                            </div>
                        </div>
                    </div>

                    {/* Stocks Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <th className="text-left p-4 font-medium text-gray-900 dark:text-white text-sm">Stock</th>
                                        <th className="text-right p-4 font-medium text-gray-900 dark:text-white text-sm">Price</th>
                                        <th className="text-right p-4 font-medium text-gray-900 dark:text-white text-sm">Change</th>
                                        <th className="text-right p-4 font-medium text-gray-900 dark:text-white text-sm">Market Cap</th>
                                        <th className="text-right p-4 font-medium text-gray-900 dark:text-white text-sm">Sector</th>
                                        <th className="text-right p-4 font-medium text-gray-900 dark:text-white text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStocks.map((stock, index) => (
                                        <tr key={stock.symbol} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white">{stock.price}</p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className={`inline-flex items-center space-x-2 ${stock.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {stock.change.startsWith('+') ? (
                                                        <TrendingUp className="h-4 w-4" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4" />
                                                    )}
                                                    <span className="font-medium">{stock.change}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{stock.marketCap}</p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                                                    {stock.sector}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                                                    Trade
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
