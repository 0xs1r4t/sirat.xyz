import type { Metadata } from "next";
import "./globals.css";
import { authenticSans } from "@/fonts/font-config";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={authenticSans.className}>{children}</body>
    </html>
  );
};

export default RootLayout;
