import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

/** Serves the resume PDF inline (viewable, not a forced download). */
export const GET = async () => {
  const filePath = path.join(process.cwd(), "public/files/resume.pdf");
  const file = await readFile(filePath);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="resume.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
};
