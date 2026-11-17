import { FadeIn } from "@/components/FadeIn";
import { Footer } from "@/components/Footer";
import { MembersConnectForm } from "@/components/form/MembersConnectForm";
import { Hero } from "@/components/Hero";
import { SmoothScroll } from "@/components/SmoothScroll";
import { jsonLd } from "@/lib/site";

const PROMISES = [
  { title: "A cell group near you", text: "Your zip code helps us connect you with a house fellowship close to home." },
  { title: "Someone to pray with", text: "Share a prayer request and our prayer team will stand with you." },
  { title: "Take a break anytime", text: "Save your progress and come back within 30 days to finish." },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <SmoothScroll />
      <a
        href="#connect"
        className="sr-only z-50 rounded-full bg-gold-400 px-4 py-2 font-bold text-maroon-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to the form
      </a>

      <main>
        <Hero />

        <section id="connect" aria-labelledby="connect-title" className="grain relative isolate overflow-hidden bg-maroon-950 pb-24">
          {/* Ambient glows */}
          <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-150 w-225 -translate-x-1/2 rounded-full bg-maroon-700/40 blur-[120px]" />
          <div aria-hidden className="pointer-events-none absolute top-1/3 -right-40 -z-10 size-105 animate-float-slow rounded-full bg-gold-500/10 blur-[100px]" />
          <div aria-hidden className="pointer-events-none absolute bottom-20 -left-40 -z-10 size-115 animate-float-slow rounded-full bg-maroon-600/25 blur-[110px] [animation-delay:-4s]" />

          <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-16">
            <FadeIn className="mb-10 text-center text-cream-100">
              <p className="text-[12px] font-extrabold tracking-[0.28em] text-gold-400 uppercase">New Member Information</p>
              <h2 id="connect-title" className="mt-3 font-display text-[34px] leading-tight font-semibold sm:text-[46px]">
                Let&apos;s get to know you
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[16px] leading-relaxed text-cream-100/70">
                Every family has a story, and we&apos;d love to hear yours. Fields marked * are required.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <MembersConnectForm />
            </FadeIn>

            <ul className="mt-12 grid gap-4 sm:grid-cols-3">
              {PROMISES.map((p, i) => (
                <li key={p.title}>
                  <FadeIn delay={0.08 * i} className="h-full rounded-3xl bg-white/4 p-5 ring-1 ring-white/10 backdrop-blur">
                    <span aria-hidden className="mb-3 grid size-9 place-items-center rounded-xl bg-gold-500/15 font-display text-gold-300">
                      {i + 1}
                    </span>
                    <h3 className="font-bold text-cream-100">{p.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-cream-100/60">{p.text}</p>
                  </FadeIn>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
