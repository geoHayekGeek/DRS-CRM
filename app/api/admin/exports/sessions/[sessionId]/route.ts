import { NextRequest, NextResponse } from "next/server";
import { loadSessionExportData } from "@/lib/exports/data";
import { buildSessionPdf } from "@/lib/exports/pdf";
import { buildSessionExcel } from "@/lib/exports/excel";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "";

    if (format !== "pdf" && format !== "xlsx") {
      return NextResponse.json(
        { error: "Invalid format. Use format=pdf or format=xlsx" },
        { status: 400 }
      );
    }

    const block = await loadSessionExportData(sessionId);

    if (!block) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (block.results.length === 0) {
      return NextResponse.json(
        { error: "This session has no results. Add results before exporting." },
        { status: 400 }
      );
    }

    const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9\-_\s]/g, "").trim() || "session";
    const baseName = `session-${sanitize(block.roundName)}-${sanitize(block.sessionType)}`;

    if (format === "xlsx") {
      const buffer = await buildSessionExcel(block);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${baseName}.xlsx"`,
          "Content-Length": String(buffer.length),
        },
      });
    }

    const buffer = await buildSessionPdf(block);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("Session export error:", error);
    return NextResponse.json(
      { error: "Failed to export session" },
      { status: 500 }
    );
  }
}
