'use client';

import React from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  return (
    <div className={`notification glass-card animate-slide-in ${type}`} onClick={onClose}>
      <span className="icon">{icons[type]}</span>
      <span className="message">{message}</span>
      
      <style jsx>{`
        .notification {
          min-width: 300px;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          border-left: 4px solid ${colors[type]};
          pointer-events: auto;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        }

        .icon { font-size: 1.2rem; }
        .message { font-size: 0.95rem; font-weight: 600; color: var(--text); }

        .success { background: rgba(34, 197, 94, 0.1); }
        .error { background: rgba(239, 68, 68, 0.1); }
        .warning { background: rgba(245, 158, 11, 0.1); }
        .info { background: rgba(59, 130, 246, 0.1); }
      `}</style>
    </div>
  );
};

export default Notification;
