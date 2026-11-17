# TKP New Members Connect: API contract

The frontend currently runs against **mock** Next.js route handlers in `src/app/api/v1/**` with an in-memory store (`src/lib/server/mock-db.ts`).
The real backend only needs to implement the endpoints below. Then set:

```
NEXT_PUBLIC_API_BASE_URL=https://api.example.org/api/v1
```

All UI calls go through `src/lib/api.ts`, and nothing else in the UI talks to the network.

- Content type: `application/json`
- Base path: `/api/v1`
- Errors always use this shape:

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Some fields are invalid", "fields": { "contact.phone": ["Too short"] } } }
```

| Status | `code` | When |
|---|---|---|
| 400 | `INVALID_JSON` | Body isn't valid JSON |
| 404 | `DRAFT_NOT_FOUND` | Unknown or used resume token |
| 410 | `DRAFT_EXPIRED` | Resume token older than 30 days |
| 413 | `PAYLOAD_TOO_LARGE` | Body > 64 KB |
| 422 | `VALIDATION_FAILED` | Field validation failed (`fields` keyed by dot path) |

The UI shows `error.message` to the visitor, so keep messages friendly.

---

## 1. Submit the form

`POST /new-members`

```json
{
  "submission": {
    "service": { "date": "2026-11-15", "name": "Sunday 1st Service" },
    "person": {
      "firstName": "Grace", "middleName": null, "lastName": "Adebayo",
      "gender": "Female", "maritalStatus": "Married", "maritalStatusOther": null,
      "dateOfBirth": "1994-04-30", "ageBracket": "31-35", "nationality": "Nigerian"
    },
    "contact": {
      "phone": "+1 832 555 0199", "email": "grace@example.com",
      "address": { "line1": "12 Palm Ct", "line2": "Apt 4", "city": "Katy", "state": "TX", "zipCode": "77494", "country": "United States" }
    },
    "followUp": {
      "bestTimeToVisit": "Saturday afternoons",
      "hearAboutUs": "Invited By Someone", "invitedBy": "Bro. Daniel", "hearAboutUsOther": null,
      "willComeAgain": "Yes", "consideringMembership": "Yes", "wantsMembership": "Yes",
      "likelyNeverReturn": "No", "neverReturnReason": null,
      "prayerRequest": "Pray for my new job.", "comments": null
    },
    "ratings": { "music": 9, "preaching": 10, "comfort": 8, "hospitality": 8, "churchEnvironment": 9, "people": 10, "traffic": 7, "parking": 6 },
    "consent": true
  },
  "draftToken": "optional: delete this draft after saving"
}
```

**201** → `{ "id": "uuid", "submittedAt": "ISO-8601", "firstName": "Grace" }`

Rules:
- Optional fields are sent as `null`, never as `""`.
- Follow-up fields such as `invitedBy` are already set to `null` by the client when their trigger answer isn't selected.
- `consent: true` is required.
- The server should validate against the same rules as `src/lib/server/submission-schema.ts`.

### Allowed values

| Field | Values |
|---|---|
| `service.name` | Sunday 1st Service · Sunday 2nd Service · Tuesday Bible Study · Power Night · 168 Hours of Praise · Cross Over Service · Other |
| `person.gender` | Male · Female |
| `person.maritalStatus` | Single · Married · Divorced · Widowed · Separated · Other |
| `person.ageBracket` | Below 16 · 16-20 · 21-25 · 26-30 · 31-35 · 36-40 · 41-45 · 46-50 · 51-65 · Above 65 |
| `followUp.hearAboutUs` **(required)** | Invited By Someone · Social Media · Youtube · Google Search · Other |
| `followUp.willComeAgain`, `consideringMembership`, `wantsMembership` **(required)** | Yes · No · Undecided |
| `followUp.likelyNeverReturn` | Yes · No |
| `ratings.*` | Integer 1–10 or `null` |
| `contact.address.country` | One of the 197 names in `src/lib/countries.json` (same list and order as the live form) |

Required fields: `service.date`, `person.firstName`, `person.lastName`, `contact.phone`, `contact.address.zipCode` (used to assign a cell group), `followUp.hearAboutUs` and `followUp.wantsMembership`.

## 2. Save and Resume Later

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/drafts` | `{ "data": { …raw form values… }, "step": 1-4 }` | **201** `{ token, expiresAt }` |
| `GET` | `/drafts/:token` | — | **200** `{ token, data, step, expiresAt, updatedAt }` · 404 · 410 |
| `PUT` | `/drafts/:token` | same as POST | **200** `{ token, expiresAt }` (expiry resets to 30 days) |
| `DELETE` | `/drafts/:token` | — | **204** |
| `POST` | `/drafts/:token/email` | `{ "email": "a@b.com" }` | **200** `{ "sent": true }` |

- `data` is the UI's raw form state: string values, `""` for empty. Store it as-is (JSON). The client tolerates missing or extra keys.
- Tokens must be unguessable (the mock uses 18 random bytes, base64url).
- Drafts expire **30 days** after the last save, matching the live WPForms behaviour.
- The resume link format is `{SITE_URL}/?resume={token}`. The email endpoint must send this link.
- When the form is submitted with `draftToken`, delete the draft.

## 3. List submissions (admin)

`GET /new-members` → `{ items: NewMemberRecord[], total }`. This exists only in the mock, so the admin web app has data to read. In production it **must** require admin authentication.

`NewMemberRecord` is the submission object above, plus `id`, `submittedAt`, `status: "new"` and `source: "web"`.

---

## Mapping to the live WPForms form (#174)

Use this to migrate existing entries from `rccgthekingspalace.com/about/`.

| WPForms field ID | Label (live) | API path |
|---|---|---|
| 1 | Service Date | `service.date` |
| 2 | Service Name | `service.name` |
| 9 / 10 / 11 | First / Middle / Last Name | `person.firstName` / `middleName` / `lastName` |
| 12 | Gender | `person.gender` |
| 30 / 31 | Marital Status / If 'Other', specify | `person.maritalStatus` / `maritalStatusOther` |
| 15 | Date of Birth (m/d/Y) | `person.dateOfBirth` (YYYY-MM-DD) |
| 32 | Age Bracket | `person.ageBracket` |
| 16 | Nationality | `person.nationality` |
| 17 / 18 | Address / Apartment / Building | `contact.address.line1` / `line2` |
| 20 / 21 / 22 / 26 | City / State / Zip / Country | `contact.address.city` / `state` / `zipCode` / `country` |
| 27 / 28 | Phone / Email | `contact.phone` / `contact.email` |
| 34 | When is the best time to visit you? | `followUp.bestTimeToVisit` |
| 61 / 33 / 62 | How did you hear about us? / Who invited you? / If Other | `followUp.hearAboutUs` / `invitedBy` / `hearAboutUsOther` |
| 36 / 41 / 40 | Will you come again? / Give a thought to membership? / Like to become a member? | `followUp.willComeAgain` / `consideringMembership` / `wantsMembership` |
| 37 / 51 | Likely never come again? / If "Yes", why? | `followUp.likelyNeverReturn` / `neverReturnReason` |
| 52 / 58 | Prayer Requests / Comments | `followUp.prayerRequest` / `comments` |
| 43, 45, 46, 47, 48, 49, 64, 65 | Musc (Music), Preaching, Comfort, Hospitality, Church Environment, The People, Traffic, Parking Space | `ratings.music`, `preaching`, `comfort`, `hospitality`, `churchEnvironment`, `people`, `traffic`, `parking` |

The same map is in code as `WP_FIELD_MAP` in `src/lib/form-config.ts`.
