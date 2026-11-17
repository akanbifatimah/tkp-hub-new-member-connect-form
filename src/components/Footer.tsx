import Image from "next/image";
import { CHURCH } from "@/lib/form-config";

const SOCIAL_ICONS: Record<keyof typeof CHURCH.socials, { label: string; path: string }> = {
  youtube: {
    label: "YouTube",
    path: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8ZM9.7 15V9l5.9 3-5.9 3Z",
  },
  x: {
    label: "X (Twitter)",
    path: "M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5Z",
  },
  facebook: {
    label: "Facebook",
    path: "M14 8.5V6.6c0-.9.6-1.1 1-1.1h2.6V1.6L14 1.5c-4 0-4.9 3-4.9 4.9v2.1H6.7v4h2.4V22.5H14v-10h3.3l.4-4H14Z",
  },
  instagram: {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1Zm0 4.8a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.2-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z",
  },
};

export function Footer() {
  const a = CHURCH.address;
  const sunday = CHURCH.services.filter((s) => s.day === "Sunday" && !s.name.includes("School"));
  return (
    <footer className="relative border-t border-gold-500/15 bg-maroon-950 text-cream-100/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/tkp-logo.png" alt={`${CHURCH.name} logo`} width={40} height={44} className="h-10 w-auto" />
            <p className="font-display text-xl font-semibold text-cream-100">{CHURCH.name}</p>
          </div>
          <address className="mt-5 text-[15px] leading-relaxed not-italic">
            {a.street}
            <br />
            {a.city}, Texas {a.postalCode}
            <br />
            <a className="transition hover:text-gold-300" href={`tel:${CHURCH.phoneE164}`}>
              Tel: {CHURCH.phoneDisplay}
            </a>
            <br />
            <a className="transition hover:text-gold-300" href={`mailto:${CHURCH.email}`}>
              {CHURCH.email}
            </a>
          </address>
          <ul className="mt-6 flex gap-3" aria-label="Social media">
            {(Object.keys(CHURCH.socials) as Array<keyof typeof CHURCH.socials>).map((k) => (
              <li key={k}>
                <a
                  href={CHURCH.socials[k]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_ICONS[k].label}
                  className="grid size-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-gold-500 hover:text-maroon-950"
                >
                  <svg viewBox="0 0 24 24" className="size-4.5 fill-current" aria-hidden>
                    <path d={SOCIAL_ICONS[k].path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[12px] font-extrabold tracking-[0.2em] text-gold-400 uppercase">Sunday Service</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {sunday.map((s) => (
              <li key={s.name} className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
                <span>{s.name.replace("Sunday ", "")}</span>
                <span className="text-cream-100/60">{s.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[12px] font-extrabold tracking-[0.2em] text-gold-400 uppercase">During the week</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
              <span>Mid-Week Service (Tue)</span>
              <span className="text-cream-100/60">7:00pm – 8:30pm</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
              <span>Sunday School (Zoom)</span>
              <span className="text-cream-100/60">4:00pm – 5:00pm</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-[13px] text-cream-100/45">
        © {CHURCH.name} · {CHURCH.parent}
      </div>
    </footer>
  );
}
