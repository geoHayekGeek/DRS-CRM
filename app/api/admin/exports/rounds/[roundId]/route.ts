import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loadRoundExportData } from "@/lib/exports/data";
import { buildRoundPdf } from "@/lib/exports/pdf";
import { buildRoundExcel } from "@/lib/exports/excel";

export async function GET(
  request: NextRequest,
  { params }: { params: { roundId: string } }
) {
  try {
    const roundId = params.roundId;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "";

    if (format !== "pdf" && format !== "xlsx") {
      return NextResponse.json(
        { error: "Invalid format. Use format=pdf or format=xlsx" },
        { status: 400 }
      );
    }

    const round = await db.round.findUnique({
      where: { id: roundId },
      select: { id: true, name: true },
    });

    if (!round) {
      return NextResponse.json(
        { error: "Round not found" },
        { status: 404 }
      );
    }

    const blocks = await loadRoundExportData(roundId);

    if (blocks.length === 0) {
      return NextResponse.json(
        { error: "This round has no sessions with results. Add results before exporting." },
        { status: 400 }
      );
    }

    const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9\-_\s]/g, "").trim() || "round";
    const baseName = `round-${sanitize(round.name)}`;

    if (format === "xlsx") {
      const buffer = await buildRoundExcel(blocks);
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

    const buffer = await buildRoundPdf(blocks);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("Round export error:", error);
    return NextResponse.json(
      { error: "Failed to export round" },
      { status: 500 }
    );
  }
}
