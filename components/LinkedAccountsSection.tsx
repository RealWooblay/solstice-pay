"use client"

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Github, Twitter, Plus, Loader2 } from "lucide-react";

interface LinkedAccount {
    type: string;
    identifier: string;
}

export default function LinkedAccountsSection() {
    const { user, linkEmail, linkPhone, linkGoogle, linkTwitter, linkDiscord, linkGithub } = usePrivy();
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
    const [isLinking, setIsLinking] = useState<string | null>(null);
    const [showLinkOptions, setShowLinkOptions] = useState(false);

    useEffect(() => {
        if (user) {
            // Extract linked accounts from Privy user object
            const accounts: LinkedAccount[] = [];

            if (user.email?.address) {
                accounts.push({
                    type: 'email',
                    identifier: user.email.address
                });
            }

            if (user.phone?.number) {
                accounts.push({
                    type: 'phone',
                    identifier: user.phone.number
                });
            }

            if (user.google?.email) {
                accounts.push({
                    type: 'google',
                    identifier: user.google.email
                });
            }

            if (user.twitter?.username) {
                accounts.push({
                    type: 'twitter',
                    identifier: user.twitter.username
                });
            }

            if (user.discord?.username) {
                accounts.push({
                    type: 'discord',
                    identifier: user.discord.username
                });
            }

            if (user.github?.username) {
                accounts.push({
                    type: 'github',
                    identifier: user.github.username
                });
            }

            setLinkedAccounts(accounts);
        }
    }, [user]);

    const handleLinkAccount = async (type: string) => {
        setIsLinking(type);
        try {
            switch (type) {
                case 'email':
                    await linkEmail();
                    break;
                case 'phone':
                    await linkPhone();
                    break;
                case 'google':
                    await linkGoogle();
                    break;
                case 'twitter':
                    await linkTwitter();
                    break;
                case 'discord':
                    await linkDiscord();
                    break;
                case 'github':
                    await linkGithub();
                    break;
            }
        } catch (error) {
            console.error(`Failed to link ${type}:`, error);
        } finally {
            setIsLinking(null);
        }
    };

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'email':
                return <Mail className="h-5 w-5" />;
            case 'phone':
                return <Phone className="h-5 w-5" />;
            case 'google':
                return <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>;
            case 'twitter':
                return <Twitter className="h-5 w-5" />;
            case 'discord':
                return <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">D</div>;
            case 'github':
                return <Github className="h-5 w-5" />;
            default:
                return <div className="w-5 h-5 bg-gray-500 rounded-full" />;
        }
    };

    const getAccountTypeLabel = (type: string) => {
        switch (type) {
            case 'email':
                return 'Email';
            case 'phone':
                return 'Phone';
            case 'google':
                return 'Google';
            case 'twitter':
                return 'Twitter';
            case 'discord':
                return 'Discord';
            case 'github':
                return 'GitHub';
            default:
                return type;
        }
    };

    const getAccountColor = (type: string) => {
        switch (type) {
            case 'email':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'phone':
                return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            case 'google':
                return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            case 'twitter':
                return 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400';
            case 'discord':
                return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
            case 'github':
                return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
            default:
                return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
        }
    };

    if (!user) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Please log in to view your linked accounts</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Existing Linked Accounts */}
            {linkedAccounts.length > 0 ? (
                <div className="space-y-3">
                    {linkedAccounts.map((account, index) => (
                        <Card key={index} className="border-gray-200 dark:border-gray-700">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getAccountColor(account.type)}`}>
                                            {getAccountIcon(account.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {getAccountTypeLabel(account.type)}
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {account.identifier}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {/* Removed verification property */}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No payment accounts linked yet</p>
                    <p className="text-sm">Link your accounts so people can send you money</p>
                </div>
            )}

            {/* Link New Account Button */}
            <div className="pt-4">
                <Button
                    onClick={() => setShowLinkOptions(!showLinkOptions)}
                    variant="outline"
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Account
                </Button>
            </div>

            {/* Link Options */}
            {showLinkOptions && (
                <div className="pt-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Choose account type to receive payments:</h4>

                    {!linkedAccounts.find(acc => acc.type === 'email') && (
                        <Button
                            onClick={() => handleLinkAccount('email')}
                            variant="outline"
                            className="w-full justify-start"
                            disabled={isLinking === 'email'}
                        >
                            {isLinking === 'email' ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Mail className="h-4 w-4 mr-2" />
                            )}
                            Link Email
                        </Button>
                    )}

                    {!linkedAccounts.find(acc => acc.type === 'phone') && (
                        <Button
                            onClick={() => handleLinkAccount('phone')}
                            variant="outline"
                            className="w-full justify-start"
                            disabled={isLinking === 'phone'}
                        >
                            {isLinking === 'phone' ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Phone className="h-4 w-4 mr-2" />
                            )}
                            Link Phone
                        </Button>
                    )}

                    {!linkedAccounts.find(acc => acc.type === 'google') && (
                        <Button
                            onClick={() => handleLinkAccount('google')}
                            variant="outline"
                            className="w-full justify-start"
                            disabled={isLinking === 'google'}
                        >
                            {isLinking === 'google' ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">G</div>
                            )}
                            Link Google
                        </Button>
                    )}

                    {!linkedAccounts.find(acc => acc.type === 'twitter') && (
                        <Button
                            onClick={() => handleLinkAccount('twitter')}
                            variant="outline"
                            className="w-full justify-start"
                            disabled={isLinking === 'twitter'}
                        >
                            {isLinking === 'twitter' ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Twitter className="h-4 w-4 mr-2" />
                            )}
                            Link Twitter
                        </Button>
                    )}

                    {!linkedAccounts.find(acc => acc.type === 'discord') && (
                        <Button
                            onClick={() => handleLinkAccount('discord')}
                            variant="outline"
                            className="w-full justify-start"
                            disabled={isLinking === 'discord'}
                        >
                            {isLinking === 'discord' ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">D</div>
                            )}
                            Link Discord
                        </Button>
                    )}

                    {!linkedAccounts.find(acc => acc.type === 'github') && (
                        <Button
                            onClick={() => handleLinkAccount('github')}
                            variant="outline"
                            className="w-full justify-start"
                            disabled={isLinking === 'github'}
                        >
                            {isLinking === 'github' ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Github className="h-4 w-4 mr-2" />
                            )}
                            Link GitHub
                        </Button>
                    )}

                    {linkedAccounts.length >= 6 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            All account types are already linked
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
