"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const currentTheme = theme === "system" ? systemTheme : theme;

    return (
        <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="fixed bottom-[30px] left-[30px] max-md:bottom-[10px] max-md:left-[15px] z-[50] flex justify-center items-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-sm transition-all duration-200 text-[#666] dark:text-gray-300 rounded-full w-10 h-10 md:w-12 md:h-12 cursor-pointer hover:scale-110 hover:shadow-lg pointer-events-auto"
            aria-label="Toggle theme"
        >
            {currentTheme === "dark" ? (
                <Sun className="h-5 w-5 md:h-6 md:w-6" />
            ) : (
                <Moon className="h-5 w-5 md:h-6 md:w-6" />
            )}
        </button>
    );
}
