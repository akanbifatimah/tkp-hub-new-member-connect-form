import type { NewMemberFormValues, NewMemberSubmission } from "./schema";

/**
 * Client API layer: the ONLY place the UI talks to the backend.
 * Point NEXT_PUBLIC_API_BASE_URL at the real backend to swap out the mocks.
 */
const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1").replace(/\/$/, "");

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiRequestError(0, "NETWORK", "We couldn't reach the server. Please check your connection and try again.");
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const e = body?.error;
    throw new ApiRequestError(res.status, e?.code ?? "UNKNOWN", e?.message ?? "Something went wrong. Please try again.", e?.fields);
  }
  return body as T;
}

export type DraftSaved = { token: string; expiresAt: string };
export type DraftLoaded = DraftSaved & { data: NewMemberFormValues; step: number; updatedAt: string };

export const api = {
  submit: (submission: NewMemberSubmission, draftToken?: string) =>
    request<{ id: string; submittedAt: string; firstName: string }>("/new-members", {
      method: "POST",
      body: JSON.stringify({ submission, draftToken }),
    }),

  saveDraft: (data: NewMemberFormValues, step: number, token?: string) =>
    token
      ? request<DraftSaved>(`/drafts/${encodeURIComponent(token)}`, { method: "PUT", body: JSON.stringify({ data, step }) })
      : request<DraftSaved>("/drafts", { method: "POST", body: JSON.stringify({ data, step }) }),

  loadDraft: (token: string) => request<DraftLoaded>(`/drafts/${encodeURIComponent(token)}`),

  emailDraftLink: (token: string, email: string) =>
    request<{ sent: true }>(`/drafts/${encodeURIComponent(token)}/email`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

export const resumeUrl = (token: string) =>
  `${typeof window !== "undefined" ? window.location.origin : ""}/?resume=${encodeURIComponent(token)}`;
