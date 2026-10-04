"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface PosterItem {
  id: string;
  name: string;
  src: string;
  fallbackSrc: string;
  aspectRatio: number;
  tapeStyle: "top-center" | "top-left" | "double-corners" | "top-kraft";
  desktop: {
    topPercent: number;
    rightPx: number;
    rotation: number;
    widthPx: number;
    opacity: number;
  };
  mobile: {
    topPercent: number;
    rightPx: number;
    rotation: number;
    widthPx: number;
    opacity: number;
  };
}

const POSTERS: PosterItem[] = [
  {
    id: "extra-mile",
    name: "Go The Extra Mile",
    src: "/posters/poster-extra-mile.jpg",
    fallbackSrc: "https://i.pinimg.com/1200x/8a/4c/96/8a4c96f121dadd698876f92263fe5300.jpg",
    aspectRatio: 1200 / 1600, // 0.75
    tapeStyle: "top-center",
    desktop: {
      topPercent: 8.9,
      rightPx: 113,
      rotation: -12,
      widthPx: Math.round(145 * 0.7), // ~102px
      opacity: 0.75,
    },
    mobile: {
      topPercent: 12,
      rightPx: 4,
      rotation: -8,
      widthPx: 34,
      opacity: 0.35,
    },
  },
  {
    id: "do-it-badly",
    name: "Do It Badly But Do It",
    src: "/posters/poster-do-it-badly.jpg",
    fallbackSrc: "https://i.pinimg.com/736x/fe/3a/74/fe3a741ae4e6b83822d08ec37984131f.jpg",
    aspectRatio: 736 / 920, // 0.80
    tapeStyle: "top-left",
    desktop: {
      topPercent: 32.7,
      rightPx: 81,
      rotation: 3.2,
      widthPx: Math.round(125 * 0.85), // ~106px
      opacity: 0.85,
    },
    mobile: {
      topPercent: 35,
      rightPx: 3,
      rotation: 4,
      widthPx: 36,
      opacity: 0.35,
    },
  },
  {
    id: "andes-flight",
    name: "1972 Andes Flight Survival",
    src: "/posters/poster-andes-flight.jpg",
    fallbackSrc: "https://i.pinimg.com/1200x/13/d9/d5/13d9d5016dc76c57b49ddf839cd255c8.jpg",
    aspectRatio: 1024 / 742, // 1.38
    tapeStyle: "double-corners",
    desktop: {
      topPercent: 57.3,
      rightPx: 81,
      rotation: -1.8,
      widthPx: 120,
      opacity: 0.95,
    },
    mobile: {
      topPercent: 58,
      rightPx: 4,
      rotation: -3,
      widthPx: 42,
      opacity: 0.4,
    },
  },
  {
    id: "dream-true",
    name: "Possibility of a Dream",
    src: "/posters/poster-dream-true.jpg",
    fallbackSrc: "https://i.pinimg.com/736x/ae/ae/33/aeae33d2ad821664fa96b5219702de6e.jpg",
    aspectRatio: 700 / 1056, // 0.66
    tapeStyle: "top-kraft",
    desktop: {
      topPercent: 76.7,
      rightPx: 48,
      rotation: 2.2,
      widthPx: 150,
      opacity: 0.95,
    },
    mobile: {
      topPercent: 80,
      rightPx: 3,
      rotation: 3,
      widthPx: 36,
      opacity: 0.4,
    },
  },
];

interface FloatingSparkle {
  id: number;
  x: number;
  y: number;
  text: string;
}

// Synthesized tactile pencil/paper tap sound
function playPaperTapSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const bufferSize = Math.floor(ctx.sampleRate * 0.038);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2200;
    filter.Q.value = 2.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.038);

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

export function WallMotivationalPosters() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Lightbox zoom modal state
  const [lightboxPoster, setLightboxPoster] = useState<PosterItem | null>(null);
  // Floating micro-sparkles
  const [sparkles, setSparkles] = useState<FloatingSparkle[]>([]);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxPoster) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxPoster(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxPoster]);

  // Handle tap / click on a poster
  const handleTap = useCallback((poster: PosterItem, e?: React.MouseEvent) => {
    playPaperTapSound();

    if (e) {
      const chars = ["✨", "★", "✦", "⚡", "•"];
      const newSparkles: FloatingSparkle[] = Array.from({ length: 4 }, (_, i) => ({
        id: Date.now() + i,
        x: e.clientX + (Math.random() * 30 - 15),
        y: e.clientY + (Math.random() * 24 - 12),
        text: chars[Math.floor(Math.random() * chars.length)],
      }));

      setSparkles((prev) => [...prev, ...newSparkles]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => !newSparkles.some((ns) => ns.id === s.id)));
      }, 750);
    }

    setLightboxPoster(poster);
  }, []);

  // Helper to render realistic washi tape fasteners
  const renderTape = (style: PosterItem["tapeStyle"], isMobile = false) => {
    if (style === "top-center") {
      return (
        <div
          className={`absolute ${
            isMobile ? "-top-1 w-4 h-1.5" : "-top-2.5 w-10 h-3.5"
          } left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-transform duration-300 group-hover/poster:scale-105`}
          style={{
            background: isDark ? "rgba(215, 180, 125, 0.32)" : "rgba(240, 222, 185, 0.85)",
            backdropFilter: "blur(1px)",
            borderTop: isDark ? "1px solid rgba(215,180,125,0.4)" : "1px solid rgba(210,185,135,0.6)",
            borderBottom: isDark ? "1px solid rgba(215,180,125,0.4)" : "1px solid rgba(210,185,135,0.6)",
            clipPath:
              "polygon(0% 12%, 96% 0%, 100% 35%, 94% 65%, 100% 90%, 96% 100%, 0% 100%, 5% 75%, 0% 50%, 5% 25%, 0% 12%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          }}
        />
      );
    }

    if (style === "top-left") {
      return (
        <div
          className={`absolute ${
            isMobile ? "-top-1 -left-1 w-4 h-1.5" : "-top-2.5 -left-2.5 w-9 h-3.5"
          } pointer-events-none z-20 -rotate-[35deg] transition-transform duration-300 group-hover/poster:scale-105`}
          style={{
            background: isDark ? "rgba(215, 180, 125, 0.32)" : "rgba(240, 222, 185, 0.85)",
            backdropFilter: "blur(1px)",
            clipPath:
              "polygon(0% 0%, 95% 5%, 100% 35%, 95% 70%, 100% 100%, 0% 100%, 6% 70%, 0% 40%, 5% 15%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          }}
        />
      );
    }

    if (style === "double-corners") {
      return (
        <>
          <div
            className={`absolute ${
              isMobile ? "-top-1 -left-1 w-3.5 h-1.5" : "-top-2 -left-2 w-7 h-3"
            } pointer-events-none z-20 -rotate-[38deg]`}
            style={{
              background: isDark ? "rgba(215, 180, 125, 0.3)" : "rgba(240, 222, 185, 0.85)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
              clipPath: "polygon(0% 0%, 96% 4%, 100% 90%, 5% 100%)",
            }}
          />
          <div
            className={`absolute ${
              isMobile ? "-top-1 -right-1 w-3.5 h-1.5" : "-top-2 -right-2 w-7 h-3"
            } pointer-events-none z-20 rotate-[38deg]`}
            style={{
              background: isDark ? "rgba(215, 180, 125, 0.3)" : "rgba(240, 222, 185, 0.85)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
              clipPath: "polygon(0% 0%, 96% 4%, 100% 90%, 5% 100%)",
            }}
          />
        </>
      );
    }

    if (style === "top-kraft") {
      return (
        <div
          className={`absolute ${
            isMobile ? "-top-1 w-4 h-1.5" : "-top-2 w-10 h-3.5"
          } left-1/2 -translate-x-1/2 pointer-events-none z-20 rotate-[1.5deg]`}
          style={{
            background: isDark ? "rgba(180, 140, 95, 0.40)" : "rgba(205, 165, 120, 0.88)",
            borderTop: isDark ? "1px solid rgba(200,160,110,0.5)" : "1px solid rgba(175,135,90,0.7)",
            borderBottom: isDark ? "1px solid rgba(200,160,110,0.5)" : "1px solid rgba(175,135,90,0.7)",
            clipPath:
              "polygon(0% 5%, 98% 0%, 100% 30%, 95% 70%, 100% 95%, 98% 100%, 0% 100%, 3% 70%, 0% 35%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        />
      );
    }

    return null;
  };

  return (
    <>
      {/* FLOATING SPARKLES LAYER */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
        {sparkles.map((sp) => (
          <span
            key={sp.id}
            className="absolute font-handwriting text-xs text-amber-500 animate-doodle-sparkle select-none pointer-events-none"
            style={{
              left: sp.x,
              top: sp.y,
            }}
          >
            {sp.text}
          </span>
        ))}
      </div>

      {/* ========================================================
          1. DESKTOP / LARGE SCREENS (md+)
          Exact fixed coordinates pinned to the right wall
          ======================================================== */}
      <aside
        aria-label="Motivational Wall Gallery (Desktop)"
        className="hidden md:block fixed inset-y-0 right-0 z-20 pointer-events-none select-none w-full overflow-visible"
      >
        {POSTERS.map((poster) => {
          const cfg = poster.desktop;

          return (
            <div
              key={`desktop-${poster.id}`}
              className="fixed transition-transform duration-300 ease-out"
              style={{
                top: `${cfg.topPercent}%`,
                right: `${cfg.rightPx}px`,
                zIndex: 22,
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => handleTap(poster, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleTap(poster);
                  }
                }}
                className="relative group/poster pointer-events-auto cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.06] active:scale-95 hover:opacity-100"
                style={{
                  width: `${cfg.widthPx}px`,
                  opacity: cfg.opacity,
                  transform: `rotate(${cfg.rotation}deg)`,
                  transformOrigin: "center top",
                }}
                title={poster.name}
              >
                {/* Photo frame with paper border & realistic shadow */}
                <div
                  className="relative overflow-hidden rounded-xs p-1 transition-shadow duration-300"
                  style={{
                    backgroundColor: isDark ? "#1c1917" : "#fefcf8",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.12)",
                    boxShadow: isDark
                      ? "0 10px 24px -4px rgba(0, 0, 0, 0.7), 0 3px 8px rgba(0, 0, 0, 0.45)"
                      : "0 8px 20px -4px rgba(70, 45, 20, 0.16), 0 2px 6px rgba(50, 30, 10, 0.10)",
                  }}
                >
                  {/* Subtle Paper Noise Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-xs opacity-20 dark:opacity-10 z-10"
                    style={{
                      backgroundImage: "url('/paper-noise.png')",
                      backgroundRepeat: "repeat",
                      backgroundSize: "160px 160px",
                      mixBlendMode: isDark ? "screen" : "multiply",
                    }}
                  />

                  {/* Poster Image */}
                  <div className="relative w-full overflow-hidden rounded-2xs bg-neutral-900/10 dark:bg-white/5">
                    <Image
                      src={poster.src}
                      alt={poster.name}
                      width={300}
                      height={Math.round(300 / poster.aspectRatio)}
                      priority
                      className="w-full h-auto object-cover block select-none pointer-events-none transition-transform duration-500 group-hover/poster:scale-[1.02]"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src !== poster.fallbackSrc) {
                          img.src = poster.fallbackSrc;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Tape fastener */}
                {renderTape(poster.tapeStyle, false)}
              </div>
            </div>
          );
        })}
      </aside>

      {/* ========================================================
          2. MOBILE SCREENS (< md)
          Pinned along the right side with reduced size and subtle opacity
          Hugs the edge as subtle watermark stamps, never obstructing content
          ======================================================== */}
      <aside
        aria-label="Motivational Wall Gallery (Mobile Side)"
        className="md:hidden fixed inset-y-0 right-0 z-20 pointer-events-none select-none w-full overflow-hidden"
      >
        {POSTERS.map((poster) => {
          const cfg = poster.mobile;

          return (
            <div
              key={`mobile-${poster.id}`}
              className="fixed transition-transform duration-300 ease-out"
              style={{
                top: `${cfg.topPercent}%`,
                right: `${cfg.rightPx}px`,
                zIndex: 21,
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => handleTap(poster, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleTap(poster);
                  }
                }}
                className="relative group/poster pointer-events-auto cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 hover:opacity-100"
                style={{
                  width: `${cfg.widthPx}px`,
                  opacity: cfg.opacity,
                  transform: `rotate(${cfg.rotation}deg)`,
                  transformOrigin: "center top",
                }}
                title={poster.name}
              >
                {/* Photo frame */}
                <div
                  className="relative overflow-hidden rounded-2xs p-0.5 transition-shadow duration-300"
                  style={{
                    backgroundColor: isDark ? "#1c1917" : "#fefcf8",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.12)",
                    boxShadow: isDark
                      ? "0 2px 8px rgba(0, 0, 0, 0.45)"
                      : "0 2px 8px rgba(70, 45, 20, 0.12)",
                  }}
                >
                  <div className="relative w-full overflow-hidden rounded-2xs bg-neutral-900/10 dark:bg-white/5">
                    <Image
                      src={poster.src}
                      alt={poster.name}
                      width={120}
                      height={Math.round(120 / poster.aspectRatio)}
                      priority
                      className="w-full h-auto object-cover block select-none pointer-events-none"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src !== poster.fallbackSrc) {
                          img.src = poster.fallbackSrc;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Mini Tape */}
                {renderTape(poster.tapeStyle, true)}
              </div>
            </div>
          );
        })}
      </aside>

      {/* ========================================================
          3. SUBTLE LIGHTBOX MODAL (Pure Artwork View, No Extra Text)
          ======================================================== */}
      {lightboxPoster && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxPoster(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm sm:max-w-md md:max-w-lg w-auto rounded-xl overflow-hidden shadow-2xl p-1 sm:p-1.5 bg-neutral-900/80 dark:bg-neutral-950/80 border border-white/10 backdrop-blur-md animate-in zoom-in-95 duration-200"
          >
            {/* Minimal Subtle Close Button */}
            <button
              type="button"
              onClick={() => setLightboxPoster(null)}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition cursor-pointer z-20 backdrop-blur-xs"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Pure Artwork Display — No text or badges */}
            <div className="relative rounded-lg overflow-hidden max-h-[78vh] flex items-center justify-center">
              <Image
                src={lightboxPoster.src}
                alt={lightboxPoster.name}
                width={800}
                height={Math.round(800 / lightboxPoster.aspectRatio)}
                className="max-h-[76vh] w-auto object-contain block mx-auto rounded-md select-none"
                priority
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== lightboxPoster.fallbackSrc) {
                    img.src = lightboxPoster.fallbackSrc;
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
