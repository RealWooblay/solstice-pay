// PWA utilities
declare global {
    interface Window {
        deferredPrompt?: BeforeInstallPromptEvent;
    }
}

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function registerServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    }
}

export function showInstallPrompt() {
    if (typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window) {
        const promptEvent = window.deferredPrompt;
        if (promptEvent) {
            promptEvent.prompt();
            window.deferredPrompt = undefined;
        }
    }
}

export function isPWAInstalled(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
}

export function isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
