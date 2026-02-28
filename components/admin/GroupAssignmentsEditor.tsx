"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

export interface Driver {
  id: string;
  fullName: string;
}

export interface GroupAssignment {
  id: string;
  group: string;
  kartNumber: number;
  driver: Driver;
}

const DROPPABLE_PREFIX = "group-";

function getGroupFromDroppableId(id: string): string | null {
  if (typeof id !== "string" || !id.startsWith(DROPPABLE_PREFIX)) return null;
  return id.slice(DROPPABLE_PREFIX.length);
}

interface KartInputRowProps {
  assignment: GroupAssignment;
  sameGroupAssignments: GroupAssignment[];
  roundId: string;
  disabled: boolean;
  onUpdate: (assignmentId: string, updates: Partial<GroupAssignment>) => void;
}

function KartInputRow({
  assignment,
  sameGroupAssignments,
  roundId,
  disabled,
  onUpdate,
}: KartInputRowProps) {
  const [localValue, setLocalValue] = useState(String(assignment.kartNumber));
  const [saving, setSaving] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const validateAndSave = useCallback(async () => {
    const num = parseInt(localValue, 10);
    if (Number.isNaN(num) || !Number.isInteger(num) || num < 1) {
      setInlineError("Must be a number ≥ 1");
      return;
    }
    const duplicate = sameGroupAssignments.some(
      (a) => a.id !== assignment.id && a.kartNumber === num
    );
    if (duplicate) {
      setInlineError("Duplicate kart in this group");
      return;
    }
    setInlineError(null);
    if (num === assignment.kartNumber) return;

    setSaving(true);
    const previous = assignment.kartNumber;
    onUpdate(assignment.id, { ...assignment, kartNumber: num });

    try {
      const res = await fetch(
        `/api/admin/rounds/${roundId}/assignments/${assignment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kartNumber: num }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update kart number");
      }
      setLocalValue(String(num));
      toast.success("Kart number updated");
    } catch (err: unknown) {
      onUpdate(assignment.id, { ...assignment, kartNumber: previous });
      setLocalValue(String(previous));
      toast.error(err instanceof Error ? err.message : "Failed to update kart number");
    } finally {
      setSaving(false);
    }
  }, [assignment, localValue, sameGroupAssignments, roundId, onUpdate]);

  const handleBlur = () => {
    if (disabled) return;
    validateAndSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  useEffect(() => {
    setLocalValue(String(assignment.kartNumber));
  }, [assignment.kartNumber]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            setInlineError(null);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-16 py-1.5 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#BA1718] disabled:bg-gray-100 disabled:text-gray-500"
        />
        {saving && (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" aria-hidden />
        )}
      </div>
      {inlineError && (
        <p className="mt-1 text-xs text-red-600">{inlineError}</p>
      )}
    </div>
  );
}

interface DraggableRowProps {
  assignment: GroupAssignment;
  sameGroupAssignments: GroupAssignment[];
  roundId: string;
  disabled: boolean;
  onUpdate: (assignmentId: string, updates: Partial<GroupAssignment>) => void;
}

function DraggableRow({
  assignment,
  sameGroupAssignments,
  roundId,
  disabled,
  onUpdate,
}: DraggableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: assignment.id,
    data: { assignment },
    disabled,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${isDragging ? "opacity-50 bg-gray-100 shadow-md z-10" : ""}`}
    >
      <td className="px-3 py-2.5 align-middle">
        <div className="flex items-center gap-2">
          {!disabled && (
            <button
              type="button"
              className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
              {...listeners}
              {...attributes}
              aria-label="Drag to move driver"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          <span className="text-sm font-medium text-gray-900">
            {assignment.driver.fullName}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 align-middle">
        <KartInputRow
          assignment={assignment}
          sameGroupAssignments={sameGroupAssignments}
          roundId={roundId}
          disabled={disabled}
          onUpdate={onUpdate}
        />
      </td>
    </tr>
  );
}

interface GroupCardProps {
  group: string;
  assignments: GroupAssignment[];
  roundId: string;
  disabled: boolean;
  onUpdate: (assignmentId: string, updates: Partial<GroupAssignment>) => void;
}

function GroupCard({ group, assignments, roundId, disabled, onUpdate }: GroupCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${DROPPABLE_PREFIX}${group}`,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 bg-white p-4 shadow-sm transition-colors ${
        isOver ? "border-[#BA1718] bg-red-50/30" : "border-gray-200"
      }`}
    >
      <h3 className="mb-3 text-base font-semibold text-gray-900">
        Group {group} ({assignments.length} driver{assignments.length !== 1 ? "s" : ""})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-0">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                Kart
              </th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <DraggableRow
                key={assignment.id}
                assignment={assignment}
                sameGroupAssignments={assignments}
                roundId={roundId}
                disabled={disabled}
                onUpdate={onUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.5" } },
  }),
};

interface GroupAssignmentsEditorProps {
  roundId: string;
  assignments: GroupAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<GroupAssignment[]>>;
  isRoundCompleted: boolean;
}

export function GroupAssignmentsEditor({
  roundId,
  assignments,
  setAssignments,
  isRoundCompleted,
}: GroupAssignmentsEditorProps) {
  const [activeAssignment, setActiveAssignment] = useState<GroupAssignment | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const updateAssignment = useCallback(
    (assignmentId: string, updates: Partial<GroupAssignment>) => {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, ...updates } : a
        )
      );
    },
    [setAssignments]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { assignment: GroupAssignment } | undefined;
    setActiveAssignment(data?.assignment ?? null);
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveAssignment(null);
      if (!over) return;
      const targetGroup = getGroupFromDroppableId(String(over.id));
      if (!targetGroup) return;
      const assignment = assignments.find((a) => a.id === active.id);
      if (!assignment || assignment.group === targetGroup) return;

      const previousGroup = assignment.group;
      const previousAssignments = [...assignments];
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignment.id ? { ...a, group: targetGroup } : a
        )
      );

      try {
        const res = await fetch(
          `/api/admin/rounds/${roundId}/assignments/${assignment.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group: targetGroup }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to move driver");
        }
        toast.success(`Moved to Group ${targetGroup}`);
      } catch (err: unknown) {
        setAssignments(previousAssignments);
        toast.error(err instanceof Error ? err.message : "Failed to move driver");
      }
    },
    [assignments, roundId, setAssignments]
  );

  const grouped = assignments.reduce<Record<string, GroupAssignment[]>>((acc, a) => {
    const g = a.group;
    if (!acc[g]) acc[g] = [];
    acc[g].push(a);
    return acc;
  }, {});
  const sortedGroups = Object.keys(grouped).sort();

  return (
    <div>
      <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
        Group Assignments
      </h2>
      {isRoundCompleted && (
        <p className="text-sm text-gray-500 mb-3">
          This round is completed. Editing is disabled.
        </p>
      )}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="mt-4 flex flex-col gap-4">
          {sortedGroups.map((group) => (
            <GroupCard
              key={group}
              group={group}
              assignments={grouped[group]}
              roundId={roundId}
              disabled={isRoundCompleted}
              onUpdate={updateAssignment}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeAssignment ? (
            <div
              className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 shadow-lg flex items-center gap-3 cursor-grabbing"
              style={{ minWidth: 200 }}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {activeAssignment.driver.fullName}
              </span>
              <span className="text-xs text-gray-500">
                Kart {activeAssignment.kartNumber}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
