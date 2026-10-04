"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface StrokePoint {
  x: number;
  y: number;
  time: number;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  char: string;
}

// Synthesized soft tactile pencil tap sound (Web Audio API)
function playPencilSound(isClick = false) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const duration = isClick ? 0.035 : 0.025;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.24));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = isClick ? 2800 : 3400;
    filter.Q.value = 2.4;

    const gain = ctx.createGain();
    const volume = isClick ? 0.045 : 0.025;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // AudioContext blocked or unavailable
  }
}

export function PencilCursor() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pencilRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sparkles on interactive click
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  // Smooth position tracking refs
  const mousePosRef = useRef({ x: -100, y: -100 });
  const currentPosRef = useRef({ x: -100, y: -100 });
  const isVisibleRef = useRef(false);
  const isDownRef = useRef(false);
  const isHoveringTargetRef = useRef(false);
  const strokePointsRef = useRef<StrokePoint[]>([]);
  const lastSoundTimeRef = useRef(0);

  useEffect(() => {
    // Only enable on devices with a fine pointer (mouse / trackpad)
    if (typeof window === "undefined") return;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to full window
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handlePointerMove = (e: PointerEvent) => {
      isVisibleRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      // Detect if hovering over clickable / interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a, button, input, textarea, select, [role="button"], [tabindex="0"]')
        );
        isHoveringTargetRef.current = isInteractive;
      }

      // If mouse is pressed, record drawing stroke
      if (isDownRef.current) {
        // Tip position is offset slightly from pointer
        strokePointsRef.current.push({
          x: e.clientX + 8,
          y: e.clientY + 8,
          time: performance.now(),
        });

        // Throttle drawing audio whisper
        const now = performance.now();
        if (now - lastSoundTimeRef.current > 120) {
          playPencilSound(false);
          lastSoundTimeRef.current = now;
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Primary mouse button
      if (e.button !== 0) return;
      isDownRef.current = true;
      playPencilSound(true);

      // Start stroke
      strokePointsRef.current.push({
        x: e.clientX + 8,
        y: e.clientY + 8,
        time: performance.now(),
      });

      // Spawn micro-sparkle at tip
      const chars = ["✦", "✧", "•"];
      const newSparkle: Sparkle = {
        id: Date.now() + Math.random(),
        x: e.clientX + 10,
        y: e.clientY + 10,
        char: chars[Math.floor(Math.random() * chars.length)],
      };
      setSparkles((prev) => [...prev.slice(-4), newSparkle]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
      }, 700);
    };

    const handlePointerUp = () => {
      isDownRef.current = false;
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      isDownRef.current = false;
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // High-performance 60/120fps render loop
    let animId: number;
    const FADE_TIME_MS = 1400; // Evaporates after 1.4s

    const render = () => {
      // 1. Lerp pencil position smoothly toward mouse
      const targetX = mousePosRef.current.x;
      const targetY = mousePosRef.current.y;
      currentPosRef.current.x += (targetX - currentPosRef.current.x) * 0.32;
      currentPosRef.current.y += (targetY - currentPosRef.current.y) * 0.32;

      // 2. Update pencil transform in DOM directly (zero React re-render overhead)
      if (pencilRef.current) {
        const isVisible = isVisibleRef.current && targetX > 0 && targetY > 0;
        pencilRef.current.style.opacity = isVisible ? (isDownRef.current ? "1" : "0.85") : "0";

        if (isVisible) {
          // Dynamic tilt angle
          let rotation = -38;
          let tipOffset = "translate(12px, 8px)";

          if (isDownRef.current) {
            // Pressed down: tip touches surface firmly
            rotation = -44;
            tipOffset = "translate(8px, 6px) scale(0.94)";
          } else if (isHoveringTargetRef.current) {
            // Hovering clickable item: perks up ready to write
            rotation = -28;
            tipOffset = "translate(14px, 10px) scale(1.08)";
          }

          pencilRef.current.style.transform = `translate3d(${currentPosRef.current.x}px, ${currentPosRef.current.y}px, 0px) ${tipOffset} rotate(${rotation}deg)`;
        }
      }

      // 3. Render and fade interactive graphite scribble strokes on canvas
      const now = performance.now();
      const points = strokePointsRef.current;

      // Filter out points older than FADE_TIME_MS
      while (points.length > 0 && now - points[0].time > FADE_TIME_MS) {
        points.shift();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (points.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];
          const age = now - p2.time;
          const alpha = Math.max(0, (1 - age / FADE_TIME_MS) * 0.42);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = isDark
            ? `rgba(225, 230, 245, ${alpha})`
            : `rgba(45, 38, 35, ${alpha})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isDark]);

  return (
    <>
      {/* Interactive Scribble Trail Canvas (fades like pencil on paper) */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-30 select-none hidden md:block"
      />

      {/* Floating Micro-Sparkles when tapping */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none hidden md:block"
      >
        {sparkles.map((sp) => (
          <span
            key={sp.id}
            className="absolute font-handwriting text-xs text-amber-500 dark:text-amber-400 animate-doodle-sparkle pointer-events-none select-none"
            style={{
              left: sp.x,
              top: sp.y,
            }}
          >
            {sp.char}
          </span>
        ))}
      </div>

      {/* 
        Subtle Following Pencil Icon
        - Positioned with transform-origin at the lead tip (12px, 30px)
        - Pointer events set to none so it never interrupts clicks
        - Hidden on mobile/touch screens
      */}
      <div
        ref={pencilRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-50 select-none will-change-transform hidden md:block"
        style={{
          width: "24px",
          height: "32px",
          transformOrigin: "12px 30px",
          transition: "opacity 0.25s ease-out",
        }}
      >
        <svg
          width="24"
          height="32"
          viewBox="0 0 24 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)]"
        >
          {/* Graphite Lead Tip pointing right at target */}
          <polygon points="12,30 10.5,25.5 13.5,25.5" fill="#1c1917" />

          {/* Sharpened Natural Cedar Wood Collar */}
          <polygon points="10.5,25.5 9,20.5 15,20.5 13.5,25.5" fill="#fde68a" />

          {/* Hexagonal Yellow Pencil Body (3 lighting facets) */}
          {/* Left Facet (Mid tone) */}
          <rect x="9" y="7" width="2" height="13.5" fill="#eab308" />
          {/* Middle Facet (Warm sunny highlight) */}
          <rect x="11" y="7" width="2" height="13.5" fill="#fef08a" />
          {/* Right Facet (Shaded amber) */}
          <rect x="13" y="7" width="2" height="13.5" fill="#ca8a04" />

          {/* Metal Ferrule Band */}
          <rect x="9" y="4" width="6" height="3" fill="#94a3b8" />
          <line x1="9" y1="5.5" x2="15" y2="5.5" stroke="#64748b" strokeWidth="0.5" />

          {/* Vintage Pink Rubber Eraser */}
          <path d="M 9 4 C 9 1.5, 15 1.5, 15 4 Z" fill="#f472b6" />
        </svg>
      </div>
    </>
  );
}
