# TKP New Members Connect

A redesign of The King's Palace (RCCG) new-member form, currently live at https://rccgthekingspalace.com/about/.
The fields, steps and behaviour are unchanged. What's new is the design, the 3D and motion work, mobile-first layout and SEO.

## Stack

- **Next.js 16** (App Router, Cache Components) + **TypeScript** + **Tailwind CSS v4**
- **3D:** three.js · @react-three/fiber · @react-three/drei. The crown is built in code, so there are no model downloads.
- **Motion:** Motion (Framer Motion) for UI, GSAP ScrollTrigger for scroll-driven scenes, Lenis for smooth scrolling.
- **Forms:** react-hook-form + Zod. One schema is shared by the UI and the mock API.

All libraries are free and open source (MIT; GSAP is free under its standard licence).

## Getting started

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                   # http://localhost:3000
```

Production check: `npm run build && npm start`.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://connect.rccgthekingspalace.org` | Canonical URL, sitemap, Open Graph links. **Set this to the real domain.** |
| `NEXT_PUBLIC_API_BASE_URL` | `/api/v1` (built-in mocks) | Point at the real backend when it's ready. |

## Backend / mock data

The site runs on **mock API routes** (`src/app/api/v1`) with an in-memory store that resets on restart, so it never touches live member data.
See **[docs/API.md](docs/API.md)** for the full contract, error format, and the mapping from the live WPForms field IDs.

## Project map

```
src/
  app/
    page.tsx              Hero + form + footer (statically prerendered)
    layout.tsx            Fonts, metadata, viewport
    opengraph-image.tsx   Generated share card
    robots.ts sitemap.ts manifest.ts icon.png
    api/v1/…              Mock backend (new-members, drafts)
  components/
    Hero.tsx              Headline + GSAP scroll link to the 3D scene
    three/CrownScene.tsx  The 3D crown, halo, gems, sparkles
    three/HeroBackdrop.tsx  Loads 3D only when supported; CSS fallback otherwise
    form/                 Multi-step form, fields, save/resume dialog, success screen
  lib/
    form-config.ts        Field options, steps, church info, WPForms field map
    schema.ts             Zod schema, empty form, submission payload builder
    api.ts                Client API layer (the only network code in the UI)
```

## Performance and accessibility

- The page is static HTML. The 3D bundle is loaded separately after hydration, and the form never waits for it.
- 3D is skipped (with an animated CSS fallback) for `prefers-reduced-motion`, Data Saver, or no WebGL. Rendering pauses when the hero is scrolled out of view.
- Phones and low-core devices get fewer particles and gems and a lower pixel ratio.
- Native radios and selects give full keyboard and screen-reader support. Errors are announced, focus moves to each new step heading, and there's a skip link.

## SEO

Title and description, canonical URL, Open Graph and Twitter cards, a generated 1200×630 share image, `robots.txt`, `sitemap.xml`, a web manifest, and schema.org JSON-LD (`Church` with address, phone, socials and service times, plus a `WebPage` with a `RegisterAction`).
