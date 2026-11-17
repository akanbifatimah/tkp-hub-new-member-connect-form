import type { NextRequest } from "next/server";
import { db, expiryFromNow, isExpired, mockLatency } from "@/lib/server/mock-db";
import { apiError, readJson } from "@/lib/server/http";
import { saveDraftSchema } from "@/lib/server/submission-schema";

type Ctx = RouteContext<"/api/v1/drafts/[token]">;

function findDraft(token: string) {
  const draft = db.drafts.get(token);
  if (!draft) return { response: apiError(404, "DRAFT_NOT_FOUND", "This link is invalid or has already been used") };
  if (isExpired(draft)) {
    db.drafts.delete(token);
    return { response: apiError(410, "DRAFT_EXPIRED", "This link has expired. Saved entries are kept for 30 days") };
  }
  return { draft };
}

/** GET /api/v1/drafts/:token: load a saved draft to resume. */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  await mockLatency();
  const found = findDraft(token);
  if ("response" in found) return found.response;
  const { data, step, expiresAt, updatedAt } = found.draft;
  return Response.json({ token, data, step, expiresAt, updatedAt });
}

/** PUT /api/v1/drafts/:token: update an existing draft (same link, expiry refreshed). */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const found = findDraft(token);
  if ("response" in found) return found.response;
  const body = await readJson(req, saveDraftSchema);
  if ("response" in body) return body.response;
  await mockLatency();

  Object.assign(found.draft, {
    data: body.data.data,
    step: body.data.step,
    updatedAt: new Date().toISOString(),
    expiresAt: expiryFromNow(),
  });
  return Response.json({ token, expiresAt: found.draft.expiresAt });
}

/** DELETE /api/v1/drafts/:token: discard a draft. */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  db.drafts.delete(token);
  return new Response(null, { status: 204 });
}
