import { FALLBACK_X_ARTICLES } from "@/data/xConfig";

export interface XArticle {
  id: string;
  title: string;
  preview: string;
  date: string;
  likes: number;
  views: number;
  url: string;
  coverImage?: string;
  tags?: string[];
  noteColor?: "yellow" | "mint" | "coral" | "sky";
  noteAngle?: number;
  readTime?: string;
}

interface FxTwitterArticleMedia {
  media_info?: {
    original_img_url?: string;
  };
}

interface FxTwitterArticle {
  title?: string;
  preview_text?: string;
  cover_media?: FxTwitterArticleMedia;
}

interface FxTwitterResult {
  id?: string;
  url?: string;
  likes?: number;
  views?: number;
  created_timestamp?: number;
  article?: FxTwitterArticle;
}

interface FxTwitterResponse {
  code?: number;
  results?: FxTwitterResult[];
}

export function formatArticleDate(timestamp?: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const NOTE_COLORS: Array<"yellow" | "mint" | "coral" | "sky"> = [
  "yellow",
  "mint",
  "coral",
  "sky",
];

const NOTE_ANGLES = [-2.1, 1.8, -1.4, 2.2, -1.9, 1.4];

export function normalizeXArticles(response: FxTwitterResponse): XArticle[] {
  const results = response.results ?? [];

  const parsed = results
    .filter((item) => item.article?.title && item.url && item.id)
    .map((item, idx) => {
      const fallbackMatch = FALLBACK_X_ARTICLES.find(
        (f) => f.id === item.id || f.title.toLowerCase() === item.article?.title?.toLowerCase(),
      );

      // Estimate read time from preview length or default to 3-5 mins
      const wordCount = (item.article?.preview_text || "").split(/\s+/).length;
      const readMinutes = Math.max(2, Math.min(6, Math.ceil(wordCount / 40)));

      return {
        id: item.id!,
        title: item.article!.title!.trim(),
        preview:
          item.article!.preview_text?.replace(/\n+/g, " ").trim() ||
          fallbackMatch?.preview ||
          "Read the full article and insights on X / Twitter...",
        date: formatArticleDate(item.created_timestamp) || fallbackMatch?.date || "2026",
        likes: item.likes ?? fallbackMatch?.likes ?? 0,
        views: item.views ?? fallbackMatch?.views ?? 0,
        url: item.url!,
        coverImage: item.article?.cover_media?.media_info?.original_img_url,
        tags: fallbackMatch?.tags || ["Deep Dive", "Article"],
        noteColor:
          fallbackMatch?.noteColor ||
          NOTE_COLORS[idx % NOTE_COLORS.length],
        noteAngle:
          fallbackMatch?.noteAngle ??
          NOTE_ANGLES[idx % NOTE_ANGLES.length],
        readTime: `${readMinutes} min read`,
      };
    });

  return parsed.length > 0 ? parsed : FALLBACK_X_ARTICLES;
}

export function buildFxTwitterArticlesUrl(username: string, count: number): string {
  return `https://api.fxtwitter.com/2/profile/${username}/articles?count=${count}`;
}
