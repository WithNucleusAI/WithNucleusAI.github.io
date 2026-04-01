export default function About() {
  return (
    <main className="w-full">
      <section className="min-h-[80vh] sm:min-h-screen flex flex-col justify-center items-center px-5 sm:px-12 max-w-3xl mx-auto py-16 sm:py-24 text-center z-10 relative">
        <h1 className="text-2xl sm:text-5xl lg:text-6xl leading-[1.3] font-extralight tracking-[0.06em] sm:tracking-[0.08em] mb-6 sm:mb-8"
          style={{ color: 'var(--t5)', textShadow: '0 0 30px var(--a1)' }}>
          About Nucleus AI
        </h1>

        <div className="space-y-4 sm:space-y-6 text-sm sm:text-lg leading-[1.7] sm:leading-relaxed font-light" style={{ color: 'var(--t3)' }}>
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
            Through our work, we aim to push the boundaries of what&apos;s possible with artificial intelligence,
            developing technologies that are not only powerful but also responsible, ethical, and beneficial
            to humanity.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center w-full">
          <div className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-[rgba(79,124,255,0.15)] hover:shadow-[0_0_25px_rgba(79,124,255,0.06)]">
            <h3 className="text-base sm:text-lg font-light tracking-wide mb-1.5 sm:mb-2" style={{ color: 'var(--t4)' }}>Research</h3>
            <p className="text-xs sm:text-sm font-light" style={{ color: 'var(--t2)' }}>
              Cutting-edge AI research focused on general intelligence and autonomous systems.
            </p>
          </div>

          <div className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-[rgba(79,124,255,0.15)] hover:shadow-[0_0_25px_rgba(79,124,255,0.06)]">
            <h3 className="text-base sm:text-lg font-light tracking-wide mb-1.5 sm:mb-2" style={{ color: 'var(--t4)' }}>Development</h3>
            <p className="text-xs sm:text-sm font-light" style={{ color: 'var(--t2)' }}>
              Building scalable, production-ready AI systems and applications.
            </p>
          </div>

          <div className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-[rgba(79,124,255,0.15)] hover:shadow-[0_0_25px_rgba(79,124,255,0.06)]">
            <h3 className="text-base sm:text-lg font-light tracking-wide mb-1.5 sm:mb-2" style={{ color: 'var(--t4)' }}>Collaboration</h3>
            <p className="text-xs sm:text-sm font-light" style={{ color: 'var(--t2)' }}>
              Working with the global AI community to advance the field together.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
