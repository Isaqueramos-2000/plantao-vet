import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, accessToken, safeEqual } from "@/lib/access";

const OPEN_PATHS = new Set(["/acesso", "/api/acesso"]);

/** Toda a demo exige a senha (cookie de acesso). Sem DEMO_PASSWORD, só o ambiente local de dev fica aberto. */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (OPEN_PATHS.has(pathname)) return NextResponse.next();

  const password = process.env.DEMO_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
  } else {
    const cookie = request.cookies.get(ACCESS_COOKIE)?.value;
    if (cookie && safeEqual(cookie, await accessToken(password))) return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/acesso";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico).*)"],
};
