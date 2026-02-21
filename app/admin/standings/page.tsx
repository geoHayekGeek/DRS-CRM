"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";
import { formatPoints } from "@/lib/format-points";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Championship {
  id: string;
  name: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string | null;
}

interface PointsByRound {
  roundId: string;
  roundName: string;
  points: number;
}

interface Standing {
  driverId: string;
  fullName: string;
  basePoints: number;
  totalPoints: number;
  adjustments: number;
  wins: number;
  podiums: number;
  poles: number;
  pointsByRound: PointsByRound[];
  canReorder?: boolean;
  tieKey?: string;
}

interface StandingsData {
  championship: { id: string; name: string };
  rounds: { id: string; name: string; date: string }[];
  standings: Standing[];
  roundId?: string | null;
}

type Block =
  | { type: "static"; standings: Standing[] }
  | { type: "sortable"; standings: Standing[]; tieKey: string };

function partitionIntoBlocks(standings: Standing[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < standings.length) {
    const s = standings[i];
    if (s.canReorder && s.tieKey) {
      const group: Standing[] = [];
      while (i < standings.length && standings[i].tieKey === s.tieKey) {
        group.push(standings[i]);
        i++;
      }
      blocks.push({ type: "sortable", standings: group, tieKey: s.tieKey });
    } else {
      const group: Standing[] = [];
      while (i < standings.length && !(standings[i].canReorder && standings[i].tieKey)) {
        group.push(standings[i]);
        i++;
      }
      blocks.push({ type: "static", standings: group });
    }
  }
  return blocks;
}

interface StandingsRowProps {
  standing: Standing;
  index: number;
  isSortable: boolean;
  dragDisabled?: boolean;
  expandedDriverId: string | null;
  adjustingDriverId: string | null;
  onToggleExpand: (id: string) => void;
  onApplyAdjustment: (driverId: string, delta: 1 | -1) => void;
  onDragHandle?: boolean;
}

function StandingsRow({
  standing,
  index,
  isSortable,
  dragDisabled,
  expandedDriverId,
  adjustingDriverId,
  onToggleExpand,
  onApplyAdjustment,
  onDragHandle,
}: StandingsRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: standing.driverId,
    disabled: !isSortable || dragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const rowContent = (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {index + 1}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {onDragHandle && isSortable && (
          <button
            type="button"
            className="hidden sm:inline-flex items-center p-0.5 mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <Link
          href={`/admin/drivers/${standing.driverId}`}
          className="hover:underline"
        >
          {standing.fullName}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
        {standing.wins}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
        {standing.podiums}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
        {standing.poles}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
        {standing.adjustments === 0
          ? "-"
          : standing.adjustments > 0
          ? `+${standing.adjustments}`
          : String(standing.adjustments)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-medium">
        {formatPoints(standing.totalPoints)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onApplyAdjustment(standing.driverId, -1)}
            disabled={!!adjustingDriverId}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Penalty (-1)"
            aria-label="Penalty"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onApplyAdjustment(standing.driverId, 1)}
            disabled={!!adjustingDriverId}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Bonus (+1)"
            aria-label="Bonus"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleExpand(standing.driverId)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            aria-label={
              expandedDriverId === standing.driverId ? "Collapse" : "Expand"
            }
          >
            {expandedDriverId === standing.driverId ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </>
  );

  const rowClass = `hover:bg-gray-50 ${
    isSortable ? "bg-amber-50/30 border-l-2 border-l-amber-300" : ""
  } ${isDragging ? "opacity-50" : ""}`;

  if (isSortable) {
    return (
      <tr ref={setNodeRef} style={style} className={rowClass}>
        {rowContent}
      </tr>
    );
  }
  return <tr className={rowClass}>{rowContent}</tr>;
}

function StandingsContent() {
  const searchParams = useSearchParams();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState<string>("");
  const [standingsData, setStandingsData] = useState<StandingsData | null>(null);
  const [championshipsLoading, setChampionshipsLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState<string>("");
  const [adjustingDriverId, setAdjustingDriverId] = useState<string | null>(null);
  const [reorderSaving, setReorderSaving] = useState(false);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReorderRef = useRef<{ tieKey: string; prevOrder: string[] } | null>(null);
  const hasAppliedUrlRef = useRef(false);

  useEffect(() => {
    fetchChampionships();
  }, []);

  useEffect(() => {
    if (championshipsLoading || championships.length === 0 || hasAppliedUrlRef.current)
      return;
    const idFromUrl = searchParams.get("championshipId");
    if (idFromUrl && championships.some((c) => c.id === idFromUrl)) {
      setSelectedChampionshipId(idFromUrl);
      hasAppliedUrlRef.current = true;
    }
  }, [championshipsLoading, championships, searchParams]);

  useEffect(() => {
    setSelectedRoundId("");
  }, [selectedChampionshipId]);

  useEffect(() => {
    if (selectedChampionshipId) {
      fetchStandings(selectedChampionshipId, selectedRoundId || null);
    } else {
      setStandingsData(null);
    }
  }, [selectedChampionshipId, selectedRoundId]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const fetchChampionships = async () => {
    try {
      setChampionshipsLoading(true);
      const response = await fetch("/api/admin/championships");
      if (!response.ok) throw new Error("Failed to fetch championships");
      const data = await response.json();
      setChampionships(data);
      setError("");
    } catch (err) {
      setError("Failed to load championships");
      toast.error("Failed to load championships");
    } finally {
      setChampionshipsLoading(false);
    }
  };

  const fetchStandings = useCallback(
    async (championshipId: string, roundId: string | null) => {
      try {
        setStandingsLoading(true);
        setError("");
        const url = roundId
          ? `/api/admin/championships/${championshipId}/standings?roundId=${roundId}`
          : `/api/admin/championships/${championshipId}/standings`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch standings");
        const data = await response.json();
        setStandingsData(data);
      } catch (err) {
        setError("Failed to load standings");
        toast.error("Failed to load standings");
        setStandingsData(null);
      } finally {
        setStandingsLoading(false);
      }
    },
    []
  );

  const applyAdjustment = async (driverId: string, delta: 1 | -1) => {
    if (!standingsData?.championship?.id || adjustingDriverId) return;
    setAdjustingDriverId(driverId);
    const championshipId = standingsData.championship.id;
    const roundId = selectedRoundId || null;

    const body: Record<string, unknown> = {
      driverId,
      delta,
    };
    if (roundId) body.roundId = roundId;
    else body.championshipId = championshipId;

    setStandingsData((prev) => {
      if (!prev) return prev;
      const updated = prev.standings.map((s) => {
        if (s.driverId !== driverId) return s;
        const newAdj = s.adjustments + delta;
        return {
          ...s,
          adjustments: newAdj,
          totalPoints: s.basePoints + newAdj,
        };
      });
      return {
        ...prev,
        standings: updated.sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
          if (b.wins !== a.wins) return b.wins - a.wins;
          return (a.fullName ?? "").localeCompare(b.fullName ?? "");
        }),
      };
    });

    try {
      const response = await fetch("/api/admin/point-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to apply adjustment");
      }
      await fetchStandings(championshipId, roundId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to apply adjustment");
      fetchStandings(championshipId, roundId);
    } finally {
      setAdjustingDriverId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !standingsData?.championship?.id || reorderSaving)
      return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const blocks = partitionIntoBlocks(standingsData.standings);
    let targetBlock: Block | null = null;
    for (const block of blocks) {
      if (block.type === "sortable" && block.standings.some((s) => s.driverId === activeId)) {
        targetBlock = block;
        break;
      }
    }
    if (!targetBlock || targetBlock.type !== "sortable") return;
    if (!targetBlock.standings.some((s) => s.driverId === overId)) return;

    const oldOrder = targetBlock.standings.map((s) => s.driverId);
    const oldIndex = oldOrder.indexOf(activeId);
    const newIndex = oldOrder.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(oldOrder, oldIndex, newIndex);
    lastReorderRef.current = { tieKey: targetBlock.tieKey, prevOrder: oldOrder };
    setReorderSaving(true);

    setStandingsData((prev) => {
      if (!prev) return prev;
      const reordered: Standing[] = [];
      let blockStart = 0;
      for (const block of blocks) {
        if (block.type === "sortable" && block.tieKey === targetBlock!.tieKey) {
          const driverMap = new Map(block.standings.map((s) => [s.driverId, s]));
          for (const id of newOrder) {
            const s = driverMap.get(id);
            if (s) reordered.push(s);
          }
        } else {
          for (const s of block.standings) reordered.push(s);
        }
        blockStart += block.standings.length;
      }
      return { ...prev, standings: reordered };
    });

    try {
      const res = await fetch(
        `/api/admin/championships/${standingsData.championship.id}/standings/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tieKey: targetBlock.tieKey, orderedDriverIds: newOrder }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to save order");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save order");
      setStandingsData((prev) => {
        if (!prev || !lastReorderRef.current) return prev;
        return { ...prev, standings: prev.standings };
      });
      fetchStandings(standingsData.championship.id, selectedRoundId || null);
      lastReorderRef.current = null;
      setReorderSaving(false);
      return;
    }

    setReorderSaving(false);

    const toastId = toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm">Standings order updated</span>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              if (undoTimeoutRef.current) {
                clearTimeout(undoTimeoutRef.current);
                undoTimeoutRef.current = null;
              }
              if (!lastReorderRef.current || !standingsData?.championship?.id) return;
              try {
                const res = await fetch(
                  `/api/admin/championships/${standingsData.championship.id}/standings/reorder/undo`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tieKey: lastReorderRef.current.tieKey }),
                  }
                );
                if (!res.ok) throw new Error("Undo failed");
                await fetchStandings(
                  standingsData.championship.id,
                  selectedRoundId || null
                );
                toast.success("Order reverted");
              } catch {
                toast.error("Failed to undo");
              }
              lastReorderRef.current = null;
            }}
            className="px-2 py-1 text-xs font-semibold rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            Undo
          </button>
        </div>
      ),
      { duration: 10000, position: "top-right" }
    );

    undoTimeoutRef.current = setTimeout(() => {
      lastReorderRef.current = null;
      toast.dismiss(toastId);
      undoTimeoutRef.current = null;
    }, 10000);
  };

  const toggleExpand = (driverId: string) => {
    setExpandedDriverId((prev) => (prev === driverId ? null : driverId));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allStandings = standingsData?.standings ?? [];
  const blocks = partitionIntoBlocks(allStandings);
  let position = 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-6xl mx-auto">
        <h1
          className="text-2xl sm:text-3xl font-heading font-semibold mb-6"
          style={{ color: theme.colors.primary.red }}
        >
          Championship Standings
        </h1>

        {error && (
          <div
            className="mb-4 p-4 bg-red-50 border-l-4 rounded-r-lg"
            style={{ borderLeftColor: theme.colors.primary.red }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 space-y-4">
          <div>
            <label htmlFor="championship" className="block text-sm font-medium text-gray-700 mb-2">
              Championship
            </label>
            <select
              id="championship"
              value={selectedChampionshipId}
              onChange={(e) => setSelectedChampionshipId(e.target.value)}
              disabled={championshipsLoading}
              className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              style={
                { "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties
              }
            >
              <option value="">Select a championship</option>
              {championships.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isCurrent ? " (Current)" : ""}
                </option>
              ))}
            </select>
          </div>
          {standingsData && standingsData.rounds.length > 0 && (
            <div>
              <label htmlFor="round" className="block text-sm font-medium text-gray-700 mb-2">
                Round
              </label>
              <select
                id="round"
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                style={
                  { "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties
                }
              >
                <option value="">All rounds</option>
                {standingsData.rounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {standingsLoading && selectedChampionshipId ? (
          <div className="text-gray-300">Loading standings...</div>
        ) : standingsData && standingsData.standings.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden overflow-x-auto">
            <div className="px-4 sm:px-6 py-3 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-heading font-semibold text-gray-900 truncate">
                {standingsData.championship.name}
              </h2>
            </div>
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-14">
                    Wins
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                    Podiums
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-14">
                    Poles
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Adjustments
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total Points
                  </th>
                  <th className="px-6 py-3 w-28" />
                </tr>
              </thead>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <tbody className="divide-y divide-gray-200">
                  {blocks.map((block, blockIdx) => {
                    if (block.type === "static") {
                      return block.standings.map((standing) => {
                        const idx = position++;
                        return (
                          <React.Fragment key={standing.driverId}>
                            <StandingsRow
                              standing={standing}
                              index={idx}
                              isSortable={false}
                              dragDisabled={reorderSaving}
                              expandedDriverId={expandedDriverId}
                              adjustingDriverId={adjustingDriverId}
                              onToggleExpand={toggleExpand}
                              onApplyAdjustment={applyAdjustment}
                              onDragHandle={false}
                            />
                            {expandedDriverId === standing.driverId && (
                              <tr className="bg-gray-50">
                                <td colSpan={9} className="px-6 py-4">
                                  <ExpandedContent standing={standing} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      });
                    }
                    return (
                      <SortableContext
                        key={block.tieKey}
                        items={block.standings.map((s) => s.driverId)}
                        strategy={verticalListSortingStrategy}
                      >
                        {block.standings.map((standing) => {
                          const idx = position++;
                          return (
                            <React.Fragment key={standing.driverId}>
                              <StandingsRow
                                standing={standing}
                                index={idx}
                                isSortable={true}
                                dragDisabled={reorderSaving}
                                expandedDriverId={expandedDriverId}
                                adjustingDriverId={adjustingDriverId}
                                onToggleExpand={toggleExpand}
                                onApplyAdjustment={applyAdjustment}
                                onDragHandle={true}
                              />
                              {expandedDriverId === standing.driverId && (
                                <tr className="bg-gray-50">
                                  <td colSpan={9} className="px-6 py-4">
                                    <ExpandedContent standing={standing} />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </SortableContext>
                    );
                  })}
                </tbody>
              </DndContext>
            </table>
          </div>
        ) : standingsData && standingsData.standings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">
              No results recorded for this championship yet.
            </p>
          </div>
        ) : !selectedChampionshipId ? (
          <div className="text-gray-500 text-sm">Select a championship to view standings.</div>
        ) : null}
      </div>
    </div>
  );
}

function ExpandedContent({ standing }: { standing: Standing }) {
  return (
    <div className="text-sm flex flex-row flex-wrap gap-6 justify-around">
      <div>
        <p className="font-medium text-gray-700 mb-2">Points by round</p>
        <table className="w-full max-w-md">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase">Round</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase">Points</th>
            </tr>
          </thead>
          <tbody>
            {standing.pointsByRound.map((pr) => (
              <tr key={pr.roundId} className="border-b border-gray-100">
                <td className="py-1.5">
                  <Link
                    href={`/admin/rounds/${pr.roundId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {pr.roundName}
                  </Link>
                </td>
                <td className="py-1.5 text-right text-gray-600">
                  {formatPoints(pr.points)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <p className="font-medium text-gray-700 mb-2">Stats</p>
        <div className="flex flex-wrap gap-4 text-gray-600">
          <span>Wins: {standing.wins}</span>
          <span>Podiums: {standing.podiums}</span>
          <span>Pole positions: {standing.poles}</span>
        </div>
      </div>
    </div>
  );
}

export default function StandingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
          <div className="max-w-4xl mx-auto text-gray-500">Loading...</div>
        </div>
      }
    >
      <StandingsContent />
    </Suspense>
  );
}
