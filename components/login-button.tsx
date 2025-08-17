"use client";

import { usePrivy } from '@privy-io/react-auth';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function LoginButton() {
    const { ready, authenticated, login, logout, user } = usePrivy();
    const loggedIn = ready && authenticated;

    if(loggedIn) {
        console.log(user?.smartWallet?.address);
    }

    return (
        <Button
            variant={loggedIn ? "outline" : "default"}
            disabled={!ready}
            onClick={loggedIn ? logout : login}
            className="w-full text-white"
        >
            {authenticated ? 'Logout' : 'Login'}
        </Button >
    );
}