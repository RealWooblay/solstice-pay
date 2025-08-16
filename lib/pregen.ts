"use server";

import { PrivyClient } from '@privy-io/server-auth';
import { logError } from './log';

const privy = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID, process.env.PRIVY_APP_SECRET);

export async function pregenerateEmailWallet(email: string): Promise<string | undefined> {
    try {
        const user = await privy.importUser({
            linkedAccounts: [{ type: 'email', address: email }],
            wallets: [
                { chainType: 'ethereum', createSmartWallet: true, policyIds: [] },
            ],
        });
        return user.smartWallet?.address;
    } catch (error) {
        logError(error);
        return undefined;
    }
}

export async function pregeneratePhoneWallet(phone: string): Promise<string | undefined> {
    try {
        const user = await privy.importUser({
            linkedAccounts: [{ type: 'phone', number: phone }],
            wallets: [
                { chainType: 'ethereum', createSmartWallet: true, policyIds: [] },
            ],
        });
        return user.smartWallet?.address;
    } catch (error) {
        logError(error);
        return undefined;
    }
}

export async function pregenerateGoogleWallet(email: string): Promise<string | undefined> {
    try {
        const user = await privy.importUser({
            linkedAccounts: [{ type: 'google_oauth', subject: email, email: email, name: email }],
            wallets: [
                { chainType: 'ethereum', createSmartWallet: true, policyIds: [] },
            ],
        });
        return user.smartWallet?.address;
    } catch (error) {
        logError(error);
        return undefined;
    }
}

export async function pregenerateTwitterWallet(username: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://api.x.com/2/users/by/username/${username}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.X_BEARER_TOKEN}`,
            },
        });
        if (!response.ok) {
            logError(`Failed to fetch Twitter user: ${response.statusText}`);
            return undefined;
        }
        const data = (await response.json()).data;

        const user = await privy.importUser({
            linkedAccounts: [{ type: 'twitter_oauth', subject: data.id, username: data.username, name: data.name }],
            wallets: [
                { chainType: 'ethereum', createSmartWallet: true, policyIds: [] },
            ],
        });
        return user.smartWallet?.address;
    } catch (error) {
        logError(error);
        return undefined;
    }
}

export async function pregenerateDiscordWallet(username: string) {
    try {
        const user = await privy.importUser({
            linkedAccounts: [{ type: 'discord_oauth', subject: username, username: username, email: username }],
            createEthereumWallet: true,
            wallets: [
                { chainType: 'ethereum', createSmartWallet: true, policyIds: [] },
            ],
        });
        return user.smartWallet?.address;
    } catch (error) {
        logError(error);
        return undefined;
    }
}