import Link from "next/link";

export default function NotFound() {
  return (
    <main className="w-full relative flex-1 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center justify-center text-center px-6 -mt-16">
        <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter text-black dark:text-white">
          404
        </h1>
        <p className="mt-4 text-sm sm:text-base text-black/40 dark:text-white/35 max-w-sm leading-relaxed">
          The page you are looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-8 text-[11px] sm:text-xs tracking-[0.1em] text-black/40 dark:text-white/35 hover:text-black dark:hover:text-white transition-colors"
        >
          &larr; Home
        </Link>
      </div>
    </main>
  );
}
