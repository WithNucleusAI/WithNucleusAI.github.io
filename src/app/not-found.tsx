import Link from "next/link";


export default function NotFound() {
  return (
    <main className="w-full relative flex-1 flex flex-col items-center justify-center min-h-[70vh]">
      {/* <EscherBackground /> */}
      <div className="z-10 relative flex flex-col items-center justify-center text-center px-6 mt-[-10vh]">
        <h1 className="text-8xl sm:text-9xl font-bold tracking-tighter text-gray-900 dark:text-gray-100">
          404
        </h1>
        <h2 className="text-2xl sm:text-4xl font-medium mt-4 text-gray-800 dark:text-gray-200">
          Page Not Found
        </h2>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          href="/" 
          className="mt-10 px-8 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-full hover:bg-gray-800 dark:hover:bg-white transition-colors duration-200"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}