import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";
import { InstallPWAHint } from "@/components/InstallPWAHint";
import { registerServiceWorker } from "@/lib/pwa";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AliasPay - Pay anyone, by alias",
  description: "Send PYUSD to anyone using their email, phone, or handle on Base",
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
        <ThemeProvider defaultTheme="dark">
          <div className="min-h-screen bg-background text-foreground">
            <Topbar />
            <main className="pb-20 md:pb-0 md:pl-64">
              <div className="container mx-auto max-w-screen-sm px-4 py-6 md:max-w-2xl md:py-8">
                {children}
              </div>
            </main>
            <BottomNav />
            <InstallPWAHint />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
