/**
 * Dedicated Zustand Store for Professional IDE Experience (Sprint 11)
 * Manages Command Palette visibility, Global Search & Replace queries,
 * Sidebar tabs (Explorer, Search, Outline), Layout Panel dimensions, Breadcrumbs, and File Decorations.
 */

import { create } from "zustand";

const useIDEStore = create((set) => ({
  // Command Palette Overlay
  isCommandPaletteOpen: false,
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

  // Sidebar Tabs & Layout Panels
  activeSidebarTab: "explorer", // "explorer" | "search" | "outline"
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab, sidebarCollapsed: false }),

  sidebarCollapsed: false,
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  sidebarWidth: 280,
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),

  consoleHeight: 176, // h-44 equivalent
  setConsoleHeight: (consoleHeight) => set({ consoleHeight }),

  // Global Search & Replace State
  globalSearchQuery: "",
  globalReplaceQuery: "",
  setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
  setGlobalReplaceQuery: (globalReplaceQuery) => set({ globalReplaceQuery }),

  // Breadcrumbs State
  currentSymbol: "",
  setCurrentSymbol: (currentSymbol) => set({ currentSymbol }),

  // File Decorations & Unsaved States
  unsavedFileIds: [],
  markFileUnsaved: (fileId) =>
    set((state) => ({
      unsavedFileIds: state.unsavedFileIds.includes(fileId)
        ? state.unsavedFileIds
        : [...state.unsavedFileIds, fileId],
    })),
  markFileSaved: (fileId) =>
    set((state) => ({
      unsavedFileIds: state.unsavedFileIds.filter((id) => id !== fileId),
    })),
  clearAllUnsaved: () => set({ unsavedFileIds: [] }),
}));

export default useIDEStore;
