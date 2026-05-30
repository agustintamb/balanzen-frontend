import { create } from "zustand";

export type ToastType = "error" | "success" | "warning" | "info";

interface UIState {
  // ─── Toast ──────────────────────────────────────────────────────────────────
  toast: {
    visible: boolean;
    message: string;
    type: ToastType;
  };
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: { visible: false, message: "", type: "error" },

  showToast: (message, type = "error") =>
    set({ toast: { visible: true, message, type } }),

  hideToast: () =>
    set((s) => ({ toast: { ...s.toast, visible: false } })),
}));

// ─── Helpers reutilizables ────────────────────────────────────────────────────

export const useToast = () => {
  const showToast = useUIStore((s) => s.showToast);
  return {
    showError: (msg: string) => showToast(msg, "error"),
    showSuccess: (msg: string) => showToast(msg, "success"),
    showWarning: (msg: string) => showToast(msg, "warning"),
    showInfo: (msg: string) => showToast(msg, "info"),
    show: showToast,
  };
};
