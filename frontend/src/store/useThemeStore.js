import { create } from "zustand";
import { DEFAULT_THEME } from "../constants/themes";


export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("theme") || DEFAULT_THEME,
    
    setTheme: (theme) => {
        localStorage.setItem("theme", theme);
        set({ theme });
    }
}));