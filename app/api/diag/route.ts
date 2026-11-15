// Dev-only API diagnostics: open http://localhost:3000/api/diag
const T = (u: string, init?: RequestInit) => fetch(u, { ...init, signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Sumi/0.1" } });
export async function GET() {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const run = async (name: string, f: () => Promise<Response>) => {
    const t = Date.now();
    try { const r = await f(); return { name, ok: r.ok, status: r.status, ms: Date.now() - t, note: r.status === 429 ? "rate limited" : "" }; }
    catch (e: any) { return { name, ok: false, status: 0, ms: Date.now() - t, note: e.name === "TimeoutError" ? "timeout (blocked network?)" : e.message }; }
  };
  const cover = await (async () => {
    try {
      const j = await (await T("https://api.mangadex.org/manga?limit=1&includes[]=cover_art&order[followedCount]=desc")).json();
      const m = j.data[0]; const f = m.relationships.find((r: any) => r.type === "cover_art").attributes.fileName;
      return `https://uploads.mangadex.org/covers/${m.id}/${f}.256.jpg`;
    } catch { return ""; }
  })();
  const results = await Promise.all([
    run("MangaDex catalog", () => T("https://api.mangadex.org/manga?limit=1")),
    run("MangaDex covers (uploads.mangadex.org)", () => (cover ? T(cover, { method: "HEAD" }) : Promise.reject(new Error("no cover URL")))),
    run("MangaDex tags", () => T("https://api.mangadex.org/manga/tag")),
    run("Jikan (MAL)", () => T("https://api.jikan.moe/v4/top/manga?limit=1")),
    run("Kitsu", () => T("https://kitsu.io/api/edge/manga?page[limit]=1")),
    run("AniList", () => T("https://graphql.anilist.co", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: "{Media(type:MANGA,sort:POPULARITY_DESC){id}}" }) })),
  ]);
  return Response.json({ checkedAt: new Date().toISOString(), results });
}
