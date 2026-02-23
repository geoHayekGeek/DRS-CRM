"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { theme } from "@/lib/theme";

export interface DriverOption {
  id: string;
  fullName: string;
}

interface DriverMultiSelectProps {
  drivers: DriverOption[];
  selectedDriverIds: string[];
  onChange: (selectedDriverIds: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
  id?: string;
  "aria-label"?: string;
}

export function DriverMultiSelect({
  drivers,
  selectedDriverIds,
  onChange,
  disabled = false,
  loading = false,
  id = "participating-drivers",
  "aria-label": ariaLabel = "Select participating drivers",
}: DriverMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredDrivers = useMemo(() => {
    if (!searchQuery.trim()) return drivers;
    const q = searchQuery.trim().toLowerCase();
    return drivers.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
    );
  }, [drivers, searchQuery]);

  const toggleDriver = useCallback(
    (driverId: string) => {
      if (disabled) return;
      const next = selectedDriverIds.includes(driverId)
        ? selectedDriverIds.filter((id) => id !== driverId)
        : [...selectedDriverIds, driverId];
      onChange(next);
    },
    [disabled, selectedDriverIds, onChange]
  );

  const removeDriver = useCallback(
    (driverId: string) => {
      if (disabled) return;
      onChange(selectedDriverIds.filter((id) => id !== driverId));
    },
    [disabled, selectedDriverIds, onChange]
  );

  const selectedSet = useMemo(
    () => new Set(selectedDriverIds),
    [selectedDriverIds]
  );
  const selectedDrivers = useMemo(
    () => drivers.filter((d) => selectedSet.has(d.id)),
    [drivers, selectedSet]
  );

  // Keyboard: ArrowDown, ArrowUp, Enter/Space to toggle, Home, End
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (filteredDrivers.length === 0) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((i) =>
            i < filteredDrivers.length - 1 ? i + 1 : 0
          );
          return;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((i) =>
            i > 0 ? i - 1 : filteredDrivers.length - 1
          );
          return;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredDrivers.length) {
            toggleDriver(filteredDrivers[focusedIndex].id);
          }
          return;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          return;
        case "End":
          e.preventDefault();
          setFocusedIndex(filteredDrivers.length - 1);
          return;
        default:
          return;
      }
    },
    [filteredDrivers, focusedIndex, toggleDriver]
  );

  useEffect(() => {
    const el = itemRefs.current[focusedIndex];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusedIndex]);

  const showValidationError = selectedDriverIds.length === 0;

  if (loading) {
    return (
      <p className="text-sm text-gray-500" id={id}>
        Loading drivers...
      </p>
    );
  }

  if (drivers.length === 0) {
    return (
      <p className="text-sm text-gray-500" id={id}>
        No drivers in database.{" "}
        <a
          href="/admin/drivers/new"
          className="hover:underline"
          style={{ color: theme.colors.primary.red }}
        >
          Create drivers first
        </a>
        .
      </p>
    );
  }

  return (
    <div className="w-full" role="group" aria-label={ariaLabel}>
      <div
        className="rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:border-transparent min-w-0"
        style={{
          ["--tw-ring-color" as string]: theme.colors.primary.red,
        }}
      >
        {/* Selected chips */}
        {selectedDrivers.length > 0 && (
          <div className="px-3 pt-3 pb-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Selected: {selectedDriverIds.length} driver
              {selectedDriverIds.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDrivers.map((d) => (
                <span
                  key={d.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm bg-gray-100 text-gray-800"
                >
                  {d.fullName}
                  <button
                    type="button"
                    onClick={() => removeDriver(d.id)}
                    disabled={disabled}
                    className="p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors touch-manipulation"
                    aria-label={`Remove ${d.fullName}`}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-2 border-b border-gray-100">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFocusedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            id={id}
            placeholder="Search drivers..."
            disabled={disabled}
            className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white min-w-0"
            style={{
              ["--tw-ring-color" as string]: theme.colors.primary.red,
            }}
            aria-label="Search drivers"
          />
        </div>

        {/* Scrollable list */}
        <div
          ref={listRef}
          className="overflow-y-auto max-h-[250px]"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="listbox"
          aria-multiselectable="true"
          aria-label="Driver list"
        >
          {filteredDrivers.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-500 text-center">
              No drivers match &quot;{searchQuery}&quot;
            </p>
          ) : (
            filteredDrivers.map((driver, index) => {
              const isSelected = selectedSet.has(driver.id);
              const isFocused = index === focusedIndex;
              return (
                <div
                  key={driver.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => toggleDriver(driver.id)}
                  onFocus={() => setFocusedIndex(index)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer text-left transition-colors min-w-0 ${
                    disabled ? "cursor-not-allowed opacity-60" : ""
                  } ${isSelected ? "bg-red-50/80" : ""} ${
                    isFocused ? "bg-gray-100" : "hover:bg-gray-50"
                  } ${isSelected && isFocused ? "bg-red-100/80" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleDriver(driver.id)}
                    disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 shrink-0"
                    style={{
                      accentColor: theme.colors.primary.red,
                    }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900 block truncate">
                      {driver.fullName}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showValidationError && (
        <p
          className="mt-1.5 text-sm font-medium"
          style={{ color: theme.colors.semantic.error }}
          role="alert"
        >
          Select at least one driver.
        </p>
      )}
    </div>
  );
}
