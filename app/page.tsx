"use client";

import React from "react";
import { DotGridBackground } from "@/components/DotGridBackground";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { FloatingNotebookDoodles } from "@/components/FloatingNotebookDoodles";
import { NotebookIntro } from "@/components/NotebookIntro";
import { GithubContributionsSticky } from "@/components/GithubContributionsSticky";
import { LeetCodeStats } from "@/components/LeetCodeStats";
import { AchievementsHanging } from "@/components/AchievementsHanging";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950 overflow-x-hidden">
      {/* Background vector dot grid / lined paper with theme transitions */}
      <DotGridBackground />

      {/* Persistent floating notebook doodles on left side of viewport */}
      <FloatingNotebookDoodles />

      {/* Top Navbar that shrinks into a floating glassmorphic pill on scroll */}
      <FloatingNavbar />

      {/* Main Content Area */}
      <main className="w-full flex-1 pt-[12vh] sm:pt-[14vh]">
        {/* Intro section positioned closer to top */}
        <div id="intro">
          <NotebookIntro />
        </div>

        <AchievementsHanging />

        {/* GitHub Contribution Sticky Note Component */}
        <div id="activity">
          <GithubContributionsSticky />
        </div>

        <LeetCodeStats />
      </main>
    </div>
  );
}
