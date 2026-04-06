import { NextRequest, NextResponse } from "next/server";
import { getAllLeads } from "@/lib/leads";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");

  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await getAllLeads();

  // Sort by newest first
  leads.sort(
    (a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  return NextResponse.json({ leads });
}