export default function About() {
  return (
    <main className="w-full">
      <section className="min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 max-w-4xl mx-auto py-24 text-center z-10 relative">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl leading-[1.2] sm:leading-[1.3] font-medium text-gray-900 dark:text-gray-100 tracking-tight mb-8">
          About Nucleus AI
        </h1>

        <div className="space-y-6 text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Nucleus AI is dedicated to advancing the field of artificial intelligence through innovative research
            and development. We focus on building the next generation of general intelligence systems that can
            understand, learn, and adapt to complex real-world challenges.
          </p>

          <p>
            Our team combines expertise in machine learning, software engineering, and systems architecture
            to create robust, scalable AI solutions. We believe in open collaboration and sharing knowledge
            to accelerate progress in the AI community.
          </p>

          <p>
            Through our work, we aim to push the boundaries of what's possible with artificial intelligence,
            developing technologies that are not only powerful but also responsible, ethical, and beneficial
            to humanity.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-[rgba(79,124,255,0.2)] hover:shadow-[0_0_25px_rgba(79,124,255,0.1)]">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Research</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Cutting-edge AI research focused on general intelligence and autonomous systems.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-[rgba(79,124,255,0.2)] hover:shadow-[0_0_25px_rgba(79,124,255,0.1)]">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Development</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Building scalable, production-ready AI systems and applications.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-[rgba(79,124,255,0.2)] hover:shadow-[0_0_25px_rgba(79,124,255,0.1)]">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Working with the global AI community to advance the field together.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}