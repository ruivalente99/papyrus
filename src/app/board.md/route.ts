import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development" && process.env.ENABLE_DEV_BOARD !== "true") {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "board.md");
    if (!fs.existsSync(filePath)) {
      return new NextResponse("board.md not found", { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return new NextResponse(`Error reading board.md: ${String(error)}`, { status: 500 });
  }
}
