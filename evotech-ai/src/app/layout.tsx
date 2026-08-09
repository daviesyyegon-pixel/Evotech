import type { Metadata } from "next";
import { Sora, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "EvoTech AI — Build your website with AI",
  description:
    "Tell EvoTech AI about your business. AI does the technical work — no code, no designer, no hosting headaches.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="bg-paper font-body text-ink antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
