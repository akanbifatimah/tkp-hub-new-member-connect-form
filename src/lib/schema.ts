import { z } from "zod";
import {
  AGE_BRACKETS,
  COUNTRIES,
  DEFAULT_COUNTRY,
  GENDERS,
  HEAR_ABOUT_US,
  MARITAL_STATUSES,
  RATING_ITEMS,
  RATING_SCALE,
  SERVICE_NAMES,
  YES_NO,
  YES_NO_UNDECIDED,
} from "./form-config";

/** Optional single choice: "" means "not answered". */
const optionalChoice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.literal(""), z.enum(values)]);

const requiredChoice = <T extends readonly [string, ...string[]]>(values: T, message: string) =>
  z.string().refine((v): v is T[number] => (values as readonly string[]).includes(v), { message });

const text = (max = 200) => z.string().trim().max(max, `Please keep this under ${max} characters`);
const requiredText = (message: string, max = 100) => text(max).min(1, message);

const ratingsShape = Object.fromEntries(
  RATING_ITEMS.map((r) => [r.key, optionalChoice(RATING_SCALE)]),
) as Record<(typeof RATING_ITEMS)[number]["key"], ReturnType<typeof optionalChoice<typeof RATING_SCALE>>>;

/**
 * Form values as held in the UI. Every field is a string ("" = empty) so
 * drafts can be saved at any point and restored exactly.
 */
export const newMemberFormSchema = z
  .object({
    // Step 1
    serviceDate: z.iso.date({ message: "Please pick the date of the service you attended" }),
    serviceName: optionalChoice(SERVICE_NAMES),
    firstName: requiredText("Please enter your first name"),
    middleName: text(100),
    lastName: requiredText("Please enter your last name"),
    gender: optionalChoice(GENDERS),
    maritalStatus: optionalChoice(MARITAL_STATUSES),
    maritalStatusOther: text(100),

    // Step 2
    dobMonth: z.string(),
    dobDay: z.string(),
    dobYear: z.string(),
    ageBracket: optionalChoice(AGE_BRACKETS),
    nationality: text(100),
    address: text(200),
    apartment: text(100),
    city: text(100),
    state: text(100),
    zipCode: requiredText("Zip code is required to assign you to a cell group", 20),
    country: z.string().refine((v) => v === "" || COUNTRIES.includes(v), "Please choose a country"),
    phone: z
      .string()
      .trim()
      .min(1, "Please enter your phone number")
      .refine((v) => v.replace(/\D/g, "").length >= 7, "Please enter a valid phone number")
      .refine((v) => /^[+\d\s().-]+$/.test(v), "Phone numbers can only contain digits, spaces and + ( ) -"),
    email: z.union([z.literal(""), z.email("Please enter a valid email address")]),

    // Step 3
    bestTimeToVisit: text(200),
    hearAboutUs: requiredChoice(HEAR_ABOUT_US, "Please tell us how you heard about us"),
    invitedBy: text(150),
    hearAboutUsOther: text(500),
    willComeAgain: optionalChoice(YES_NO_UNDECIDED),
    consideringMembership: optionalChoice(YES_NO_UNDECIDED),
    wantsMembership: requiredChoice(YES_NO_UNDECIDED, "Please let us know if you'd like to become a member"),
    likelyNeverReturn: optionalChoice(YES_NO),
    neverReturnReason: text(1000),
    prayerRequest: text(2000),
    comments: text(2000),

    // Step 4
    ratings: z.object(ratingsShape),
  })
  .superRefine((v, ctx) => {
    const parts = [v.dobMonth, v.dobDay, v.dobYear];
    const filled = parts.filter(Boolean).length;
    if (filled === 0) return;
    if (filled < 3) {
      ctx.addIssue({ code: "custom", path: ["dobMonth"], message: "Please complete month, day and year" });
      return;
    }
    const [m, d, y] = parts.map(Number);
    const date = new Date(y, m - 1, d);
    const valid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
    if (!valid) ctx.addIssue({ code: "custom", path: ["dobMonth"], message: "That date doesn't exist" });
    else if (date > new Date()) ctx.addIssue({ code: "custom", path: ["dobMonth"], message: "Date of birth can't be in the future" });
  });

export type NewMemberFormValues = z.input<typeof newMemberFormSchema>;

export const EMPTY_FORM: NewMemberFormValues = {
  serviceDate: "",
  serviceName: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  maritalStatus: "",
  maritalStatusOther: "",
  dobMonth: "",
  dobDay: "",
  dobYear: "",
  ageBracket: "",
  nationality: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zipCode: "",
  country: DEFAULT_COUNTRY,
  phone: "",
  email: "",
  bestTimeToVisit: "",
  hearAboutUs: "",
  invitedBy: "",
  hearAboutUsOther: "",
  willComeAgain: "",
  consideringMembership: "",
  wantsMembership: "",
  likelyNeverReturn: "",
  neverReturnReason: "",
  prayerRequest: "",
  comments: "",
  ratings: Object.fromEntries(RATING_ITEMS.map((r) => [r.key, ""])) as NewMemberFormValues["ratings"],
};

/** Merge a (possibly partial / older) draft onto the empty form safely. */
export function hydrateDraft(data: unknown): NewMemberFormValues {
  const src = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = { ...EMPTY_FORM };
  for (const key of Object.keys(EMPTY_FORM)) {
    if (key === "ratings") continue;
    if (typeof src[key] === "string") out[key] = src[key];
  }
  const r = (src.ratings ?? {}) as Record<string, unknown>;
  out.ratings = Object.fromEntries(
    RATING_ITEMS.map((i) => [i.key, typeof r[i.key] === "string" ? r[i.key] : ""]),
  );
  return out as NewMemberFormValues;
}

/* ------------------------------------------------------------------ */
/* API payload: the clean shape the backend receives on submission.   */
/* ------------------------------------------------------------------ */

const orNull = (v: string) => (v.trim() === "" ? null : v.trim());

export function toSubmissionPayload(v: NewMemberFormValues) {
  const dob =
    v.dobMonth && v.dobDay && v.dobYear
      ? `${v.dobYear}-${v.dobMonth.padStart(2, "0")}-${v.dobDay.padStart(2, "0")}`
      : null;

  return {
    service: {
      date: v.serviceDate,
      name: orNull(v.serviceName),
    },
    person: {
      firstName: v.firstName.trim(),
      middleName: orNull(v.middleName),
      lastName: v.lastName.trim(),
      gender: orNull(v.gender),
      maritalStatus: orNull(v.maritalStatus),
      maritalStatusOther: v.maritalStatus === "Other" ? orNull(v.maritalStatusOther) : null,
      dateOfBirth: dob,
      ageBracket: orNull(v.ageBracket),
      nationality: orNull(v.nationality),
    },
    contact: {
      phone: v.phone.trim(),
      email: orNull(v.email),
      address: {
        line1: orNull(v.address),
        line2: orNull(v.apartment),
        city: orNull(v.city),
        state: orNull(v.state),
        zipCode: v.zipCode.trim(),
        country: orNull(v.country),
      },
    },
    followUp: {
      bestTimeToVisit: orNull(v.bestTimeToVisit),
      hearAboutUs: v.hearAboutUs,
      invitedBy: v.hearAboutUs === "Invited By Someone" ? orNull(v.invitedBy) : null,
      hearAboutUsOther: v.hearAboutUs === "Other" ? orNull(v.hearAboutUsOther) : null,
      willComeAgain: orNull(v.willComeAgain),
      consideringMembership: orNull(v.consideringMembership),
      wantsMembership: v.wantsMembership,
      likelyNeverReturn: orNull(v.likelyNeverReturn),
      neverReturnReason: v.likelyNeverReturn === "Yes" ? orNull(v.neverReturnReason) : null,
      prayerRequest: orNull(v.prayerRequest),
      comments: orNull(v.comments),
    },
    ratings: Object.fromEntries(
      RATING_ITEMS.map((r) => [r.key, v.ratings[r.key] ? Number(v.ratings[r.key]) : null]),
    ) as Record<(typeof RATING_ITEMS)[number]["key"], number | null>,
    consent: true as const,
  };
}

export type NewMemberSubmission = ReturnType<typeof toSubmissionPayload>;
