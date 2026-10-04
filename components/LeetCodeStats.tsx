"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import rough from "roughjs";
import { ExternalLink, Flame, Trophy } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const LEETCODE_USERNAME = "garvittsingla";
const DAY_MS = 24 * 60 * 60 * 1000;

interface ContestResult {
  rating: number;
  ranking: number;
  title: string;
  startTime: number;
}

interface LeetCodeData {
  username: string;
  realName: string;
  ranking: number | null;
  solved: { all: number; easy: number; medium: number; hard: number };
  calendar: Record<string, number>;
  activeDays: number;
  streak: number;
  contestRating: number | null;
  contestRanking: number | null;
  contestHistory: ContestResult[];
}

interface CalendarCell {
  date: Date;
  count: number;
}

interface SvgPathData {
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

interface CellRenderData {
  cell: CalendarCell;
  level: number;
  col: number;
  row: number;
  x: number;
  y: number;
  paths: SvgPathData[];
}

const formatNumber = (value: number) => value.toLocaleString("en-US");

function getSubmissionLevel(count: number): number {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

function ratingPath(history: ContestResult[]) {
  const width = 640;
  const height = 205;
  const padding = { top: 14, right: 18, bottom: 30, left: 42 };

  if (history.length === 0) return null;

  const ratings = history.map((entry) => entry.rating);
  const minRating = Math.floor((Math.min(...ratings) - 50) / 100) * 100;
  const maxRating = Math.ceil((Math.max(...ratings) + 50) / 100) * 100;
  const range = Math.max(maxRating - minRating, 100);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const points = history.map((entry, index) => {
    const x = padding.left + (history.length === 1 ? plotWidth / 2 : (index / (history.length - 1)) * plotWidth);
    const y = padding.top + ((maxRating - entry.rating) / range) * plotHeight;
    return { ...entry, x, y };
  });

  return { width, height, padding, minRating, maxRating, points, plotWidth, plotHeight };
}

export function LeetCodeStats() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [data, setData] = useState<LeetCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fillStyleMode = "cross-hatch";
  const seedOffset = 0;
  const [filterLevel, setFilterLevel] = useState<number | null>(null);

  const [hoveredCell, setHoveredCell] = useState<{
    cell: CalendarCell;
    level: number;
    x: number;
    y: number;
  } | null>(null);

  const [hoveredContest, setHoveredContest] = useState<ContestResult | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const response = await fetch(`/api/leetcode?username=${LEETCODE_USERNAME}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load LeetCode stats.");
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not load LeetCode stats.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);


  const weeks = useMemo(() => {
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const daysToSaturday = 6 - new Date(todayUtc).getUTCDay();
    const end = todayUtc + daysToSaturday * DAY_MS;
    const start = end - 370 * DAY_MS;
    const cells: CalendarCell[] = Array.from({ length: 371 }, (_, index) => {
      const date = new Date(start + index * DAY_MS);
      const key = String(Math.floor(date.getTime() / 1000));
      return { date, count: data?.calendar[key] ?? 0 };
    });
    return Array.from({ length: 53 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  }, [data]);

  // Auto-scroll the contribution grid to the right on mobile screens
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [weeks]);

  // Month labels across the 53 weeks
  const monthLabels = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels: { weekIndex: number; name: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIdx) => {
      if (week.length > 0) {
        const midDay = week[Math.min(3, week.length - 1)];
        const m = midDay.date.getUTCMonth();
        if (m !== lastMonth) {
          lastMonth = m;
          const prev = labels[labels.length - 1];
          if (!prev || weekIdx - prev.weekIndex >= 3) {
            labels.push({ weekIndex: weekIdx, name: months[m] });
          }
        }
      }
    });
    return labels;
  }, [weeks]);

  const contestHistory = useMemo(
    () => [...(data?.contestHistory ?? [])].sort((a, b) => a.startTime - b.startTime),
    [data],
  );
  const chart = useMemo(() => ratingPath(contestHistory), [contestHistory]);
  const yearlySubmissions = data ? Object.values(data.calendar).reduce((sum, count) => sum + count, 0) : 0;

  // Layout constants matching GitHub graph
  const CELL_SIZE = 11;
  const CELL_GAP = 3.5;
  const MARGIN_LEFT = 36;
  const MARGIN_TOP = 28;
  const TOTAL_SVG_WIDTH = 830;
  const TOTAL_SVG_HEIGHT = 154;

  // Generate Rough.js cells and annotations with warm amber/orange LeetCode theme
  const { cellDataList, monthHighlighters, dividerLinePaths } = useMemo(() => {
    const gen = rough.generator();

    const getCellColors = (level: number) => {
      if (isDark) {
        switch (level) {
          case 1:
            return { stroke: "#f59e0b", fill: "#78350f", gap: 3.8, strokeW: 0.95 };
          case 2:
            return { stroke: "#fbbf24", fill: "#92400e", gap: 3.0, strokeW: 1.05 };
          case 3:
            return { stroke: "#fb923c", fill: "#b45309", gap: 2.3, strokeW: 1.15 };
          case 4:
            return { stroke: "#fdba74", fill: "#ea580c", gap: 1.7, strokeW: 1.25 };
          case 0:
          default:
            return { stroke: "rgba(180, 145, 100, 0.32)", fill: "rgba(48, 38, 28, 0.4)", gap: 4, strokeW: 0.85 };
        }
      } else {
        switch (level) {
          case 1:
            return { stroke: "#d97706", fill: "#fde047", gap: 3.8, strokeW: 0.95 };
          case 2:
            return { stroke: "#b45309", fill: "#fbbf24", gap: 3.0, strokeW: 1.05 };
          case 3:
            return { stroke: "#c2410c", fill: "#f97316", gap: 2.3, strokeW: 1.15 };
          case 4:
            return { stroke: "#9a3412", fill: "#ea580c", gap: 1.7, strokeW: 1.25 };
          case 0:
          default:
            return { stroke: "rgba(165, 135, 95, 0.45)", fill: "rgba(235, 222, 195, 0.35)", gap: 4, strokeW: 0.85 };
        }
      }
    };

    const cells: CellRenderData[] = [];
    weeks.forEach((week, col) => {
      week.forEach((cell, row) => {
        const x = MARGIN_LEFT + col * (CELL_SIZE + CELL_GAP);
        const y = MARGIN_TOP + row * (CELL_SIZE + CELL_GAP);
        const seed = Math.floor((col * 7 + row + 1) * 37.718) + seedOffset;
        const level = getSubmissionLevel(cell.count);
        const colors = getCellColors(level);

        const isZero = level === 0;
        const rectDrawable = gen.rectangle(x, y, CELL_SIZE, CELL_SIZE, {
          seed,
          roughness: isZero ? 0.9 : 1.25,
          bowing: 1.15,
          stroke: colors.stroke,
          strokeWidth: colors.strokeW,
          fill: colors.fill,
          fillStyle: isZero ? "solid" : fillStyleMode,
          fillWeight: fillStyleMode === "cross-hatch" ? 0.85 : 1.05,
          hachureAngle: -41,
          hachureGap: colors.gap,
        });

        const rawPaths = gen.toPaths(rectDrawable);
        const paths: SvgPathData[] = rawPaths.map((p) => ({
          d: p.d,
          stroke: p.stroke || "none",
          strokeWidth: p.strokeWidth || 0,
          fill: p.fill || "none",
        }));

        cells.push({
          cell,
          level,
          col,
          row,
          x,
          y,
          paths,
        });
      });
    });

    const mHighlighters = monthLabels.map((m, idx) => {
      const x = MARGIN_LEFT + m.weekIndex * (CELL_SIZE + CELL_GAP);
      const hlDrawable = gen.rectangle(x - 3, 5, 26, 15, {
        seed: 600 + idx * 17 + seedOffset,
        roughness: 1.4,
        bowing: 1.2,
        fill: isDark ? "rgba(235, 180, 50, 0.22)" : "rgba(245, 205, 75, 0.42)",
        fillStyle: "solid",
        stroke: "none",
      });
      const paths = gen.toPaths(hlDrawable).map((p) => ({
        d: p.d,
        stroke: "none",
        strokeWidth: 0,
        fill: p.fill || "none",
      }));
      return {
        name: m.name,
        x,
        paths,
      };
    });

    const divDrawable = gen.line(MARGIN_LEFT, 150, MARGIN_LEFT + 53 * (CELL_SIZE + CELL_GAP) - CELL_GAP, 150, {
      seed: 777 + seedOffset,
      roughness: 1.3,
      bowing: 1.2,
      stroke: isDark ? "rgba(180, 140, 90, 0.3)" : "rgba(165, 125, 75, 0.35)",
      strokeWidth: 1.1,
    });
    const divPaths = gen.toPaths(divDrawable).map((p) => ({
      d: p.d,
      stroke: p.stroke || "none",
      strokeWidth: p.strokeWidth || 1,
      fill: "none",
    }));

    return {
      cellDataList: cells,
      monthHighlighters: mHighlighters,
      dividerLinePaths: divPaths,
    };
  }, [weeks, monthLabels, isDark, fillStyleMode, seedOffset]);

  // Hand-drawn legend paths (5 levels in amber/orange)
  const legendPaths = useMemo(() => {
    const gen = rough.generator();
    const levels = [0, 1, 2, 3, 4];
    return levels.map((lvl) => {
      let stroke = isDark ? "rgba(180, 145, 100, 0.35)" : "rgba(165, 135, 95, 0.45)";
      let fill = isDark ? "rgba(48, 38, 28, 0.4)" : "rgba(235, 222, 195, 0.35)";
      let gap = 3.8;
      let strokeW = 0.9;

      if (lvl === 1) {
        stroke = isDark ? "#f59e0b" : "#d97706";
        fill = isDark ? "#78350f" : "#fde047";
        gap = 3.8;
      } else if (lvl === 2) {
        stroke = isDark ? "#fbbf24" : "#b45309";
        fill = isDark ? "#92400e" : "#fbbf24";
        gap = 3.0;
        strokeW = 1.0;
      } else if (lvl === 3) {
        stroke = isDark ? "#fb923c" : "#c2410c";
        fill = isDark ? "#b45309" : "#f97316";
        gap = 2.3;
        strokeW = 1.1;
      } else if (lvl === 4) {
        stroke = isDark ? "#fdba74" : "#9a3412";
        fill = isDark ? "#ea580c" : "#ea580c";
        gap = 1.7;
        strokeW = 1.2;
      }

      const rect = gen.rectangle(0, 0, 11, 11, {
        seed: 800 + lvl * 23 + seedOffset,
        roughness: lvl === 0 ? 0.9 : 1.25,
        bowing: 1.1,
        stroke,
        strokeWidth: strokeW,
        fill,
        fillStyle: lvl === 0 ? "solid" : fillStyleMode,
        hachureAngle: -41,
        hachureGap: gap,
      });

      return gen.toPaths(rect).map((p) => ({
        d: p.d,
        stroke: p.stroke || "none",
        strokeWidth: p.strokeWidth || 0,
        fill: p.fill || "none",
      }));
    });
  }, [isDark, fillStyleMode, seedOffset]);

  // Hand-drawn highlight ring when hovering a cell
  const hoveredCellHighlight = useMemo(() => {
    if (!hoveredCell) return null;
    const gen = rough.generator();
    const cell = cellDataList.find((c) => c.cell.date.toISOString() === hoveredCell.cell.date.toISOString());
    if (!cell) return null;

    const ring = gen.rectangle(cell.x - 2.5, cell.y - 2.5, CELL_SIZE + 5, CELL_SIZE + 5, {
      seed: 8888 + seedOffset,
      roughness: 1.4,
      bowing: 1.3,
      stroke: isDark ? "#fbbf24" : "#b45309",
      strokeWidth: 1.8,
      fill: isDark ? "rgba(251, 191, 36, 0.18)" : "rgba(245, 158, 11, 0.15)",
      fillStyle: "solid",
    });

    return gen.toPaths(ring).map((p) => ({
      d: p.d,
      stroke: p.stroke || "none",
      strokeWidth: p.strokeWidth || 1.8,
      fill: p.fill || "none",
    }));
  }, [hoveredCell, cellDataList, isDark, seedOffset]);

  // Hand-drawn contest chart rendering with Rough.js
  const roughChartPaths = useMemo(() => {
    if (!chart || contestHistory.length === 0) return null;
    const gen = rough.generator();

    // 1. Reference grid lines
    const gridLines: SvgPathData[] = [];
    [0, 0.5, 1].forEach((fraction, idx) => {
      const y = chart.padding.top + chart.plotHeight * fraction;
      const lineDrawable = gen.line(chart.padding.left, y, chart.width - chart.padding.right, y, {
        seed: 300 + idx * 7 + seedOffset,
        stroke: isDark ? "rgba(180, 140, 90, 0.25)" : "rgba(165, 125, 75, 0.3)",
        strokeWidth: 0.9,
        strokeLineDash: [3, 4],
        roughness: 0.8,
      });
      gen.toPaths(lineDrawable).forEach((p) => {
        gridLines.push({
          d: p.d,
          stroke: p.stroke || "currentColor",
          strokeWidth: p.strokeWidth || 1,
          fill: "none",
        });
      });
    });

    // 2. Rating line
    const pointCoords: [number, number][] = chart.points.map((pt) => [pt.x, pt.y]);
    const lineDrawable = gen.linearPath(pointCoords, {
      seed: 555 + seedOffset,
      stroke: "#d97706",
      strokeWidth: 2.2,
      roughness: 1.1,
      bowing: 1.0,
    });
    const ratingLinePaths: SvgPathData[] = gen.toPaths(lineDrawable).map((p) => ({
      d: p.d,
      stroke: p.stroke || "#d97706",
      strokeWidth: p.strokeWidth || 2,
      fill: "none",
    }));

    // 3. Points circles
    const pointCircles = chart.points.map((pt, idx) => {
      const circleDrawable = gen.circle(pt.x, pt.y, 6.5, {
        seed: 700 + idx * 3 + seedOffset,
        stroke: isDark ? "#fde68a" : "#78350f",
        strokeWidth: 1.2,
        fill: "#d97706",
        fillStyle: "solid",
        roughness: 0.9,
      });
      return {
        point: pt,
        paths: gen.toPaths(circleDrawable).map((p) => ({
          d: p.d,
          stroke: p.stroke || "none",
          strokeWidth: p.strokeWidth || 0,
          fill: p.fill || "none",
        })),
      };
    });

    return {
      gridLines,
      ratingLinePaths,
      pointCircles,
    };
  }, [chart, contestHistory, isDark, seedOffset]);

  const formatDateString = (d: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getUTCDay()]}, ${monthNames[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  };

  return (
    <section
      id="leetcode"
      aria-label="LeetCode stats"
      className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 select-none mt-14 sm:mt-16 mb-16 sm:mb-20 scroll-mt-24"
    >
      {/* SECTION AMBIENCE: Warm antique desk lighting around the paper sheet */}
      <div
        className="absolute -inset-8 -z-10 pointer-events-none rounded-[40px] opacity-70 transition-opacity duration-500"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 50% 40%, rgba(217, 160, 60, 0.08) 0%, rgba(15, 12, 9, 0) 70%)"
            : "radial-gradient(ellipse at 50% 40%, rgba(245, 220, 160, 0.35) 0%, rgba(253, 251, 247, 0) 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative group/note">
        {/* UNEVEN TAPES HOLDING THE OLD PAPER DIRECTLY ABOVE */}
        {/* Left Tape */}
        <div
          className="absolute -top-3 sm:-top-3.5 left-8 sm:left-14 z-30 pointer-events-none transition-transform duration-300 group-hover/note:scale-[1.03]"
          style={{ transform: "rotate(-3.5deg)" }}
        >
          <div
            className="w-16 sm:w-20 h-4 sm:h-5 relative
              bg-[#eedcb4]/85 dark:bg-[#d4b47c]/25 backdrop-blur-[2px]
              border-y border-[#d8be8c]/60 dark:border-[#b89558]/35
              shadow-[0_2px_5px_rgba(100,70,30,0.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            style={{
              clipPath:
                "polygon(0% 4%, 96% 0%, 100% 16%, 95% 32%, 100% 48%, 96% 64%, 100% 80%, 95% 96%, 98% 100%, 0% 100%, 4% 84%, 0% 68%, 5% 52%, 1% 36%, 4% 20%, 0% 8%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-amber-900/10 pointer-events-none" />
          </div>
        </div>

        {/* Right Tape */}
        <div
          className="absolute -top-2.5 sm:-top-3 right-8 sm:right-14 z-30 pointer-events-none transition-transform duration-300 group-hover/note:scale-[1.03]"
          style={{ transform: "rotate(4.5deg)" }}
        >
          <div
            className="w-14 sm:w-16 h-3.5 sm:h-4.5 relative
              bg-[#eedcb4]/80 dark:bg-[#d4b47c]/25 backdrop-blur-[2px]
              border-y border-[#d8be8c]/55 dark:border-[#b89558]/30
              shadow-[0_2px_5px_rgba(100,70,30,0.1)] dark:shadow-[0_2px_7px_rgba(0,0,0,0.45)]"
            style={{
              clipPath:
                "polygon(0% 0%, 95% 3%, 100% 20%, 94% 38%, 99% 56%, 94% 74%, 100% 90%, 96% 100%, 0% 100%, 5% 82%, 0% 66%, 4% 50%, 0% 34%, 5% 18%, 1% 6%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-amber-900/10 pointer-events-none" />
          </div>
        </div>

        {/* THE OLD YELLOW PAPER SHEET BACKING */}
        <div
          ref={cardRef}
          className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8
            transition-all duration-500 ease-out rotate-[0.25deg] hover:rotate-0"
          style={{
            background: isDark
              ? "linear-gradient(140deg, #241d15 0%, #1e1710 40%, #16110b 100%)"
              : "linear-gradient(140deg, #fbf5e6 0%, #f6ecd0 25%, #f0dfba 65%, #e6d0a1 100%)",
            boxShadow: isDark
              ? "0 24px 60px -12px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(0, 0, 0, 0.6), inset 0 0 50px rgba(220, 160, 60, 0.08), inset 0 0 110px rgba(0, 0, 0, 0.5), inset 0 0 2px rgba(220, 160, 60, 0.25)"
              : "0 20px 48px -12px rgba(110, 75, 25, 0.22), 0 4px 16px rgba(80, 50, 15, 0.12), inset 0 0 50px rgba(160, 110, 45, 0.18), inset 0 0 110px rgba(120, 80, 25, 0.12), inset 0 0 2px rgba(100, 65, 20, 0.35)",
            border: isDark
              ? "1px solid rgba(210, 160, 80, 0.25)"
              : "1px solid rgba(195, 155, 100, 0.45)",
          }}
        >
          {/* 1. FAINT VINTAGE SURVEYOR / ARCHIVAL LEDGER GRID PATTERN */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl opacity-60 dark:opacity-30"
            style={{
              backgroundImage: isDark
                ? "linear-gradient(to right, rgba(215, 160, 60, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(215, 160, 60, 0.05) 1px, transparent 1px)"
                : "linear-gradient(to right, rgba(160, 115, 60, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(160, 115, 60, 0.08) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* 2. TACTILE PAPER FIBER NOISE OVERLAY */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl opacity-35 dark:opacity-20"
            style={{
              backgroundImage: "url('/paper-noise.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
              mixBlendMode: isDark ? "screen" : "multiply",
            }}
          />

          {/* 3. DRIED TEA / COFFEE WATERMARK IN CORNER */}
          <div
            className="absolute top-5 right-14 w-28 h-28 pointer-events-none rounded-full opacity-20 dark:opacity-10"
            style={{
              background: isDark
                ? "radial-gradient(circle, transparent 48%, rgba(215, 160, 60, 0.25) 54%, rgba(215, 160, 60, 0.08) 70%, transparent 72%)"
                : "radial-gradient(circle, transparent 48%, rgba(145, 95, 40, 0.35) 54%, rgba(175, 120, 50, 0.12) 70%, transparent 72%)",
              transform: "rotate(-15deg) scaleX(1.1)",
            }}
          />

          {/* 4. REALISTIC DOG-EARED FOLDED CORNER AT BOTTOM-RIGHT */}
          <div
            className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none overflow-hidden"
            style={{ borderBottomRightRadius: "1rem" }}
          >
            <div
              className="absolute bottom-0 right-0 w-8 h-8 transition-transform duration-300"
              style={{
                background: isDark
                  ? "linear-gradient(225deg, #2e261d 45%, #18130e 55%)"
                  : "linear-gradient(225deg, #e4cd9b 45%, #cbb17b 55%)",
                boxShadow: isDark
                  ? "-2px -2px 6px rgba(0, 0, 0, 0.6)"
                  : "-2px -2px 5px rgba(110, 75, 25, 0.25)",
                clipPath: "polygon(100% 0%, 0% 100%, 100% 100%)",
              }}
            />
          </div>

          {/* TOP BAR: Clean Heading without Rough.js highlighter, subtitle & LeetCode link */}
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 mb-5 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-handwriting font-normal text-[#382b1d] dark:text-[#f4e8cb] tracking-tight rotate-[-0.5deg]">
                leetcode problem-solving log
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-handwriting text-[#6c543c] dark:text-[#b49e82] rotate-[0.3deg]">
                a little record of problems and contests
              </p>
            </div>

            <a
              href={`https://leetcode.com/u/${LEETCODE_USERNAME}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono
                text-[#5a4632] dark:text-[#d6c5a5]
                hover:text-[#1f170f] dark:hover:text-white
                bg-[#ecd8b0]/50 dark:bg-[#2c2217]/60
                border border-[#cfb686]/60 dark:border-[#523e2b]/80
                hover:border-[#9c7d4a] dark:hover:border-[#8f6e3c]
                transition-all shadow-2xs group/link"
            >
              <span>u/{LEETCODE_USERNAME}</span>
              <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100 transition-opacity" />
            </a>
          </div>

          {isLoading && (
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-pulse" aria-label="Loading LeetCode stats">
              {["total", "easy", "medium", "hard"].map((label) => (
                <div key={label} className="h-[76px] rounded-xl bg-[#ecd8b0]/35 dark:bg-[#281f15]/50 border border-[#cfb686]/40 dark:border-[#4d3a27]/50" />
              ))}
            </div>
          )}

          {error && (
            <p role="status" className="relative z-10 rounded-xl border border-amber-300/70 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-3 text-xs font-mono text-[#5a4632] dark:text-[#d6c5a5]">
              {error} The profile link above still opens LeetCode.
            </p>
          )}

          {data && (
            <div className="relative z-10 space-y-6">
              {/* STAT CARDS: Styled as vintage parchment index cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div
                  className="col-span-2 sm:col-span-1 rounded-xl p-3.5 rotate-[-0.4deg] transition-transform hover:rotate-0"
                  style={{
                    background: isDark ? "rgba(42, 33, 23, 0.7)" : "rgba(255, 252, 244, 0.75)",
                    border: isDark ? "1px solid rgba(215, 160, 60, 0.25)" : "1px solid rgba(195, 155, 100, 0.45)",
                    boxShadow: isDark ? "inset 0 0 15px rgba(0,0,0,0.3)" : "inset 0 0 15px rgba(160, 110, 45, 0.06)",
                  }}
                >
                  <p className="text-xs font-handwriting text-[#6c543c] dark:text-[#b49e82]">solved</p>
                  <p className="mt-1 text-2xl font-handwriting text-[#382b1d] dark:text-[#f4e8cb]">{formatNumber(data.solved.all)}</p>
                  <p className="text-xs font-handwriting text-[#6c543c] dark:text-[#b49e82]">problems</p>
                </div>

                <div
                  className="rounded-xl p-3.5 rotate-[0.3deg] transition-transform hover:rotate-0"
                  style={{
                    background: isDark ? "rgba(42, 33, 23, 0.6)" : "rgba(255, 252, 244, 0.65)",
                    border: isDark ? "1px solid rgba(46, 160, 67, 0.3)" : "1px solid rgba(46, 160, 67, 0.35)",
                  }}
                >
                  <p className="text-xs font-handwriting text-[#2ea043] dark:text-[#3fb950]">easy</p>
                  <p className="mt-1 text-xl font-handwriting text-[#382b1d] dark:text-[#f4e8cb]">{formatNumber(data.solved.easy)}</p>
                </div>

                <div
                  className="rounded-xl p-3.5 rotate-[-0.25deg] transition-transform hover:rotate-0"
                  style={{
                    background: isDark ? "rgba(42, 33, 23, 0.6)" : "rgba(255, 252, 244, 0.65)",
                    border: isDark ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(217, 119, 6, 0.35)",
                  }}
                >
                  <p className="text-xs font-handwriting text-[#d97706] dark:text-[#f59e0b]">medium</p>
                  <p className="mt-1 text-xl font-handwriting text-[#382b1d] dark:text-[#f4e8cb]">{formatNumber(data.solved.medium)}</p>
                </div>

                <div
                  className="rounded-xl p-3.5 rotate-[0.45deg] transition-transform hover:rotate-0"
                  style={{
                    background: isDark ? "rgba(42, 33, 23, 0.6)" : "rgba(255, 252, 244, 0.65)",
                    border: isDark ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(220, 38, 38, 0.35)",
                  }}
                >
                  <p className="text-xs font-handwriting text-[#dc2626] dark:text-[#ef4444]">hard</p>
                  <p className="mt-1 text-xl font-handwriting text-[#382b1d] dark:text-[#f4e8cb]">{formatNumber(data.solved.hard)}</p>
                </div>
              </div>

              {/* HANDDRAWN LEETCODE SUBMISSION HEATMAP */}
              <div
                className="rounded-2xl p-4 sm:p-5"
                style={{
                  background: isDark ? "rgba(32, 25, 18, 0.6)" : "rgba(255, 252, 244, 0.65)",
                  border: isDark ? "1px solid rgba(215, 160, 60, 0.22)" : "1px solid rgba(195, 155, 100, 0.4)",
                  boxShadow: isDark ? "inset 0 0 20px rgba(0,0,0,0.3)" : "inset 0 0 20px rgba(160, 110, 45, 0.05)",
                }}
              >
                {/* Header & Stats */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-handwriting text-[#382b1d] dark:text-[#f4e8cb] rotate-[-0.5deg]">
                      submission history
                    </h3>
                    <p className="mt-0.5 text-xs font-handwriting text-[#6c543c] dark:text-[#b49e82]">
                      last 12 months · {formatNumber(yearlySubmissions)} submissions
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-handwriting text-[#6c543c] dark:text-[#b49e82]">
                      <Flame className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>{formatNumber(data.activeDays)} active days</span>
                      <span className="text-[#cbb07d] dark:text-[#4d3a27]">·</span>
                      <span>{formatNumber(data.streak)} day streak</span>
                    </div>
                  </div>
                </div>

                {/* Unified Rough.js SVG Grid */}
                <div className="relative">
                  <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth select-none"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    <div className="min-w-[760px] sm:min-w-[800px] w-full flex flex-col">
                      <svg
                        viewBox={`0 0 ${TOTAL_SVG_WIDTH} ${TOTAL_SVG_HEIGHT}`}
                        className="w-full h-auto overflow-visible select-none"
                        aria-label="Handdrawn LeetCode Submission Graph"
                      >
                        {/* Day of Week Labels */}
                        <g className="font-mono text-[10px] select-none">
                          <text
                            x={MARGIN_LEFT - 8}
                            y={MARGIN_TOP + 1 * (CELL_SIZE + CELL_GAP) + 8.5}
                            textAnchor="end"
                            className="font-handwriting text-[11px] fill-[#6a543f] dark:fill-[#ab977e]"
                          >
                            Mon
                          </text>
                          <text
                            x={MARGIN_LEFT - 8}
                            y={MARGIN_TOP + 3 * (CELL_SIZE + CELL_GAP) + 8.5}
                            textAnchor="end"
                            className="font-handwriting text-[11px] fill-[#6a543f] dark:fill-[#ab977e]"
                          >
                            Wed
                          </text>
                          <text
                            x={MARGIN_LEFT - 8}
                            y={MARGIN_TOP + 5 * (CELL_SIZE + CELL_GAP) + 8.5}
                            textAnchor="end"
                            className="font-handwriting text-[11px] fill-[#6a543f] dark:fill-[#ab977e]"
                          >
                            Fri
                          </text>
                        </g>

                        {/* Month Headers */}
                        <g className="month-headers select-none">
                          {monthHighlighters.map((m, idx) => (
                            <g key={idx}>
                              {m.paths.map((p, pIdx) => (
                                <path key={pIdx} d={p.d} fill={p.fill} stroke="none" />
                              ))}
                              <text
                                x={m.x + 10}
                                y={16}
                                textAnchor="middle"
                                className="font-mono font-medium text-[11px] fill-[#4a3927] dark:fill-[#ecdcc2] select-none"
                              >
                                {m.name}
                              </text>
                            </g>
                          ))}
                        </g>

                        {/* 371 Day Cells */}
                        <g className="submission-cells">
                          {cellDataList.map((cellItem) => {
                            const isHovered = hoveredCell?.cell.date.toISOString() === cellItem.cell.date.toISOString();
                            const isDimmed = filterLevel !== null && cellItem.level !== filterLevel;

                            return (
                              <g
                                key={cellItem.cell.date.toISOString()}
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const cardBounds = cardRef.current?.getBoundingClientRect();
                                  if (cardBounds) {
                                    setHoveredCell({
                                      cell: cellItem.cell,
                                      level: cellItem.level,
                                      x: rect.left - cardBounds.left + rect.width / 2,
                                      y: rect.top - cardBounds.top,
                                    });
                                  }
                                }}
                                onMouseLeave={() => setHoveredCell(null)}
                                className="cursor-pointer"
                              >
                                {cellItem.paths.map((path, pathIdx) => (
                                  <path
                                    key={pathIdx}
                                    d={path.d}
                                    stroke={path.stroke === "none" ? undefined : path.stroke}
                                    strokeWidth={path.strokeWidth}
                                    fill={path.fill === "none" ? "none" : path.fill}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-opacity duration-150 ${
                                      isDimmed ? "opacity-20" : isHovered ? "opacity-100" : "opacity-90"
                                    }`}
                                  />
                                ))}

                                <rect
                                  x={cellItem.x - 1}
                                  y={cellItem.y - 1}
                                  width={CELL_SIZE + 2}
                                  height={CELL_SIZE + 2}
                                  fill="transparent"
                                  className="cursor-pointer"
                                />
                              </g>
                            );
                          })}
                        </g>

                        {/* Active Cell Hover Highlight Ring */}
                        {hoveredCellHighlight && (
                          <g className="pointer-events-none animate-in fade-in duration-100">
                            {hoveredCellHighlight.map((p, pIdx) => (
                              <path
                                key={pIdx}
                                d={p.d}
                                stroke={p.stroke}
                                strokeWidth={p.strokeWidth}
                                fill={p.fill}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            ))}
                          </g>
                        )}

                        {/* Divider Line */}
                        <g className="divider-line pointer-events-none">
                          {dividerLinePaths.map((p, idx) => (
                            <path
                              key={idx}
                              d={p.d}
                              stroke={p.stroke}
                              strokeWidth={p.strokeWidth}
                              fill="none"
                              strokeLinecap="round"
                            />
                          ))}
                        </g>
                      </svg>
                    </div>
                  </div>

                  {/* Interactive Tooltip */}
                  {hoveredCell && (
                    <div
                      className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-all duration-100"
                      style={{
                        left: hoveredCell.x,
                        top: hoveredCell.y - 8,
                      }}
                    >
                      <div
                        className="relative px-3 py-1.5 rounded-md text-[11px] font-mono tracking-tight shadow-xl whitespace-nowrap"
                        style={{
                          background: isDark ? "#1f1811" : "#fffef7",
                          color: isDark ? "#fef3c7" : "#38291b",
                          border: isDark ? "1px solid rgba(217, 160, 60, 0.45)" : "1px solid rgba(165, 125, 75, 0.45)",
                          boxShadow: isDark
                            ? "0 8px 24px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.4)"
                            : "0 8px 20px rgba(100,70,30,0.18), 0 2px 6px rgba(80,50,15,0.1)",
                        }}
                      >
                        <div className="flex items-center gap-1.5 font-medium">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                hoveredCell.cell.count === 0
                                  ? isDark ? "#715b43" : "#c4ab85"
                                  : hoveredCell.cell.count > 9
                                  ? "#ea580c"
                                  : "#d97706",
                            }}
                          />
                          <span>
                            {hoveredCell.cell.count === 0
                              ? "No submissions"
                              : `${hoveredCell.cell.count} submission${
                                  hoveredCell.cell.count === 1 ? "" : "s"
                                }`}
                          </span>
                          <span className="opacity-50">on</span>
                          <span className="font-sans font-semibold">
                            {formatDateString(hoveredCell.cell.date)}
                          </span>
                        </div>

                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent"
                          style={{
                            borderTop: isDark ? "5px solid #1f1811" : "5px solid #fffef7",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Handdrawn Interactive Legend */}
                <div className="mt-3 flex items-center justify-end gap-1.5 text-xs font-handwriting text-[#5e4933] dark:text-[#bca88d]">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((level) => {
                      const paths = legendPaths[level] || [];
                      const isHovered = filterLevel === level;

                      return (
                        <button
                          key={level}
                          type="button"
                          onMouseEnter={() => setFilterLevel(level)}
                          onMouseLeave={() => setFilterLevel(null)}
                          onClick={() => setFilterLevel((prev) => (prev === level ? null : level))}
                          className={`relative w-4 h-4 cursor-pointer transition-transform duration-100 flex items-center justify-center ${
                            isHovered ? "scale-135 z-20" : "hover:scale-120"
                          }`}
                          title={`Level ${level} submissions (hover to highlight)`}
                        >
                          <svg viewBox="0 0 11 11" className="w-3.5 h-3.5 overflow-visible">
                            {paths.map((p, idx) => (
                              <path
                                key={idx}
                                d={p.d}
                                stroke={p.stroke === "none" ? undefined : p.stroke}
                                strokeWidth={p.strokeWidth}
                                fill={p.fill === "none" ? "none" : p.fill}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            ))}
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* CONTEST RATING CHART: Handdrawn with Rough.js */}
              <div
                className="rounded-2xl p-4 sm:p-5"
                style={{
                  background: isDark ? "rgba(32, 25, 18, 0.6)" : "rgba(255, 252, 244, 0.65)",
                  border: isDark ? "1px solid rgba(215, 160, 60, 0.22)" : "1px solid rgba(195, 155, 100, 0.4)",
                  boxShadow: isDark ? "inset 0 0 20px rgba(0,0,0,0.3)" : "inset 0 0 20px rgba(160, 110, 45, 0.05)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <div>
                      <h3 className="text-base font-handwriting text-[#382b1d] dark:text-[#f4e8cb] rotate-[0.4deg]">
                        contest rating
                      </h3>
                      <p className="mt-0.5 text-xs font-handwriting text-[#6c543c] dark:text-[#b49e82]">
                        rating after each attended contest
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-handwriting text-[#382b1d] dark:text-[#f4e8cb]">
                      {data.contestRating === null ? "—" : Math.round(data.contestRating).toLocaleString("en-US")}
                    </p>
                    <p className="text-[11px] font-handwriting text-[#6c543c] dark:text-[#b49e82]">
                      current rating
                    </p>
                  </div>
                </div>

                {chart && roughChartPaths ? (
                  <div className="relative overflow-x-auto">
                    <svg
                      viewBox={`0 0 ${chart.width} ${chart.height}`}
                      className="w-full min-w-[440px] h-auto select-none"
                      role="img"
                      aria-label={`Contest rating graph, ${contestHistory.length} contests`}
                    >
                      {/* Grid lines & values */}
                      {roughChartPaths.gridLines.map((p, idx) => (
                        <path
                          key={idx}
                          d={p.d}
                          stroke={p.stroke}
                          strokeWidth={p.strokeWidth}
                          fill="none"
                          strokeDasharray="3 4"
                        />
                      ))}

                      {[0, 0.5, 1].map((fraction) => {
                        const y = chart.padding.top + chart.plotHeight * fraction;
                        const value = Math.round(chart.maxRating - (chart.maxRating - chart.minRating) * fraction);
                        return (
                          <text
                            key={fraction}
                            x={chart.padding.left - 8}
                            y={y + 3}
                            textAnchor="end"
                            className="fill-[#7d654c] dark:fill-[#ab977e] font-mono text-[9px]"
                          >
                            {value}
                          </text>
                        );
                      })}

                      {/* Handdrawn rating curve */}
                      {roughChartPaths.ratingLinePaths.map((p, idx) => (
                        <path
                          key={idx}
                          d={p.d}
                          stroke={p.stroke}
                          strokeWidth={p.strokeWidth}
                          fill="none"
                          strokeLinecap="round"
                        />
                      ))}

                      {/* Handdrawn rating points */}
                      {roughChartPaths.pointCircles.map(({ point, paths }, idx) => (
                        <g
                          key={idx}
                          className="cursor-pointer transition-transform hover:scale-125"
                          onMouseEnter={() => setHoveredContest(point)}
                          onMouseLeave={() => setHoveredContest(null)}
                        >
                          {paths.map((p, pIdx) => (
                            <path
                              key={pIdx}
                              d={p.d}
                              stroke={p.stroke}
                              strokeWidth={p.strokeWidth}
                              fill={p.fill}
                            />
                          ))}
                          <circle cx={point.x} cy={point.y} r="8" fill="transparent" />
                        </g>
                      ))}

                      {/* Date Axis */}
                      <text
                        x={chart.padding.left}
                        y={chart.height - 7}
                        className="fill-[#7d654c] dark:fill-[#ab977e] font-mono text-[9px]"
                      >
                        {new Date(contestHistory[0].startTime * 1000).toLocaleDateString("en-US", {
                          month: "short",
                          year: "2-digit",
                        })}
                      </text>
                      <text
                        x={chart.width - chart.padding.right}
                        y={chart.height - 7}
                        textAnchor="end"
                        className="fill-[#7d654c] dark:fill-[#ab977e] font-mono text-[9px]"
                      >
                        {new Date(contestHistory[contestHistory.length - 1].startTime * 1000).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "2-digit" }
                        )}
                      </text>
                    </svg>

                    {/* Contest hover tooltip */}
                    {hoveredContest && (
                      <div className="absolute top-2 right-4 px-2.5 py-1 rounded bg-[#fffef7] dark:bg-[#1f1811] text-[11px] font-mono border border-[#cfb686] dark:border-[#4d3a27] shadow-lg pointer-events-none text-[#38291b] dark:text-[#fef3c7]">
                        <p className="font-semibold">{hoveredContest.title}</p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400">
                          Rating: {Math.round(hoveredContest.rating)} · Rank: #{hoveredContest.ranking}
                        </p>
                      </div>
                    )}

                    <p className="text-right text-xs font-handwriting text-[#6c543c] dark:text-[#b49e82] mt-1">
                      {contestHistory.length} contests logged
                    </p>
                  </div>
                ) : (
                  <p className="py-8 text-center text-xs font-mono text-[#6c543c] dark:text-[#b49e82]">
                    No contest rating history yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* VINTAGE MARGIN NOTE AT FOOTER */}
          <div className="relative z-10 mt-3 pt-2 flex items-center justify-between text-[10px] font-handwriting text-[#83694f]/80 dark:text-[#a58e74]/70">
            <span>{"// leetcode solved stats & contests on aged ledger parchment"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
