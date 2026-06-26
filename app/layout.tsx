import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SWRegister from "@/components/layout/SWRegister";
import PWAInstallPrompt from "@/components/layout/PWAInstallPrompt";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

const SITE_URL = "https://world-cup-2026-companion-xi.vercel.app";
const OG_DESCRIPTION =
  "Everything about the FIFA World Cup 2026 in your hand — fixtures, live scores, standings, knockout bracket, stadiums, reminders and where to watch, all from official sources.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "World Cup 2026 Companion", template: "%s · WC26 Companion" },
  description:
    "Fixtures, live scores, standings, knockout bracket, stadiums, reminders, where-to-watch and personalized team tracking for the 2026 World Cup — powered only by official data sources.",
  manifest: "/manifest.webmanifest",
  applicationName: "WC26 Companion",
  openGraph: {
    type: "website",
    siteName: "WC26 Companion",
    title: "Everything about FIFA World Cup 2026 in your hand!",
    description: OG_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1920,
        height: 1080,
        alt: "WC26 Companion — everything about FIFA World Cup 2026 in your hand"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Everything about FIFA World Cup 2026 in your hand!",
    description: OG_DESCRIPTION,
    images: ["/og-image.png"]
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#116a48" },
    { media: "(prefers-color-scheme: dark)", color: "#0a101a" }
  ]
};

const themeInit = `
try {
  var t = localStorage.getItem("wc26.theme");
  var dark = t === "dark" || ((t === null || t === "system") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.documentElement.classList.add("dark");
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${display.variable} ${body.variable} font-body`}>
        <Header />
        <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">{children}</main>
        <Footer />
        <SWRegister />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
