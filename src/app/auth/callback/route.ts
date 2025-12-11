import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Validate that redirect path is safe (relative path only)
function getSafeRedirectPath(path: string): string {
  // Must start with / and not contain protocol or double slashes
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return "/";
  }
  // Remove any query params that could be malicious
  const cleanPath = path.split("?")[0];
  // Only allow alphanumeric, hyphens, underscores, and slashes
  if (!/^[a-zA-Z0-9/_-]*$/.test(cleanPath)) {
    return "/";
  }
  return cleanPath;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Validate the redirect path to prevent open redirect
  const safePath = getSafeRedirectPath(next);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Use the forwardedHost for Vercel deployments
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safePath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safePath}`);
      } else {
        return NextResponse.redirect(`${origin}${safePath}`);
      }
    }
  }

  // Auth error - redirect to home with error param
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
