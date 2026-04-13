import Link from "next/link";

export default function NotFound() {
  return (
    <main className="w-full relative flex-1 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="z-10 relative flex flex-col items-center justify-center text-center px-6 mt-[-10vh]">
        <h1 className="text-8xl sm:text-9xl font-bold tracking-tighter text-black dark:text-white">
          404
        </h1>
        <h2 className="text-2xl sm:text-4xl font-medium mt-4 text-black dark:text-white">
          Page Not Found
        </h2>
        <p className="mt-6 text-lg sm:text-xl text-black/50 dark:text-white/50 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="mt-10 px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-80 transition-opacity duration-200"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
