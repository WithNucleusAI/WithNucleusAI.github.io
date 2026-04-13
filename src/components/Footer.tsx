import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer data-site-footer className="w-full bg-white dark:bg-black mt-auto border-t border-black/6 dark:border-white/6">
            <div className="max-w-3xl mx-auto px-5 py-8 sm:py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-5 sm:gap-6">
                    <div className="flex gap-6">
                        <Link href="mailto:contact@withnucleus.ai"
                            className="text-[10px] sm:text-xs tracking-[0.06em] text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">
                            Contact
                        </Link>
                        <Link href="/about"
                            className="text-[10px] sm:text-xs tracking-[0.06em] text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">
                            About
                        </Link>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-black/20 dark:text-white/20 tracking-[0.04em] hidden md:block">
                        &copy; 2026 Nucleus AI
                    </p>

                    <div className="flex gap-3.5">
                        <a href="https://github.com/WithNucleusAI" target="_blank" rel="noopener noreferrer"
                            className="text-black/25 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors" aria-label="GitHub">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        <a href="https://huggingface.co/WithNucleusAI" target="_blank" rel="noopener noreferrer"
                            className="text-black/25 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors" aria-label="Hugging Face">
                            <Image src="/huggingface.svg" alt="" width={16} height={16} className="w-4 h-4 dark:invert opacity-25 hover:opacity-100 transition-opacity" />
                        </a>
                        <a href="https://twitter.com/WithNucleusAI" target="_blank" rel="noopener noreferrer"
                            className="text-black/25 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors" aria-label="X">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-3.5 h-3.5" viewBox="0 0 16 16">
                                <path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z" />
                            </svg>
                        </a>
                        <a href="https://linkedin.com/company/withnucleusai" target="_blank" rel="noopener noreferrer"
                            className="text-black/25 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors" aria-label="LinkedIn">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="mt-6 text-center md:hidden">
                    <p className="text-[10px] text-black/20 dark:text-white/20">
                        &copy; 2026 Nucleus AI
                    </p>
                </div>
            </div>
        </footer>
    );
}
