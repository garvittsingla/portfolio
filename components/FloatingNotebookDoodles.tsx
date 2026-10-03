"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

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
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
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

        {/* PC Doodle 2: Halftone Open Book Sticker */}
        <div
          className="fixed transition-transform duration-500 ease-out"
          style={{
            top: "36.7%",
            left: "7.8%",
            transform: "rotate(-41deg) scale(0.65)",
          }}
        >
          <div className="animate-doodle-float-3 relative">
            <button
              type="button"
              tabIndex={0}
              onClick={() => handleTap("book")}
              onTouchStart={() => handleTap("book")}
              title="Halftone open book sticker — tap me!"
              aria-label="Interactive open book doodle sticker"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                hover:scale-110 active:scale-95
                opacity-90 hover:opacity-100
                ${tapped.book ? "animate-doodle-tap" : ""}
              `}
            >
              <div
                className="relative w-18 sm:w-22 md:w-26 lg:w-30 transition-all duration-300
                  drop-shadow-[0_2px_5px_rgba(0,0,0,0.06)]
                  group-hover:drop-shadow-[0_4px_10px_rgba(0,0,0,0.10)]
                  dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]
                  dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.08)]
                  dark:group-hover:drop-shadow-[0_3px_10px_rgba(0,0,0,0.65)]
                  dark:group-hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.14)]"
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
            </button>
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
        {/* Mobile Doodle 1: Brain (Top-Left) */}
        <div
          className="fixed transition-transform duration-300 ease-out"
          style={{
            top: "68px",
            left: "10px",
            transform: "rotate(-18deg) scale(0.38)",
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

        {/* Mobile Doodle 2: Book (Top-Right) */}
        <div
          className="fixed transition-transform duration-300 ease-out"
          style={{
            top: "70px",
            right: "10px",
            transform: "rotate(16deg) scale(0.36)",
            transformOrigin: "top right",
          }}
        >
          <div className="animate-doodle-float-3 relative">
            <button
              type="button"
              onClick={() => handleTap("book")}
              onTouchStart={() => handleTap("book")}
              title="Mini open book doodle"
              aria-label="Interactive mini book sticker"
              className={`
                group relative pointer-events-auto cursor-pointer focus:outline-none block
                hover:scale-110 active:scale-95 transition-transform duration-200
                opacity-85 hover:opacity-100
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
            </button>
          </div>
        </div>

        {/* Mobile Doodle 3: Chess King (Upper-Right below book) */}
        <div
          className="fixed transition-transform duration-300 ease-out"
          style={{
            top: "116px",
            right: "10px",
            transform: "rotate(6deg) scale(0.34)",
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
