import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, DM_Sans, Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ThemeProvider from "@/components/ThemeProvider";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import EventModalHost from "@/components/EventModalHost";

// Legacy display/body fonts — kept for existing screens.
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// La Movida Refined (NEG-64) — display (Archivo Black) + body (Inter).
// Exposed as CSS vars consumed by the design system (see lib/design-tokens.ts).
const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spain 2026 — Charles & Carly + Tony & Ang",
  description: "Trip companion for Spain: Madrid & Seville, May 15-22, 2026",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Spain 2026",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFDF7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} ${inter.variable} ${archivoBlack.variable}`}
    >
      <body>
        <ThemeProvider>
          <ServiceWorkerRegistrar />
          <div className="pb-20">{children}</div>
          <BottomNav />
          <EventModalHost />
        </ThemeProvider>
      </body>
    </html>
  );
}
