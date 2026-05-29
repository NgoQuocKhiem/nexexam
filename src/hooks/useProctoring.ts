'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export const useProctoring = (enabled: boolean) => {
  const [violations, setViolations] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const violationRef = useRef<string[]>([]);

  const addViolation = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const fullMsg = `[${timestamp}] ${msg}`;
    violationRef.current = [...violationRef.current, fullMsg];
    setViolations(violationRef.current);
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      addViolation('Rời khỏi tab bài thi');
    }
  }, [addViolation]);

  const handleBlur = useCallback(() => {
    addViolation('Mất tiêu điểm (Chuyển cửa sổ)');
  }, [addViolation]);

  const handleFullscreenChange = useCallback(() => {
    const isFull = !!document.fullscreenElement;
    setIsFullscreen(isFull);
    if (!isFull) {
      addViolation('Thoát chế độ toàn màn hình');
    }
  }, [addViolation]);

  const preventDefault = useCallback((e: Event) => {
    e.preventDefault();
    addViolation(`Hành động bị chặn: ${e.type}`);
  }, [addViolation]);

  useEffect(() => {
    if (!enabled) {
      violationRef.current = [];
      setViolations([]);
      return;
    }

    // Initial check
    setIsFullscreen(!!document.fullscreenElement);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Restrictions
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('paste', preventDefault);
    document.addEventListener('cut', preventDefault);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('paste', preventDefault);
      document.removeEventListener('cut', preventDefault);
    };
  }, [enabled, handleVisibilityChange, handleBlur, handleFullscreenChange, preventDefault]);

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error('Error enabling fullscreen:', err);
    }
  };

  return { 
    violations, 
    isFullscreen, 
    enterFullscreen 
  };
};
