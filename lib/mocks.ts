// Mock data and services for AliasPay
// TODO: Replace with real blockchain calls

export interface AliasResolution {
  alias: string;
  address: string;
  type: 'email' | 'phone' | 'handle';
  verified: boolean;
  routingRule?: TeamMember[];
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  note?: string;
  timestamp: string;
  status: 'pending' | 'success' | 'failed';
  txHash?: string;
}

export interface Balance {
  pyusd: string;
  usdc: string;
  eth: string;
}

export interface Profile {
  alias: string;
  address: string;
  email?: string;
  phone?: string;
  github?: string;
  twitter?: string;
  verified: {
    email: boolean;
    phone: boolean;
    github: boolean;
    twitter: boolean;
  };
  totalReceived: string;
  uniquePayers: number;
  streak: number;
  routingRule?: TeamMember[];
}

export interface TeamMember {
  address: string;
  alias?: string;
  share: number;
}

export interface Team {
  id: string;
  alias: string;
  members: TeamMember[];
  createdAt: string;
  totalReceived: string;
}

// Mock data storage
const mockAliases = new Map<string, AliasResolution>([
  ['alice@email.com', {
    alias: 'alice@email.com',
    address: '0x1234567890123456789012345678901234567890',
    type: 'email',
    verified: true
  }],
  ['+1234567890', {
    alias: '+1234567890',
    address: '0x2345678901234567890123456789012345678901',
    type: 'phone',
    verified: true
  }],
  ['@alice', {
    alias: '@alice',
    address: '0x3456789012345678901234567890123456789012',
    type: 'handle',
    verified: true
  }]
]);

const mockTransactions = new Map<string, Transaction[]>([
  ['alice@email.com', [
    {
      id: '1',
      from: '0x4567890123456789012345678901234567890123',
      to: '0x1234567890123456789012345678901234567890',
      amount: '100.00',
      note: 'Lunch payment',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'success',
      txHash: '0xabc123...'
    }
  ]]
]);

// Team storage
const mockTeams = new Map<string, Team>([
  ['@team1', {
    id: '1',
    alias: '@team1',
    members: [
      { address: '0x1234567890123456789012345678901234567890', alias: 'alice@email.com', share: 50 },
      { address: '0x2345678901234567890123456789012345678901', alias: 'bob@email.com', share: 50 }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    totalReceived: '500.00'
  }]
]);

// Mock functions
export async function resolveAlias(alias: string): Promise<AliasResolution | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockAliases.get(alias) || null;
}

export async function getBalance(): Promise<Balance> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    pyusd: '1250.75',
    usdc: '500.00',
    eth: '0.25'
  };
}

export async function sendPayment(alias: string, amount: string, note?: string): Promise<{ ok: boolean; txHash?: string }> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success
  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  
  // Add to transaction history
  const existing = mockTransactions.get(alias) || [];
  const newTx: Transaction = {
    id: Date.now().toString(),
    from: '0x4567890123456789012345678901234567890123',
    to: alias,
    amount,
    note,
    timestamp: new Date().toISOString(),
    status: 'success',
    txHash
  };
  
  mockTransactions.set(alias, [newTx, ...existing]);
  
  return { ok: true, txHash };
}

export async function getHistory(alias: string): Promise<Transaction[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockTransactions.get(alias) || [];
}

export async function setAlias(alias: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate success
  return true;
}

export async function setRoutingRule(alias: string, members: TeamMember[]): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Create new team
  const newTeam: Team = {
    id: Date.now().toString(),
    alias,
    members,
    createdAt: new Date().toISOString(),
    totalReceived: '0.00'
  };
  
  mockTeams.set(alias, newTeam);
  
  // Update alias with routing rule
  const existing = mockAliases.get(alias);
  if (existing) {
    existing.routingRule = members;
    mockAliases.set(alias, existing);
  }
  
  return true;
}

export async function getProfile(alias: string): Promise<Profile | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const resolution = mockAliases.get(alias);
  if (!resolution) return null;
  
  return {
    alias,
    address: resolution.address,
    email: alias.includes('@') ? alias : undefined,
    phone: alias.startsWith('+') ? alias : undefined,
    github: alias.startsWith('@') ? alias : undefined,
    twitter: undefined,
    verified: {
      email: alias.includes('@'),
      phone: alias.startsWith('+'),
      github: alias.startsWith('@'),
      twitter: false
    },
    totalReceived: '1250.75',
    uniquePayers: 3,
    streak: 5,
    routingRule: resolution.routingRule
  };
}

export async function verifyEmail(email: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate verification success
  return true;
}

export async function verifyPhone(phone: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate verification success
  return true;
}

export async function connectGithub(): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate connection success
  return true;
}

export async function connectTwitter(): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate connection success
  return true;
}

// Team management functions
export async function getTeams(): Promise<Team[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return Array.from(mockTeams.values());
}

export async function getTeam(alias: string): Promise<Team | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockTeams.get(alias) || null;
}

export async function deleteTeam(alias: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockTeams.delete(alias);
}
