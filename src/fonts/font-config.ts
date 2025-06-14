import localFont from "next/font/local";

export const AuthenticSans = localFont({
  src: [
    {
      path: "./authentic-sans/AUTHENTICSans-60.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./authentic-sans/AUTHENTICSans-90.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./authentic-sans/AUTHENTICSans-130.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "./authentic-sans/AUTHENTICSans-150.woff",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-authentic-sans",
});

export const AuthenticSansCondensed = localFont({
  src: [
    {
      path: "./authentic-sans/AUTHENTICSans-Condensed-60.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./authentic-sans/AUTHENTICSans-Condensed-90.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./authentic-sans/AUTHENTICSans-Condensed-130.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "./authentic-sans/AUTHENTICSans-Condensed-150.woff",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-authentic-sans-condensed",
});

export const ThatThatNewPixel = localFont({
  src: [
    {
      path: "./that-that-new-pixel/ThatThatNewPixelVariable-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./that-that-new-pixel/ThatThatNewPixelVariable-Italic.woff",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-that-that-new-pixel",
});

export const Monaco = localFont({
  src: [
    {
      path: "./monaco/Monaco.woff",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-monaco",
});
