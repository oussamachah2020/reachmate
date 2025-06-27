// zustand/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Session, User } from "@supabase/supabase-js";
import Cookies from "js-cookie";
import { Sender, Plan, Usage } from "@/types/auth"; // Import all necessary types

interface AuthState {
  session: Session | null;
  user: User | null;
  plan: Plan | null;
  sender: Sender | null;
  usage: Usage | null;
  setPlan: (value: Plan | null) => void;
  setSender: (value: Sender | null) => void;
  setAuth: (session: Session | null, user: User | null) => void;
  clearAuth: () => void;
  setUsage: (value: Usage | null) => void;
}

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: cookieStorage.getItem("auth-session"),
      sender: null,
      user: null,
      plan: null,
      usage: null,
      setSender: (value) => set(() => ({ sender: value })),
      setPlan: (value) => set(() => ({ plan: value })),
      setUsage: (value) => set(() => ({ usage: value })),
      setAuth: (session, user) => {
        if (session) {
          cookieStorage.setItem("auth-session", session);
        } else {
          cookieStorage.removeItem("auth-session");
        }
        set({ session, user });
      },
      clearAuth: () => {
        cookieStorage.removeItem("auth-session");
        set({
          session: null,
          user: null,
          plan: null,
          sender: null,
          usage: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        sender: state.sender,
        plan: state.plan,
        usage: state.usage, // Persist usage state
      }),
      storage: createJSONStorage(() => localStorage), // This is for `partialize` data
    },
  ),
);
