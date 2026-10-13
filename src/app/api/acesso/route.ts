import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, ACCESS_MAX_AGE_SECONDS, accessToken, safeEqual, safeNextPath } from "@/lib/access";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const input = String(form.get("password") ?? "");
  const next = safeNextPath(form.get("next"));
  const password = process.env.DEMO_PASSWORD;

  const valid = !!password && safeEqual(await accessToken(input), await accessToken(password));
  if (!valid) {
    // Atraso fixo para desestimular tentativas em série.
    await new Promise((resolve) => setTimeout(resolve, 700));
    const url = new URL("/acesso", request.url);
    url.searchParams.set("erro", "1");
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(ACCESS_COOKIE, await accessToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE_SECONDS,
  });
  return response;
}
