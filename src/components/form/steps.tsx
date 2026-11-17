"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  AGE_BRACKETS,
  COUNTRIES,
  GENDERS,
  HEAR_ABOUT_US,
  MARITAL_STATUSES,
  RATING_ITEMS,
  SERVICE_NAMES,
  YES_NO,
  YES_NO_UNDECIDED,
} from "@/lib/form-config";
import type { NewMemberFormValues } from "@/lib/schema";
import { useIsClient } from "@/lib/use-client";
import { ChoiceGroup, ErrorText, RatingScale, SelectField, TextAreaField, TextField, inputBase } from "./fields";

/** Reveals a conditional follow-up field with a smooth height animation. */
function Reveal({ when, children }: { when: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {when ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="pt-1 pb-0.5">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function useStepForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<NewMemberFormValues>();
  return { register, control, errors };
}

/** Today's date (YYYY-MM-DD), read only in the browser so prerendering stays static. */
function useToday() {
  const isClient = useIsClient();
  if (!isClient) return undefined;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Fallback year used only during prerender; replaced with the real year after hydration. */
const PRERENDER_YEAR = 2026;

export function StepVisit() {
  const { register, control, errors } = useStepForm();
  const marital = useWatch({ control, name: "maritalStatus" });
  const today = useToday();
  return (
    <div className="grid gap-6">
      <TextField
        label="Service Date"
        type="date"
        required
        max={today}
        registration={register("serviceDate")}
        error={errors.serviceDate?.message}
        className="sm:max-w-xs"
      />
      <ChoiceGroup
        legend="Service Name"
        name="serviceName"
        options={SERVICE_NAMES}
        registration={register("serviceName")}
        error={errors.serviceName?.message}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField label="First Name" required autoComplete="given-name" registration={register("firstName")} error={errors.firstName?.message} />
        <TextField label="Middle Name" autoComplete="additional-name" registration={register("middleName")} error={errors.middleName?.message} />
        <TextField label="Last Name" required autoComplete="family-name" registration={register("lastName")} error={errors.lastName?.message} />
      </div>
      <ChoiceGroup legend="Gender" name="gender" options={GENDERS} registration={register("gender")} error={errors.gender?.message} />
      <div>
        <ChoiceGroup
          legend="Marital Status"
          name="maritalStatus"
          options={MARITAL_STATUSES}
          registration={register("maritalStatus")}
          error={errors.maritalStatus?.message}
        />
        <Reveal when={marital === "Other"}>
          <TextField
            label="If 'Other', specify"
            registration={register("maritalStatusOther")}
            error={errors.maritalStatusOther?.message}
            className="mt-4 sm:max-w-md"
          />
        </Reveal>
      </div>
    </div>
  );
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function DateOfBirth() {
  const { register, errors } = useStepForm();
  const isClient = useIsClient();
  const thisYear = isClient ? new Date().getFullYear() : PRERENDER_YEAR;
  const years = Array.from({ length: 101 }, (_, i) => String(thisYear - i));
  const err = errors.dobMonth?.message;
  const sel = `${inputBase} select-arrow cursor-pointer ${err ? "border-maroon-600/70" : "border-maroon-900/12"}`;
  return (
    <fieldset aria-describedby={err ? "dob-error" : undefined}>
      <legend className="mb-1.5 block text-[14px] font-bold text-maroon-900">
        Date of Birth <span className="ml-1.5 text-[12px] font-medium text-maroon-500/70">(optional)</span>
      </legend>
      <div className="grid grid-cols-[1.4fr_1fr_1.2fr] gap-2">
        <select aria-label="Birth month" autoComplete="bday-month" className={sel} {...register("dobMonth")}>
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1)}>
              {m}
            </option>
          ))}
        </select>
        <select aria-label="Birth day" autoComplete="bday-day" className={sel} {...register("dobDay", { deps: ["dobMonth"] })}>
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select aria-label="Birth year" autoComplete="bday-year" className={sel} {...register("dobYear", { deps: ["dobMonth"] })}>
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <ErrorText id="dob-error" message={err} />
    </fieldset>
  );
}

export function StepContact() {
  const { register, errors } = useStepForm();
  return (
    <div className="grid gap-6">
      <DateOfBirth />
      <ChoiceGroup
        legend="Age Bracket"
        name="ageBracket"
        options={AGE_BRACKETS}
        registration={register("ageBracket")}
        error={errors.ageBracket?.message}
        columns="grid grid-cols-3 sm:grid-cols-5"
      />
      <TextField label="Nationality" registration={register("nationality")} error={errors.nationality?.message} className="sm:max-w-md" />
      <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
        <TextField label="Address" autoComplete="address-line1" registration={register("address")} error={errors.address?.message} />
        <TextField label="Apartment / Building" autoComplete="address-line2" registration={register("apartment")} error={errors.apartment?.message} />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField label="City" autoComplete="address-level2" registration={register("city")} error={errors.city?.message} />
        <TextField label="State" autoComplete="address-level1" registration={register("state")} error={errors.state?.message} />
        <TextField
          label="Zip Code / Postal Code"
          required
          autoComplete="postal-code"
          inputMode="text"
          registration={register("zipCode")}
          error={errors.zipCode?.message}
          hint="We use this to connect you to a cell group near you."
        />
      </div>
      <SelectField
        label="Country"
        autoComplete="country-name"
        options={COUNTRIES}
        placeholder="Select a country"
        registration={register("country")}
        error={errors.country?.message}
        className="sm:max-w-md"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Phone" required type="tel" autoComplete="tel" inputMode="tel" registration={register("phone")} error={errors.phone?.message} />
        <TextField label="Email" type="email" autoComplete="email" inputMode="email" registration={register("email")} error={errors.email?.message} />
      </div>
    </div>
  );
}

export function StepConnect() {
  const { register, control, errors } = useStepForm();
  const [hear, neverReturn] = useWatch({ control, name: ["hearAboutUs", "likelyNeverReturn"] });
  return (
    <div className="grid gap-6">
      <TextField
        label="When is the best time to visit you?"
        placeholder="e.g. Saturday afternoons"
        registration={register("bestTimeToVisit")}
        error={errors.bestTimeToVisit?.message}
        className="sm:max-w-md"
      />
      <div>
        <ChoiceGroup
          legend="How did you hear about us?"
          name="hearAboutUs"
          required
          options={HEAR_ABOUT_US}
          registration={register("hearAboutUs")}
          error={errors.hearAboutUs?.message}
        />
        <Reveal when={hear === "Invited By Someone"}>
          <TextField label="Please who invited you?" registration={register("invitedBy")} error={errors.invitedBy?.message} className="mt-4 sm:max-w-md" />
        </Reveal>
        <Reveal when={hear === "Other"}>
          <TextAreaField label="If Other, please specify" rows={2} registration={register("hearAboutUsOther")} error={errors.hearAboutUsOther?.message} className="mt-4" />
        </Reveal>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <ChoiceGroup legend="Will you come again?" name="willComeAgain" options={YES_NO_UNDECIDED} registration={register("willComeAgain")} error={errors.willComeAgain?.message} />
        <ChoiceGroup
          legend="Will you give a thought to becoming a member?"
          name="consideringMembership"
          options={YES_NO_UNDECIDED}
          registration={register("consideringMembership")}
          error={errors.consideringMembership?.message}
        />
        <ChoiceGroup
          legend="Would you like to become a member?"
          name="wantsMembership"
          required
          options={YES_NO_UNDECIDED}
          registration={register("wantsMembership")}
          error={errors.wantsMembership?.message}
        />
        <ChoiceGroup
          legend="Is it likely you will never come again?"
          name="likelyNeverReturn"
          options={YES_NO}
          registration={register("likelyNeverReturn")}
          error={errors.likelyNeverReturn?.message}
        />
      </div>
      <Reveal when={neverReturn === "Yes"}>
        <TextAreaField
          label={'If "Yes", please why?'}
          hint="Your honest feedback helps us serve people better."
          registration={register("neverReturnReason")}
          error={errors.neverReturnReason?.message}
        />
      </Reveal>
      <TextAreaField
        label="Prayer Requests"
        placeholder="Do you have a prayer request? Please enter the details here."
        hint="Our prayer team will stand with you in prayer."
        registration={register("prayerRequest")}
        error={errors.prayerRequest?.message}
      />
      <TextAreaField label="Comments" registration={register("comments")} error={errors.comments?.message} />
    </div>
  );
}

export function StepExperience() {
  const { register, control } = useStepForm();
  const ratings = useWatch({ control, name: "ratings" });
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {RATING_ITEMS.map((item) => (
        <RatingScale
          key={item.key}
          label={item.label}
          name={`ratings.${item.key}`}
          value={ratings?.[item.key] ?? ""}
          registration={register(`ratings.${item.key}`)}
        />
      ))}
    </div>
  );
}
