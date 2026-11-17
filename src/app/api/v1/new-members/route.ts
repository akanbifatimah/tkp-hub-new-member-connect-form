import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import { db, mockLatency, type NewMemberRecord } from "@/lib/server/mock-db";
import { readJson } from "@/lib/server/http";
import { submitRequestSchema } from "@/lib/server/submission-schema";

/** POST /api/v1/new-members: submit a completed New Members Connect form. */
export async function POST(req: Request) {
  const body = await readJson(req, submitRequestSchema);
  if ("response" in body) return body.response;
  await mockLatency(900);

  const { submission, draftToken } = body.data;
  const record: NewMemberRecord = {
    ...submission,
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    status: "new",
    source: "web",
  };
  db.members.set(record.id, record);
  if (draftToken) db.drafts.delete(draftToken);

  return Response.json(
    { id: record.id, submittedAt: record.submittedAt, firstName: record.person.firstName },
    { status: 201 },
  );
}

/**
 * GET /api/v1/new-members: list submissions (newest first).
 * MOCK ONLY: in production this belongs behind admin auth in the web app.
 */
export async function GET() {
  await connection();
  const items = [...db.members.values()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return Response.json({ items, total: items.length });
}
