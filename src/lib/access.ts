// Proteção por senha do protótipo. A senha vem da variável de ambiente DEMO_PASSWORD
// (configurada na Vercel) e nunca é commitada. O cookie guarda só um HMAC derivado dela:
// trocar a senha invalida todos os acessos.
export const ACCESS_COOKIE = "pv_access";
export const ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

export async function accessToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode("plantaovet-demo-access-v1"));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparação em tempo constante (para strings de mesmo tamanho, como os tokens hex). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Aceita apenas caminhos internos, evitando redirecionamento para outro domínio. */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value.startsWith("/acesso") || value.startsWith("/api/acesso")) return "/";
  return value;
}
