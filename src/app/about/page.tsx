export default function About() {
  return (
    <main className="w-full">
      <section className="min-h-[80vh] sm:min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 max-w-2xl mx-auto py-16 sm:py-24 text-center z-10 relative">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl leading-[1.3] font-bold tracking-[0.04em] mb-6 sm:mb-10 text-black dark:text-white">
          About
        </h1>

        <div className="space-y-4 sm:space-y-6 text-sm sm:text-base leading-[1.8] font-light text-black/55 dark:text-white/55">
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

        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-black/8 dark:bg-white/8 w-full border border-black/8 dark:border-white/8">
          {[
            { title: "Research", desc: "General intelligence and autonomous systems." },
            { title: "Development", desc: "Scalable, production-ready AI systems." },
            { title: "Collaboration", desc: "Open collaboration with the AI community." },
          ].map((card) => (
            <div key={card.title} className="bg-white dark:bg-black p-5 sm:p-6 text-center">
              <h3 className="text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase mb-2 text-black/70 dark:text-white/70">{card.title}</h3>
              <p className="text-[11px] sm:text-xs font-light text-black/35 dark:text-white/35 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
