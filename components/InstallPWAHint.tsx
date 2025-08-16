"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { isPWAInstalled, isIOS } from "@/lib/pwa";

export function InstallPWAHint() {
  const [show, setShow] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Only show on mobile and if not already installed
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const installed = isPWAInstalled();
      const ios = isIOS();
      
      setIsIOSDevice(ios);
      
      if (isMobile && !installed) {
        // Delay showing the hint
        const timer = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-40 md:hidden"
      >
        <div className="bg-background border border-border rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Download className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Install AliasPay</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {isIOSDevice 
                  ? "Add to home screen for the best experience"
                  : "Install as an app for quick access"
                }
              </p>
              
              {isIOSDevice ? (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs">1</span>
                    </span>
                    <span>Tap the share button</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs">2</span>
                    </span>
                    <span>Select "Add to Home Screen"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs">3</span>
                    </span>
                    <span>Tap "Add"</span>
                  </div>
                </div>
              ) : (
                <Button size="sm" className="w-full">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Install App
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShow(false)}
              className="flex-shrink-0 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
