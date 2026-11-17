import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const press = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press" });
const vt = VT323({ weight: "400", subsets: ["latin"], variable: "--font-vt" });

export const metadata: Metadata = {
  title: "Krillion · KSEA edition",
  description:
    "An unofficial fan parody of the Krillion daily game, made as an ad for KSEA at USC. Rarer answers sink deeper.",
  openGraph: {
    title: "Krillion · KSEA edition",
    description: "Name it. The rarer the answer, the deeper you dive.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#07101f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${press.variable} ${vt.variable}`}>
      <body>{children}</body>
    </html>
  );
}
