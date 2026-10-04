"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  Heart,
} from "lucide-react";

interface BlogItem {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readTime: string;
  likes?: number;
  views?: number;
  xUrl?: string;
  githubUrl?: string;
}

const INITIAL_FALLBACK_BLOGS: BlogItem[] = [
  {
    slug: "http-server-in-cpp",
    title: "Building a Custom HTTP Server from Scratch in C++",
    description:
      "Demystifying low-level UNIX network sockets, object-oriented socket abstractions, and crafting a minimal HTTP/1.1 web server in modern C++.",
    date: "Sep 17, 2026",
    tags: ["C++", "Networking", "Systems", "Sockets"],
    readTime: "6 min read",
    likes: 64,
    views: 920,
    githubUrl: "https://github.com/garvittsingla/http-server-cpp",
  },
  {
    slug: "you-suck-at-subnetting",
    title: "You suck at Subnetting",
    description:
      "A comprehensive, intuition-first breakdown of IPv4 address allocation, CIDR notation, subnet masks, and how network engineers divide host ranges without wasting precious address space.",
    date: "Jun 12, 2026",
    tags: ["Networking", "Subnetting", "Systems"],
    readTime: "4 min read",
    likes: 42,
    views: 680,
    xUrl: "https://x.com/garvitsinglaa/status/2065482303347085350",
  },
  {
    slug: "how-to-actually-win-in-life",
    title: "How to actually win in life (Real world experiment)",
    description:
      "Why does cooperation emerge in a selfish world? Unpacking Robert Axelrod's famous iterated prisoner's dilemma tournament and what game theory teaches us about long-term success.",
    date: "May 20, 2026",
    tags: ["Game Theory", "Life", "Psychology"],
    readTime: "5 min read",
    likes: 54,
    views: 890,
    xUrl: "https://x.com/garvitsinglaa/status/2057192335398912116",
  },
  {
    slug: "github-actions-for-dummies",
    title: "GitHub Actions for dummies",
    description:
      "Demystifying automated CI/CD pipelines: runners, workflows, jobs, triggers, and building your first automated test & deployment script from scratch.",
    date: "May 18, 2026",
    tags: ["DevOps", "CI/CD", "Automation"],
    readTime: "4 min read",
    likes: 38,
    views: 740,
    xUrl: "https://x.com/garvitsinglaa/status/2056971098999402611",
  },
];

export function WritingsSection() {
  const [blogs, setBlogs] = useState<BlogItem[]>(INITIAL_FALLBACK_BLOGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadBlogs = async () => {
      // 1. Try local cache
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("portfolio_md_blogs_cache");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBlogs(parsed);
              setLoading(false);
            }
          }
        } catch {
          // ignore cache error
        }
      }

      // 2. Fetch fresh blogs from custom engine endpoint
      try {
        const res = await fetch("/api/blogs");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.blogs) && data.blogs.length > 0 && isMounted) {
            setBlogs(data.blogs);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(
                  "portfolio_md_blogs_cache",
                  JSON.stringify(data.blogs),
                );
              } catch {
                // ignore storage error
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch fresh blogs, using cache/fallback:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Only display the latest 3 blogs on the main portfolio page
  const latestBlogs = blogs.slice(0, 3);

  return (
    <section
      id="writings"
      aria-label="Writings & Blogs"
      className="mx-auto mb-4 mt-16 w-full max-w-4xl scroll-mt-28 px-4 sm:mt-20 sm:px-6"
    >
      {/* SECTION HEADER (matching portfolio aesthetic) */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            words & thoughts · writings
          </p>
          <h2 className="font-handwriting text-2xl text-neutral-800 dark:text-neutral-100 sm:text-3xl">
            field notes, articles & blogs
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono
              text-neutral-700 dark:text-neutral-300
              hover:text-black dark:hover:text-white
              bg-white/70 dark:bg-neutral-800/60
              border border-neutral-300/80 dark:border-neutral-700/80
              hover:border-neutral-800 dark:hover:border-neutral-200
              transition-all shadow-2xs group/btn"
          >
            <span>all {blogs.length} blogs</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>

          <a
            href="https://x.com/garvitsinglaa"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono
              text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <span>@garvitsinglaa</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* NOTEBOOK ARTICLE LEDGER */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e7e1d0] bg-[#faf7ee]/95 shadow-[0_10px_30px_rgba(0,0,0,.06)] dark:border-neutral-800/90 dark:bg-[#12131a]/95 dark:shadow-[0_14px_38px_rgba(0,0,0,.35)] sm:rounded-3xl">
        {/* Archival paper noise & subtle dot pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[.16] dark:opacity-[.08]"
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

        {/* Notebook Top Margin Line */}
        <div className="relative z-10 px-5 pt-5 pb-3 border-b border-[#e5decb] dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              blogs/ directory · recent 3 field notes
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-handwriting text-xs text-neutral-500 dark:text-neutral-400">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>recent 3 of {blogs.length} articles</span>
          </div>
        </div>

        {/* Articles List Rows */}
        <div className="relative z-10 divide-y divide-dashed divide-neutral-300/80 dark:divide-neutral-700/80">
          {latestBlogs.map((blog) => (
            <div
              key={blog.slug}
              className="group relative block px-5 py-5 sm:px-7 sm:py-6 transition-colors hover:bg-white/60 dark:hover:bg-white/[.035]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-6">
                <div className="flex-1 min-w-0">
                  {/* Tags & Date row */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-2 font-mono text-[11px]">
                    <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      <span>{blog.date}</span>
                    </span>

                    <span>·</span>

                    <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{blog.readTime}</span>
                    </span>

                    {blog.tags && blog.tags.length > 0 && (
                      <>
                        <span className="text-neutral-300 dark:text-neutral-700">
                          ·
                        </span>
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

                  {/* Article Title: Links to /blog/[slug] */}
                  <Link href={`/blog/${blog.slug}`} className="inline-block">
                    <h3 className="relative inline-block font-sans text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                      {blog.title}
                    </h3>
                  </Link>

                  {/* Article Preview Excerpt */}
                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300 line-clamp-2">
                    {blog.description}
                  </p>

                  {/* Stats & Actions bar */}
                  <div className="mt-3.5 flex items-center gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {typeof blog.likes === "number" && (
                      <span className="inline-flex items-center gap-1 text-rose-500/90 font-medium">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{blog.likes}</span>
                      </span>
                    )}

                    {typeof blog.views === "number" && (
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{blog.views}</span>
                      </span>
                    )}

                    <Link
                      href={`/blog/${blog.slug}`}
                      className="font-handwriting text-xs text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                    >
                      <span>read article</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    {blog.githubUrl && (
                      <a
                        href={blog.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors hidden sm:inline-flex items-center gap-1"
                        title="View source repository on GitHub"
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
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors hidden sm:inline-flex items-center gap-1"
                        title="View original thread on X"
                      >
                        <span>thread on X</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* External arrow button -> opens /blog/[slug] */}
                <Link
                  href={`/blog/${blog.slug}`}
                  className="self-end sm:self-center shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300/70 dark:border-neutral-700/70 bg-white/60 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:border-neutral-900 dark:group-hover:border-white transition-all group-hover:scale-105"
                  aria-label={`Read ${blog.title}`}
                >
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Notebook bottom footer bar with "browse all blogs" */}
        <div className="relative z-10 px-5 py-3.5 bg-[#f5efe0] dark:bg-[#161821] border-t border-[#e5decb] dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-handwriting">
            {loading ? "loading markdown files..." : `showing latest 3 notes · all ${blogs.length} on blogs page`}
          </span>

          <Link
            href="/blogs"
            className="font-mono text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-sky-400 underline underline-offset-4 transition-colors flex items-center gap-1 group/lib"
          >
            <span>browse all blogs ({blogs.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/lib:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
