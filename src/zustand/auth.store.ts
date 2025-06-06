import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Session, User } from "@supabase/supabase-js";
import Cookies from "js-cookie";

type Sender = {
  firstName: string;
  lastName: string;
};

interface AuthState {
  session: Session | null;
  user: User | null;
  sender: Sender | null;
  setSender: (value: Sender | null) => void;
  setAuth: (session: Session | null, user: User | null) => void;
  clearAuth: () => void;
}

// Cookie storage logic for session
const cookieStorage = {
  getItem: (name: string) => {
    try {
      const value = Cookies.get(name);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: any) => {
    Cookies.set(name, JSON.stringify(value), { expires: 7 });
  },
  removeItem: (name: string) => {
    Cookies.remove(name);
  },
};

// Zustand store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: cookieStorage.getItem("auth-session"),
      sender: null,
      user: null,
      setSender: (value) => set(() => ({ sender: value })),
      setAuth: (session, user) => {
        // Sync session to cookies manually
        if (session) {
          cookieStorage.setItem("auth-session", session);
        } else {
          cookieStorage.removeItem("auth-session");
        }

        set({ session, user });
      },
      clearAuth: () => {
        cookieStorage.removeItem("auth-session");
        set({ session: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        sender: state.sender,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
