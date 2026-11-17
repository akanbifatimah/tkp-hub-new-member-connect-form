"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { CHURCH } from "@/lib/form-config";
import { heroScroll, smoothScrollTo } from "@/lib/smooth-scroll";
import { HeroBackdrop } from "./three/HeroBackdrop";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          heroScroll.progress = self.progress;
        },
      });
      if (!reduce) {
        gsap.to("[data-hero-copy]", {
          yPercent: -18,
          opacity: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    },
    { scope: root, dependencies: [reduce] },
  );

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="grain relative isolate flex min-h-svh flex-col overflow-hidden text-cream-100"
    >
      <HeroBackdrop />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <a
          href={CHURCH.website}
          className="flex items-center gap-3"
          aria-label={`${CHURCH.name} home`}
        >
          <Image
            src="/tkp-logo.png"
            alt=""
            width={44}
            height={49}
            priority
            className="h-11 w-auto drop-shadow-[0_4px_12px_rgb(0_0_0/0.4)]"
          />
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-semibold">
              {CHURCH.name}
            </span>
            <span className="block text-[11px] font-bold tracking-[0.2em] text-gold-300/80 uppercase">
              RCCG · Katy, Texas
            </span>
          </span>
        </a>
        <a
          href="#connect"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("connect");
            if (el) smoothScrollTo(el, -16);
          }}
          className="hidden rounded-full border border-gold-400 bg-cream-100 px-5 py-2.5 text-[14px] font-bold text-maroon-900 shadow-[0_6px_20px_-6px_rgb(0_0_0/0.5)] transition hover:-translate-y-0.5 hover:bg-white sm:inline-flex"
        >
          I&apos;m new here
        </a>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-end px-5 pb-24 sm:px-8 lg:items-center lg:pb-16">
        <motion.div
          data-hero-copy
          variants={container}
          initial={reduce ? "show" : "hidden"}
          animate="show"
          className="max-w-xl pt-[44svh] lg:pt-0"
        >
          <motion.h1
            variants={item}
            id="hero-title"
            className="font-display text-[44px] leading-[1.02] font-semibold tracking-tight sm:text-[64px] lg:text-[76px]"
          >
            Welcome <span className="text-gold-shimmer italic">home.</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-5 max-w-md text-[17px] leading-relaxed text-cream-100/80 sm:text-[19px]"
          >
            We are glad you joined us today. Please take a few minutes to fill
            out the form below so we can get to know you.
          </motion.p>
          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <a
              href="#connect"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("connect");
                if (el) smoothScrollTo(el, -16);
              }}
              className="pointer-events-auto group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-linear-to-br from-gold-300 via-gold-500 to-gold-600 px-7 py-4 text-[16px] font-extrabold text-maroon-950 shadow-glow transition hover:-translate-y-0.5"
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative">Get connected</span>
              <svg
                viewBox="0 0 20 20"
                className="relative size-4 transition-transform group-hover:translate-y-0.5"
                aria-hidden
              >
                <path
                  d="M10 4v11m-5-4 5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <span className="text-[14px] font-semibold text-cream-100/60">
              4 short steps · about 4 minutes
            </span>
          </motion.div>
        </motion.div>
      </div>

      <div
        aria-hidden
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-bold tracking-[0.3em] text-cream-100/50 uppercase sm:flex"
      >
        Scroll
        <span className="h-9 w-5 rounded-full border border-cream-100/30 p-1">
          <span className="block h-2 w-full animate-bounce-soft rounded-full bg-gold-400" />
        </span>
      </div>
    </section>
  );
}
