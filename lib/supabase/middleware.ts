import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

const PUBLIC_PATHS = ["/login", "/auth", "/api/stripe/webhook", "/preview"];

/**
 * Refreshes the Supabase session on every request and enforces route access:
 *  - unauthenticated users are pushed to /login
 *  - /admin/* requires role === 'admin'
 *  - authenticated users hitting /login are sent to their home
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // If Supabase isn't configured yet (empty .env.local), don't crash —
  // route everything to /login so the app still renders during setup.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    const { pathname } = request.nextUrl;
    if (pathname === "/login" || pathname.startsWith("/preview")) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/preview/dashboard";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Not signed in → only public paths allowed
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    // Resolve role once for gating
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    // Admin-only area
    if (pathname.startsWith("/admin") && !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Already authenticated but on /login → bounce to home
    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
