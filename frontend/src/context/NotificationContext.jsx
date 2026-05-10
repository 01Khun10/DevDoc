import { createContext, useCallback, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, options = {}) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast = {
        id,
        message,
        tone: options.tone || "info"
      };

      setToasts((currentToasts) => [...currentToasts, toast]);

      window.setTimeout(() => {
        dismiss(id);
      }, options.duration || 4000);

      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toasts,
      notify,
      dismiss
    }),
    [dismiss, notify, toasts]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

function useNotify() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotify must be used within a NotificationProvider");
  }

  return context;
}

export { NotificationProvider, useNotify };
