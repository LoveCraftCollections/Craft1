import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "LoveCraft — Mana Pelli",
  description: "A thoughtful, bilingual wedding invitation by LoveCraft.",
  openGraph: {
    title: "LoveCraft — Mana Pelli",
    description: "A thoughtful, bilingual wedding invitation by LoveCraft.",
    images: ["/wedding-couple.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}