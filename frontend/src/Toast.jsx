import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
            setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
        }, duration);
    }, []);

    const remove = (id) => {
        setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast ${t.type}${t.exiting ? ' exiting' : ''}`}>
                        <span className="toast-icon">{ICONS[t.type]}</span>
                        <span className="toast-text">{t.message}</span>
                        <button className="toast-close" onClick={() => remove(t.id)}>✕</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
