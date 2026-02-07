import { headers } from "next/headers";

export async function getBaseUrl() {
  // Next versi kamu: headers() async
  const h = await headers();

  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (!host) {
    // fallback dev
    return "http://localhost:3000";
  }

  return `${proto}://${host}`;
}
