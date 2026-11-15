import { listManga } from "@/lib/mangadex";
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return Response.json({ items: [] });
  try { const { items } = await listManga({ q, limit: 6, anyLang: true }); return Response.json({ items: items.map((m) => ({ id: m.id, title: m.title, alt: m.altTitles[0] })) }); }
  catch { return Response.json({ items: [] }); }
}
