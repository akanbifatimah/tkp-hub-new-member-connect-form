"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { CHURCH } from "@/lib/form-config";

/** Deterministic pseudo-random so the burst is stable between renders. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function SuccessCelebration({ firstName }: { firstName: string }) {
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => headingRef.current?.focus(), []);

  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2 + rand(i, 1) * 0.4;
        const dist = 90 + rand(i, 2) * 110;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          size: 4 + rand(i, 3) * 7,
          delay: rand(i, 4) * 0.15,
          gold: i % 3 !== 0,
          rotate: rand(i, 5) * 360,
        };
      }),
    [],
  );

  return (
    <div className="flex flex-col items-center px-2 py-6 text-center sm:py-10">
      <div className="relative mb-8 grid size-28 place-items-center">
        {!reduce &&
          particles.map((p, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute top-1/2 left-1/2 rounded-xs"
              style={{
                width: p.size,
                height: p.size,
                background: p.gold ? "linear-gradient(135deg,#f6e7b0,#d4af37)" : "#8c1a20",
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
              animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1, 0.6], rotate: p.rotate }}
              transition={{ duration: 1.4, delay: 0.35 + p.delay, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="grid size-28 place-items-center rounded-full bg-linear-to-br from-gold-300 via-gold-500 to-gold-600 shadow-glow"
        >
          <svg viewBox="0 0 52 52" className="size-14" aria-hidden>
            <motion.path
              d="M14 27 l8 8 l17 -18"
              fill="none"
              stroke="#4a0b0e"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <p className="text-[13px] font-extrabold tracking-[0.25em] text-gold-600 uppercase">Welcome to the family</p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 font-display text-4xl font-semibold text-maroon-900 outline-none sm:text-5xl"
        >
          Thank you, {firstName}!
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-maroon-800/80">
          We&apos;re so glad you worshipped with us. Someone from our team will be in touch soon to help you get
          connected at {CHURCH.name}.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={CHURCH.website}
            className="rounded-full bg-maroon-700 px-6 py-3 font-bold text-cream-100 shadow-[0_10px_24px_-10px_rgb(110_13_18/0.8)] transition hover:-translate-y-0.5 hover:bg-maroon-800"
          >
            Visit our website
          </a>
          <a
            href={CHURCH.socials.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-maroon-700/20 bg-white/70 px-6 py-3 font-bold text-maroon-800 transition hover:-translate-y-0.5 hover:border-gold-500"
          >
            Watch us on YouTube
          </a>
        </div>
      </motion.div>
    </div>
  );
}
