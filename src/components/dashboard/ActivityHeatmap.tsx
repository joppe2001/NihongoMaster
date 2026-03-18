import { useState, useEffect, useRef } from 'react';
import { query } from '@/lib/db';

interface DayData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  userId: number;
}

const WEEKS_TO_SHOW = 26; // ~6 months
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = [
  { index: 1, label: 'Mon' },
  { index: 3, label: 'Wed' },
  { index: 5, label: 'Fri' },
];

interface CellData {
  date: Date;
  dateStr: string;
  count: number;
  intensity: number; // 0-4
}

export function ActivityHeatmap({ userId }: ActivityHeatmapProps) {
  const [data, setData] = useState<Map<string, number>>(new Map());
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const rows = await query<DayData>(
        `SELECT date, cards_reviewed as count FROM user_progress
         WHERE user_id = $1 AND date >= date('now', '-180 days')
         ORDER BY date ASC`,
        [userId]
      );
      const map = new Map<string, number>();
      for (const row of rows) {
        map.set(row.date, row.count);
      }
      setData(map);
    }
    load();
  }, [userId]);

  // Build grid: columns = weeks, rows = days (Sun-Sat)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (WEEKS_TO_SHOW * 7 - 1));
  // Align to start of week (Sunday)
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks: CellData[][] = [];
  const d = new Date(startDate);
  let currentWeek: CellData[] = [];

  while (d <= today) {
    const dateStr = d.toISOString().slice(0, 10);
    currentWeek.push({
      date: new Date(d),
      dateStr,
      count: data.get(dateStr) ?? 0,
      intensity: 0, // calculated below
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    d.setDate(d.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    // Pad the last week so it's always 7 (future days won't render)
    weeks.push(currentWeek);
  }

  // Calculate intensity levels
  const maxCount = Math.max(1, ...Array.from(data.values()));
  for (const week of weeks) {
    for (const cell of week) {
      if (cell.count === 0) {
        cell.intensity = 0;
      } else {
        cell.intensity = Math.min(4, Math.ceil((cell.count / maxCount) * 4));
      }
    }
  }

  // Total reviews for the period
  const totalReviews = Array.from(data.values()).reduce((a, b) => a + b, 0);
  const activeDays = Array.from(data.values()).filter((v) => v > 0).length;

  // Build month label positions (aligned to first week of each month)
  const monthLabels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  for (let wi = 0; wi < weeks.length; wi++) {
    // Use the first day of the week to determine which month the column belongs to
    const firstDay = weeks[wi][0];
    const month = firstDay.date.getMonth();
    if (month !== lastMonth) {
      // Only show if there's room (at least 3 weeks gap from the previous label)
      if (monthLabels.length === 0 || wi - monthLabels[monthLabels.length - 1].colIndex >= 3) {
        monthLabels.push({ label: MONTH_LABELS[month], colIndex: wi });
      }
      lastMonth = month;
    }
  }

  const handleCellHover = (e: React.MouseEvent, cell: CellData) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cellRect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      text: `${cell.count} review${cell.count !== 1 ? 's' : ''} on ${formatDate(cell.date)}`,
      x: cellRect.left - rect.left + cellRect.width / 2,
      y: cellRect.top - rect.top - 4,
    });
  };

  // Intensity → CSS opacity against accent color
  // Level 0 = empty (uses bg-subtle), levels 1-4 use accent at increasing opacity
  const cellStyle = (intensity: number, isFuture: boolean): React.CSSProperties => {
    if (isFuture) return {};
    if (intensity === 0) return {};
    // Map intensity 1-4 to opacity values that create a clear visual ramp
    const opacities = [0, 0.2, 0.4, 0.65, 1.0];
    return {
      backgroundColor: `color-mix(in srgb, var(--color-accent) ${opacities[intensity] * 100}%, transparent)`,
    };
  };

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border p-4 pb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary tracking-tight">Activity</h3>
        <p className="text-[11px] text-text-secondary">
          <span className="font-semibold text-text-primary tabular-nums">{totalReviews.toLocaleString()}</span> reviews in the last {WEEKS_TO_SHOW} weeks
          {activeDays > 0 && (
            <span className="text-text-tertiary"> &middot; {activeDays} active day{activeDays !== 1 ? 's' : ''}</span>
          )}
        </p>
      </div>

      {/* Graph container */}
      <div ref={containerRef} className="relative">
        {/* Month labels row */}
        <div className="flex ml-7 mb-1">
          {weeks.map((_, wi) => {
            const monthLabel = monthLabels.find((m) => m.colIndex === wi);
            return (
              <div key={wi} className="flex-none" style={{ width: 13 }}>
                {monthLabel && (
                  <span className="text-[10px] text-text-tertiary leading-none">{monthLabel.label}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid: day labels + cells */}
        <div className="flex">
          {/* Day-of-week labels */}
          <div className="flex flex-col shrink-0 mr-1" style={{ width: 24 }}>
            {Array.from({ length: 7 }, (_, i) => {
              const dayLabel = DAY_LABELS.find((d) => d.index === i);
              return (
                <div key={i} className="flex items-center justify-end" style={{ height: 11, marginBottom: 2 }}>
                  <span className="text-[10px] text-text-tertiary leading-none">
                    {dayLabel?.label ?? ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Weeks grid */}
          <div className="flex gap-[2px] flex-1 overflow-hidden">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((cell, di) => {
                  const isFuture = cell.date > today;
                  if (isFuture) {
                    return <div key={di} className="w-[11px] h-[11px]" />;
                  }
                  return (
                    <div
                      key={di}
                      className={`w-[11px] h-[11px] rounded-[2px] transition-colors ${cell.intensity === 0 ? 'bg-bg-subtle' : ''}`}
                      style={cellStyle(cell.intensity, isFuture)}
                      onMouseEnter={(e) => handleCellHover(e, cell)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 px-2 py-1 rounded-md text-[11px] font-medium bg-text-primary text-bg-primary shadow-lg whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {tooltip.text}
            {/* Arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid var(--color-text-primary)',
              }}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[10px] text-text-tertiary mr-0.5">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-[10px] h-[10px] rounded-[2px] ${level === 0 ? 'bg-bg-subtle' : ''}`}
            style={level > 0 ? {
              backgroundColor: `color-mix(in srgb, var(--color-accent) ${[0, 20, 40, 65, 100][level]}%, transparent)`,
            } : undefined}
          />
        ))}
        <span className="text-[10px] text-text-tertiary ml-0.5">More</span>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
