import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Welcome home: New Members Connect at The King's Palace (RCCG), Katy, Texas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logo = `data:image/png;base64,${await readFile(join(process.cwd(), "public/tkp-logo.png"), "base64")}`;

/** Share card for WhatsApp, Facebook, X, iMessage, etc. */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          gap: 64,
          color: "#faf7ef",
          background:
            "radial-gradient(circle at 78% 40%, rgba(212,175,55,0.35), transparent 45%), linear-gradient(135deg, #6e0d12 0%, #2f0d0b 55%, #210e0a 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#e2c35f", textTransform: "uppercase", fontWeight: 700 }}>
            New Members Connect
          </div>
          <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1.02, marginTop: 18 }}>Welcome home.</div>
          <div style={{ fontSize: 34, marginTop: 24, color: "rgba(250,247,239,0.8)", lineHeight: 1.3 }}>
            The King&apos;s Palace (RCCG), Katy, Texas
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 340,
            height: 340,
            borderRadius: 340,
            border: "3px solid rgba(226,195,95,0.6)",
            boxShadow: "0 0 120px rgba(212,175,55,0.45)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires <img> */}
          <img src={logo} width={208} height={230} alt="" />
        </div>
      </div>
    ),
    size,
  );
}
