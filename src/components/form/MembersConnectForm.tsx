"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type FieldErrors, type FieldPath } from "react-hook-form";
import { api, ApiRequestError } from "@/lib/api";
import { CONSENT_TEXT, STEPS } from "@/lib/form-config";
import { smoothScrollTo } from "@/lib/smooth-scroll";
import { useQueryParam } from "@/lib/use-client";
import { EMPTY_FORM, hydrateDraft, newMemberFormSchema, toSubmissionPayload, type NewMemberFormValues } from "@/lib/schema";
import { SaveResumeDialog } from "./SaveResumeDialog";
import { StepConnect, StepContact, StepExperience, StepVisit } from "./steps";
import { SuccessCelebration } from "./SuccessCelebration";

type Field = FieldPath<NewMemberFormValues>;
const STEP_COMPONENTS = [StepVisit, StepContact, StepConnect, StepExperience];

/** Find the first step that contains a validation error. */
function firstStepWithError(errors: FieldErrors<NewMemberFormValues>) {
  const flat = new Set<string>();
  for (const [k, v] of Object.entries(errors)) {
    if (k === "ratings" && v && typeof v === "object") Object.keys(v).forEach((r) => flat.add(`ratings.${r}`));
    else flat.add(k);
  }
  const idx = STEPS.findIndex((s) => (s.fields as readonly string[]).some((f) => flat.has(f)));
  return idx === -1 ? 0 : idx;
}

type Banner = { tone: "error" | "info"; text: string } | null;

export function MembersConnectForm() {
  const methods = useForm<NewMemberFormValues>({
    resolver: zodResolver(newMemberFormSchema),
    defaultValues: EMPTY_FORM,
    mode: "onTouched",
    shouldFocusError: true,
  });
  const { handleSubmit, trigger, getValues, reset, formState } = methods;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [draftToken, setDraftToken] = useState<string>();
  const [saveOpen, setSaveOpen] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const resumeToken = useQueryParam("resume");
  const [resumeDone, setResumeDone] = useState(false);
  const resuming = !!resumeToken && !resumeDone;
  const [done, setDone] = useState<{ firstName: string } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const scrollToTop = useCallback(() => {
    const el = topRef.current;
    // Only scroll if the top of the card is out of view.
    if (el && el.getBoundingClientRect().top < 0) smoothScrollTo(el, -24);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > step ? 1 : -1);
      setStep(next);
      setBanner(null);
      scrollToTop();
    },
    [step, scrollToTop],
  );

  // Resume from a saved link: /?resume=<token>
  useEffect(() => {
    if (!resumeToken) return;
    api
      .loadDraft(resumeToken)
      .then((d) => {
        reset(hydrateDraft(d.data));
        setDraftToken(d.token);
        setStep(Math.min(Math.max(d.step - 1, 0), STEPS.length - 1));
        setBanner({ tone: "info", text: "Welcome back! We've restored your saved progress." });
        setTimeout(scrollToTop, 300);
      })
      .catch((e: unknown) =>
        setBanner({ tone: "error", text: e instanceof ApiRequestError ? e.message : "We couldn't load your saved form." }),
      )
      .finally(() => {
        setResumeDone(true);
        // Remove the token from the address bar (it stays valid until submit/expiry).
        window.history.replaceState(null, "", window.location.pathname);
      });
  }, [resumeToken, reset, scrollToTop]);

  async function next() {
    const ok = await trigger(STEPS[step].fields as unknown as Field[], { shouldFocus: true });
    if (ok) goTo(step + 1);
  }

  const onValid = async (values: NewMemberFormValues) => {
    setBanner(null);
    try {
      const res = await api.submit(toSubmissionPayload(values), draftToken);
      setDone({ firstName: res.firstName });
      scrollToTop();
    } catch (e) {
      setBanner({
        tone: "error",
        text: e instanceof ApiRequestError ? e.message : "Something went wrong while submitting. Please try again.",
      });
    }
  };

  const onInvalid = (errors: FieldErrors<NewMemberFormValues>) => {
    const target = firstStepWithError(errors);
    if (target !== step) goTo(target);
    setBanner({ tone: "error", text: "A few details still need your attention." });
  };

  const save = useCallback(async () => {
    const res = await api.saveDraft(getValues(), step + 1, draftToken);
    setDraftToken(res.token);
    return res;
  }, [getValues, step, draftToken]);

  const isLast = step === STEPS.length - 1;
  const StepBody = STEP_COMPONENTS[step];
  const progress = done ? 100 : ((step + 1) / STEPS.length) * 100;

  return (
    <div ref={topRef} className="relative scroll-mt-6">
      <div className="relative overflow-hidden rounded-4xl bg-cream-100/95 shadow-card ring-1 ring-white/40 backdrop-blur-xl">
        {/* Gold hairline */}
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-maroon-700 via-gold-400 to-maroon-700" />

        <div className="px-5 pt-8 pb-6 sm:px-10 sm:pt-10">
          {done ? (
            <SuccessCelebration firstName={done.firstName} />
          ) : (
            <>
              <StepProgress step={step} progress={progress} />

              <div aria-live="polite" className="sr-only">
                Step {step + 1} of {STEPS.length}: {STEPS[step].title}
              </div>

              <AnimatePresence initial={false}>
                {banner ? (
                  <motion.div
                    key={banner.text}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role={banner.tone === "error" ? "alert" : "status"}
                    className={
                      "mb-6 rounded-2xl px-4 py-3 text-[14px] font-semibold " +
                      (banner.tone === "error"
                        ? "bg-maroon-100 text-maroon-700 ring-1 ring-maroon-600/20"
                        : "bg-gold-300/30 text-maroon-800 ring-1 ring-gold-500/40")
                    }
                  >
                    {banner.text}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {resuming ? (
                <div className="grid min-h-60 place-items-center" role="status">
                  <span className="flex items-center gap-3 font-semibold text-maroon-700">
                    <span className="size-5 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent" />
                    Restoring your saved progress…
                  </span>
                </div>
              ) : (
                <FormProvider {...methods}>
                  <form
                    noValidate
                    aria-labelledby="form-step-title"
                    onSubmit={(e) => {
                      if (!isLast) {
                        e.preventDefault();
                        void next();
                        return;
                      }
                      void handleSubmit(onValid, onInvalid)(e);
                    }}
                  >
                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                      <motion.section
                        key={step}
                        custom={direction}
                        variants={{
                          enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 48, filter: "blur(6px)" }),
                          center: { opacity: 1, x: 0, filter: "blur(0px)" },
                          exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -48, filter: "blur(6px)" }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        onAnimationComplete={(def) => {
                          // Move focus to the new step heading (no mobile keyboard pop-up).
                          if (def === "center" && step > 0) document.getElementById("form-step-title")?.focus({ preventScroll: true });
                        }}
                      >
                        <header className="mb-7">
                          <h2 id="form-step-title" tabIndex={-1} className="outline-none font-display text-[28px] leading-tight font-semibold text-maroon-900 sm:text-[34px]">
                            {STEPS[step].title}
                          </h2>
                          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-maroon-800/75">{STEPS[step].blurb}</p>
                        </header>
                        <StepBody />
                      </motion.section>
                    </AnimatePresence>

                    <p className="mt-8 rounded-2xl bg-cream-200 px-4 py-3 text-[13px] leading-relaxed text-maroon-800/80">
                      <span className="font-bold text-maroon-900">Legal disclaimer: </span>
                      {CONSENT_TEXT}
                    </p>

                    <nav aria-label="Form steps" className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => setSaveOpen(true)}
                        className="rounded-full px-5 py-3 text-[15px] font-bold text-maroon-700 underline-offset-4 transition hover:bg-maroon-100/60 hover:underline sm:mr-auto"
                      >
                        Save and Resume Later
                      </button>
                      {step > 0 ? (
                        <button
                          type="button"
                          onClick={() => goTo(step - 1)}
                          className="rounded-full border border-maroon-700/25 bg-white/70 px-6 py-3 text-[15px] font-bold text-maroon-800 transition hover:-translate-y-0.5 hover:border-maroon-700/50"
                        >
                          Previous
                        </button>
                      ) : null}
                      <button
                        type="submit"
                        disabled={formState.isSubmitting}
                        className="group relative overflow-hidden rounded-full bg-linear-to-br from-maroon-600 via-maroon-700 to-maroon-900 px-8 py-3.5 text-[15px] font-extrabold text-cream-100 shadow-[0_14px_30px_-12px_rgb(110_13_18/0.9)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-80"
                      >
                        <span
                          aria-hidden
                          className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                        />
                        <span className="relative flex items-center justify-center gap-2">
                          {formState.isSubmitting ? (
                            <>
                              <span className="size-4 animate-spin rounded-full border-2 border-cream-100 border-t-transparent" />
                              Submitting…
                            </>
                          ) : isLast ? (
                            "Submit"
                          ) : (
                            <>
                              Next
                              <svg viewBox="0 0 20 20" className="size-4 transition-transform group-hover:translate-x-1" aria-hidden>
                                <path d="M4 10h11m-4-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </>
                          )}
                        </span>
                      </button>
                    </nav>
                  </form>
                </FormProvider>
              )}
            </>
          )}
        </div>
      </div>

      <SaveResumeDialog open={saveOpen} onClose={() => setSaveOpen(false)} save={save} defaultEmail={getValues("email")} />
    </div>
  );
}

function StepProgress({ step, progress }: { step: number; progress: number }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-[12px] font-extrabold tracking-[0.18em] text-maroon-500 uppercase">
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
        <span className="text-gold-600">{Math.round(progress)}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-cream-300/70"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step + 1}
        aria-label="Form progress"
      >
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-maroon-700 via-maroon-600 to-gold-400"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <ol className="mt-4 hidden grid-cols-4 gap-2 sm:grid">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === step ? "step" : undefined}
            className={
              "flex items-center gap-2 text-[13px] font-bold transition-colors " +
              (i <= step ? "text-maroon-800" : "text-maroon-500/50")
            }
          >
            <span
              className={
                "grid size-6 shrink-0 place-items-center rounded-full text-[11px] transition-all " +
                (i < step
                  ? "bg-gold-500 text-maroon-950"
                  : i === step
                    ? "bg-maroon-700 text-cream-100 ring-4 ring-maroon-700/15"
                    : "bg-cream-300 text-maroon-500")
              }
            >
              {i < step ? "✓" : i + 1}
            </span>
            {s.title}
          </li>
        ))}
      </ol>
    </div>
  );
}
