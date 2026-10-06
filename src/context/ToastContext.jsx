import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CircleAlert, Check } from "lucide-react";

const ToastContext = createContext(null);
let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((text, tone = "info") => {
    const id = nextToastId++;
    setToasts((list) => [...list.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), tone === "error" ? 6000 : 3500);
  }, []);

  const api = useMemo(
    () => Object.assign((text) => push(text, "info"), { error: (text) => push(text, "error") }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.tone === "error" ? "toast-error" : ""}`}>
            {t.tone === "error" ? <CircleAlert size={18} aria-hidden /> : <Check size={18} aria-hidden />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
