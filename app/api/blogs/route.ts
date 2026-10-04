import { NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/blog-engine";

export const revalidate = 60; // 1 minute cache

export async function GET() {
  try {
    const blogs = await getAllBlogs();
    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs in API route:", error);
    return NextResponse.json({ blogs: [] }, { status: 500 });
  }
}
