import type Lenis from "lenis";

/** Shared Lenis instance (null when reduced motion is on or before mount). */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

/** Scroll to an element or y position, via Lenis when active. */
export function smoothScrollTo(target: HTMLElement | number, offset = 0) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (instance && !reduce) {
    instance.scrollTo(target, { offset, duration: 1.2 });
    return;
  }
  const y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}

/** Shared scroll progress through the hero (0 → 1), read by the 3D scene each frame. */
export const heroScroll = { progress: 0 };
