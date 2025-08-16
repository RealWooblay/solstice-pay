'use client'

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGate() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn && pathname !== '/login') {
            router.replace('/login');
        }
        if (isLoggedIn && pathname === '/login') {
            router.replace('/');
        }
    }, [pathname, router]);

    return null;
}
