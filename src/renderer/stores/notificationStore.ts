import { create } from "zustand";

export type NotificationType = "info" | "error" | "warning" | "success";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  autoClose?: boolean;
}

interface NotificationState {
  notifications: Notification[];

  // Actions
  addNotification: (
    message: string,
    type: NotificationType,
    autoClose?: boolean
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (
    message: string,
    type: NotificationType,
    autoClose = true
  ) => {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 7);

    set((state) => ({
      notifications: [...state.notifications, { id, message, type, autoClose }],
    }));

    if (autoClose) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, 5000);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
