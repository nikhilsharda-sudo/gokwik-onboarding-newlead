export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAllLeads } from "@/lib/leads";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing lead ID" }, { status: 400 });
  }

  const all    = await getAllLeads();
  const newAll = all.filter(l => l.id !== id);

  await redis.del("leads");
  for (const l of newAll.reverse()) {
    await redis.lpush("leads", JSON.stringify(l));
  }

  return NextResponse.json({ success: true, remaining: newAll.length });
}