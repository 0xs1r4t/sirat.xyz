import "./globals.css";
import type { Metadata, Viewport } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { AuthenticSans, AuthenticSansCondensed } from "@/fonts/font-config";

import { cn } from "@/lib/utils";
import Breadcrumb from "@/components/Breadcrumb";
import Sidebar from "@/components/Sidebar";

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

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html
      lang="en"
      className="transition-colors duration-400 ease-in-out"
      suppressHydrationWarning
    >
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          AuthenticSans.className,
          AuthenticSansCondensed.variable
        )}
      >
        <ThemeProvider>
          <div className="fixed z-10 flex justify-between w-full bg-background shadow-background shadow-md">
            <Breadcrumb />
            <ThemeToggle />
          </div>
          <div className="flex flex-row">
            <Sidebar />
            <main className="container relative flex flex-col items-center justify-between w-full top-10 px-5">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
