import { create } from "zustand";

const LOCAL_STORAGE_KEY = "pixelide-theme";

export const THEMES = [
  { id: "vs-dark", name: "VS Dark" },
  { id: "vs-light", name: "VS Light" },
  { id: "dracula", name: "Dracula" },
  { id: "monokai", name: "Monokai" },
  { id: "github-dark", name: "GitHub Dark" },
];

const applyThemeToDOM = (themeId) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", themeId);
  }
};

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved && THEMES.some((t) => t.id === saved)) {
      applyThemeToDOM(saved);
      return saved;
    }
  }
  const defaultTheme = "vs-dark";
  applyThemeToDOM(defaultTheme);
  return defaultTheme;
};

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (themeId) => {
    if (THEMES.some((t) => t.id === themeId)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, themeId);
      applyThemeToDOM(themeId);
      set({ theme: themeId });
    }
  },
}));

export default useThemeStore;
