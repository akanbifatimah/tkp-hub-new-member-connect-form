/**
 * New Members Connect: form definition.
 *
 * Mirrors the live WPForms form (#174) at https://rccgthekingspalace.com/about/
 * field-for-field. `wpFieldId` is the original WPForms field id so existing
 * entries can be migrated/mapped by the backend.
 */
import countries from "./countries.json";

/** Common countries are pinned at the top of the JSON and repeated alphabetically; keep first occurrence only. */
export const COUNTRIES: readonly string[] = [...new Set(countries)];
export const DEFAULT_COUNTRY = "United States";

export const SERVICE_NAMES = [
  "Sunday 1st Service",
  "Sunday 2nd Service",
  "Tuesday Bible Study",
  "Power Night",
  "168 Hours of Praise",
  "Cross Over Service",
  "Other",
] as const;

export const GENDERS = ["Male", "Female"] as const;

export const MARITAL_STATUSES = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Separated",
  "Other",
] as const;

export const AGE_BRACKETS = [
  "Below 16",
  "16-20",
  "21-25",
  "26-30",
  "31-35",
  "36-40",
  "41-45",
  "46-50",
  "51-65",
  "Above 65",
] as const;

export const HEAR_ABOUT_US = [
  "Invited By Someone",
  "Social Media",
  "Youtube",
  "Google Search",
  "Other",
] as const;

export const YES_NO_UNDECIDED = ["Yes", "No", "Undecided"] as const;
export const YES_NO = ["Yes", "No"] as const;

export const RATING_SCALE = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;

/** Step 4 rating items. Labels fixed per client ("Musc" -> "Music"). */
export const RATING_ITEMS = [
  { key: "music", label: "Music", wpFieldId: 43 },
  { key: "preaching", label: "Preaching", wpFieldId: 45 },
  { key: "comfort", label: "Comfort", wpFieldId: 46 },
  { key: "hospitality", label: "Hospitality", wpFieldId: 47 },
  { key: "churchEnvironment", label: "Church Environment", wpFieldId: 48 },
  { key: "people", label: "The People", wpFieldId: 49 },
  { key: "traffic", label: "Traffic", wpFieldId: 64 },
  { key: "parking", label: "Parking Space", wpFieldId: 65 },
] as const;

export type RatingKey = (typeof RATING_ITEMS)[number]["key"];

export const STEPS = [
  {
    id: 1,
    title: "Your visit",
    blurb: "Tell us which service you joined and a little about you.",
    fields: [
      "serviceDate",
      "serviceName",
      "firstName",
      "middleName",
      "lastName",
      "gender",
      "maritalStatus",
      "maritalStatusOther",
    ],
  },
  {
    id: 2,
    title: "Stay in touch",
    blurb: "How can we reach you? Your zip code helps us connect you to a cell group near you.",
    fields: [
      "dobMonth",
      "dobDay",
      "dobYear",
      "ageBracket",
      "nationality",
      "address",
      "apartment",
      "city",
      "state",
      "zipCode",
      "country",
      "phone",
      "email",
    ],
  },
  {
    id: 3,
    title: "Getting connected",
    blurb: "Help us follow up with you in the way that suits you best.",
    fields: [
      "bestTimeToVisit",
      "hearAboutUs",
      "invitedBy",
      "hearAboutUsOther",
      "willComeAgain",
      "consideringMembership",
      "wantsMembership",
      "likelyNeverReturn",
      "neverReturnReason",
      "prayerRequest",
      "comments",
    ],
  },
  {
    id: 4,
    title: "Your experience",
    blurb:
      "Please rate the following based on your observations in service today. 10 is very good and 1 is poor.",
    fields: RATING_ITEMS.map((r) => `ratings.${r.key}` as const),
  },
] as const;

export const CONSENT_TEXT =
  "By filling out this form, you consent to us contacting you either by phone or email.";

/** Field key -> original WPForms field id (for data migration). */
export const WP_FIELD_MAP: Record<string, number> = {
  serviceDate: 1,
  serviceName: 2,
  firstName: 9,
  middleName: 10,
  lastName: 11,
  gender: 12,
  maritalStatus: 30,
  maritalStatusOther: 31,
  dateOfBirth: 15,
  ageBracket: 32,
  nationality: 16,
  address: 17,
  apartment: 18,
  city: 20,
  state: 21,
  zipCode: 22,
  country: 26,
  phone: 27,
  email: 28,
  bestTimeToVisit: 34,
  hearAboutUs: 61,
  invitedBy: 33,
  hearAboutUsOther: 62,
  willComeAgain: 36,
  consideringMembership: 41,
  wantsMembership: 40,
  likelyNeverReturn: 37,
  neverReturnReason: 51,
  prayerRequest: 52,
  comments: 58,
  ...Object.fromEntries(RATING_ITEMS.map((r) => [`ratings.${r.key}`, r.wpFieldId])),
};

export const CHURCH = {
  name: "The King's Palace",
  parent: "The Redeemed Christian Church of God (RCCG)",
  shortName: "TKP",
  website: "https://rccgthekingspalace.org",
  address: {
    street: "5371 East Fifth Street",
    city: "Katy",
    region: "TX",
    postalCode: "77493",
    country: "US",
  },
  phoneDisplay: "281 391 RCCG",
  phoneE164: "+12813917224",
  fax: "281 391 7224",
  email: "info@rccgthekingspalace.org",
  socials: {
    youtube: "https://www.youtube.com/@KingsPalaceTV",
    x: "https://x.com/KingsPalaceTV",
    facebook: "https://www.facebook.com/kingspalacetv",
    instagram: "https://www.instagram.com/kingspalace.tv/",
  },
  services: [
    { name: "Sunday First Service", day: "Sunday", time: "8:30am – 9:30am", opens: "08:30", closes: "09:30" },
    { name: "Sunday Second Service", day: "Sunday", time: "9:30am – 10:00am", opens: "09:30", closes: "10:00" },
    { name: "Arise Show", day: "Sunday", time: "10:00am – 11:30am", opens: "10:00", closes: "11:30" },
    { name: "Mid-Week Service", day: "Tuesday", time: "7:00pm – 8:30pm", opens: "19:00", closes: "20:30" },
    { name: "Sunday School (Zoom)", day: "Sunday", time: "4:00pm – 5:00pm", opens: "16:00", closes: "17:00" },
  ],
} as const;
