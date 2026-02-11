import ExcelJS from "exceljs";
import type { ExportSessionBlock } from "./types";

const INFO_HEADER_STYLE: Partial<ExcelJS.Style> = {
  font: { bold: true, size: 11 },
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E8E8" } },
  alignment: { vertical: "middle" },
};

const INFO_VALUE_STYLE: Partial<ExcelJS.Style> = {
  alignment: { vertical: "middle", wrapText: true },
};

const RESULTS_HEADER_STYLE: Partial<ExcelJS.Style> = {
  font: { bold: true, size: 11 },
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD3D3D3" } },
  alignment: { vertical: "middle", horizontal: "left" },
};

const RESULTS_HEADER_STYLE_RIGHT: Partial<ExcelJS.Style> = {
  ...RESULTS_HEADER_STYLE,
  alignment: { vertical: "middle", horizontal: "right" },
};

const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

const INFO_COL_WIDTH = 18;
const VALUE_COL_WIDTH = 36;
const POS_WIDTH = 10;
const DRIVER_WIDTH = 28;
const KART_WIDTH = 8;
const POINTS_WIDTH = 10;

function applyBorder(cell: ExcelJS.Cell) {
  cell.border = BORDER_THIN;
}

function addSessionBlockToSheet(
  ws: ExcelJS.Worksheet,
  block: ExportSessionBlock,
  startRow: number
): number {
  let row = startRow;

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

  infoRows.forEach(([label, value], i) => {
    const r = row + i;
    const cellLabel = ws.getCell(r, 1);
    const cellValue = ws.getCell(r, 2);
    cellLabel.value = label;
    cellValue.value = value;
    Object.assign(cellLabel, INFO_HEADER_STYLE);
    Object.assign(cellValue, INFO_VALUE_STYLE);
    applyBorder(cellLabel);
    applyBorder(cellValue);
  });
  row += infoRows.length + 1;

  const resultHeaders = ["Position", "Driver", "Kart", "Points"];
  resultHeaders.forEach((h, c) => {
    const cell = ws.getCell(row, c + 1);
    cell.value = h;
    Object.assign(
      cell,
      c === 0 || c === 2 || c === 3 ? RESULTS_HEADER_STYLE_RIGHT : RESULTS_HEADER_STYLE
    );
    applyBorder(cell);
  });
  row += 1;

  block.results.forEach((res) => {
    const cells = [
      ws.getCell(row, 1),
      ws.getCell(row, 2),
      ws.getCell(row, 3),
      ws.getCell(row, 4),
    ];
    cells[0].value = res.position;
    cells[1].value = res.driverName;
    cells[2].value = res.kartNumber;
    cells[3].value = res.points;
    cells[0].alignment = { horizontal: "right", vertical: "middle" };
    cells[2].alignment = { horizontal: "right", vertical: "middle" };
    cells[3].alignment = { horizontal: "right", vertical: "middle" };
    cells.forEach(applyBorder);
    row += 1;
  });

  return row + 2;
}

/**
 * Build Excel buffer for a single session.
 * One sheet with info table and results table; column widths set for readability.
 */
export async function buildSessionExcel(block: ExportSessionBlock): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Session", {
    views: [{ state: "normal", showGridLines: true }],
  });

  ws.getColumn(1).width = Math.max(INFO_COL_WIDTH, POS_WIDTH);
  ws.getColumn(2).width = Math.max(VALUE_COL_WIDTH, DRIVER_WIDTH);
  ws.getColumn(3).width = KART_WIDTH;
  ws.getColumn(4).width = POINTS_WIDTH;

  addSessionBlockToSheet(ws, block, 1);

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Build Excel buffer for a full round.
 * One sheet; each session is an info block + results table with spacing.
 */
export async function buildRoundExcel(blocks: ExportSessionBlock[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Round", {
    views: [{ state: "normal", showGridLines: true }],
  });

  ws.getColumn(1).width = Math.max(INFO_COL_WIDTH, POS_WIDTH);
  ws.getColumn(2).width = Math.max(VALUE_COL_WIDTH, DRIVER_WIDTH);
  ws.getColumn(3).width = KART_WIDTH;
  ws.getColumn(4).width = POINTS_WIDTH;

  let row = 1;
  blocks.forEach((block, i) => {
    if (i > 0) {
      row += 2;
    }
    row = addSessionBlockToSheet(ws, block, row);
  });

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
