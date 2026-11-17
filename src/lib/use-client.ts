"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** true only after hydration on the client (false during SSR). */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Reads a URL query param on the client without forcing dynamic rendering. */
export function useQueryParam(name: string) {
  return useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}
