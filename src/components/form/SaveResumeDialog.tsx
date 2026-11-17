"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { api, ApiRequestError, resumeUrl } from "@/lib/api";
import { getLenis } from "@/lib/smooth-scroll";
import { inputBase } from "./fields";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Saves the current form and resolves with the draft token. */
  save: () => Promise<{ token: string; expiresAt: string }>;
  defaultEmail?: string;
};

type State =
  | { kind: "saving" }
  | { kind: "saved"; token: string; expiresAt: string }
  | { kind: "error"; message: string };

export function SaveResumeDialog({ open, onClose, save, defaultEmail = "" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<State>({ kind: "saving" });
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | string>("idle");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      getLenis()?.stop();
      setState({ kind: "saving" });
      setCopied(false);
      setEmailState("idle");
      setEmail(defaultEmail);
      save()
        .then((r) => setState({ kind: "saved", ...r }))
        .catch((e: unknown) =>
          setState({ kind: "error", message: e instanceof ApiRequestError ? e.message : "We couldn't save your progress." }),
        );
    } else if (!open && d.open) d.close();
    if (!open) getLenis()?.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on open toggle only
  }, [open]);

  const link = state.kind === "saved" ? resumeUrl(state.token) : "";
  const expires =
    state.kind === "saved"
      ? new Date(state.expiresAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
      : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const input = document.getElementById("resume-link") as HTMLInputElement | null;
      input?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind !== "saved") return;
    if (!/^\S+@\S+\.\S+$/.test(email)) return setEmailState("Please enter a valid email address");
    setEmailState("sending");
    try {
      await api.emailDraftLink(state.token, email);
      setEmailState("sent");
    } catch (err) {
      setEmailState(err instanceof ApiRequestError ? err.message : "We couldn't send the email. Please try again.");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="save-title"
      className="m-auto w-[min(92vw,30rem)] overflow-visible bg-transparent p-0 backdrop:bg-maroon-950/70 backdrop:backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={open ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative rounded-[28px] bg-cream-100 p-6 shadow-card sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-maroon-700 transition hover:bg-maroon-100"
        >
          <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
            <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-linear-to-br from-gold-300 to-gold-500 text-maroon-900 shadow-glow">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 3h9l3 3v15H6z" strokeLinejoin="round" />
            <path d="M9 3v5h6V3M9 21v-6h6v6" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 id="save-title" className="font-display text-2xl font-semibold text-maroon-900">
          Save and resume later
        </h2>

        {state.kind === "saving" ? (
          <p className="mt-3 flex items-center gap-2 text-maroon-600" role="status">
            <span className="size-4 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent" />
            Saving your progress…
          </p>
        ) : state.kind === "error" ? (
          <p className="mt-3 font-semibold text-maroon-600" role="alert">
            {state.message}
          </p>
        ) : (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-maroon-800/80" role="status">
              Your form entry has been saved and a unique link has been created which you can access to resume this
              form. The link expires on <strong className="text-maroon-900">{expires}</strong> (30 days), after which
              your entry will be deleted.
            </p>

            <label htmlFor="resume-link" className="mt-5 mb-1.5 block text-[13px] font-bold text-maroon-900">
              Your resume link
            </label>
            <div className="flex gap-2">
              <input
                id="resume-link"
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className={`${inputBase} border-maroon-900/12 truncate text-[13px]`}
              />
              <button
                type="button"
                onClick={copy}
                className="shrink-0 rounded-2xl bg-maroon-700 px-4 font-bold text-cream-100 transition hover:bg-maroon-800"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <form onSubmit={sendEmail} className="mt-5" noValidate>
              <label htmlFor="resume-email" className="mb-1.5 block text-[13px] font-bold text-maroon-900">
                Email <span className="text-maroon-600">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="resume-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputBase} border-maroon-900/12`}
                />
                <button
                  type="submit"
                  disabled={emailState === "sending" || emailState === "sent"}
                  className="shrink-0 rounded-2xl bg-linear-to-br from-gold-400 to-gold-600 px-4 font-bold text-maroon-950 transition hover:brightness-105 disabled:opacity-60"
                >
                  {emailState === "sending" ? "Sending…" : emailState === "sent" ? "Sent ✓" : "Send Link"}
                </button>
              </div>
              <p className="mt-2 min-h-5 text-[13px] font-semibold" role="status">
                {emailState === "sent" ? (
                  <span className="text-emerald-700">We&apos;ve sent the link to {email}.</span>
                ) : emailState !== "idle" && emailState !== "sending" ? (
                  <span className="text-maroon-600">{emailState}</span>
                ) : null}
              </p>
            </form>
          </>
        )}
      </motion.div>
    </dialog>
  );
}
