function callerName(): string {
    const stack = new Error().stack;
    return stack?.split('\n')[3]?.match(/at\s+(\w+)/)?.[1] || 'unknown';
}

export function logInfo(info: any): void {
    const caller = callerName();
    console.info(`INFO (${caller}): ${info}`);
}

export function logWarning(warning: any): void {
    const caller = callerName();
    console.warn(`WARNING (${caller}): ${warning}`);
}

export function logError(error: any): void {
    const caller = callerName();
    console.error(`ERROR (${caller}): ${error}`);
}