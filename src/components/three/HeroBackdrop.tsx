"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIsClient } from "@/lib/use-client";

const CrownScene = dynamic(() => import("./CrownScene"), { ssr: false });

type Mode = "pending" | "3d" | "static";

function canUse3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** 3D crown when the device can handle it; an elegant CSS glow otherwise. */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  // Device capabilities are fixed for the session: detect once after hydration.
  const { mode, compact } = useMemo<{ mode: Mode; compact: boolean }>(() => {
    if (!isClient) return { mode: "pending", compact: false };
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    return { mode: canUse3D() ? "3d" : "static", compact: narrow || lowPower };
  }, [isClient]);

  // Stop rendering when the hero is off-screen (saves battery while filling the form).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (mode !== "3d") return;
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, [mode]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Warm light behind everything (always present: also the fallback) */}
      <div className="absolute inset-0 bg-sanctuary" />
      <div className="absolute top-[18%] left-1/2 size-[70vmin] -translate-x-1/2 rounded-full bg-gold-500/20 blur-[90px] lg:left-[68%]" />
      {mode === "static" ? (
        <div className="absolute top-[22%] left-1/2 size-[40vmin] -translate-x-1/2 animate-float-slow rounded-full border border-gold-400/30 lg:left-[68%]">
          <div className="absolute inset-6 rounded-full border border-gold-400/20" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(212_175_55/0.35),transparent_65%)]" />
        </div>
      ) : null}
      {mode === "3d" ? (
        // Pinned to the first screen (not the full hero height) so the crown is centred in what the visitor sees.
        <div className={`absolute inset-x-0 top-0 h-svh transition-opacity duration-1400 ${ready ? "opacity-100" : "opacity-0"}`}>
          <CrownScene active={visible} compact={compact} />
        </div>
      ) : null}
      {/* Vignette + fade into the next section */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_50%,rgb(23_9_6/0.75))]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-maroon-950" />
    </div>
  );
}
