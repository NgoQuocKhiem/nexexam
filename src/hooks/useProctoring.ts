'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useGuard } from '@/context/GuardProvider';

export const useProctoring = (enabled: boolean) => {
  const [violations, setViolations] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const violationRef = useRef<string[]>([]);
  const { recordViolation } = useGuard();

  const addViolation = useCallback((msg: string, isSecurity?: boolean) => {
    const timestamp = new Date().toLocaleTimeString();
    const fullMsg = `[${timestamp}] ${msg}`;
    violationRef.current = [...violationRef.current, fullMsg];
    setViolations(violationRef.current);

    if (isSecurity) {
      recordViolation(msg);
    }
  }, [recordViolation]);

  // DevTools detection via window size
  const checkDevTools = useCallback(() => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      addViolation('Phát hiện mở công cụ lập trình (Console)', true);
    }
  }, [addViolation]);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(checkDevTools, 2000);
    return () => clearInterval(interval);
  }, [enabled, checkDevTools]);

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
    addViolation(`Hành động bị chặn: ${e.type}`, true);
  }, [addViolation]);

  useEffect(() => {
    if (!enabled) {
      violationRef.current = [];
      setViolations([]);
      return;
    }

    setIsFullscreen(!!document.fullscreenElement);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

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
      console.error('Fullscreen error:', err);
    }
  };

  return { violations, isFullscreen, enterFullscreen };
};
