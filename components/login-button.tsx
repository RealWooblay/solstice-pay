"use client";

import { usePrivy } from '@privy-io/react-auth';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function LoginButton() {
    const { ready, authenticated, login, logout } = usePrivy();

    const loggedIn = ready && authenticated;

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