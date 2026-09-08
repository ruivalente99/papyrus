import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseBoardMarkdown } from "@/lib/boardParser";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "board.md");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "board.md not found" }, { status: 404 });
    }
    const markdown = fs.readFileSync(filePath, "utf-8");
    const data = parseBoardMarkdown(markdown);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Error parsing board.md: ${String(error)}` },
      { status: 500 }
    );
  }
}
