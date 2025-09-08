import React, { createContext, useCallback, useContext, useState } from 'react';

interface Toast { id: string; message: string; type?: 'info'|'success'|'error'; timeout?: number }
interface ToastContextValue { push: (m: string, opts?: Partial<Omit<Toast,'id'|'message'>>) => void }

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToasts = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within <ToastProvider>');
  return ctx;
};

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, opts?: Partial<Omit<Toast,'id'|'message'>>) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, message, type: 'info', timeout: 3500, ...opts };
    setToasts(t => [...t, toast]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), toast.timeout);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 w-full max-w-sm px-4">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow text-sm font-medium backdrop-blur border animate-fade-in ${t.type === 'error' ? 'bg-red-600/80 border-red-400/30 text-white' : t.type === 'success' ? 'bg-green-600/80 border-green-400/30 text-white' : 'bg-gray-800/70 border-gray-600/40 text-gray-100'}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
