export function formatAddress(address: string, start = 6, end = 4): string {
    if (!address || address.length < start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatAmount(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
}

export function formatCurrency(amount: string | number): string {
    return `$${formatAmount(amount)}`;
}

export function formatTimeAgo(time: string): string {
    if (time === 'now') return 'Just now';
    return time;
}

export function maskEmail(email: string): string {
    if (!email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local[0]}***@${domain}`;
}

export function maskPhone(phone: string): string {
    if (!phone.startsWith('+')) return phone;
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    return `+${digits.slice(0, 2)}***${digits.slice(-2)}`;
}
