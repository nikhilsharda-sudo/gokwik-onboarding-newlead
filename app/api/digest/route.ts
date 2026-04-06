export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token") || req.nextUrl.searchParams.get("secret");
  if (token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Lazy imports — only runs at request time, never at build time
  const { Resend } = await import("resend");
  const { getAllLeads } = await import("@/lib/leads");

  const resend = new Resend(process.env.RESEND_API_KEY);
  const all    = await getAllLeads();
  const now    = Date.now();
  const week   = 7 * 24 * 60 * 60 * 1000;

  const newThisWeek = all.filter(l => now - new Date(l.submitted_at).getTime() < week);
  const highValue   = all.filter(l => (l.score || 0) >= 70);
  const stale       = all.filter(l => {
    const last = new Date(l.last_updated || l.submitted_at).getTime();
    return now - last > 3 * 24 * 60 * 60 * 1000 &&
      l.status !== "Qualified" &&
      l.status !== "Rejected";
  });

  const byStatus = {
    New:       all.filter(l => l.status === "New").length,
    Contacted: all.filter(l => l.status === "Contacted").length,
    Qualified: all.filter(l => l.status === "Qualified").length,
    Rejected:  all.filter(l => l.status === "Rejected").length,
  };

  const newLeadRows = newThisWeek.map(l => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;font-weight:700;color:#1a1a2e;font-size:13px">
        ${l.brand_name} ${(l.score || 0) >= 70 ? "🔥" : ""}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;color:#6C3BFF;font-size:13px;font-weight:600">${l.gmv || "—"}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;font-size:13px;color:#555">${l.referral?.split(":")[0] || "—"}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;font-size:13px">
        <span style="background:#EEF2FF;color:#6C3BFF;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700">${l.status}</span>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;font-size:12px;color:#aaa">
        ${new Date(l.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
      </td>
    </tr>`).join("");

  const staleRows = stale.slice(0, 5).map(l => `
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid #ede9fe;font-weight:700;color:#1a1a2e;font-size:13px">${l.brand_name}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #ede9fe;font-size:13px;color:#555">${l.status}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #ede9fe;font-size:12px;color:#aaa">
        ${Math.floor((now - new Date(l.last_updated || l.submitted_at).getTime()) / 86400000)} days ago
      </td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f0ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0ff;padding:32px 0">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(108,59,255,0.12)">
  <tr><td style="background:linear-gradient(135deg,#6C3BFF,#A78BFA);padding:28px 32px;text-align:center">
    <div style="font-size:32px;margin-bottom:8px">📊</div>
    <h1 style="color:white;margin:0;font-size:20px;font-weight:800">Weekly Lead Digest</h1>
    <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px">
      Week of ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
    </p>
  </td></tr>
  <tr><td style="background:white;padding:24px 32px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;padding:0 8px">
          <div style="background:#f8f7ff;border-radius:14px;padding:14px 10px">
            <div style="font-size:26px;font-weight:800;color:#6C3BFF">${all.length}</div>
            <div style="font-size:11px;color:#888;margin-top:4px">Total Leads</div>
          </div>
        </td>
        <td style="text-align:center;padding:0 8px">
          <div style="background:#f8f7ff;border-radius:14px;padding:14px 10px">
            <div style="font-size:26px;font-weight:800;color:#00C48C">${newThisWeek.length}</div>
            <div style="font-size:11px;color:#888;margin-top:4px">New This Week</div>
          </div>
        </td>
        <td style="text-align:center;padding:0 8px">
          <div style="background:#f8f7ff;border-radius:14px;padding:14px 10px">
            <div style="font-size:26px;font-weight:800;color:#FFB800">${highValue.length}</div>
            <div style="font-size:11px;color:#888;margin-top:4px">High Value 🔥</div>
          </div>
        </td>
        <td style="text-align:center;padding:0 8px">
          <div style="background:#f8f7ff;border-radius:14px;padding:14px 10px">
            <div style="font-size:26px;font-weight:800;color:#FF6B6B">${stale.length}</div>
            <div style="font-size:11px;color:#888;margin-top:4px">Need Follow-up</div>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="background:white;padding:0 32px 24px">
    <h2 style="font-size:14px;font-weight:800;color:#1a1a2e;margin:0 0 12px">Pipeline Status</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #ede9fe">
      ${Object.entries(byStatus).map(([s, c]) => `
        <tr>
          <td style="padding:10px 16px;background:#f8f7ff;color:#6C3BFF;font-weight:700;font-size:13px;width:40%;border-bottom:1px solid #ede9fe">${s}</td>
          <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1a1a2e;border-bottom:1px solid #ede9fe">${c} leads</td>
        </tr>`).join("")}
    </table>
  </td></tr>
  ${newThisWeek.length > 0 ? `
  <tr><td style="background:white;padding:0 32px 24px">
    <h2 style="font-size:14px;font-weight:800;color:#1a1a2e;margin:0 0 12px">🆕 New This Week (${newThisWeek.length})</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #ede9fe">
      <tr style="background:#f8f7ff">
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Brand</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">GMV</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Source</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Status</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Date</th>
      </tr>
      ${newLeadRows}
    </table>
  </td></tr>` : ""}
  ${stale.length > 0 ? `
  <tr><td style="background:white;padding:0 32px 24px">
    <h2 style="font-size:14px;font-weight:800;color:#FF6B6B;margin:0 0 12px">⚠️ Stale Leads (${stale.length})</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #ede9fe">
      <tr style="background:#FEF2F2">
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Brand</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Status</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Last Touched</th>
      </tr>
      ${staleRows}
    </table>
  </td></tr>` : ""}
  <tr><td style="background:white;padding:0 32px 28px;text-align:center">
    <a href="https://your-app.vercel.app/admin"
      style="display:inline-block;background:linear-gradient(135deg,#6C3BFF,#A78BFA);color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:14px">
      🚀 Open Admin Dashboard
    </a>
  </td></tr>
  <tr><td style="background:#1a1a2e;padding:18px 32px;text-align:center">
    <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">
      GoKwik Merchant Onboarding · ✦ Crafted & Built by
      <span style="color:#A78BFA;font-weight:600">Nikhil Sharda</span>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  await resend.emails.send({
    from:    "GoKwik Bot <onboarding@resend.dev>",
    to:      "nikhil.sharda@gokwik.co",
    subject: `📊 Weekly Digest — ${newThisWeek.length} new, ${stale.length} stale · GoKwik`,
    html,
  });

  return NextResponse.json({ success: true, newLeads: newThisWeek.length, stale: stale.length });
}