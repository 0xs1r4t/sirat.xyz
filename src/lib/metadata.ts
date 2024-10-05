// metadata information

import type { Metadata, Viewport } from "next";

export const myMetadata: Metadata = {
  title: "Sirat Baweja",
  description:
    "🪻 my digital garden 🥬- a personal dumping ground for  🧠 thoughts, 🔧 works and 💡 ideas",
  applicationName: "Sirat's digital garden",
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
  icons: "icons/favicon.ico",
  manifest: "/manifest.json",
};

export const myViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ebc4f8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#8447a2ff" },
  ],
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  viewportFit: "auto",
  colorScheme: "normal",
};
