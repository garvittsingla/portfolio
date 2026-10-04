import fs from "fs";
import path from "path";

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
  readTime: string;
  author: string;
  xUrl?: string;
  likes?: number;
  views?: number;
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
  headings: HeadingItem[];
}

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/garvittsingla/portfolio/main/blogs";

// Parse YAML frontmatter between leading --- blocks
export function parseFrontmatter(rawContent: string): {
  frontmatter: BlogFrontmatter;
  body: string;
} {
  const defaultFrontmatter: BlogFrontmatter = {
    title: "Untitled Note",
    description: "",
    date: "2026",
    tags: ["Article"],
    readTime: "3 min read",
    author: "Garvit Singla",
  };

  const trimmed = rawContent.trimStart();
  if (!trimmed.startsWith("---")) {
    return { frontmatter: defaultFrontmatter, body: rawContent };
  }

  const endIdx = trimmed.indexOf("\n---", 3);
  if (endIdx === -1) {
    return { frontmatter: defaultFrontmatter, body: rawContent };
  }

  const yamlBlock = trimmed.slice(3, endIdx).trim();
  const body = trimmed.slice(endIdx + 4).trimStart();

  const frontmatter: Partial<BlogFrontmatter> = {};

  yamlBlock.split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return;

    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    // Remove quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    if (key === "title") frontmatter.title = val;
    else if (key === "description") frontmatter.description = val;
    else if (key === "date") frontmatter.date = val;
    else if (key === "readTime") frontmatter.readTime = val;
    else if (key === "author") frontmatter.author = val;
    else if (key === "xUrl") frontmatter.xUrl = val;
    else if (key === "likes") frontmatter.likes = parseInt(val, 10) || 0;
    else if (key === "views") frontmatter.views = parseInt(val, 10) || 0;
    else if (key === "tags") {
      // Parse array like ["Networking", "Subnetting"] or comma separated
      if (val.startsWith("[") && val.endsWith("]")) {
        frontmatter.tags = val
          .slice(1, -1)
          .split(",")
          .map((t) => t.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else {
        frontmatter.tags = [val];
      }
    }
  });

  return {
    frontmatter: { ...defaultFrontmatter, ...frontmatter },
    body,
  };
}

export function extractHeadings(markdown: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const lines = markdown.split("\n");

  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ id, text, level });
    }
  });

  return headings;
}

// Read blog post by slug with local-first file check, falling back to GitHub raw URL
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const sanitizedSlug = slug.replace(/[^\w-]/g, "");
  const localPath = path.join(process.cwd(), "blogs", `${sanitizedSlug}.md`);

  let rawContent: string | null = null;

  // 1. Try local filesystem
  if (fs.existsSync(localPath)) {
    try {
      rawContent = await fs.promises.readFile(localPath, "utf-8");
    } catch {
      rawContent = null;
    }
  }

  // 2. Fallback to GitHub raw
  if (!rawContent) {
    try {
      const res = await fetch(`${GITHUB_RAW_BASE}/${sanitizedSlug}.md`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        rawContent = await res.text();
      }
    } catch {
      rawContent = null;
    }
  }

  if (!rawContent) return null;

  const { frontmatter, body } = parseFrontmatter(rawContent);
  const headings = extractHeadings(body);

  return {
    slug: sanitizedSlug,
    ...frontmatter,
    content: body,
    headings,
  };
}

// Get metadata for all published blogs
export async function getAllBlogs(): Promise<BlogPostMeta[]> {
  const blogsDir = path.join(process.cwd(), "blogs");
  const posts: BlogPostMeta[] = [];

  if (fs.existsSync(blogsDir)) {
    try {
      const files = await fs.promises.readdir(blogsDir);
      for (const file of files) {
        if (!file.endsWith(".md")) continue;
        const slug = file.replace(/\.md$/, "");
        const post = await getBlogBySlug(slug);
        if (post) {
          posts.push({
            slug: post.slug,
            title: post.title,
            description: post.description,
            date: post.date,
            tags: post.tags,
            readTime: post.readTime,
            author: post.author,
            xUrl: post.xUrl,
            likes: post.likes,
            views: post.views,
          });
        }
      }
    } catch (err) {
      console.warn("Error reading local blogs directory:", err);
    }
  }

  // Sort chronologically or by fixed order
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
