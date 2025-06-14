import "@/app/globals.css";

import React, { Suspense } from "react";

import type { Metadata, Viewport } from "next";
import { myMetadata, myViewport } from "@/lib/metadata";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeSwitcher from "@/components/ThemeSwitcherButton";
const AnimatedCursor = React.lazy(() => import("@/components/AnimatedCursor"));

import {
  AuthenticSans,
  AuthenticSansCondensed,
  ThatThatNewPixel,
  Monaco,
} from "@/fonts/font-config";

import { cn } from "@/lib/utils";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import Navbar from "@/components/Navigation/Navbar";
const MouseTrail = React.lazy(() => import("@/graphics/MouseTrail"));

export const metadata: Metadata = myMetadata;
export const viewport: Viewport = myViewport;

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-svh bg-background font-sans antialiased overflow-x-clip transition-all duration-500 ease-in-out",
          AuthenticSans.className,
          AuthenticSansCondensed.variable,
          ThatThatNewPixel.variable,
          Monaco.variable
        )}
      >
        <Suspense fallback={<></>}>
          <AnimatedCursor />
        </Suspense>

        <ThemeProvider
          attribute="class"
          defaultTheme="strawberry-matcha"
          enableColorScheme
          themes={[
            "strawberry-matcha",
            "neopolitan-ice-cream",
            "blueberry-lemon",
          ]}
        >
          <Suspense fallback={<></>}>
            <MouseTrail>
              <div className="fixed top-0 z-10 flex justify-between w-full">
                <span className="flex flex-row justify-start">
                  <Breadcrumb />
                </span>
                <ThemeSwitcher />
              </div>
              <div className="flex flex-row">
                <Navbar />
                <main className="container mx-auto relative flex flex-col items-center justify-between top-10 px-5">
                  {children}
                </main>
              </div>
            </MouseTrail>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
