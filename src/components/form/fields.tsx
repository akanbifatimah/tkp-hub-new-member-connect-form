"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

export const inputBase =
  "w-full rounded-2xl border bg-white/80 px-4 py-3 text-[15px] text-ink shadow-[inset_0_1px_2px_rgb(33_14_10/0.06)] " +
  "placeholder:text-maroon-500/50 transition-[border-color,box-shadow,background-color] duration-200 " +
  "hover:border-maroon-500/40 focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-gold-400/25";

const borderFor = (error?: string) => (error ? "border-maroon-600/70 bg-maroon-100/40" : "border-maroon-900/12");

export function ErrorText({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          key={message}
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-maroon-600"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0 fill-current">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5h1.5v4.5h-1.5V4.5Zm.75 7.25a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" />
          </svg>
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

type FieldShellProps = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (ids: { inputId: string; describedBy?: string }) => ReactNode;
};

export function FieldShell({ label, required, hint, error, className, children }: FieldShellProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-[14px] font-bold text-maroon-900">
        {label}
        {required ? <span className="ml-0.5 text-maroon-600" aria-hidden> *</span> : null}
        {!required ? <span className="ml-1.5 text-[12px] font-medium text-maroon-500/70">(optional)</span> : null}
      </label>
      {children({ inputId, describedBy })}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-[13px] text-maroon-500">
          {hint}
        </p>
      ) : null}
      <ErrorText id={errorId} message={error} />
    </div>
  );
}

type TextFieldProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

export function TextField({ label, registration, error, hint, required, className, ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} required={required} hint={hint} error={error} className={className}>
      {({ inputId, describedBy }) => (
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={describedBy}
          className={cx(inputBase, borderFor(error))}
          {...rest}
          {...registration}
        />
      )}
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<ComponentPropsWithoutRef<"textarea">, "id"> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

export function TextAreaField({ label, registration, error, hint, required, className, ...rest }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} required={required} hint={hint} error={error} className={className}>
      {({ inputId, describedBy }) => (
        <textarea
          id={inputId}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cx(inputBase, "min-h-28 resize-y leading-relaxed", borderFor(error))}
          data-lenis-prevent
          {...rest}
          {...registration}
        />
      )}
    </FieldShell>
  );
}

type SelectFieldProps = Omit<ComponentPropsWithoutRef<"select">, "id"> & {
  label: string;
  registration: UseFormRegisterReturn;
  options: readonly string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

export function SelectField({ label, registration, options, placeholder, error, required, className, ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} required={required} error={error} className={className}>
      {({ inputId, describedBy }) => (
        <select
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cx(inputBase, "select-arrow cursor-pointer", borderFor(error))}
          {...rest}
          {...registration}
        >
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

type ChoiceGroupProps = {
  legend: string;
  name: string;
  options: readonly string[];
  registration: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  columns?: string;
};

/** Radio group rendered as tappable pills (native radios => full keyboard support). */
export function ChoiceGroup({ legend, name, options, registration, error, required, hint, className, columns }: ChoiceGroupProps) {
  const id = useId();
  return (
    <fieldset
      className={className}
      aria-invalid={!!error}
      aria-describedby={cx(hint && `${id}-hint`, error && `${id}-error`) || undefined}
    >
      <legend className="mb-2 block text-[14px] font-bold text-maroon-900">
        {legend}
        {required ? <span className="ml-0.5 text-maroon-600" aria-hidden> *</span> : null}
        {!required ? <span className="ml-1.5 text-[12px] font-medium text-maroon-500/70">(optional)</span> : null}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-1 mb-2 text-[13px] text-maroon-500">
          {hint}
        </p>
      ) : null}
      <div className={cx("flex flex-wrap gap-2", columns)}>
        {options.map((opt) => (
          <label key={opt} className="group relative cursor-pointer select-none">
            <input type="radio" value={opt} className="peer sr-only" {...registration} name={name} />
            <span
              className={cx(
                "flex h-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-center text-[14px] font-semibold",
                "border-maroon-900/12 bg-white/70 text-maroon-800 transition-all duration-200",
                "group-hover:-translate-y-0.5 group-hover:border-gold-500/60 group-hover:bg-white",
                "peer-focus-visible:ring-4 peer-focus-visible:ring-gold-400/40",
                "peer-checked:border-maroon-700 peer-checked:bg-linear-to-br peer-checked:from-maroon-700 peer-checked:to-maroon-900",
                "peer-checked:text-cream-100 peer-checked:shadow-[0_8px_20px_-8px_rgb(110_13_18/0.7)]",
                error && "border-maroon-600/50",
              )}
            >
              <span
                aria-hidden
                className="size-2 rounded-full bg-maroon-900/15 transition-colors group-has-checked:bg-gold-400"
              />
              {opt}
            </span>
          </label>
        ))}
      </div>
      <ErrorText id={`${id}-error`} message={error} />
    </fieldset>
  );
}

type RatingProps = {
  label: string;
  name: string;
  value: string;
  registration: UseFormRegisterReturn;
};

const ratingWord = (n: number) =>
  n >= 9 ? "Excellent" : n >= 7 ? "Very good" : n >= 5 ? "Good" : n >= 3 ? "Fair" : "Poor";

/** 1 to 10 rating with a warm gradient that fills up to the chosen score. */
export function RatingScale({ label, name, value, registration }: RatingProps) {
  const selected = value ? Number(value) : 0;
  return (
    <fieldset className="rounded-3xl border border-maroon-900/8 bg-white/60 p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <legend className="text-[15px] font-bold text-maroon-900">{label}</legend>
        <span aria-live="polite" className="min-w-20 text-right text-[13px] font-bold text-gold-600">
          {selected ? `${selected}/10 · ${ratingWord(selected)}` : "Tap to rate"}
        </span>
      </div>
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const on = n <= selected;
          return (
            <label key={n} className="group relative cursor-pointer">
              <input type="radio" value={String(n)} className="peer sr-only" {...registration} name={name} aria-label={`${label}: ${n} out of 10`} />
              <span
                className={cx(
                  "flex aspect-square items-center justify-center rounded-xl text-[13px] font-extrabold transition-all duration-200 sm:text-[14px]",
                  "peer-focus-visible:ring-4 peer-focus-visible:ring-gold-400/40",
                  on
                    ? "text-maroon-950 shadow-[0_6px_14px_-6px_rgb(176_141_34/0.9)]"
                    : "bg-cream-200 text-maroon-500 group-hover:-translate-y-0.5 group-hover:bg-cream-300",
                  n === selected && "scale-110",
                )}
                style={
                  on
                    ? { background: `linear-gradient(160deg, #f6e7b0, hsl(${44 - (10 - n) * 1.2} 64% ${62 - n * 1.6}%))` }
                    : undefined
                }
              >
                {n}
              </span>
            </label>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-maroon-500/70">
        <span>Poor</span>
        <span>Very good</span>
      </div>
    </fieldset>
  );
}
