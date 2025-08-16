'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Bank, DollarSign, ArrowRight, CheckCircle } from "lucide-react";

interface OnrampModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PAYMENT_METHODS = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, fee: '2.5%', time: 'Instant' },
    { id: 'bank', name: 'Bank Transfer', icon: Bank, fee: '0.5%', time: '1-3 days' },
    { id: 'ach', name: 'ACH Transfer', icon: DollarSign, fee: '0.1%', time: '3-5 days' }
];

export default function OnrampModal({ open, onOpenChange }: OnrampModalProps) {
    const [step, setStep] = useState<'amount' | 'payment' | 'confirm' | 'success'>('amount');
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAmountSubmit = () => {
        if (amount && parseFloat(amount) >= 10) {
            setStep('payment');
        }
    };

    const handlePaymentSelect = (methodId: string) => {
        setSelectedMethod(methodId);
        setStep('confirm');
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStep('success');
        setIsProcessing(false);
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state after delay to allow animation
        setTimeout(() => {
            setStep('amount');
            setAmount('');
            setSelectedMethod('');
        }, 300);
    };

    const getFee = () => {
        const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
        if (!method || !amount) return 0;
        const rate = parseFloat(method.fee.replace('%', '')) / 100;
        return parseFloat(amount) * rate;
    };

    const getTotal = () => {
        return parseFloat(amount || '0') + getFee();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-center">
                        Buy PYUSD
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Amount Step */}
                    <AnimatePresence mode="wait">
                        {step === 'amount' && (
                            <motion.div
                                key="amount"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="text-center space-y-2">
                                    <p className="text-gray-600 dark:text-gray-400">How much PYUSD would you like to buy?</p>
                                    <div className="text-2xl font-light text-gray-900 dark:text-white">
                                        $1.00 = 1.00 PYUSD
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Amount (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="pl-8 text-lg"
                                            min="10"
                                            step="0.01"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Minimum: $10.00
                                    </p>
                                </div>

                                <Button
                                    onClick={handleAmountSubmit}
                                    disabled={!amount || parseFloat(amount) < 10}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </motion.div>
                        )}

                        {/* Payment Method Step */}
                        {step === 'payment' && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <p className="text-center text-gray-600 dark:text-gray-400">
                                    Select your payment method
                                </p>

                                <div className="space-y-3">
                                    {PAYMENT_METHODS.map((method) => {
                                        const Icon = method.icon;
                                        return (
                                            <Card
                                                key={method.id}
                                                className="cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                                onClick={() => handlePaymentSelect(method.id)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Fee: {method.fee} • {method.time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Confirmation Step */}
                        {step === 'confirm' && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Amount</span>
                                            <span className="text-gray-900 dark:text-white">${amount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Fee</span>
                                            <span className="text-gray-900 dark:text-white">${getFee().toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-medium">
                                            <span className="text-gray-900 dark:text-white">Total</span>
                                            <span className="text-gray-900 dark:text-white">${getTotal().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                        You'll receive approximately <span className="font-medium text-gray-900 dark:text-white">{amount} PYUSD</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleConfirm}
                                    disabled={isProcessing}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Purchase'
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        {/* Success Step */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-4"
                            >
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Purchase Successful!
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Your PYUSD will be available in your account shortly.
                                    </p>
                                </div>

                                <Button onClick={handleClose} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                                    Done
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
