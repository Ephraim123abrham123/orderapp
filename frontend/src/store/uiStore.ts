import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface UiState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  toasts: Toast[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTheme: () => void;
  addToast: (message: any, type: Toast["type"], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  theme: "dark", // Sleek premium dark mode by default!
  toasts: [],
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  addToast: (message: any, type, duration = 4000) => {
    let formattedMessage = "";

    if (typeof message === "string") {
      formattedMessage = message;
    } else if (Array.isArray(message)) {
      // Pydantic validation list format: [{"loc": ["body", "status"], "msg": "..."}]
      formattedMessage = message
        .map((err: any) => {
          if (err && typeof err === "object") {
            const loc = err.loc ? err.loc.join(".") : "";
            const msg = err.msg || "";
            return loc ? `${loc}: ${msg}` : msg;
          }
          return String(err);
        })
        .join(", ");
    } else if (message && typeof message === "object") {
      if (message.message) {
        formattedMessage = String(message.message);
      } else if (message.detail) {
        formattedMessage =
          typeof message.detail === "string"
            ? message.detail
            : JSON.stringify(message.detail);
      } else {
        formattedMessage = JSON.stringify(message);
      }
    } else {
      formattedMessage = String(message);
    }

    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message: formattedMessage, type, duration }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
