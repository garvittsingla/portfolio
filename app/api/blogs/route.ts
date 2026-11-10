import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const revalidate = 60; // 1 minute cache

export async function GET() {
  try {
    const contentDir = path.join(process.cwd(), "zola", "content");
    const blogs: Array<{
      slug: string;
      title: string;
      description: string;
      date: string;
      tags: string[];
      readTime: string;
    }> = [];

    if (fs.existsSync(contentDir)) {
      const files = await fs.promises.readdir(contentDir);
      for (const file of files) {
        if (!file.endsWith(".md") || file.startsWith("_")) continue;
        const slug = file.replace(/\.md$/, "");
        const raw = await fs.promises.readFile(path.join(contentDir, file), "utf-8");

        // Parse Zola TOML frontmatter between +++
        const match = raw.match(/^\+\+\+([\s\S]*?)\+\+\+/);
        if (!match) continue;

        const toml = match[1];
        const titleMatch = toml.match(/title\s*=\s*"([^"]+)"/);
        const descMatch = toml.match(/description\s*=\s*"([^"]+)"/);
        const dateMatch = toml.match(/date\s*=\s*([0-9-]+)/);
        const tagsMatch = toml.match(/tags\s*=\s*\[(.*?)\]/);

        let tags: string[] = [];
        if (tagsMatch) {
          tags = tagsMatch[1]
            .split(",")
            .map((t) => t.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean);
        }

        blogs.push({
          slug,
          title: titleMatch ? titleMatch[1] : slug,
          description: descMatch ? descMatch[1] : "",
          date: dateMatch ? dateMatch[1] : "2026-10-01",
          tags,
          readTime: "5 min read",
        });
      }
    }

    blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Error reading Zola blogs for API:", error);
    return NextResponse.json({ blogs: [] }, { status: 500 });
  }
}
