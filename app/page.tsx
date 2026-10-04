"use client";

import React from "react";
import { DotGridBackground } from "@/components/DotGridBackground";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { FloatingNotebookDoodles } from "@/components/FloatingNotebookDoodles";
import { WallMotivationalPosters } from "@/components/WallMotivationalPosters";
import { PencilCursor } from "@/components/PencilCursor";
import { NotebookIntro } from "@/components/NotebookIntro";
import { GithubContributionsSticky } from "@/components/GithubContributionsSticky";
import { LeetCodeStats } from "@/components/LeetCodeStats";
import { AchievementsHanging } from "@/components/AchievementsHanging";
import { ExperienceSection } from "@/components/ExperienceSection";
import { WritingsSection } from "@/components/WritingsSection";
import { FooterSection } from "@/components/FooterSection";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950 overflow-x-hidden">
      {/* Background vector dot grid / lined paper with theme transitions */}
      <DotGridBackground />

      {/* Persistent floating notebook doodles on left side of viewport */}
      <FloatingNotebookDoodles />

      {/* Subtle motivational posters & prints on right wall */}
      <WallMotivationalPosters />

      {/* Subtle interactive pencil trailing the cursor */}
      <PencilCursor />

      {/* Top Navbar that shrinks into a floating glassmorphic pill on scroll */}
      <FloatingNavbar />

      {/* Main Content Area */}
      <main className="w-full flex-1 pt-[12vh] sm:pt-[14vh]">
        {/* Intro section positioned closer to top */}
        <div id="intro">
          <NotebookIntro />
        </div>

        <ScrollReveal delay={40}>
          <ExperienceSection />
        </ScrollReveal>

        <ScrollReveal delay={60}>
          <AchievementsHanging />
        </ScrollReveal>

        {/* Writings & Blogs Section */}
        <ScrollReveal delay={60}>
          <WritingsSection />
        </ScrollReveal>

        {/* GitHub Contribution Sticky Note Component */}
        <ScrollReveal delay={60}>
          <div id="activity">
            <GithubContributionsSticky />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={60}>
          <LeetCodeStats />
        </ScrollReveal>

        {/* Footer with Alex Hormozi quote & socials */}
        <FooterSection />
      </main>
    </div>
  );
}
