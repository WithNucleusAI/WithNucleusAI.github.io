"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        if (!isHomePage) return;

        const handleScroll = () => {
            // Change color when background fades out significantly
            // User suggested around 300px, or when fade anim starts. 
            // The background fades out continuously from 0 to 0.8vh.
            // By 300px (on desktop ~1080p), opacity is ~0.65.
            // Let's use a threshold where the background is light enough.
            // Actually, the background is black? "below bg is whit". 
            // Ah, the illusions are on a black background? No, `globals.css` body is bg-white.
            // But the illusion iframe has a dark setting?
            // "Bird A (Yellow) and Bird B (Grey)".
            // The user surely sees a dark background initially if they want white text.
            // And "below bg is whit" implies the content below the hero is white.
            // So we switch to black text when we scroll down.
            setIsScrolled(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHomePage]);

    // Determine if we should use dark mode (white text)
    // Dark mode is active ONLY on Home Page AND NOT Scrolled.
    const useDarkMode = isHomePage && !isScrolled;

    // Color classes based on state
    const textColor = useDarkMode ? "text-white" : "text-black";
    const linkColor = useDarkMode ? "text-white/80" : "text-black/60";
    const linkHoverColor = useDarkMode ? "hover:text-white" : "hover:text-black";
    const borderColor = useDarkMode ? "border-white/20" : "border-black/5";
    const bgColor = useDarkMode ? "bg-white/10" : "bg-white/50"; // More opaque helper when scrolled? Or keep same?

    return (
        <div className="w-full fixed p-3 z-50">
            <header className={`w-full top-0 px-4 py-2 rounded-full shadow-sm sm:px-8 sm:py-3 flex justify-between items-center box-border z-50 pointer-events-none backdrop-blur-md transition-all duration-300 ${bgColor} border ${borderColor}`}>
                <div className="logo-container pointer-events-auto">
                    <Link href="/" className={`flex items-center gap-2 sm:gap-3 no-underline ${textColor} font-bold text-lg sm:text-xl transition-colors duration-300 hover:opacity-80`}>
                        <Image
                            src="/logo.png"
                            alt="Nucleus AI Logo"
                            width={40}
                            height={40}
                            className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-300 ${!useDarkMode ? "invert" : ""}`}
                        />
                        <span className="tracking-tight hidden sm:inline">Nucleus AI</span>
                        {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENV === "dev") && (
                            <span className="text-[0.7rem] sm:text-[0.8rem] bg-[#ff4444] text-white px-1.5 py-0.5 rounded ml-2 font-bold align-middle">
                                DEV
                            </span>
                        )}
                    </Link>
                </div>
                <nav className="flex gap-4 sm:gap-8 pointer-events-auto">
                    <Link href="/" className={`no-underline ${linkColor} font-medium text-sm sm:text-base transition-colors duration-300 ${linkHoverColor}`}>Home</Link>
                    <Link href="/blog" className={`no-underline ${linkColor} font-medium text-sm sm:text-base transition-colors duration-300 ${linkHoverColor}`}>Blogs</Link>
                </nav>
            </header>
        </div>
    );
}
