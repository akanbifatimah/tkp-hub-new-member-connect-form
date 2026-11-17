import { db, expiryFromNow, mockLatency, newDraftToken, type DraftRecord } from "@/lib/server/mock-db";
import { readJson } from "@/lib/server/http";
import { saveDraftSchema } from "@/lib/server/submission-schema";

/** POST /api/v1/drafts: "Save and Resume Later". Creates a resumable draft. */
export async function POST(req: Request) {
  const body = await readJson(req, saveDraftSchema);
  if ("response" in body) return body.response;
  await mockLatency();

  const now = new Date().toISOString();
  const draft: DraftRecord = {
    token: newDraftToken(),
    data: body.data.data,
    step: body.data.step,
    createdAt: now,
    updatedAt: now,
    expiresAt: expiryFromNow(),
    emailedTo: [],
  };
  db.drafts.set(draft.token, draft);

  return Response.json({ token: draft.token, expiresAt: draft.expiresAt }, { status: 201 });
}
