"use client";

import React, { useState, useMemo, useCallback, useSyncExternalStore } from "react";
import rough from "roughjs";
import { useTheme } from "./ThemeProvider";

interface Sparkle {
  id: number;
  tx: number;
  ty: number;
  char: string;
  size: number;
}

interface PathData {
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

type RoughDrawable = Parameters<ReturnType<typeof rough.generator>["toPaths"]>[0];

// 40ms soft tactile pencil tap sound
function playPencilTapSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2500;
    filter.Q.value = 2.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {}
}

export function RoughDeskInstruments() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Sparkles and tap states for each border instrument
  const [sparkles, setSparkles] = useState<{
    scale: Sparkle[];
    pencil: Sparkle[];
    compass: Sparkle[];
    trigonometer: Sparkle[];
  }>({
    scale: [],
    pencil: [],
    compass: [],
    trigonometer: [],
  });

  const [tapped, setTapped] = useState<{
    scale: boolean;
    pencil: boolean;
    compass: boolean;
    trigonometer: boolean;
  }>({
    scale: false,
    pencil: false,
    compass: false,
    trigonometer: false,
  });

  const createSparkles = useCallback(() => {
    const chars = ["✦", "✧", "⋆", "•", "✎"];
    const newSparkles: Sparkle[] = [];
    const count = 3;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.6;
      const dist = 22 + Math.random() * 18;
      newSparkles.push({
        id: Date.now() + i,
        tx: Math.round(Math.cos(angle) * dist),
        ty: Math.round(Math.sin(angle) * dist) - 8,
        char: chars[Math.floor(Math.random() * chars.length)],
        size: Math.round(10 + Math.random() * 3),
      });
    }
    return newSparkles;
  }, []);

  const handleTap = (id: "scale" | "pencil" | "compass" | "trigonometer") => {
    playPencilTapSound();
    setTapped((prev) => ({ ...prev, [id]: true }));
    setSparkles((prev) => ({ ...prev, [id]: createSparkles() }));

    setTimeout(() => {
      setTapped((prev) => ({ ...prev, [id]: false }));
    }, 600);

    setTimeout(() => {
      setSparkles((prev) => ({ ...prev, [id]: [] }));
    }, 750);
  };

  // Generate Rough.js vector paths for instruments
  const { rulerPaths, pencilPaths, trigonometerPaths, compassPaths } = useMemo(() => {
    const gen = rough.generator();

    const woodStroke = isDark ? "#c29b68" : "#8c6239";
    const woodFill = isDark ? "rgba(70, 52, 34, 0.45)" : "rgba(245, 222, 179, 0.65)";
    const pencilYellow = isDark ? "#854d0e" : "#facc15";
    const pencilStroke = isDark ? "#ca8a04" : "#b45309";
    const graphiteFill = isDark ? "#e2e8f0" : "#1e293b";
    const metalStroke = isDark ? "#94a3b8" : "#475569";
    const metalFill = isDark ? "#334155" : "#cbd5e1";
    const skyStroke = isDark ? "#38bdf8" : "#0284c7";
    const skyFill = isDark ? "rgba(30, 41, 59, 0.45)" : "rgba(224, 242, 254, 0.55)";
    const goldStroke = isDark ? "#fbbf24" : "#b45309";

    // 1. SCALE / RULER (180px x 28px)
    const rulerDrawables: RoughDrawable[] = [];
    rulerDrawables.push(
      gen.rectangle(2, 2, 176, 26, {
        seed: 101,
        roughness: 1.2,
        bowing: 1.1,
        fill: woodFill,
        fillStyle: "cross-hatch",
        hachureAngle: -35,
        hachureGap: 4.5,
        stroke: woodStroke,
        strokeWidth: 1.3,
      })
    );
    rulerDrawables.push(
      gen.line(6, 18, 174, 18, {
        seed: 102,
        roughness: 1.1,
        stroke: woodStroke,
        strokeWidth: 0.9,
      })
    );
    for (let x = 12; x <= 168; x += 6) {
      const isCm = (x - 12) % 24 === 0;
      const isHalfCm = (x - 12) % 12 === 0;
      const tickHeight = isCm ? 10 : isHalfCm ? 7 : 4;
      rulerDrawables.push(
        gen.line(x, 2, x, 2 + tickHeight, {
          seed: 200 + x,
          roughness: 0.8,
          stroke: woodStroke,
          strokeWidth: isCm ? 1.4 : 0.85,
        })
      );
    }
    const rulerPaths: PathData[] = rulerDrawables.flatMap((d) =>
      gen.toPaths(d).map((p) => ({
        d: p.d,
        stroke: p.stroke || "none",
        strokeWidth: p.strokeWidth || 1,
        fill: p.fill || "none",
      }))
    );

    // 2. DRAFTING PENCIL (160px x 16px)
    const pencilDrawables: RoughDrawable[] = [];
    pencilDrawables.push(
      gen.rectangle(26, 2, 104, 12, {
        seed: 301,
        roughness: 1.1,
        fill: pencilYellow,
        fillStyle: "cross-hatch",
        hachureAngle: 45,
        hachureGap: 3.8,
        stroke: pencilStroke,
        strokeWidth: 1.2,
      })
    );
    pencilDrawables.push(
      gen.polygon(
        [
          [26, 2],
          [4, 8],
          [26, 14],
        ],
        {
          seed: 302,
          roughness: 1.2,
          fill: isDark ? "rgba(180, 140, 100, 0.45)" : "rgba(254, 243, 199, 0.9)",
          fillStyle: "solid",
          stroke: pencilStroke,
          strokeWidth: 1.1,
        }
      )
    );
    pencilDrawables.push(
      gen.polygon(
        [
          [10, 6],
          [4, 8],
          [10, 10],
        ],
        {
          seed: 303,
          roughness: 1.0,
          fill: graphiteFill,
          fillStyle: "solid",
          stroke: isDark ? "#cbd5e1" : "#0f172a",
          strokeWidth: 1.2,
        }
      )
    );
    pencilDrawables.push(
      gen.rectangle(130, 2, 12, 12, {
        seed: 304,
        fill: metalFill,
        fillStyle: "solid",
        stroke: metalStroke,
        strokeWidth: 1.1,
      })
    );
    pencilDrawables.push(
      gen.rectangle(142, 3, 12, 10, {
        seed: 305,
        fill: isDark ? "#9d174d" : "#fb7185",
        fillStyle: "solid",
        stroke: isDark ? "#f43f5e" : "#e11d48",
        strokeWidth: 1.1,
      })
    );
    const pencilPaths: PathData[] = pencilDrawables.flatMap((d) =>
      gen.toPaths(d).map((p) => ({
        d: p.d,
        stroke: p.stroke || "none",
        strokeWidth: p.strokeWidth || 1,
        fill: p.fill || "none",
      }))
    );

    // 3. TRIGONOMETER / SET SQUARE (110px x 80px)
    const trigDrawables: RoughDrawable[] = [];
    trigDrawables.push(
      gen.polygon(
        [
          [4, 76],
          [106, 76],
          [4, 10],
        ],
        {
          seed: 401,
          roughness: 1.3,
          bowing: 1.2,
          fill: skyFill,
          fillStyle: "cross-hatch",
          hachureAngle: -45,
          hachureGap: 4.8,
          stroke: skyStroke,
          strokeWidth: 1.3,
        }
      )
    );
    trigDrawables.push(
      gen.polygon(
        [
          [18, 66],
          [76, 66],
          [18, 28],
        ],
        {
          seed: 402,
          roughness: 1.1,
          stroke: skyStroke,
          strokeWidth: 1.1,
        }
      )
    );
    for (let i = 1; i <= 6; i++) {
      const t = i / 7;
      const x = 4 + t * 102;
      const y = 10 + t * 66;
      trigDrawables.push(
        gen.line(x, y, x + 3.5, y - 3.5, {
          seed: 500 + i,
          roughness: 0.9,
          stroke: skyStroke,
          strokeWidth: 0.9,
        })
      );
    }
    const trigonometerPaths: PathData[] = trigDrawables.flatMap((d) =>
      gen.toPaths(d).map((p) => ({
        d: p.d,
        stroke: p.stroke || "none",
        strokeWidth: p.strokeWidth || 1,
        fill: p.fill || "none",
      }))
    );

    // 4. PRECISION DRAFTING COMPASS (85px x 85px)
    const compassDrawables: RoughDrawable[] = [];
    compassDrawables.push(
      gen.circle(42, 8, 8, {
        seed: 601,
        fill: metalFill,
        fillStyle: "solid",
        stroke: metalStroke,
        strokeWidth: 1.2,
      })
    );
    compassDrawables.push(
      gen.line(42, 12, 14, 78, {
        seed: 602,
        roughness: 1.2,
        stroke: metalStroke,
        strokeWidth: 1.8,
      })
    );
    compassDrawables.push(
      gen.line(42, 12, 70, 78, {
        seed: 603,
        roughness: 1.2,
        stroke: metalStroke,
        strokeWidth: 1.8,
      })
    );
    compassDrawables.push(
      gen.line(24, 46, 60, 46, {
        seed: 604,
        roughness: 1.0,
        stroke: goldStroke,
        strokeWidth: 1.3,
      })
    );
    compassDrawables.push(
      gen.circle(42, 46, 5.5, {
        seed: 605,
        fill: isDark ? "#ca8a04" : "#f59e0b",
        fillStyle: "solid",
        stroke: goldStroke,
        strokeWidth: 1,
      })
    );
    compassDrawables.push(
      gen.arc(14, 78, 115, 115, -0.4, 0.45, false, {
        seed: 606,
        roughness: 1.5,
        bowing: 1.3,
        stroke: isDark ? "rgba(251, 191, 36, 0.45)" : "rgba(180, 83, 9, 0.35)",
        strokeWidth: 1.3,
      })
    );
    const compassPaths: PathData[] = compassDrawables.flatMap((d) =>
      gen.toPaths(d).map((p) => ({
        d: p.d,
        stroke: p.stroke || "none",
        strokeWidth: p.strokeWidth || 1,
        fill: p.fill || "none",
      }))
    );

    return { rulerPaths, pencilPaths, trigonometerPaths, compassPaths };
  }, [isDark]);

  if (!mounted) return null;

  return (
    <>
      {/* ========================================================
          1. DESKTOP / LAPTOP BORDER INSTRUMENTS
          Placed randomly along the left & right borders of the screen
          like the floating doodles on the main page
          ======================================================== */}
      <div
        aria-hidden="true"
        className="hidden md:block fixed inset-y-0 inset-x-0 pointer-events-none select-none z-30 overflow-visible"
      >
        {/* Left Border Item 1: Wooden Scale / Ruler */}
        <div
          className="fixed transition-transform duration-500 ease-out"
          style={{
            top: "22%",
            left: "2.2%",
            transform: "rotate(-68deg) scale(0.9)",
            transformOrigin: "center center",
          }}
        >
          <div className="animate-doodle-float-2 relative">
            <button
              type="button"
              onClick={() => handleTap("scale")}
              title="Architect's Scale Ruler — tap me!"
              aria-label="Interactive scale ruler doodle"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                hover:scale-110 active:scale-95
                opacity-85 hover:opacity-100
                ${tapped.scale ? "animate-doodle-tap" : ""}
              `}
            >
              <div className="relative w-44 drop-shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                <svg
                  width="180"
                  height="30"
                  viewBox="0 0 180 30"
                  className="w-full h-auto pointer-events-none select-none"
                >
                  {rulerPaths.map((p, idx) => (
                    <path
                      key={`ruler-${idx}`}
                      d={p.d}
                      stroke={p.stroke}
                      strokeWidth={p.strokeWidth}
                      fill={p.fill}
                    />
                  ))}
                </svg>
              </div>

              {/* Sparkles */}
              {sparkles.scale.map((sp) => (
                <span
                  key={sp.id}
                  className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-amber-700 dark:text-amber-300"
                  style={
                    {
                      "--tx": `${sp.tx}px`,
                      "--ty": `${sp.ty}px`,
                      fontSize: `${sp.size}px`,
                    } as React.CSSProperties
                  }
                >
                  {sp.char}
                </span>
              ))}
            </button>
          </div>
        </div>

        {/* Left Border Item 2: 2B Graphite Drafting Pencil */}
        <div
          className="fixed transition-transform duration-500 ease-out"
          style={{
            top: "64%",
            left: "2.8%",
            transform: "rotate(32deg) scale(0.95)",
            transformOrigin: "center center",
          }}
        >
          <div className="animate-doodle-float-1 relative">
            <button
              type="button"
              onClick={() => handleTap("pencil")}
              title="2B Drafting Pencil — tap me!"
              aria-label="Interactive drafting pencil doodle"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                hover:scale-110 active:scale-95
                opacity-85 hover:opacity-100
                ${tapped.pencil ? "animate-doodle-tap" : ""}
              `}
            >
              <div className="relative w-40 drop-shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                <svg
                  width="160"
                  height="18"
                  viewBox="0 0 160 18"
                  className="w-full h-auto pointer-events-none select-none"
                >
                  {pencilPaths.map((p, idx) => (
                    <path
                      key={`pencil-${idx}`}
                      d={p.d}
                      stroke={p.stroke}
                      strokeWidth={p.strokeWidth}
                      fill={p.fill}
                    />
                  ))}
                </svg>
              </div>

              {/* Sparkles */}
              {sparkles.pencil.map((sp) => (
                <span
                  key={sp.id}
                  className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-amber-700 dark:text-amber-300"
                  style={
                    {
                      "--tx": `${sp.tx}px`,
                      "--ty": `${sp.ty}px`,
                      fontSize: `${sp.size}px`,
                    } as React.CSSProperties
                  }
                >
                  {sp.char}
                </span>
              ))}
            </button>
          </div>
        </div>

        {/* Right Border Item 1: Precision Drafting Compass with Pencil Arc */}
        <div
          className="fixed transition-transform duration-500 ease-out"
          style={{
            top: "26%",
            right: "2.4%",
            transform: "rotate(-14deg) scale(0.95)",
            transformOrigin: "center center",
          }}
        >
          <div className="animate-doodle-float-3 relative">
            <button
              type="button"
              onClick={() => handleTap("compass")}
              title="Drafting Compass with Arc — tap me!"
              aria-label="Interactive drafting compass doodle"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                hover:scale-110 active:scale-95
                opacity-85 hover:opacity-100
                ${tapped.compass ? "animate-doodle-tap" : ""}
              `}
            >
              <div className="relative w-24 drop-shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                <svg
                  width="85"
                  height="85"
                  viewBox="0 0 85 85"
                  className="w-full h-auto pointer-events-none select-none"
                >
                  {compassPaths.map((p, idx) => (
                    <path
                      key={`compass-${idx}`}
                      d={p.d}
                      stroke={p.stroke}
                      strokeWidth={p.strokeWidth}
                      fill={p.fill}
                    />
                  ))}
                </svg>
              </div>

              {/* Sparkles */}
              {sparkles.compass.map((sp) => (
                <span
                  key={sp.id}
                  className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-amber-700 dark:text-amber-300"
                  style={
                    {
                      "--tx": `${sp.tx}px`,
                      "--ty": `${sp.ty}px`,
                      fontSize: `${sp.size}px`,
                    } as React.CSSProperties
                  }
                >
                  {sp.char}
                </span>
              ))}
            </button>
          </div>
        </div>

        {/* Right Border Item 2: Trigonometer / Set Square */}
        <div
          className="fixed transition-transform duration-500 ease-out"
          style={{
            top: "66%",
            right: "2.8%",
            transform: "rotate(21deg) scale(0.9)",
            transformOrigin: "center center",
          }}
        >
          <div className="animate-doodle-float-2 relative">
            <button
              type="button"
              onClick={() => handleTap("trigonometer")}
              title="30°-60°-90° Trigonometer Set Square — tap me!"
              aria-label="Interactive trigonometer set square doodle"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                hover:scale-110 active:scale-95
                opacity-85 hover:opacity-100
                ${tapped.trigonometer ? "animate-doodle-tap" : ""}
              `}
            >
              <div className="relative w-28 drop-shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                <svg
                  width="110"
                  height="80"
                  viewBox="0 0 110 80"
                  className="w-full h-auto pointer-events-none select-none"
                >
                  {trigonometerPaths.map((p, idx) => (
                    <path
                      key={`trig-${idx}`}
                      d={p.d}
                      stroke={p.stroke}
                      strokeWidth={p.strokeWidth}
                      fill={p.fill}
                    />
                  ))}
                </svg>
              </div>

              {/* Sparkles */}
              {sparkles.trigonometer.map((sp) => (
                <span
                  key={sp.id}
                  className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-amber-700 dark:text-amber-300"
                  style={
                    {
                      "--tx": `${sp.tx}px`,
                      "--ty": `${sp.ty}px`,
                      fontSize: `${sp.size}px`,
                    } as React.CSSProperties
                  }
                >
                  {sp.char}
                </span>
              ))}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. MOBILE BORDER INSTRUMENTS
          Positioned delicately along margins on smaller viewports
          ======================================================== */}
      <div
        aria-hidden="true"
        className="block md:hidden fixed inset-y-0 inset-x-0 pointer-events-none select-none z-30 overflow-visible"
      >
        {/* Mobile Item 1: Mini Pencil (Top-Left edge) */}
        <div
          className="fixed transition-transform duration-300 ease-out"
          style={{
            top: "84px",
            left: "6px",
            transform: "rotate(24deg) scale(0.55)",
            transformOrigin: "top left",
          }}
        >
          <div className="animate-doodle-float-1 relative">
            <button
              type="button"
              onClick={() => handleTap("pencil")}
              title="Mini pencil doodle"
              aria-label="Interactive mini pencil sticker"
              className="pointer-events-auto cursor-pointer focus:outline-none block opacity-85 hover:opacity-100"
            >
              <div className="relative w-32 drop-shadow-xs">
                <svg width="160" height="18" viewBox="0 0 160 18" className="w-full h-auto">
                  {pencilPaths.map((p, idx) => (
                    <path
                      key={`m-pencil-${idx}`}
                      d={p.d}
                      stroke={p.stroke}
                      strokeWidth={p.strokeWidth}
                      fill={p.fill}
                    />
                  ))}
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Item 2: Mini Compass (Top-Right edge) */}
        <div
          className="fixed transition-transform duration-300 ease-out"
          style={{
            top: "84px",
            right: "6px",
            transform: "rotate(-12deg) scale(0.55)",
            transformOrigin: "top right",
          }}
        >
          <div className="animate-doodle-float-3 relative">
            <button
              type="button"
              onClick={() => handleTap("compass")}
              title="Mini compass doodle"
              aria-label="Interactive mini compass sticker"
              className="pointer-events-auto cursor-pointer focus:outline-none block opacity-85 hover:opacity-100"
            >
              <div className="relative w-20 drop-shadow-xs">
                <svg width="85" height="85" viewBox="0 0 85 85" className="w-full h-auto">
                  {compassPaths.map((p, idx) => (
                    <path
                      key={`m-compass-${idx}`}
                      d={p.d}
                      stroke={p.stroke}
                      strokeWidth={p.strokeWidth}
                      fill={p.fill}
                    />
                  ))}
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
