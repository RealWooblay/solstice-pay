import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Topbar } from "@/components/Topbar";
// import { BottomNav } from "@/components/BottomNav";
import { InstallPWAHint } from "@/components/InstallPWAHint";
import { registerServiceWorker } from "@/lib/pwa";
import AuthGate from "@/components/AuthGate";
import Providers from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SolsticePay - Get paid in crypto, like a bank",
  description: "Receive PYUSD payments to your phone number or email - no wallet needed, just like getting paid at a bank",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Register service worker on client side
  if (typeof window !== "undefined") {
    registerServiceWorker();
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
            <ThemeProvider defaultTheme="dark">
              <AuthGate />
              <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <Topbar />
                <main className="pb-0">
                  <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
                    {children}
                  </div>
                </main>
                {/* <BottomNav /> */}
                <InstallPWAHint />
              </div>
            </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
