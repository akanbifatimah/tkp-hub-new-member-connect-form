import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import type { NewMemberSubmission } from "@/lib/schema";

/**
 * In-memory MOCK store. Stands in for the real backend so the frontend is
 * fully functional. Data resets when the dev server restarts.
 * See docs/API.md for the contract the real backend should implement.
 */

export const DRAFT_TTL_DAYS = 30;

export type NewMemberRecord = NewMemberSubmission & {
  id: string;
  submittedAt: string;
  status: "new";
  source: "web";
};

export type DraftRecord = {
  token: string;
  data: Record<string, unknown>;
  step: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  emailedTo: string[];
};

type Store = { members: Map<string, NewMemberRecord>; drafts: Map<string, DraftRecord> };

const g = globalThis as unknown as { __tkpMockStore?: Store };

function seed(): Store {
  const members = new Map<string, NewMemberRecord>();
  const sample: Array<[string, string, string, string, string]> = [
    ["Adaeze", "Okafor", "77494", "Invited By Someone", "Yes"],
    ["Marcus", "Bennett", "77449", "Google Search", "Undecided"],
    ["Tolu", "Adeyemi", "77493", "Youtube", "Yes"],
  ];
  sample.forEach(([firstName, lastName, zipCode, hearAboutUs, wantsMembership], i) => {
    const id = randomUUID();
    members.set(id, {
      id,
      submittedAt: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
      status: "new",
      source: "web",
      service: { date: new Date(Date.now() - (i + 1) * 86_400_000).toISOString().slice(0, 10), name: "Sunday 1st Service" },
      person: {
        firstName,
        middleName: null,
        lastName,
        gender: i === 1 ? "Male" : "Female",
        maritalStatus: "Single",
        maritalStatusOther: null,
        dateOfBirth: null,
        ageBracket: "26-30",
        nationality: null,
        // ^ mock data only; never real member data
      },
      contact: {
        phone: `+1 832 555 01${10 + i}`,
        email: `${firstName.toLowerCase()}@example.com`,
        address: { line1: null, line2: null, city: "Katy", state: "TX", zipCode, country: "United States" },
      },
      followUp: {
        bestTimeToVisit: "Weekday evenings",
        hearAboutUs,
        invitedBy: hearAboutUs === "Invited By Someone" ? "Sis. Grace" : null,
        hearAboutUsOther: null,
        willComeAgain: "Yes",
        consideringMembership: "Yes",
        wantsMembership,
        likelyNeverReturn: "No",
        neverReturnReason: null,
        prayerRequest: null,
        comments: null,
      },
      ratings: {
        music: 9, preaching: 10, comfort: 8, hospitality: 9,
        churchEnvironment: 9, people: 10, traffic: 7, parking: 6,
      },
      consent: true,
    });
  });
  return { members, drafts: new Map() };
}

export const db: Store = (g.__tkpMockStore ??= seed());

export const newDraftToken = () => randomBytes(18).toString("base64url");

export function isExpired(d: DraftRecord) {
  return new Date(d.expiresAt).getTime() < Date.now();
}

export function expiryFromNow() {
  return new Date(Date.now() + DRAFT_TTL_DAYS * 86_400_000).toISOString();
}

/** Small artificial latency so loading states are visible in the UI. */
export const mockLatency = (ms = 450) => new Promise((r) => setTimeout(r, ms));
