import { NextRequest, NextResponse } from "next/server";
import { updateLeadKV } from "@/lib/leads";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");

  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await req.json();

  if (!updated.id) {
    return NextResponse.json({ error: "Missing lead ID" }, { status: 400 });
  }

  await updateLeadKV(updated);

  return NextResponse.json({ success: true });
}