import { Template } from "@/types/template";
import { create } from "zustand";

interface TemplateState {
  selectedTemplate: Template | undefined;
  setSelectedTemplate: (value: Template | undefined) => void;
}

export const useTemplateStore = create<TemplateState>()((set, get) => ({
  selectedTemplate: undefined, // default value
  setSelectedTemplate: (value) => set({ selectedTemplate: value }),
}));
