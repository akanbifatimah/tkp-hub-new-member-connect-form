import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import { CHURCH } from "@/lib/form-config";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "TKP New Members Connect",
  keywords: [
    "The King's Palace",
    "RCCG Katy",
    "RCCG Texas",
    "church in Katy TX",
    "church near me Katy",
    "new member registration",
    "first time visitor church",
    "Redeemed Christian Church of God",
  ],
  authors: [{ name: CHURCH.name, url: CHURCH.website }],
  creator: CHURCH.name,
  publisher: CHURCH.name,
  category: "religion",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: CHURCH.name,
    title: `Welcome home | ${CHURCH.name}`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@KingsPalaceTV",
    title: `Welcome home | ${CHURCH.name}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#210e0a",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US" className={`${fraunces.variable} ${nunito.variable} antialiased`}>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
