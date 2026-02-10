// src/store/uiStore.ts
import { create } from "zustand";

type MessageBoxType = "info" | "success" | "error" | "warning" | "confirm";

interface UIState {
  message: string | null;
  type: MessageBoxType;
  show: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  confirmText?: string;
  cancelText?: string;

  showMessage: (
    msg: string,
    type?: MessageBoxType,
    onClose?: () => void,
  ) => void;
  showConfirm: (
    msg: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    },
  ) => void;
  hideMessage: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  message: null,
  type: "info",
  show: false,
  onConfirm: undefined,
  onCancel: undefined,
  confirmText: "Confirm",
  cancelText: "Cancel",
  onClose: undefined,

  showMessage: (message, type = "info", onClose) =>
    set({
      message,
      type,
      show: true,
      onConfirm: undefined,
      onCancel: undefined,
      onClose: onClose,
    }),

  showConfirm: (message, onConfirm, options = {}) =>
    set({
      message,
      type: "confirm",
      show: true,
      onConfirm,
      onCancel: options.onCancel,
      onClose: undefined,
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel",
    }),

  hideMessage: () =>
    set((state) => {
      state.onClose?.();
      return {
        show: false,
        onConfirm: undefined,
        onCancel: undefined,
        onClose: undefined,
      };
    }),
}));
