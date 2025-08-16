'use client'

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
    
export default function AuthGate() {
    const { ready, authenticated, user } = usePrivy();

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!ready) return;
        if (!authenticated && !user && pathname !== '/login') {
            router.replace('/login');
        }
        if (authenticated && pathname === '/login') {
            router.replace('/');
        }
    }, [pathname, router, ready, authenticated, user]);

    return null;
}
