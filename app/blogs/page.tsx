import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, BookOpen, Calendar, Clock, ExternalLink } from "lucide-react";
import { getAllBlogs } from "@/lib/blog-engine";
import { DotGridBackground } from "@/components/DotGridBackground";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { FooterSection } from "@/components/FooterSection";

export const metadata: Metadata = {
  title: "Blogs & Field Notes — Garvit Singla",
  description: "Systems programming, network architecture, game theory, and engineering thoughts by Garvit Singla.",
};

export const revalidate = 60; // Revalidate every minute

export default async function BlogsIndexPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950 overflow-x-hidden">
      <DotGridBackground />
      <FloatingNavbar />

      <main className="w-full flex-1 pt-[14vh] sm:pt-[16vh] pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Top breadcrumb & back button */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>back to portfolio</span>
            </Link>

            <span className="font-handwriting text-xs text-neutral-400 dark:text-neutral-500">
              markdown engine v1.0
            </span>
          </div>

          {/* Page Header */}
          <div className="mb-10 sm:mb-12">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
              library · field notes
            </p>
            <h1 className="font-handwriting text-3xl sm:text-4xl md:text-4.5xl text-neutral-900 dark:text-neutral-100">
              articles & engineering blogs
            </h1>
            <p className="mt-3 max-w-2xl font-sans text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              Distilled explanations, network protocols, game theory, and dev notes written directly as markdown files and published to GitHub.
            </p>
          </div>

          {/* Blogs Notebook Ledger */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e5decb] dark:border-neutral-800 bg-[#faf6ea]/95 dark:bg-[#121319]/95 shadow-[0_12px_36px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            {/* Paper texture overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[.14] dark:opacity-[.07]"
              style={{
                backgroundImage: "radial-gradient(#000 0.4px, transparent 0.4px)",
                backgroundSize: "4px 4px",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-25 dark:opacity-15"
              style={{
                backgroundImage: "url('/paper-noise.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "180px 180px",
              }}
            />

            {/* Notebook top bar */}
            <div className="relative z-10 px-6 py-4 border-b border-[#e2d8c0] dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80 inline-block" />
                <span className="ml-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  /blogs directory
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-handwriting text-xs text-neutral-500 dark:text-neutral-400">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>{blogs.length} articles</span>
              </div>
            </div>

            {/* List of Blogs */}
            <div className="relative z-10 divide-y divide-dashed divide-neutral-300/80 dark:divide-neutral-700/80">
              {blogs.map((blog) => (
                <article
                  key={blog.slug}
                  className="group relative block px-6 py-6 sm:px-8 sm:py-7 transition-colors hover:bg-white/60 dark:hover:bg-white/[.035]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                        {/* Archival written date badge */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#efe7d2] dark:bg-[#1c1e28] border border-[#ded3bc] dark:border-neutral-700/80 font-medium text-neutral-800 dark:text-neutral-200">
                          <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>{blog.date}</span>
                        </span>

                        <span>·</span>

                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{blog.readTime}</span>
                        </span>

                        {blog.tags && blog.tags.length > 0 && (
                          <>
                            <span>·</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {blog.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-[4px] border border-neutral-300/80 dark:border-neutral-700/80 text-[10px] text-neutral-600 dark:text-neutral-400 bg-white/50 dark:bg-black/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Blog Title */}
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="inline-block"
                      >
                        <h2 className="font-sans text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                          {blog.title}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      <p className="mt-2 text-xs sm:text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                        {blog.description}
                      </p>

                      {/* Action Links */}
                      <div className="mt-4 flex items-center gap-4 text-xs font-mono">
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="font-handwriting text-neutral-800 dark:text-neutral-200 group-hover:underline flex items-center gap-1"
                        >
                          <span>read full article</span>
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>

                        {blog.githubUrl && (
                          <a
                            href={blog.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex items-center gap-1"
                            title="View source on GitHub"
                          >
                            <span>GitHub</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {blog.xUrl && (
                          <a
                            href={blog.xUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex items-center gap-1"
                            title="View thread on X"
                          >
                            <span>on X</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/blog/${blog.slug}`}
                      className="self-end sm:self-center shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-neutral-300/80 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:border-neutral-900 dark:group-hover:border-white transition-all group-hover:scale-105"
                      aria-label={`Read ${blog.title}`}
                    >
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
