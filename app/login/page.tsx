"use client";

import { motion } from "framer-motion";
import { LoginButton } from "@/components/login-button";

export default function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center space-y-6">
                <h1 className="text-3xl font-semibold">Welcome</h1>
                <p className="text-gray-600 dark:text-gray-400">Login to access SolsticePay</p>
                <LoginButton />
                <p className="text-xs text-gray-500 dark:text-gray-500">You’ll replace this with your modal.</p>
            </motion.div>
        </div>
    );
}
