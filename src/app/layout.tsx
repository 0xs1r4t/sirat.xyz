import React from "react";

import "./globals.css";
import type { Metadata, Viewport } from "next";
import { myMetadata, myViewport } from "@/lib/metadata";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeSwitcher from "@/components/ThemeSwitcherButton";

import {
  AuthenticSans,
  AuthenticSansCondensed,
  ThatThatNewPixel,
  Monaco,
} from "@/fonts/font-config";

import { cn } from "@/lib/utils";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import Navbar from "@/components/Navigation/Navbar";
import DrawableCanvas from "@/graphics/MouseTrail";

export const metadata: Metadata = myMetadata;
export const viewport: Viewport = myViewport;

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-clip transition-all duration-500 ease-in-out",
          AuthenticSans.className,
          AuthenticSansCondensed.variable,
          ThatThatNewPixel.variable,
          Monaco.variable
        )}
      >
        <ThemeProvider
          defaultTheme="strawberry-matcha"
          enableColorScheme
          themes={[
            "strawberry-matcha",
            "neopolitan-ice-cream",
            "blueberry-lemon",
          ]}
        >
          <DrawableCanvas>
            <div className="fixed top-0 z-10 flex justify-between w-full">
              <span className="flex flex-row justify-start">
                <Breadcrumb />
              </span>
              <ThemeSwitcher />
            </div>
            <div className="flex flex-row">
              <Navbar />
              <main className="container relative flex flex-col items-center justify-between w-full top-10 px-5">
                {children}
              </main>
            </div>
          </DrawableCanvas>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
