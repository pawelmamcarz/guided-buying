import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    const colors = {
        success: 'rgba(16, 185, 129, 0.15)',
        warning: 'rgba(245, 158, 11, 0.15)',
        error: 'rgba(239, 68, 68, 0.15)',
        info: 'rgba(14, 165, 233, 0.15)',
    };
    const borderColors = {
        success: 'var(--success-color)',
        warning: 'var(--warning-color)',
        error: 'var(--danger-color)',
        info: 'var(--accent-color)',
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{
                position: 'fixed', bottom: '2rem', right: '2rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                zIndex: 9999, maxWidth: '380px'
            }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="animate-slide-right"
                        style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            padding: '1rem 1.25rem',
                            background: colors[toast.type],
                            border: `1px solid ${borderColors[toast.type]}`,
                            borderRadius: 'var(--border-radius-md)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            lineHeight: 1.4
                        }}
                    >
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icons[toast.type]}</span>
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
};
