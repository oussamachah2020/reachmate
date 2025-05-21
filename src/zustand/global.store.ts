// src/store/viewModeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "grid" | "list";

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleMode: () => void;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set, get) => ({
      viewMode: "grid", // default value
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleMode: () =>
        set({ viewMode: get().viewMode === "grid" ? "list" : "grid" }),
    }),
    {
      name: "view-mode", // localStorage key
    }
  )
);
