import { getPagesByProps } from "@/lib/notion";
import { NextRequest, NextResponse } from "next/server";

// For testing purposes

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q");

  if (!q) {
    return new NextResponse("No query provided! ", { status: 400 });
  }

  try {
    const pages = await getPagesByProps(q);
    return new NextResponse(JSON.stringify(pages), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new NextResponse(`Error! ${error} :(`, { status: 500 });
  }
};
