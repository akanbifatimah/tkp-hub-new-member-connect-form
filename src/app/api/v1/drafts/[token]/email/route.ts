import type { NextRequest } from "next/server";
import { db, isExpired, mockLatency } from "@/lib/server/mock-db";
import { apiError, readJson } from "@/lib/server/http";
import { emailDraftSchema } from "@/lib/server/submission-schema";

/**
 * POST /api/v1/drafts/:token/email: email the resume link to the visitor.
 * MOCK: records the address instead of sending. The real backend should send
 * an email containing `${SITE_URL}/?resume=${token}`.
 */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/v1/drafts/[token]/email">) {
  const { token } = await ctx.params;
  const draft = db.drafts.get(token);
  if (!draft || isExpired(draft)) return apiError(404, "DRAFT_NOT_FOUND", "This link is invalid or has expired");

  const body = await readJson(req, emailDraftSchema);
  if ("response" in body) return body.response;
  await mockLatency(700);

  draft.emailedTo.push(body.data.email);
  return Response.json({ sent: true });
}
