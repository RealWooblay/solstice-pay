export interface AliasResolution {
  alias: string;
  address: string;
  verified: {
    email: boolean;
    phone: boolean;
    github: boolean;
    twitter: boolean;
  };
  isTeam: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface Transaction {
  id: string;
  dir: 'in' | 'out';
  counterparty: string;
  amount: string;
  note?: string;
  status: 'pending' | 'success' | 'failed';
  time: string;
  txHash?: string;
}

export interface Balance {
  pyusd: string;
}

export interface Profile {
  alias: string;
  address: string;
  verified: {
    email: boolean;
    phone: boolean;
    github: boolean;
    twitter: boolean;
  };
  stats: {
    totalReceived: string;
    uniquePayers: number;
    streak: number;
  };
  isTeam: boolean;
  teamMembers?: Array<{
    address: string;
    alias?: string;
    share: number;
  }>;
}

export interface TeamMember {
  address: string;
  alias?: string;
  share: number;
}

// Mock data
const mockAliases = new Map<string, AliasResolution>([
  ['alice@email.com', {
    alias: 'alice@email.com',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    verified: { email: true, phone: false, github: false, twitter: false },
    isTeam: false,
    riskLevel: 'low'
  }],
  ['@bob', {
    alias: '@bob',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    verified: { email: false, phone: false, github: true, twitter: false },
    isTeam: false,
    riskLevel: 'low'
  }],
  ['+1234567890', {
    alias: '+1234567890',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    verified: { email: false, phone: true, github: false, twitter: false },
    isTeam: false,
    riskLevel: 'medium'
  }],
  ['@hack-team', {
    alias: '@hack-team',
    address: '0xteam1234567890abcdef1234567890abcdef123',
    verified: { email: true, phone: true, github: true, twitter: false },
    isTeam: true,
    riskLevel: 'low'
  }]
]);

const mockTransactions = new Map<string, Transaction[]>([
  ['alice@email.com', [
    { id: '1', dir: 'out', counterparty: '@bob', amount: '25.00', note: 'Design work', status: 'success', time: '2m ago', txHash: '0xabc123' },
    { id: '2', dir: 'in', counterparty: '@mike', amount: '50.00', note: 'Consulting', status: 'success', time: '1h ago', txHash: '0xdef456' }
  ]],
  ['@bob', [
    { id: '3', dir: 'in', counterparty: 'alice@email.com', amount: '25.00', note: 'Design work', status: 'success', time: '2m ago', txHash: '0xabc123' }
  ]],
  ['@hack-team', [
    { id: '4', dir: 'in', counterparty: 'sponsor@company.com', amount: '1000.00', note: 'Hackathon prize', status: 'success', time: '1d ago', txHash: '0xteam789' }
  ]]
]);

// Mock functions
export async function resolveAlias(alias: string): Promise<AliasResolution | null> {
  // TODO: resolve alias against on-chain registry or API
  await new Promise(r => setTimeout(r, 700));

  const resolution = mockAliases.get(alias);
  if (resolution) return resolution;

  // Generate mock for new aliases
  const isEmail = alias.includes('@');
  const isPhone = /^\+/.test(alias);
  const isHandle = alias.startsWith('@');

  return {
    alias,
    address: `0x${Math.random().toString(16).slice(2, 42)}`,
    verified: {
      email: isEmail && Math.random() > 0.3,
      phone: isPhone && Math.random() > 0.3,
      github: isHandle && Math.random() > 0.3,
      twitter: isHandle && Math.random() > 0.3
    },
    isTeam: false,
    riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
  };
}

export async function getBalance(): Promise<Balance> {
  // TODO: read PYUSD balance via wallet
  await new Promise(r => setTimeout(r, 300));
  return { pyusd: "1234.56" };
}

export async function sendPayment(alias: string, amount: string, note?: string): Promise<{ ok: boolean; txHash?: string }> {
  // TODO: approve/transfer PYUSD (ERC20) using wallet
  await new Promise(r => setTimeout(r, 1200));

  const success = Math.random() > 0.1;
  if (success) {
    const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;

    // Add to mock history
    const tx: Transaction = {
      id: Date.now().toString(),
      dir: 'out',
      counterparty: alias,
      amount,
      note,
      status: 'success',
      time: 'now',
      txHash
    };

    const existing = mockTransactions.get(alias) || [];
    mockTransactions.set(alias, [tx, ...existing]);

    return { ok: true, txHash };
  }

  return { ok: false };
}

export async function getHistory(alias: string): Promise<Transaction[]> {
  // TODO: fetch transaction history from blockchain
  await new Promise(r => setTimeout(r, 500));
  return mockTransactions.get(alias) || [];
}

export async function setAlias(alias: string, address: string): Promise<boolean> {
  // TODO: setAlias(bytes32 aliasHash, chainId, token, recipient)
  await new Promise(r => setTimeout(r, 800));
  return true;
}

export async function setRoutingRule(alias: string, members: TeamMember[]): Promise<boolean> {
  // TODO: setRoutingRule with encoded splits
  await new Promise(r => setTimeout(r, 800));
  return true;
}

export async function getProfile(alias: string): Promise<Profile | null> {
  // TODO: fetch profile from blockchain/API
  await new Promise(r => setTimeout(r, 600));

  const resolution = await resolveAlias(alias);
  if (!resolution) return null;

  const history = await getHistory(alias);
  const totalReceived = history
    .filter(tx => tx.dir === 'in' && tx.status === 'success')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
    .toFixed(2);

  const uniquePayers = new Set(history.filter(tx => tx.dir === 'in').map(tx => tx.counterparty)).size;

  return {
    ...resolution,
    stats: {
      totalReceived,
      uniquePayers,
      streak: Math.floor(Math.random() * 30) + 1
    },
    teamMembers: resolution.isTeam ? [
      { address: '0xmember1', alias: '@alice', share: 40 },
      { address: '0xmember2', alias: '@bob', share: 35 },
      { address: '0xmember3', alias: '@charlie', share: 25 }
    ] : undefined
  };
}

export async function verifyEmail(email: string): Promise<boolean> {
  // TODO: integrate Privy or SIWE + email verification
  await new Promise(r => setTimeout(r, 1000));
  return true;
}

export async function verifyPhone(phone: string): Promise<boolean> {
  // TODO: integrate Privy or SIWE + phone verification
  await new Promise(r => setTimeout(r, 1000));
  return true;
}

export async function connectGithub(): Promise<boolean> {
  // TODO: integrate Privy or SIWE + GitHub OAuth
  await new Promise(r => setTimeout(r, 1000));
  return true;
}

export async function connectTwitter(): Promise<boolean> {
  // TODO: integrate Privy or SIWE + Twitter OAuth
  await new Promise(r => setTimeout(r, 1000));
  return true;
}
