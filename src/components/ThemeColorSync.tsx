"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

const LIGHT_BG = "#ffffff";
const DARK_BG = "#000000";

export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const fallback = resolvedTheme === "dark" ? DARK_BG : LIGHT_BG;
    const source = document.querySelector('[data-theme-color-source="true"]') as HTMLElement | null;
    const computed = source ? window.getComputedStyle(source).backgroundColor : window.getComputedStyle(document.body).backgroundColor;
    const color = computed && computed !== "rgba(0, 0, 0, 0)" ? computed : fallback;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", color);
      return;
    }

    const tag = document.createElement("meta");
    tag.setAttribute("name", "theme-color");
    tag.setAttribute("content", color);
    document.head.appendChild(tag);
  }, [pathname, resolvedTheme]);

  return null;
}
