'use client';

import { useEffect, useCallback } from 'react';

interface ProctoringConfig {
  onViolation: (action: string, details?: string) => void;
  enabled: boolean;
}

export const useProctoring = ({ onViolation, enabled }: ProctoringConfig) => {
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      onViolation('TAB_SWITCH', 'Student left the examination tab');
    }
  }, [onViolation]);

  const handleBlur = useCallback(() => {
    onViolation('WINDOW_BLUR', 'Examination window lost focus');
  }, [onViolation]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement) {
      onViolation('FULLSCREEN_EXIT', 'Student exited fullscreen mode');
    }
  }, [onViolation]);

  const preventDefault = useCallback((e: Event) => {
    e.preventDefault();
    onViolation('RESTRICTED_ACTION', `Attempted prohibited action: ${e.type}`);
  }, [onViolation]);

  useEffect(() => {
    if (!enabled) return;

    // Visibility & Blur
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    // Fullscreen
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
      console.error('Error attempting to enable full-screen mode:', err);
    }
  };

  return { enterFullscreen };
};
