import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  try {
    // Follow redirects to get the final URL
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });

    // Return the final URL after redirects
    return NextResponse.json({ resolvedUrl: response.url });
  } catch (error) {
    console.error("Failed to resolve URL:", error);
    return NextResponse.json(
      { error: "Failed to resolve URL" },
      { status: 500 }
    );
  }
}
