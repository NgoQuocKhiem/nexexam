'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface GuardContextType {
  recordViolation: (type: string) => void;
  isBanned: boolean;
}

const GuardContext = createContext<GuardContextType | undefined>(undefined);

const BAN_THRESHOLD = 5;
const BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const GuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [violationCount, setViolationCount] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for existing ban
    const banUntil = localStorage.getItem('guard_ban_until');
    if (banUntil) {
      if (new Date().getTime() < parseInt(banUntil)) {
        setIsBanned(true);
        if (pathname !== '/banned') {
          router.replace('/banned');
        }
      } else {
        localStorage.removeItem('guard_ban_until');
        localStorage.removeItem('guard_violations');
      }
    }

    // Load violation count
    const savedViolations = localStorage.getItem('guard_violations');
    if (savedViolations) {
      setViolationCount(parseInt(savedViolations));
    }
  }, [pathname, router]);

  const recordViolation = useCallback((type: string) => {
    setViolationCount((prev) => {
      const newCount = prev + 1;
      localStorage.setItem('guard_violations', newCount.toString());

      if (newCount >= BAN_THRESHOLD) {
        const banTime = new Date().getTime() + BAN_DURATION_MS;
        localStorage.setItem('guard_ban_until', banTime.toString());
        setIsBanned(true);
        router.replace('/banned');
      }
      return newCount;
    });
    console.warn(`Guard Violation: ${type}`);
  }, [router]);

  // Block Keyboard Shortcuts globally
  useEffect(() => {
      const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation('RIGHT_CLICK_MENU');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        recordViolation('F12_KEY');
      }
      // Ctrl+Shift+I, J, C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        recordViolation('DEVTOOLS_SHORTCUT');
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        recordViolation('VIEW_SOURCE');
      }
      // Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        recordViolation('SAVE_PAGE');
      }
      // Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        recordViolation('PRINT_PAGE');
      }
    };

    // Advanced DevTools detection (debugger loop)
    // This makes using DevTools nearly impossible as it pauses execution
    const devToolsTrap = setInterval(() => {
      const startTime = performance.now();
      debugger;
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        // If debugger paused the execution, it means DevTools is likely open
        recordViolation('DEVTOOLS_DETECTED_DEBUGGER');
      }
    }, 2000);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(devToolsTrap);
    };
  }, [recordViolation]);

  return (
    <GuardContext.Provider value={{ recordViolation, isBanned }}>
      {children}
    </GuardContext.Provider>
  );
};

export const useGuard = () => {
  const context = useContext(GuardContext);
  if (!context) throw new Error('useGuard must be used within a GuardProvider');
  return context;
};
