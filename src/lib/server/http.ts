import "server-only";
import type { z } from "zod";

export type ApiError = {
  error: { code: string; message: string; fields?: Record<string, string[]> };
};

export function apiError(status: number, code: string, message: string, fields?: Record<string, string[]>) {
  return Response.json({ error: { code, message, ...(fields ? { fields } : {}) } } satisfies ApiError, { status });
}

const MAX_BODY_BYTES = 64 * 1024;

/** Parse + validate a JSON body. Returns either data or a ready error Response. */
export async function readJson<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<{ data: z.output<T> } | { response: Response }> {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return { response: apiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large") };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { response: apiError(400, "INVALID_JSON", "Request body must be valid JSON") };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const fields: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fields[key] ??= []).push(issue.message);
    }
    return { response: apiError(422, "VALIDATION_FAILED", "Some fields are invalid", fields) };
  }
  return { data: parsed.data };
}
