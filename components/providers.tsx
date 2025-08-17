"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import {SmartWalletsProvider} from '@privy-io/react-auth/smart-wallets';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
            clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
            config={{
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets'
                    }
                },
            }}
        >
            <SmartWalletsProvider>
                {children}
            </SmartWalletsProvider>
        </PrivyProvider>
    );
}