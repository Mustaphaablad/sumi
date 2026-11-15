import { getPages } from "@/lib/mangadex";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try { return Response.json({ pages: await getPages(params.id) }); }
  catch (e: any) { return Response.json({ error: e.message }, { status: 502 }); }
}
