export default function About() {
  const pillars = [
    { title: "Research", desc: "General intelligence and autonomous systems.", color: "text-shockingly-green" },
    { title: "Development", desc: "Scalable, production-ready AI systems.", color: "text-blue" },
    { title: "Collaboration", desc: "Open collaboration with the AI community.", color: "text-lilac" },
  ];

  return (
    <main className="w-full">
      <section className="flex flex-col justify-center items-center px-6 sm:px-12 max-w-2xl mx-auto py-16 sm:py-28 text-center">
        <span className="eyebrow text-surface-50 mb-4 sm:mb-6">Nucleus AI</span>
        <h1 className="text-[44px] sm:text-[66px] font-semibold leading-[1] tracking-[-0.02em] mb-10 sm:mb-14 text-white">
          About
        </h1>

        <div className="space-y-5 sm:space-y-7 text-[15px] sm:text-[19px] leading-[1.6] sm:leading-[1.7] text-white/75">
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

        <div className="mt-14 sm:mt-20 w-full">
          <div className="hairline" />
          {pillars.map((card) => (
            <div key={card.title}>
              <div className="py-7 sm:py-9 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 text-left">
                <h3 className={`text-[21px] sm:text-[24px] font-semibold tracking-[-0.011em] sm:w-56 shrink-0 ${card.color}`}>{card.title}</h3>
                <p className="text-[14px] sm:text-[16px] text-surface-50 leading-[1.5]">
                  {card.desc}
                </p>
              </div>
              <div className="hairline" />
            </div>
          ))}
        </div>

        <a href="mailto:contact@withnucleus.ai" className="pill-btn mt-12 sm:mt-16">
          Get in Touch
        </a>
      </section>
    </main>
  );
}
