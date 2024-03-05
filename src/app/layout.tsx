import "./globals.css";
import { AuthenticSans, AuthenticSansCondensed } from "@/fonts/font-config";

import { cn } from "@/lib/utils";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "sirat.xyz",
  description:
    "🪻 my digital garden 🥬- a personal dumping ground for  🧠 thoughts, 🔧 works and 💡 ideas",
  applicationName: "my digital garden",
  authors: [{ name: "Sirat Baweja", url: "https://sirat.xyz" }],
  generator: "Next.js",
  keywords: [
    "personal website",
    "digital garden",
    "garden",
    "blog",
    "thoughts",
    "ideas",
    "portfolio",
    "works",
    "next.js",
    "web dev",
    "design",
  ],
  referrer: "origin",
  icons: "./favicon.ico",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  viewportFit: "auto",
  colorScheme: "normal",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          AuthenticSans.className,
          AuthenticSansCondensed.variable
        )}
      >
        {children}
        <SpotifyPlayer />
      </body>
    </html>
  );
};

export default RootLayout;
