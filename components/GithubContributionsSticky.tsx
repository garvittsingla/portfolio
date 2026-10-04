"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import rough from "roughjs";
import {
  FALLBACK_CONTRIBUTION_DATA,
  ContributionDay,
  ContributionData,
} from "./githubContributionsData";
import { useTheme } from "./ThemeProvider";
import {
  ChevronDown,
  ExternalLink,
  GitPullRequest,
  Star,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface MonthLabel {
  name: string;
  weekIndex: number;
}

interface OSSProject {
  title: string;
  repo: string;
  repoUrl: string;
  prUrl: string;
  prNumber: number;
  prTitle: string;
  status: "Merged" | "Open";
  description: string;
  language: string;
  langColor: string;
  stars?: string;
}

const OSS_PROJECTS: OSSProject[] = [
  {
    title: "ImageDiff",
    repo: "sev-/ImageDiff",
    repoUrl: "https://github.com/sev-/ImageDiff",
    prUrl: "https://github.com/sev-/ImageDiff/pull/2",
    prNumber: 2,
    prTitle: "Add caching and pagination; display builds in increasing order",
    status: "Merged",
    description: "Added cached timeline ranges and paginated build listings, with builds sorted chronologically.",
    language: "Python",
    langColor: "#3572A5",
    stars: "1",
  },
  {
    title: "rs-tiled",
    repo: "mapeditor/rs-tiled",
    repoUrl: "https://github.com/mapeditor/rs-tiled",
    prUrl: "https://github.com/mapeditor/rs-tiled/pull/337",
    prNumber: 337,
    prTitle: "Make SFML and GGEZ examples optional features so tests can run",
    status: "Merged",
    description: "Decoupled heavy game framework dependencies into optional cargo features to fix headless CI test execution.",
    language: "Rust",
    langColor: "#dea584",
    stars: "850",
  },
];

interface SvgPathData {
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

interface CellRenderData {
  day: ContributionDay;
  col: number;
  row: number;
  x: number;
  y: number;
  paths: SvgPathData[];
}

export function GithubContributionsSticky() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [data, setData] = useState<ContributionData>(FALLBACK_CONTRIBUTION_DATA);
  const [hoveredDay, setHoveredDay] = useState<{
    day: ContributionDay;
    x: number;
    y: number;
  } | null>(null);

  const fillStyleMode = "cross-hatch";
  const [seedOffset, setSeedOffset] = useState<number>(0);
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [isOssExpanded, setIsOssExpanded] = useState<boolean>(false);
  const [isResketching, setIsResketching] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Re-fetch live contributions from public API on mount with graceful fallback
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveContributions() {
      try {
        const res = await fetch(
          "https://github-contributions-api.jogruber.de/v4/garvittsingla?y=last"
        );
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json && json.contributions && json.contributions.length > 0) {
            setData(json);
          }
        }
      } catch {
        // Fallback to pre-bundled data gracefully
      }
    }

    fetchLiveContributions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll the contribution grid to the right on mobile screens so recent activity is visible
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [data]);

  // Audio flourish when re-sketching
  const playSketchSound = useCallback(() => {
    try {
      const audio = new Audio("/pencil-flourish.wav");
      audio.volume = 0.28;
      audio.play().catch(() => {});
    } catch {
      // Audio playback might be restricted before first gesture
    }
  }, []);

  const handleResketch = () => {
    setIsResketching(true);
    playSketchSound();
    setSeedOffset((prev) => prev + 7);
    setTimeout(() => setIsResketching(false), 450);
  };

  // Group 371 days into 53 weeks (columns of 7 days) and detect month headers accurately
  const { weeks, monthLabels } = useMemo(() => {
    const rawDays = data.contributions || [];
    const weeksList: ContributionDay[][] = [];
    const months: MonthLabel[] = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    let currentMonth = -1;

    for (let i = 0; i < rawDays.length; i += 7) {
      const week = rawDays.slice(i, i + 7);
      const weekIdx = Math.floor(i / 7);
      weeksList.push(week);

      if (week.length > 0) {
        const midDay = week[Math.min(3, week.length - 1)];
        const dateObj = new Date(midDay.date + "T00:00:00Z");
        const m = dateObj.getUTCMonth();
        if (m !== currentMonth) {
          currentMonth = m;
          const lastMonth = months[months.length - 1];
          if (!lastMonth || weekIdx - lastMonth.weekIndex >= 3) {
            months.push({
              name: monthNames[m],
              weekIndex: weekIdx,
            });
          }
        }
      }
    }

    return { weeks: weeksList, monthLabels: months };
  }, [data]);

  // SVG Layout constants
  const CELL_SIZE = 11;
  const CELL_GAP = 3.5;
  const MARGIN_LEFT = 36;
  const MARGIN_TOP = 28;
  const TOTAL_SVG_WIDTH = 830;
  const TOTAL_SVG_HEIGHT = 154;

  // Generate Rough.js cells and annotations
  const { cellDataList, monthHighlighters, dividerLinePaths } = useMemo(() => {
    const gen = rough.generator();

    // 1. Color palettes calibrated for authentic fountain pen & pencil on aged yellow parchment
    const getCellColors = (level: number) => {
      if (isDark) {
        switch (level) {
          case 1:
            return { stroke: "#2ea043", fill: "#154d2a", gap: 3.8, strokeW: 0.95 };
          case 2:
            return { stroke: "#3fb950", fill: "#238636", gap: 3.0, strokeW: 1.05 };
          case 3:
            return { stroke: "#56d364", fill: "#2ea043", gap: 2.3, strokeW: 1.15 };
          case 4:
            return { stroke: "#7ee787", fill: "#39d353", gap: 1.7, strokeW: 1.25 };
          case 0:
          default:
            return { stroke: "rgba(180, 145, 100, 0.32)", fill: "rgba(48, 38, 28, 0.4)", gap: 4, strokeW: 0.85 };
        }
      } else {
        switch (level) {
          case 1:
            return { stroke: "#3b8b4c", fill: "#9de1a4", gap: 3.8, strokeW: 0.95 };
          case 2:
            return { stroke: "#227b3d", fill: "#46c66a", gap: 3.0, strokeW: 1.05 };
          case 3:
            return { stroke: "#16622d", fill: "#30a14e", gap: 2.3, strokeW: 1.15 };
          case 4:
            return { stroke: "#0e4520", fill: "#1c6e35", gap: 1.7, strokeW: 1.25 };
          case 0:
          default:
            return { stroke: "rgba(165, 135, 95, 0.45)", fill: "rgba(235, 222, 195, 0.35)", gap: 4, strokeW: 0.85 };
        }
      }
    };

    // 2. Render all 371 cells with rough.js
    const cells: CellRenderData[] = [];
    weeks.forEach((week, col) => {
      week.forEach((day, row) => {
        const x = MARGIN_LEFT + col * (CELL_SIZE + CELL_GAP);
        const y = MARGIN_TOP + row * (CELL_SIZE + CELL_GAP);
        const seed = Math.floor((col * 7 + row + 1) * 31.4159) + seedOffset;
        const colors = getCellColors(day.level);

        const isZero = day.level === 0;
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
          day,
          col,
          row,
          x,
          y,
          paths,
        });
      });
    });

    // 3. Render month highlighter strokes behind month names
    const mHighlighters = monthLabels.map((m, idx) => {
      const x = MARGIN_LEFT + m.weekIndex * (CELL_SIZE + CELL_GAP);
      const hlDrawable = gen.rectangle(x - 3, 5, 26, 15, {
        seed: 400 + idx * 13 + seedOffset,
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

    // 4. Render hand-drawn divider line
    const divDrawable = gen.line(MARGIN_LEFT, 150, MARGIN_LEFT + 53 * (CELL_SIZE + CELL_GAP) - CELL_GAP, 150, {
      seed: 888 + seedOffset,
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

  // Hand-drawn legend paths (5 levels)
  const legendPaths = useMemo(() => {
    const gen = rough.generator();
    const levels = [0, 1, 2, 3, 4];
    return levels.map((lvl) => {
      let stroke = isDark ? "rgba(180, 145, 100, 0.35)" : "rgba(165, 135, 95, 0.45)";
      let fill = isDark ? "rgba(48, 38, 28, 0.4)" : "rgba(235, 222, 195, 0.35)";
      let gap = 3.8;
      let strokeW = 0.9;

      if (lvl === 1) {
        stroke = isDark ? "#2ea043" : "#3b8b4c";
        fill = isDark ? "#154d2a" : "#9de1a4";
        gap = 3.8;
      } else if (lvl === 2) {
        stroke = isDark ? "#3fb950" : "#227b3d";
        fill = isDark ? "#238636" : "#46c66a";
        gap = 3.0;
        strokeW = 1.0;
      } else if (lvl === 3) {
        stroke = isDark ? "#56d364" : "#16622d";
        fill = isDark ? "#2ea043" : "#30a14e";
        gap = 2.3;
        strokeW = 1.1;
      } else if (lvl === 4) {
        stroke = isDark ? "#7ee787" : "#0e4520";
        fill = isDark ? "#39d353" : "#1c6e35";
        gap = 1.7;
        strokeW = 1.2;
      }

      const rect = gen.rectangle(0, 0, 11, 11, {
        seed: 700 + lvl * 19 + seedOffset,
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
    if (!hoveredDay) return null;
    const gen = rough.generator();
    const cell = cellDataList.find((c) => c.day.date === hoveredDay.day.date);
    if (!cell) return null;

    const ring = gen.rectangle(cell.x - 2.5, cell.y - 2.5, CELL_SIZE + 5, CELL_SIZE + 5, {
      seed: 9999 + seedOffset,
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
  }, [hoveredDay, cellDataList, isDark, seedOffset]);

  // Format date helper: "Wednesday, Jul 8, 2026"
  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z");
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${days[d.getUTCDay()]}, ${monthNames[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  };

  const totalContributions = data.total?.lastYear ?? 1328;

  return (
    <section
      aria-label="GitHub Contributions Activity"
      className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 select-none mt-20 sm:mt-24 mb-14"
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

      {/* Main Container with Organic Tilt and Uneven Tapes */}
      <div className="relative group/note">
        {/* UNEVEN TAPES HOLDING THE OLD PAPER DIRECTLY ABOVE */}
        {/* 1. Left Tape: tilted -3.5deg, serrated cut, aged yellowish translucent texture */}
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

        {/* 2. Right Tape: tilted +4.5deg, different offset & serration */}
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
            transition-all duration-500 ease-out rotate-[-0.35deg] hover:rotate-0"
          style={{
            // Authentic Old Yellow Paper Palette with aged gradient
            background: isDark
              ? "linear-gradient(140deg, #241d15 0%, #1e1710 40%, #16110b 100%)"
              : "linear-gradient(140deg, #fbf5e6 0%, #f6ecd0 25%, #f0dfba 65%, #e6d0a1 100%)",
            // Burnt / oxidized sepia edge oxidation vignette & deep realistic drop shadows
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

          {/* 3. DRIED TEA / COFFEE WATERMARK IN CORNER (Archival artifact) */}
          <div
            className="absolute top-4 right-14 w-28 h-28 pointer-events-none rounded-full opacity-20 dark:opacity-10"
            style={{
              background: isDark
                ? "radial-gradient(circle, transparent 48%, rgba(215, 160, 60, 0.25) 54%, rgba(215, 160, 60, 0.08) 70%, transparent 72%)"
                : "radial-gradient(circle, transparent 48%, rgba(145, 95, 40, 0.35) 54%, rgba(175, 120, 50, 0.12) 70%, transparent 72%)",
              transform: "rotate(25deg) scaleX(1.1)",
            }}
          />

          {/* 4. REALISTIC DOG-EARED FOLDED CORNER AT BOTTOM-RIGHT */}
          <div
            className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none overflow-hidden"
            style={{ borderBottomRightRadius: "1rem" }}
          >
            {/* The folded flap */}
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

          {/* TOP BAR: Clean Heading, live count, Re-sketch & GitHub link */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="text-sm sm:text-base md:text-[17px] font-sans font-semibold text-[#382b1d] dark:text-[#f4e8cb] tracking-tight">
              {totalContributions.toLocaleString()} contributions in the last year
            </h3>

            <div className="flex items-center gap-2">
              {/* Re-sketch Button (Triggers new Rough.js seeds + tactile pencil flourish audio) */}
              <button
                type="button"
                onClick={handleResketch}
                disabled={isResketching}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md
                  text-[#4f3a25] dark:text-[#d8c6a8]
                  bg-[#ecd8b0]/50 dark:bg-[#2c2217]/60
                  hover:bg-[#e4cca0] dark:hover:bg-[#382b1c]
                  border border-[#cfb686]/60 dark:border-[#523e2b]/80
                  hover:border-[#9c7d4a] dark:hover:border-[#8f6e3c]
                  cursor-pointer transition-all active:scale-95 shadow-2xs"
                title="Re-randomize Rough.js seeds and re-sketch all handdrawn lines"
              >
                <RotateCcw
                  className={`w-3 h-3 text-amber-700 dark:text-amber-400 transition-transform duration-500 ${
                    isResketching ? "-rotate-180" : ""
                  }`}
                />
                <span>Re-sketch</span>
              </button>

              {/* Profile link */}
              <a
                href="https://github.com/garvittsingla"
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
                <span>@garvittsingla</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* MAIN HEATMAP SECTION: UNIFIED ROUGH.JS SVG GRAPH */}
          <div className="relative z-10">
            {/* Scrollable Container for Heatmap on mobile */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth select-none"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="min-w-[760px] sm:min-w-[800px] w-full flex flex-col">
                <svg
                  viewBox={`0 0 ${TOTAL_SVG_WIDTH} ${TOTAL_SVG_HEIGHT}`}
                  className="w-full h-auto overflow-visible select-none"
                  aria-label="Handdrawn GitHub Contribution Graph by Rough.js"
                >
                  {/* 1. Day of Week Labels along Left Margin (Mon, Wed, Fri) */}
                  <g className="font-mono text-[10px] fill-[#7d654c] dark:fill-[#9e886e] select-none">
                    {/* Row 1 = Monday */}
                    <text
                      x={MARGIN_LEFT - 8}
                      y={MARGIN_TOP + 1 * (CELL_SIZE + CELL_GAP) + 8.5}
                      textAnchor="end"
                      className="font-handwriting text-[11px] fill-[#6a543f] dark:fill-[#ab977e]"
                    >
                      Mon
                    </text>
                    {/* Row 3 = Wednesday */}
                    <text
                      x={MARGIN_LEFT - 8}
                      y={MARGIN_TOP + 3 * (CELL_SIZE + CELL_GAP) + 8.5}
                      textAnchor="end"
                      className="font-handwriting text-[11px] fill-[#6a543f] dark:fill-[#ab977e]"
                    >
                      Wed
                    </text>
                    {/* Row 5 = Friday */}
                    <text
                      x={MARGIN_LEFT - 8}
                      y={MARGIN_TOP + 5 * (CELL_SIZE + CELL_GAP) + 8.5}
                      textAnchor="end"
                      className="font-handwriting text-[11px] fill-[#6a543f] dark:fill-[#ab977e]"
                    >
                      Fri
                    </text>
                  </g>

                  {/* 2. Month Headers across Top with Rough.js highlighter marks */}
                  <g className="month-headers select-none">
                    {monthHighlighters.map((m, idx) => (
                      <g key={idx}>
                        {/* Rough.js handdrawn highlighter rectangle */}
                        {m.paths.map((p, pIdx) => (
                          <path
                            key={pIdx}
                            d={p.d}
                            fill={p.fill}
                            stroke="none"
                            className="transition-opacity"
                          />
                        ))}
                        {/* Month text label in handwritten typography */}
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

                  {/* 3. The 371 Handdrawn Day Cells (53 weeks x 7 rows) */}
                  <g className="contribution-cells">
                    {cellDataList.map((cell) => {
                      const isHovered = hoveredDay?.day.date === cell.day.date;
                      const isDimmed = filterLevel !== null && cell.day.level !== filterLevel;

                      return (
                        <g
                          key={cell.day.date}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const cardBounds = cardRef.current?.getBoundingClientRect();
                            if (cardBounds) {
                              setHoveredDay({
                                day: cell.day,
                                x: rect.left - cardBounds.left + rect.width / 2,
                                y: rect.top - cardBounds.top,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          className="cursor-pointer group/cell"
                        >
                          {/* Rough.js generated hand-drawn paths for the cell */}
                          {cell.paths.map((path, pathIdx) => (
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

                          {/* Invisible expanded hit target rect to ensure mouse hover never jitters over hachure line gaps */}
                          <rect
                            x={cell.x - 1}
                            y={cell.y - 1}
                            width={CELL_SIZE + 2}
                            height={CELL_SIZE + 2}
                            fill="transparent"
                            className="cursor-pointer"
                          />
                        </g>
                      );
                    })}
                  </g>

                  {/* 4. Active Cell Hover Selection Ring */}
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

                  {/* 5. Rough.js Hand-drawn Divider Line */}
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

            {/* CUSTOM INTERACTIVE TOOLTIP: Vintage Parchment Tag */}
            {hoveredDay && (
              <div
                className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-all duration-100"
                style={{
                  left: hoveredDay.x,
                  top: hoveredDay.y - 8,
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
                          hoveredDay.day.count === 0
                            ? isDark ? "#715b43" : "#c4ab85"
                            : hoveredDay.day.count > 9
                            ? "#1e7037"
                            : "#30a14e",
                      }}
                    />
                    <span>
                      {hoveredDay.day.count === 0
                        ? "No contributions"
                        : `${hoveredDay.day.count} contribution${
                            hoveredDay.day.count === 1 ? "" : "s"
                          }`}
                    </span>
                    <span className="opacity-50">on</span>
                    <span className="font-sans font-semibold">
                      {formatDateString(hoveredDay.day.date)}
                    </span>
                  </div>

                  {/* Downward Caret Arrow */}
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

          {/* BOTTOM BAR: Handdrawn Interactive Legend & OSS Contributions Drawer */}
          <div className="relative z-10 mt-3 pt-3 flex flex-wrap items-center justify-between gap-4">
            {/* Handdrawn Rough.js Legend ("Less" [ ] [ ] [ ] [ ] [ ] "More") */}
            <div className="flex items-center gap-2">
              <span className="font-handwriting text-xs text-[#5e4933] dark:text-[#bca88d]">
                Less
              </span>

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
                      title={`Level ${level} contributions (hover to highlight in graph)`}
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

              <span className="font-handwriting text-xs text-[#5e4933] dark:text-[#bca88d]">
                More
              </span>

              {filterLevel !== null && (
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 ml-1.5 animate-in fade-in">
                  (level {filterLevel} highlighted)
                </span>
              )}
            </div>

            {/* OSS Contributions Toggle & Circular Badges */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs sm:text-sm font-sans font-medium text-[#463523] dark:text-[#e4d6bf]">
                OSS contributions:
              </span>

              <div className="flex items-center -space-x-1.5">
                {/* Tiled icon */}
                <div
                  title="Tiled Map Editor"
                  className="relative w-6 h-6 sm:w-7 sm:h-7 overflow-hidden rounded-full bg-white border-2 border-[#FAF2DB] dark:border-[#1E1812] shadow-xs"
                >
                  <Image
                    src="/oss-icons/tiled.png"
                    alt="Tiled"
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* ScummVM icon */}
                <div
                  title="ScummVM Engine"
                  className="relative w-6 h-6 sm:w-7 sm:h-7 overflow-hidden rounded-full bg-white border-2 border-[#FAF2DB] dark:border-[#1E1812] shadow-xs"
                >
                  <Image
                    src="/oss-icons/scummvm.png"
                    alt="ScummVM"
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Drawer Toggle */}
              <button
                type="button"
                onClick={() => setIsOssExpanded((prev) => !prev)}
                aria-label={isOssExpanded ? "Collapse OSS details" : "Expand OSS details"}
                title={isOssExpanded ? "Collapse OSS details" : "Expand OSS details"}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full
                  bg-[#eedbb4]/70 dark:bg-[#2b2116]/80
                  border border-[#cfb686]/70 dark:border-[#4f3c29]
                  hover:border-[#967645] dark:hover:border-[#967645]
                  flex items-center justify-center
                  text-[#4a3826] dark:text-[#d4c3a9]
                  transition-all duration-300 cursor-pointer shadow-2xs hover:scale-105"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isOssExpanded ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* EXPANDABLE OSS DRAWER DETAILS: Styled in vintage parchment cards */}
          {isOssExpanded && (
            <div className="relative z-10 mt-4 pt-4 border-t border-dashed border-[#cfb686]/60 dark:border-[#423321] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OSS_PROJECTS.map((proj) => (
                  <div
                    key={proj.repo}
                    className="p-3 sm:p-3.5 rounded-xl transition-all duration-200 flex flex-col justify-between"
                    style={{
                      background: isDark
                        ? "rgba(35, 27, 19, 0.7)"
                        : "rgba(255, 252, 244, 0.75)",
                      border: isDark
                        ? "1px solid rgba(215, 160, 60, 0.22)"
                        : "1px solid rgba(195, 155, 100, 0.4)",
                      boxShadow: isDark
                        ? "inset 0 0 15px rgba(0,0,0,0.4)"
                        : "inset 0 0 15px rgba(160, 110, 45, 0.06)",
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-xs sm:text-sm text-[#2b2014] dark:text-[#f2e6cf] hover:underline inline-flex items-center gap-1 font-sans"
                        >
                          <span>{proj.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>

                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-800/70">
                          <GitPullRequest className="w-2.5 h-2.5" />
                          #{proj.prNumber}
                        </span>
                      </div>

                      <p className="text-[11px] sm:text-xs text-[#523e2a] dark:text-[#c4b094] leading-relaxed line-clamp-2 mb-2 font-mono">
                        {proj.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#7a6249] dark:text-[#9e886d] pt-1 border-t border-[#e2cca4]/50 dark:border-[#382b1d]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: proj.langColor }}
                        />
                        <span>{proj.language}</span>
                      </div>

                      {proj.stars && (
                        <div className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          <span>{proj.stars}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VINTAGE MARGIN NOTE AT FOOTER */}
          <div className="relative z-10 mt-3 pt-2 flex items-center justify-between text-[10px] font-handwriting text-[#83694f]/80 dark:text-[#a58e74]/70">
            <span>{"// 371 days charted on aged ledger parchment"}</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 opacity-60" />
              <span>rough.js renderer</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
