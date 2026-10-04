import { NextResponse } from "next/server";
import {
  X_ARTICLES_FETCH_COUNT,
  X_USERNAME,
  FALLBACK_X_ARTICLES,
} from "@/data/xConfig";
import {
  buildFxTwitterArticlesUrl,
  normalizeXArticles,
} from "@/lib/x-articles";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      buildFxTwitterArticlesUrl(X_USERNAME, X_ARTICLES_FETCH_COUNT),
      {
        headers: {
          "User-Agent": "GarvitSinglaPortfolio/2.0",
          Accept: "application/json",
        },
        signal: controller.signal,
        next: { revalidate: 3600 },
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("FxTwitter API returned non-200, returning fallback articles");
      return NextResponse.json({ articles: FALLBACK_X_ARTICLES });
    }

    const data = await response.json();
    const articles = normalizeXArticles(data);

    return NextResponse.json({
      articles: articles.length > 0 ? articles : FALLBACK_X_ARTICLES,
    });
  } catch (error) {
    console.error("X Articles API Fetch Error, using fallback:", error);
    return NextResponse.json({ articles: FALLBACK_X_ARTICLES });
  }
}
