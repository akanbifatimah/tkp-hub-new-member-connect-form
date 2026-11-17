import { CHURCH } from "./form-config";

/** Public URL of this site. Set NEXT_PUBLIC_SITE_URL in each environment. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://connect.rccgthekingspalace.org").replace(/\/$/, "");

export const SITE_TITLE = `New Members Connect | ${CHURCH.name} (RCCG), Katy, TX`;
export const SITE_DESCRIPTION =
  "Visited The King's Palace (RCCG) in Katy, Texas? Welcome home! Take a few minutes to share your details so we can connect you to a cell group, pray with you, and help you feel at home.";

/** schema.org structured data for the church + this page. */
export function jsonLd() {
  const a = CHURCH.address;
  const church = {
    "@type": "Church",
    "@id": `${CHURCH.website}/#church`,
    name: CHURCH.name,
    alternateName: ["TKP", "RCCG The King's Palace"],
    url: CHURCH.website,
    logo: `${SITE_URL}/tkp-logo.png`,
    image: `${SITE_URL}/opengraph-image`,
    telephone: CHURCH.phoneE164,
    email: CHURCH.email,
    faxNumber: "+12813917224",
    parentOrganization: { "@type": "Organization", name: CHURCH.parent },
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.region,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    sameAs: Object.values(CHURCH.socials),
    openingHoursSpecification: CHURCH.services.map((s) => ({
      "@type": "OpeningHoursSpecification",
      name: s.name,
      dayOfWeek: `https://schema.org/${s.day}`,
      opens: s.opens,
      closes: s.closes,
    })),
  };
  const page = {
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
    about: { "@id": church["@id"] },
    potentialAction: { "@type": "RegisterAction", target: `${SITE_URL}/#connect`, name: "New member registration" },
  };
  return { "@context": "https://schema.org", "@graph": [church, page] };
}
