export default function About() {
  return (
    <main className="w-full">
      <section className="flex flex-col justify-center items-center px-6 sm:px-12 max-w-2xl mx-auto py-16 sm:py-28 text-center">
        <h1 className="text-xl sm:text-3xl leading-[1.3] font-bold tracking-[0.04em] mb-8 sm:mb-12 text-black dark:text-white">
          About
        </h1>

        <div className="space-y-5 sm:space-y-7 text-[14px] sm:text-base leading-[1.9] font-light text-black/50 dark:text-white/45">
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

        <div className="mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-black/[0.04] dark:bg-white/[0.03] w-full border border-black/[0.06] dark:border-white/[0.04]">
          {[
            { title: "Research", desc: "General intelligence and autonomous systems." },
            { title: "Development", desc: "Scalable, production-ready AI systems." },
            { title: "Collaboration", desc: "Open collaboration with the AI community." },
          ].map((card) => (
            <div key={card.title} className="bg-white dark:bg-black p-5 sm:p-7 text-center">
              <h3 className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase mb-2 text-black/60 dark:text-white/50">{card.title}</h3>
              <p className="text-[12px] sm:text-[13px] font-light text-black/35 dark:text-white/30 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
