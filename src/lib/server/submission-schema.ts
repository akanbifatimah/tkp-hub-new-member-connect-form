import "server-only";
import { z } from "zod";
import {
  AGE_BRACKETS,
  GENDERS,
  HEAR_ABOUT_US,
  MARITAL_STATUSES,
  RATING_ITEMS,
  SERVICE_NAMES,
  YES_NO,
  YES_NO_UNDECIDED,
} from "@/lib/form-config";

/** Server-side validation of the POST /new-members payload (see docs/API.md). */
const s = (max: number) => z.string().trim().max(max).nullable();
const choice = <T extends readonly [string, ...string[]]>(v: T) => z.enum(v).nullable();
const rating = z.number().int().min(1).max(10).nullable();

export const submissionSchema = z.object({
  service: z.object({ date: z.iso.date(), name: choice(SERVICE_NAMES) }),
  person: z.object({
    firstName: z.string().trim().min(1).max(100),
    middleName: s(100),
    lastName: z.string().trim().min(1).max(100),
    gender: choice(GENDERS),
    maritalStatus: choice(MARITAL_STATUSES),
    maritalStatusOther: s(100),
    dateOfBirth: z.iso.date().nullable(),
    ageBracket: choice(AGE_BRACKETS),
    nationality: s(100),
  }),
  contact: z.object({
    phone: z.string().trim().min(7).max(30),
    email: z.email().nullable(),
    address: z.object({
      line1: s(200),
      line2: s(100),
      city: s(100),
      state: s(100),
      zipCode: z.string().trim().min(1).max(20),
      country: s(100),
    }),
  }),
  followUp: z.object({
    bestTimeToVisit: s(200),
    hearAboutUs: z.enum(HEAR_ABOUT_US),
    invitedBy: s(150),
    hearAboutUsOther: s(500),
    willComeAgain: choice(YES_NO_UNDECIDED),
    consideringMembership: choice(YES_NO_UNDECIDED),
    wantsMembership: z.enum(YES_NO_UNDECIDED),
    likelyNeverReturn: choice(YES_NO),
    neverReturnReason: s(1000),
    prayerRequest: s(2000),
    comments: s(2000),
  }),
  ratings: z.object(
    Object.fromEntries(RATING_ITEMS.map((r) => [r.key, rating])) as Record<
      (typeof RATING_ITEMS)[number]["key"],
      typeof rating
    >,
  ),
  consent: z.literal(true),
});

export const submitRequestSchema = z.object({
  submission: submissionSchema,
  /** If the visitor resumed from a saved draft, it is deleted on submit. */
  draftToken: z.string().max(64).optional(),
});

export const saveDraftSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  step: z.number().int().min(1).max(4),
});

export const emailDraftSchema = z.object({ email: z.email() });
