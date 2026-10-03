"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";

export function NotebookIntro() {
  const prefix = "hey i am ";
  const fullName = "garvit singla";
  const fullText = prefix + fullName;

  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const TARGET_VOLUME = 0.4; // 40% volume as requested

  const sketchAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMutedRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted && sketchAudioRef.current) {
      sketchAudioRef.current.pause();
    }
  }, [isMuted]);

  // Function to start the subtle Pixabay household pencil sound at 40% volume
  const startPencilSound = useCallback(() => {
    if (isMutedRef.current) return;
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    if (sketchAudioRef.current) {
      sketchAudioRef.current.currentTime = 0;
      sketchAudioRef.current.volume = TARGET_VOLUME;
      sketchAudioRef.current.loop = true;
      sketchAudioRef.current.play().catch(() => {
        // Autoplay may be restricted by browser until user gesture
      });
    }
  }, []);

  // Function to stop the pencil sound smoothly
  const stopPencilSound = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    if (sketchAudioRef.current) {
      let vol = sketchAudioRef.current.volume;
      fadeIntervalRef.current = setInterval(() => {
        if (sketchAudioRef.current && vol > 0.05) {
          vol -= 0.08;
          sketchAudioRef.current.volume = Math.max(0, vol);
        } else {
          if (sketchAudioRef.current) {
            sketchAudioRef.current.pause();
            sketchAudioRef.current.currentTime = 0;
            sketchAudioRef.current.volume = isMutedRef.current ? 0 : TARGET_VOLUME;
          }
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
        }
      }, 20);
    }
  }, []);

  // Unified handwriting typewriter animation
  const runHandwritingAnimation = useCallback(() => {
    // 1. Clear any active timeouts or intervals
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    // 2. Stop audio immediately and reset
    if (sketchAudioRef.current) {
      sketchAudioRef.current.pause();
      sketchAudioRef.current.currentTime = 0;
      sketchAudioRef.current.volume = isMutedRef.current ? 0 : TARGET_VOLUME;
    }

    setDisplayedText("");
    setIsTypingDone(false);

    let currentIndex = 0;

    startTimeoutRef.current = setTimeout(() => {
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex));

          // Start pencil sound right as writing begins
          if (currentIndex === 1) {
            startPencilSound();
          }

          currentIndex++;
        } else {
          // Writing finished
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          stopPencilSound();
          setIsTypingDone(true);
        }
      }, 65);
    }, 150);
  }, [fullText, startPencilSound, stopPencilSound]);

  // Initialize audio element with downloaded Pixabay household-pencil-29272
  useEffect(() => {
    const sketchAudio = new Audio("/pencil-sketch.mp3");
    sketchAudio.preload = "auto";
    sketchAudio.volume = TARGET_VOLUME;
    sketchAudioRef.current = sketchAudio;

    // Global unlock listener to satisfy browser autoplay policy on first interaction
    const unlockAudio = () => {
      if (sketchAudioRef.current) {
        sketchAudioRef.current.load();
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("scroll", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    // Run initial handwriting animation
    runHandwritingAnimation();

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      if (sketchAudioRef.current) {
        sketchAudioRef.current.pause();
      }
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [runHandwritingAnimation]);

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
          onClick={runHandwritingAnimation}
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
          onClick={runHandwritingAnimation}
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

        {/* Subtitle / Role with replay option and sound toggle */}
        <div className="flex items-center gap-2.5">
          <p
            className={`font-handwriting text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 transition-opacity duration-500 delay-100 rotate-[0.5deg] tracking-wide ${
              isTypingDone ? "opacity-85" : "opacity-0"
            }`}
          >
            engineer
          </p>

          {/* Action buttons: Replay writing & Toggle pencil sound */}
          {isTypingDone && (
            <div className="flex items-center gap-1 animate-in fade-in duration-300">
              <button
                type="button"
                onClick={runHandwritingAnimation}
                title="Replay handwriting & sound"
                aria-label="Replay handwriting and pencil sound"
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors opacity-70 hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                title={isMuted ? "Unmute pencil sound" : "Mute pencil sound"}
                aria-label={isMuted ? "Unmute pencil sound" : "Mute pencil sound"}
                className={`p-1 rounded transition-colors ${
                  isMuted
                    ? "text-red-400 hover:text-red-600 opacity-80"
                    : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 opacity-70 hover:opacity-100"
                } hover:bg-neutral-100 dark:hover:bg-neutral-800`}
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* 3-4 lines intro */}
        <div
          className={`pt-2 max-w-md space-y-1.5 transition-all duration-700 delay-200 ${
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

        {/* 4. Socials in hand-drawn doodle form */}
        <div
          className={`pt-3 flex flex-wrap items-center gap-2 sm:gap-2.5 transition-all duration-700 delay-300 ${
            isTypingDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <span className="font-handwriting text-xs text-neutral-400 dark:text-neutral-500 mr-0.5 select-none rotate-[-2deg]">
            ✎ socials ➔
          </span>

          {/* GitHub doodle */}
          <a
            href="https://github.com/garvittsingla"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              border border-neutral-300/90 dark:border-neutral-700/80
              bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xs
              text-neutral-700 dark:text-neutral-300
              hover:text-black dark:hover:text-white
              hover:border-neutral-800 dark:hover:border-neutral-200
              hover:scale-105 transition-all duration-300
              shadow-[1px_2px_0px_rgba(0,0,0,0.06)] dark:shadow-[1px_2px_0px_rgba(255,255,255,0.05)]
              rotate-[-1.5deg] hover:rotate-0 cursor-pointer"
            aria-label="GitHub Profile"
          >
            {/* Hand-drawn Octocat silhouette */}
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round"
            >
              <path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 4.1 5.4 4.4 5.4 4.4a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 10.8c0 4.6 2.7 5.7 5.5 6-.4.4-.6 1.1-.6 2.1V21" />
              <path d="M15 19.5c.5.8 1.2 1.2 2 1" strokeDasharray="1 2" />
            </svg>
            <span className="font-handwriting text-xs text-neutral-800 dark:text-neutral-200">github</span>
          </a>

          {/* LinkedIn doodle */}
          <a
            href="https://linkedin.com/in/garvittsingla"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              border border-neutral-300/90 dark:border-neutral-700/80
              bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xs
              text-neutral-700 dark:text-neutral-300
              hover:text-blue-600 dark:hover:text-sky-400
              hover:border-blue-400 dark:hover:border-sky-500
              hover:scale-105 transition-all duration-300
              shadow-[1px_2px_0px_rgba(0,0,0,0.06)] dark:shadow-[1px_2px_0px_rgba(255,255,255,0.05)]
              rotate-[1.2deg] hover:rotate-0 cursor-pointer"
            aria-label="LinkedIn Profile"
          >
            {/* Hand-drawn LinkedIn in-badge */}
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round"
            >
              <path d="M3.5 6.5C3.3 4.8 4.6 3.5 6.5 3.3c3.6-.3 7.8-.2 11.2.2 1.8.2 3.1 1.6 3.1 3.4.1 3.7.2 7.7-.2 11.4-.2 1.8-1.5 3.1-3.3 3.2-3.8.3-7.8.2-11.6-.1-1.7-.1-3-1.5-3.1-3.2-.2-3.8-.2-7.9.9-11.7z" />
              <circle cx="8" cy="8.5" r="1" fill="currentColor" />
              <path d="M8 12v5.5" />
              <path d="M12 17.5v-5.5m0 2c.4-1.5 1.3-2 2.5-2 1.7 0 2.5 1 2.5 3v4.5" />
            </svg>
            <span className="font-handwriting text-xs text-neutral-800 dark:text-neutral-200">linkedin</span>
          </a>

          {/* Twitter / X doodle */}
          <a
            href="https://twitter.com/garvitsinglaa"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              border border-neutral-300/90 dark:border-neutral-700/80
              bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xs
              text-neutral-700 dark:text-neutral-300
              hover:text-black dark:hover:text-white
              hover:border-neutral-800 dark:hover:border-neutral-200
              hover:scale-105 transition-all duration-300
              shadow-[1px_2px_0px_rgba(0,0,0,0.06)] dark:shadow-[1px_2px_0px_rgba(255,255,255,0.05)]
              rotate-[-1deg] hover:rotate-0 cursor-pointer"
            aria-label="Twitter Profile"
          >
            {/* Hand-drawn sketched X icon */}
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round"
            >
              <path d="M4.5 4.5l14.8 15m.2-15L4.7 19.5" />
              <path d="M6 4l12.5 13M18.5 4.5L7.5 18" strokeDasharray="2 3" opacity="0.5" />
            </svg>
            <span className="font-handwriting text-xs text-neutral-800 dark:text-neutral-200">twitter</span>
          </a>

          {/* Gmail doodle */}
          <a
            href="mailto:garvitsingla4751@gmail.com"
            className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              border border-neutral-300/90 dark:border-neutral-700/80
              bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xs
              text-neutral-700 dark:text-neutral-300
              hover:text-rose-600 dark:hover:text-rose-400
              hover:border-rose-300 dark:hover:border-rose-500
              hover:scale-105 transition-all duration-300
              shadow-[1px_2px_0px_rgba(0,0,0,0.06)] dark:shadow-[1px_2px_0px_rgba(255,255,255,0.05)]
              rotate-[2deg] hover:rotate-0 cursor-pointer"
            aria-label="Email Garvit Singla"
          >
            {/* Hand-drawn envelope sketch */}
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round"
            >
              <path d="M3.5 6.5C3.4 5.3 4.4 4.5 5.5 4.4c4.3-.3 8.8-.2 13 .1 1.2.1 2.1 1 2.2 2.2.2 3.6.2 7.2-.1 10.8-.1 1.2-1.1 2.1-2.3 2.1-4.2.2-8.6.2-12.8-.2-1.1-.1-2-1-2.1-2.2-.3-3.6-.3-7.2.1-10.7z" />
              <path d="M4 6l7.4 6.2c.4.3.9.3 1.3 0L20 6" />
              <path d="M4 18l5.5-5M20 18l-5.5-5" strokeDasharray="1.5 2.5" opacity="0.6" />
            </svg>
            <span className="font-handwriting text-xs text-neutral-800 dark:text-neutral-200">gmail</span>
          </a>
        </div>
      </div>
    </section>
  );
}
