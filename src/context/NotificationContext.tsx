'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification, { NotificationType } from '@/components/Notification';

interface NotificationContextType {
  showToast: (message: string, type?: NotificationType) => void;
  confirm: (message: string, onConfirm: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: NotificationType }[]>([]);
  const [confirmData, setConfirmData] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const showToast = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmData({ message, onConfirm });
  }, []);

  const handleConfirm = () => {
    if (confirmData) {
      confirmData.onConfirm();
      setConfirmData(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, confirm }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Notification 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmData && (
        <div className="modal-overlay animate-fade-in">
          <div className="glass-card confirm-modal animate-scale-in">
            <h3>Xác nhận</h3>
            <p>{confirmData.message}</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmData(null)}>Hủy bỏ</button>
              <button className="btn btn-primary" onClick={handleConfirm}>Đồng ý</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          pointer-events: none;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }

        .confirm-modal {
          max-width: 400px;
          width: 100%;
          padding: 2rem;
          text-align: center;
        }

        h3 { font-size: 1.5rem; margin-bottom: 1rem; }
        p { margin-bottom: 2rem; color: var(--text-muted); }
        .modal-actions { display: flex; gap: 1rem; justify-content: center; }
      `}</style>
    </NotificationContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useToast must be used within a NotificationProvider');
  return context;
};
