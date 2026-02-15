import PDFDocument from "pdfkit";
import type { ExportSessionBlock } from "./types";

type PDFDoc = InstanceType<typeof PDFDocument>;

const FONT_SIZE_NORMAL = 10;
const FONT_SIZE_HEADER = 11;
const ROW_HEIGHT_INFO = 20;
const ROW_HEIGHT_RESULTS = 18;
const TABLE_LEFT = 50;
const PAGE_WIDTH = 612;
const MARGIN = 50;

const INFO_LABEL_WIDTH = 95;
const INFO_VALUE_WIDTH = 265;
const INFO_TABLE_WIDTH = INFO_LABEL_WIDTH + INFO_VALUE_WIDTH;

const RES_COL_WIDTHS = [52, 196, 38, 48];
const RESULTS_TABLE_WIDTH = RES_COL_WIDTHS.reduce((a, b) => a + b, 0);

function drawTableBorders(
  doc: PDFDoc,
  left: number,
  top: number,
  colWidths: number[],
  rowCount: number,
  rowHeight: number
): void {
  doc.strokeColor("#666666");
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  for (let r = 0; r <= rowCount; r++) {
    const y = top + r * rowHeight;
    doc
      .moveTo(left, y)
      .lineTo(left + totalWidth, y)
      .stroke();
  }
  let x = left;
  for (let c = 0; c <= colWidths.length; c++) {
    doc.moveTo(x, top).lineTo(x, top + rowCount * rowHeight).stroke();
    if (c < colWidths.length) x += colWidths[c];
  }
}

function writeSessionBlock(
  doc: PDFDoc,
  block: ExportSessionBlock,
  startY: number
): number {
  let y = startY;

  const groupDisplay = block.group != null ? `Group ${block.group}` : "";
  const pointsDisplay = block.pointsType != null ? block.pointsType : "—";

  const infoRows: [string, string][] = [
    ["Championship", block.championshipName],
    ["Round", block.roundName],
    ["Track", block.trackName],
    ["Session Type", block.sessionType],
    ["Group", groupDisplay],
    ["Points Type", pointsDisplay],
  ];

  const infoTableTop = y;
  doc.font("Helvetica-Bold").fontSize(FONT_SIZE_HEADER);
  infoRows.forEach(([label, value], i) => {
    const rowY = infoTableTop + i * ROW_HEIGHT_INFO + 4;
    doc.fillColor("#333333").text(label, TABLE_LEFT + 4, rowY, {
      width: INFO_LABEL_WIDTH - 8,
    });
    doc
      .font("Helvetica")
      .fillColor("#000000")
      .text(value, TABLE_LEFT + INFO_LABEL_WIDTH + 4, rowY, {
        width: INFO_VALUE_WIDTH - 8,
      });
    doc.font("Helvetica-Bold");
  });

  drawTableBorders(
    doc,
    TABLE_LEFT,
    infoTableTop,
    [INFO_LABEL_WIDTH, INFO_VALUE_WIDTH],
    infoRows.length,
    ROW_HEIGHT_INFO
  );
  y = infoTableTop + infoRows.length * ROW_HEIGHT_INFO + 16;

  const resultsTableTop = y;
  doc.font("Helvetica-Bold").fontSize(FONT_SIZE_HEADER);
  const headerY = resultsTableTop + 4;
  let cx = TABLE_LEFT;
  doc.text("Position", cx + 4, headerY, { width: RES_COL_WIDTHS[0] - 8 });
  cx += RES_COL_WIDTHS[0];
  doc.text("Driver", cx + 4, headerY, { width: RES_COL_WIDTHS[1] - 8 });
  cx += RES_COL_WIDTHS[1];
  doc.text("Kart", cx + 4, headerY, { width: RES_COL_WIDTHS[2] - 8 });
  cx += RES_COL_WIDTHS[2];
  doc.text("Points", cx + 4, headerY, { width: RES_COL_WIDTHS[3] - 8 });

  doc.font("Helvetica").fontSize(FONT_SIZE_NORMAL);
  block.results.forEach((row, i) => {
    const rowY = resultsTableTop + ROW_HEIGHT_RESULTS + i * ROW_HEIGHT_RESULTS + 4;
    cx = TABLE_LEFT;
    doc.text(String(row.position), cx + 4, rowY, {
      width: RES_COL_WIDTHS[0] - 8,
    });
    cx += RES_COL_WIDTHS[0];
    doc.text(row.driverName, cx + 4, rowY, {
      width: RES_COL_WIDTHS[1] - 8,
    });
    cx += RES_COL_WIDTHS[1];
    doc.text(String(row.kartNumber), cx + 4, rowY, {
      width: RES_COL_WIDTHS[2] - 8,
    });
    cx += RES_COL_WIDTHS[2];
    doc.text(String(row.points), cx + 4, rowY, {
      width: RES_COL_WIDTHS[3] - 8,
    });
  });

  const resultsRowCount = block.results.length + 1;
  drawTableBorders(
    doc,
    TABLE_LEFT,
    resultsTableTop,
    RES_COL_WIDTHS,
    resultsRowCount,
    ROW_HEIGHT_RESULTS
  );

  y =
    resultsTableTop +
    resultsRowCount * ROW_HEIGHT_RESULTS +
    24;
  return y;
}

/**
 * Build PDF buffer for a single session.
 */
export function buildSessionPdf(block: ExportSessionBlock): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    writeSessionBlock(doc, block, MARGIN);
    doc.end();
  });
}

/**
 * Build PDF buffer for a full round (multiple sessions, one section per session).
 */
export function buildRoundPdf(blocks: ExportSessionBlock[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = MARGIN;
    for (let i = 0; i < blocks.length; i++) {
      if (i > 0) {
        doc.addPage();
        y = MARGIN;
      }
      y = writeSessionBlock(doc, blocks[i], y);
    }
    doc.end();
  });
}
