import { getPagesByTag } from "@/lib/notion";
import { NextRequest, NextResponse } from "next/server";

// For testing purposes

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const tag = searchParams.get("tag");

  if (!tag) {
    return new NextResponse("No tag provided! ", { status: 400 });
  }

  try {
    const pages = await getPagesByTag(tag);
    return new NextResponse(JSON.stringify(pages), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new NextResponse(`Error! ${error} :(`, { status: 500 });
  }
};
