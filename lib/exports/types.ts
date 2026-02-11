/**
 * Shared types for session/round export data.
 * Used by PDF and Excel generators.
 */

export type SessionTypeLabel =
  | "Qualifying"
  | "Race"
  | "Final Qualifying"
  | "Final Race";

export type PointsTypeLabel = "Normal" | "Half" | "Double";

export interface ExportResultRow {
  position: number;
  driverName: string;
  kartNumber: number;
  points: number;
}

export interface ExportSessionBlock {
  championshipName: string;
  roundName: string;
  trackName: string;
  sessionType: SessionTypeLabel;
  group: string | null;
  pointsType: PointsTypeLabel | null;
  results: ExportResultRow[];
}
