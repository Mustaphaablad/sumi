export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") ?? "";
  if (!/^https:\/\/uploads\.mangadex\.org\/covers\//.test(u)) return new Response("Bad url", { status: 400 });
  try {
    const r = await fetch(u, { headers: { "User-Agent": "Sumi/0.1 (self-hosted reader)" } });
    if (!r.ok) return new Response("Upstream error", { status: 502 });
    return new Response(r.body, { headers: { "Content-Type": r.headers.get("content-type") ?? "image/jpeg", "Cache-Control": "public, max-age=86400" } });
  } catch { return new Response("Image server unreachable", { status: 502 }); }
}
