import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get the origin from the request
  const origin = request.headers.get("origin") || "";

  // Allow multiple origins
  const allowedOrigins = [
    "https://www.youtube.com",
    "https://youtube.com",
    "https://youtu.be",
    "https://play.google.com",
    "https://*.google.com",
    process.env.NEXT_PUBLIC_SITE_URL,
    // Add your local development URL if needed
    "http://localhost:3000",
  ].filter(Boolean);

  // Check if the request origin is allowed
  if (
    allowedOrigins.some((allowedOrigin) => origin.includes(allowedOrigin || ""))
  ) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Update CSP to allow Google services
  response.headers.set(
    "Content-Security-Policy",
    [
      "frame-src 'self' https://www.youtube.com https://youtube.com https://youtu.be;",
      "connect-src 'self' https://*.google.com https://play.google.com;",
      "img-src 'self' https://*.google.com https://*.youtube.com;",
    ].join(" ")
  );

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/garden/:path*"],
};
