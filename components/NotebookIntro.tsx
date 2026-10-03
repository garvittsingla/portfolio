"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";

export function NotebookIntro() {
  const prefix = "hey i am ";
  const fullName = "garvit singla";
  const fullText = prefix + fullName;

  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio with downloaded Pixabay pencil sound
  useEffect(() => {
    const audio = new Audio("/pencil-sketch.mp3");
    audio.preload = "auto";
    audio.volume = 0.65; // Clearly audible volume
    audioRef.current = audio;

    // Global unlock listener to satisfy browser autoplay policy on first interaction
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.load();
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("scroll", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Function to start the downloaded pencil sound
  const startPencilSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.65;
      audioRef.current.play().catch(() => {
        // Autoplay restricted until user interaction
      });
    }
  };

  // Function to stop the pencil sound smoothly
  const stopPencilSound = () => {
    if (audioRef.current) {
      let vol = audioRef.current.volume;
      const fadeInterval = setInterval(() => {
        if (audioRef.current && vol > 0.08) {
          vol -= 0.1;
          audioRef.current.volume = Math.max(0, vol);
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          clearInterval(fadeInterval);
        }
      }, 25);
    }
  };

  // Replay animation with guaranteed user-gesture audio playback
  const replayWriting = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.65;
      audioRef.current.play().catch(() => {});
    }

    setDisplayedText("");
    setIsTypingDone(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));

        if (currentIndex === prefix.length + 1) {
          startPencilSound();
        }

        currentIndex++;
      } else {
        stopPencilSound();
        setIsTypingDone(true);
        clearInterval(interval);
      }
    }, 70);
  };

  // Initial handwriting typewriter animation on page land
  useEffect(() => {
    let currentIndex = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex));

          // Start pencil sound when writing "garvit singla"
          if (currentIndex === prefix.length + 1) {
            startPencilSound();
          }

          currentIndex++;
        } else {
          stopPencilSound();
          setIsTypingDone(true);
          clearInterval(interval);
        }
      }, 70);

      return () => clearInterval(interval);
    }, 200);

    return () => clearTimeout(startTimeout);
  }, [fullText, prefix.length]);

  // Derived sliced texts
  const prefixText = displayedText.slice(0, prefix.length);
  const nameText = displayedText.slice(prefix.length);

  return (
    <section
      aria-label="Notebook Intro"
      className="w-full max-w-2xl mx-auto flex flex-row items-center justify-center gap-6 sm:gap-8 px-6 select-none"
    >
      {/* 1. GitHub picture with 2-3px white border - locked in place with zero shift */}
      <div className="relative shrink-0">
        {/* Subtle washi tape snippet at top */}
        <div
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-11 h-3
            bg-amber-100/75 dark:bg-amber-200/20 backdrop-blur-xs
            border-y border-amber-300/40 dark:border-amber-400/20
            shadow-xs rotate-[-2deg] pointer-events-none"
        />

        {/* Drawing container with organic paper tilt */}
        <div
          onClick={replayWriting}
          title="Click to replay writing & sound"
          className={`
            group relative p-1 transition-all duration-500 ease-out
            rotate-[2.5deg] hover:rotate-0 hover:scale-105 cursor-pointer
            ${imageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
          `}
        >
          {/* Paper / drawing polaroid frame with 2.5px crisp white border */}
          <div
            className="relative rounded-xs overflow-hidden
              border-[2.5px] border-white
              shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)]
              dark:shadow-[0_6px_20px_rgba(0,0,0,0.6),0_0_1px_rgba(255,255,255,0.2)]
              ring-1 ring-black/10 dark:ring-white/15
              bg-white dark:bg-neutral-800"
          >
            {/* GitHub Avatar */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden">
              <Image
                src="https://avatars.githubusercontent.com/u/159273915?v=4"
                alt="Garvit Singla drawing"
                width={96}
                height={96}
                priority
                onLoad={() => setImageLoaded(true)}
                className="w-full h-full object-cover filter contrast-[1.05] saturate-[0.92] brightness-[0.99] transition-transform duration-300 group-hover:scale-105"
              />

              {/* Subtle paper grain & graphite sketch overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply dark:mix-blend-screen"
                style={{
                  backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px)",
                  backgroundSize: "3px 3px",
                }}
              />
            </div>

            {/* Handwritten sketch label at bottom */}
            <div className="py-0.5 px-1 text-center bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
              <span className="font-handwriting text-[11px] text-neutral-600 dark:text-neutral-300">
                garvit
              </span>
            </div>
          </div>

          {/* Hand-drawn corner pencil doodle */}
          <div className="absolute -bottom-2 -left-1.5 text-slate-400 dark:text-slate-500 font-handwriting text-[10px] pointer-events-none rotate-[-4deg]">
            ✎ sketch
          </div>
        </div>
      </div>

      {/* 2. Handwritten text: "hey i am" + distinguished "garvit singla" without typing cursor */}
      <div className="flex flex-col items-start space-y-1">
        <div
          onClick={replayWriting}
          title="Click to replay writing & sound"
          className="relative inline-block rotate-[-1deg] transition-transform duration-300 hover:rotate-0 cursor-pointer"
        >
          {/* Pre-allocated invisible layout spacer: prevents any shift */}
          <h1
            className="invisible font-handwriting text-2xl sm:text-3xl md:text-3.5xl font-normal tracking-wide select-none whitespace-nowrap"
            aria-hidden="true"
          >
            <span>{prefix}</span>
            <span className="px-1">{fullName}</span>
          </h1>

          {/* Actual typing text: letters appear directly onto paper with NO computer cursor */}
          <h1 className="absolute inset-0 font-handwriting text-2xl sm:text-3xl md:text-3.5xl font-normal tracking-wide whitespace-nowrap">
            {/* Standard graphite ink for greeting */}
            <span className="text-neutral-800 dark:text-neutral-200 transition-colors duration-400">
              {prefixText}
            </span>

            {/* Distinctive ink & notebook highlighter for name */}
            {nameText && (
              <span className="relative inline-block text-blue-600 dark:text-sky-400 font-normal transition-colors duration-400">
                {/* Subtle highlighter marker stroke behind name */}
                <span
                  className="absolute inset-x-[-3px] top-1.5 bottom-0.5 -z-10
                    bg-amber-200/50 dark:bg-amber-400/20
                    rounded-xs -rotate-1 pointer-events-none transition-all duration-300"
                />
                {nameText}
              </span>
            )}
          </h1>

          {/* Hand-drawn ink underline flourish under full line */}
          <svg
            className={`w-full h-2.5 mt-0.5 text-neutral-700 dark:text-neutral-300 transition-all duration-500 ${
              isTypingDone ? "opacity-85 stroke-dashoffset-0" : "opacity-0"
            }`}
            viewBox="0 0 240 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 7C50 2 120 3 238 6C170 9 60 8 12 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Subtitle / Role with replay option */}
        <div className="flex items-center gap-2">
          <p
            className={`font-handwriting text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 transition-opacity duration-500 delay-100 rotate-[0.5deg] tracking-wide ${
              isTypingDone ? "opacity-85" : "opacity-0"
            }`}
          >
            engineer
          </p>

          {/* Small subtle replay button */}
          {isTypingDone && (
            <button
              type="button"
              onClick={replayWriting}
              title="Replay writing & sound"
              aria-label="Replay writing and pencil sound"
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors opacity-60 hover:opacity-100"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* 3-4 lines intro */}
        <div
          className={`pt-2.5 max-w-md space-y-1.5 transition-all duration-700 delay-200 ${
            isTypingDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 font-mono leading-relaxed">
            Software engineer obsessed with low-level systems, C/C++, Rust, and graphics.
          </p>
          <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 font-mono leading-relaxed">
            Exploring foundational computing from network protocols to memory management.
          </p>
          <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 font-mono leading-relaxed">
            Building performant tools and understanding computers from the metal up.
          </p>
        </div>
      </div>
    </section>
  );
}
