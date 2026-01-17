import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)",
      },
    });

    const html = await response.text();

    // Parse Open Graph tags
    const titleMatch = html.match(
      /<meta property="og:title" content="([^"]+)"/
    );
    const descriptionMatch = html.match(
      /<meta property="og:description" content="([^"]+)"/
    );
    const imageMatch = html.match(
      /<meta property="og:image" content="([^"]+)"/
    );

    return NextResponse.json({
      title: titleMatch?.[1] || new URL(url).hostname,
      description: descriptionMatch?.[1] || "",
      image: imageMatch?.[1] || "",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 }
    );
  }
}
