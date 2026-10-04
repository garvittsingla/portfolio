"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

interface Sparkle {
  id: number;
  tx: number;
  ty: number;
  char: string;
  size: number;
}

// 40ms soft tactile pencil tap sound
function playPencilTapSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
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
    filter.frequency.value = 2400;
    filter.Q.value = 2.5;

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
  } catch {
    // AudioContext blocked or unavailable
  }
}

export function FloatingNotebookDoodles() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Sparkles and tap states for each doodle
  const [sparkles, setSparkles] = useState<{
    brain: Sparkle[];
    book: Sparkle[];
    chess: Sparkle[];
  }>({
    brain: [],
    book: [],
    chess: [],
  });

  const [tapped, setTapped] = useState<{
    brain: boolean;
    book: boolean;
    chess: boolean;
  }>({
    brain: false,
    book: false,
    chess: false,
  });

  useEffect(() => {
    try {
      localStorage.removeItem("portfolio_doodles_custom_config");
    } catch {}
  }, []);

  const createSparkles = useCallback(() => {
    const chars = ["✦", "✧", "⋆", "•"];
    const newSparkles: Sparkle[] = [];
    const count = 3;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.6;
      const dist = 20 + Math.random() * 16;
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

  const handleTap = (id: "brain" | "book" | "chess") => {
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

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* ========================================================
          1. DESKTOP / PC DOODLES (Exact Custom Layout)
          Brain: top 13.9%, left 2.7%, rot -30deg, scale 0.9
          Book:  top 36.7%, left 7.8%, rot -41deg, scale 0.65
          Chess: top 58.8%, left 4.4%, rot 8deg,   scale 1.0
          ======================================================== */}
      <div
        aria-hidden="true"
        className="hidden md:block fixed inset-y-0 left-0 pointer-events-none select-none z-30 w-full overflow-visible"
      >
        {/* PC Doodle 1: Halftone Brain Sticker */}
        <div
          className="fixed transition-transform duration-500 ease-out"
          style={{
            top: "13.9%",
            left: "2.7%",
            transform: "rotate(-30deg) scale(0.9)",
          }}
        >
          <div className="animate-doodle-float-1 relative">
            <button
              type="button"
              tabIndex={0}
              onClick={() => handleTap("brain")}
              onTouchStart={() => handleTap("brain")}
              title="Halftone brain sticker — tap me!"
              aria-label="Interactive brain doodle sticker"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                hover:scale-110 active:scale-95
                opacity-90 hover:opacity-100
                ${tapped.brain ? "animate-doodle-tap" : ""}
              `}
            >
              <div
                className="relative w-20 sm:w-24 md:w-28 lg:w-32 transition-all duration-300
                  drop-shadow-[0_2px_5px_rgba(0,0,0,0.06)]
                  group-hover:drop-shadow-[0_4px_10px_rgba(0,0,0,0.10)]
                  dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]
                  dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.08)]
                  dark:group-hover:drop-shadow-[0_3px_10px_rgba(0,0,0,0.65)]
                  dark:group-hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.14)]"
              >
                <Image
                  src="/doodle-brain.png"
                  alt="Halftone brain notebook sticker"
                  width={240}
                  height={195}
                  priority
                  className="w-full h-auto object-contain pointer-events-none select-none"
                />
              </div>

              {/* Sparkles */}
              {sparkles.brain.map((sp) => (
                <span
                  key={sp.id}
                  className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-neutral-600 dark:text-neutral-300"
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

        {/* PC Doodle 2: Halftone Open Book Sticker + Shelf Trigger */}
        <div
          className="fixed transition-transform duration-500 ease-out z-30"
          style={{
            top: "36.7%",
            left: "7.8%",
          }}
        >
          <div className="relative group/shelf-trigger">
            <Link
              href="/shelf"
              onClick={() => handleTap("book")}
              title="Open My Bookshelf (/shelf)"
              aria-label="Visit my reading shelf"
              className="relative pointer-events-auto cursor-pointer block select-none focus:outline-none"
            >
              {/* Book sticker with float animation & tilt */}
              <div
                className="animate-doodle-float-3 relative"
                style={{
                  transform: "rotate(-41deg) scale(0.65)",
                  transformOrigin: "center center",
                }}
              >
                <div
                  className={`
                    transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    group-hover/shelf-trigger:scale-110 active:scale-95
                    opacity-90 group-hover/shelf-trigger:opacity-100
                    ${tapped.book ? "animate-doodle-tap" : ""}
                  `}
                >
                  <div
                    className="relative w-18 sm:w-22 md:w-26 lg:w-30 transition-all duration-300
                      drop-shadow-[0_2px_5px_rgba(0,0,0,0.06)]
                      group-hover/shelf-trigger:drop-shadow-[0_4px_10px_rgba(0,0,0,0.10)]
                      dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]
                      dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.08)]
                      dark:group-hover/shelf-trigger:drop-shadow-[0_3px_10px_rgba(0,0,0,0.65)]
                      dark:group-hover/shelf-trigger:drop-shadow-[0_0_2px_rgba(255,255,255,0.14)]"
                  >
                    <Image
                      src="/doodle-book.png"
                      alt="Halftone open book notebook sticker"
                      width={240}
                      height={173}
                      priority
                      className="w-full h-auto object-contain pointer-events-none select-none"
                    />
                  </div>

                  {/* Sparkles */}
                  {sparkles.book.map((sp) => (
                    <span
                      key={sp.id}
                      className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-neutral-600 dark:text-neutral-300"
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
                </div>
              </div>

              {/* Playful textured note + little arrow: "my shelf ↗" */}
              <div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 sm:-bottom-6 sm:left-4 sm:translate-x-0
                  flex items-center gap-1.5 px-2.5 py-1 rounded-[3px]
                  bg-[#faf5e6]/95 dark:bg-[#1c1d27]/95
                  border border-[#ded3bc] dark:border-neutral-700/80
                  shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)]
                  rotate-[-3deg] group-hover/shelf-trigger:rotate-0 group-hover/shelf-trigger:scale-105
                  transition-all duration-200"
                style={{
                  backgroundImage: "radial-gradient(#000 0.45px, transparent 0.45px)",
                  backgroundSize: "3px 3px",
                }}
              >
                {/* Tiny washi tape accent */}
                <div
                  aria-hidden="true"
                  className="absolute -top-1.5 left-2.5 w-4 h-1.5 bg-amber-200/70 dark:bg-amber-400/30 border-x border-amber-300/50 rotate-[-5deg] pointer-events-none"
                />

                {/* Hand-drawn little curved arrow */}
                <svg
                  width="14"
                  height="12"
                  viewBox="0 0 16 14"
                  fill="none"
                  className="text-amber-600 dark:text-amber-400 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M2 12 C 5 11, 9 8, 13 3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 2.5 H 13.5 V 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="font-handwriting text-xs text-neutral-800 dark:text-neutral-200 font-medium whitespace-nowrap tracking-wide">
                  my shelf
                </span>

                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 group-hover/shelf-trigger:translate-x-0.5 group-hover/shelf-trigger:-translate-y-0.5 transition-transform">
                  ↗
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* PC Doodle 3: Halftone Chess King Sticker */}
        <div
          className="fixed transition-transform duration-500 ease-out"
          style={{
            top: "58.8%",
            left: "4.4%",
            transform: "rotate(8deg) scale(1)",
          }}
        >
          <div className="animate-doodle-float-2 relative">
            <button
              type="button"
              tabIndex={0}
              onClick={() => handleTap("chess")}
              onTouchStart={() => handleTap("chess")}
              title="Halftone chess king sticker — tap me!"
              aria-label="Interactive chess piece doodle sticker"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                hover:scale-110 active:scale-95
                opacity-90 hover:opacity-100
                ${tapped.chess ? "animate-doodle-tap" : ""}
              `}
            >
              <div
                className="relative w-13 h-26 sm:w-15 sm:h-30 md:w-17 md:h-34 lg:w-19 lg:h-38 transition-all duration-300
                  drop-shadow-[0_2px_5px_rgba(0,0,0,0.06)]
                  group-hover:drop-shadow-[0_4px_10px_rgba(0,0,0,0.10)]
                  dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]
                  dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.08)]
                  dark:group-hover:drop-shadow-[0_3px_10px_rgba(0,0,0,0.65)]
                  dark:group-hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.14)]"
              >
                <Image
                  src="/doodle-chess.png"
                  alt="Halftone chess king notebook sticker"
                  width={180}
                  height={360}
                  priority
                  className="w-full h-auto object-contain pointer-events-none select-none"
                />
              </div>

              {/* Sparkles */}
              {sparkles.chess.map((sp) => (
                <span
                  key={sp.id}
                  className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-neutral-600 dark:text-neutral-300"
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
          2. MOBILE DOODLES (Top of page, extremely small)
          Brain: Top Left margin
          Book:  Top Right margin
          Chess: Upper Right margin below book
          ======================================================== */}
      <div
        aria-hidden="true"
        className="block md:hidden fixed inset-x-0 top-0 pointer-events-none select-none z-30 overflow-visible"
      >
        {/* Mobile Doodle 1: Brain (Top-Left corner) */}
        <div
          className="fixed transition-transform duration-300 ease-out"
          style={{
            top: "56px",
            left: "8px",
            transform: "rotate(-18deg) scale(0.32)",
            transformOrigin: "top left",
          }}
        >
          <div className="animate-doodle-float-1 relative">
            <button
              type="button"
              onClick={() => handleTap("brain")}
              onTouchStart={() => handleTap("brain")}
              title="Mini brain doodle"
              aria-label="Interactive mini brain sticker"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                hover:scale-110 active:scale-95 transition-transform duration-200
                opacity-85 hover:opacity-100
                ${tapped.brain ? "animate-doodle-tap" : ""}
              `}
            >
              <div className="relative w-16 drop-shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                <Image
                  src="/doodle-brain.png"
                  alt="Brain sticker"
                  width={120}
                  height={98}
                  priority
                  className="w-full h-auto object-contain pointer-events-none select-none"
                />
              </div>

              {/* Sparkles */}
              {sparkles.brain.map((sp) => (
                <span
                  key={sp.id}
                  className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-neutral-600 dark:text-neutral-300"
                  style={
                    {
                      "--tx": `${sp.tx * 0.7}px`,
                      "--ty": `${sp.ty * 0.7}px`,
                      fontSize: `${Math.round(sp.size * 0.8)}px`,
                    } as React.CSSProperties
                  }
                >
                  {sp.char}
                </span>
              ))}
            </button>
          </div>
        </div>

        {/* Mobile Doodle 2: Book + Shelf Trigger (~10% from Left, beside Mountain photo) */}
        <div
          className="fixed transition-transform duration-300 ease-out z-30"
          style={{
            top: "115px",
            left: "10%",
            transformOrigin: "top left",
          }}
        >
          <div className="relative group/mobile-shelf">
            <Link
              href="/shelf"
              onClick={() => handleTap("book")}
              title="Open My Bookshelf (/shelf)"
              aria-label="Visit my reading shelf"
              className="relative pointer-events-auto cursor-pointer block select-none focus:outline-none"
            >
              {/* Mini Book Sticker with float animation */}
              <div
                className="animate-doodle-float-3 relative"
                style={{
                  transform: "rotate(-12deg) scale(0.48)",
                  transformOrigin: "top left",
                }}
              >
                <div
                  className={`
                    hover:scale-110 active:scale-95 transition-transform duration-200
                    opacity-90 hover:opacity-100
                    ${tapped.book ? "animate-doodle-tap" : ""}
                  `}
                >
                  <div className="relative w-16 drop-shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                    <Image
                      src="/doodle-book.png"
                      alt="Book sticker"
                      width={120}
                      height={87}
                      priority
                      className="w-full h-auto object-contain pointer-events-none select-none"
                    />
                  </div>

                  {/* Sparkles */}
                  {sparkles.book.map((sp) => (
                    <span
                      key={sp.id}
                      className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-neutral-600 dark:text-neutral-300"
                      style={
                        {
                          "--tx": `${sp.tx * 0.7}px`,
                          "--ty": `${sp.ty * 0.7}px`,
                          fontSize: `${Math.round(sp.size * 0.8)}px`,
                        } as React.CSSProperties
                      }
                    >
                      {sp.char}
                    </span>
                  ))}
                </div>
              </div>

              {/* Playful textured note + little arrow: "my shelf ↗" */}
              <div
                className="mt-0.5 flex items-center gap-1 px-1.5 py-0.5 rounded-[2px]
                  bg-[#faf5e6]/95 dark:bg-[#1a1b23]/95
                  border border-[#dfd4be] dark:border-neutral-700/80
                  shadow-[0_1px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_6px_rgba(0,0,0,0.5)]
                  rotate-[-2deg] active:scale-95 transition-transform"
                style={{
                  backgroundImage: "radial-gradient(#000 0.4px, transparent 0.4px)",
                  backgroundSize: "3px 3px",
                  maxWidth: "max-content",
                }}
              >
                {/* Hand-drawn little curved arrow */}
                <svg
                  width="11"
                  height="10"
                  viewBox="0 0 16 14"
                  fill="none"
                  className="text-amber-600 dark:text-amber-400 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M2 12 C 5 11, 9 8, 13 3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 2.5 H 13.5 V 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="font-handwriting text-[10px] text-neutral-800 dark:text-neutral-200 font-medium whitespace-nowrap">
                  my shelf
                </span>

                <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">
                  ↗
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Doodle 3: Chess King (Upper-Right) */}
        <div
          className="fixed transition-transform duration-300 ease-out"
          style={{
            top: "105px",
            right: "10px",
            transform: "rotate(6deg) scale(0.36)",
            transformOrigin: "top right",
          }}
        >
          <div className="animate-doodle-float-2 relative">
            <button
              type="button"
              onClick={() => handleTap("chess")}
              onTouchStart={() => handleTap("chess")}
              title="Mini chess king doodle"
              aria-label="Interactive mini chess king sticker"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                hover:scale-110 active:scale-95 transition-transform duration-200
                opacity-85 hover:opacity-100
                ${tapped.chess ? "animate-doodle-tap" : ""}
              `}
            >
              <div className="relative w-10 h-20 drop-shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                <Image
                  src="/doodle-chess.png"
                  alt="Chess king sticker"
                  width={90}
                  height={180}
                  priority
                  className="w-full h-auto object-contain pointer-events-none select-none"
                />
              </div>

              {/* Sparkles */}
              {sparkles.chess.map((sp) => (
                <span
                  key={sp.id}
                  className="animate-doodle-sparkle absolute top-1/2 left-1/2 pointer-events-none font-handwriting font-bold text-neutral-600 dark:text-neutral-300"
                  style={
                    {
                      "--tx": `${sp.tx * 0.7}px`,
                      "--ty": `${sp.ty * 0.7}px`,
                      fontSize: `${Math.round(sp.size * 0.8)}px`,
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
    </>
  );
}
