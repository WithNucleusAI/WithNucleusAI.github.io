import Link from "next/link";

export default function NotFound() {
  return (
    <main className="w-full relative flex-1 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center justify-center text-center px-6 -mt-16">
        <span className="eyebrow text-surface-50 mb-6">Lost in the Void</span>
        <h1 className="display-type text-[clamp(96px,20vw,224px)] text-white">
          404
        </h1>
        <p className="mt-6 text-[15px] sm:text-[19px] text-surface-50 max-w-sm leading-[1.6]">
          The page you are looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="pill-btn mt-10">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
