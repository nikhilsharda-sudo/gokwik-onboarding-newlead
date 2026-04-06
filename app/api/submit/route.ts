export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { Resend } = await import("resend");
  const { saveLeadKV, calculateScore } = await import("@/lib/leads");

  const data = await req.json();

  const lead = {
    ...data,
    id: Date.now().toString(),
    status: "New",
    priority: "",
    notes: [],
    timeline: [{ timestamp: new Date().toISOString(), action: "Lead Created", detail: "Submitted via onboarding bot" }],
    score: calculateScore(data),
    notes_text: "",
    submitted_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };

  await saveLeadKV(lead);

  const resend = new Resend(process.env.RESEND_API_KEY);

  const fields: [string, string][] = [
    ["Brand Name",       data.brand_name],
    ["Website",          data.website],
    ["Email",            data.email],
    ["Mobile",           data.mobile],
    ["GMV / Month",      data.gmv],
    ["Avg Orders / Day", data.avg_orders],
    ["AOV",              data.aov],
    ["COD %",            data.cod_percent],
    ["Prepaid %",        data.prepaid_percent],
    ["Legal Structure",  data.legal_structure],
    ["Lead Referral",    data.referral],
    ["Lead Score",       `${lead.score}/100`],
  ];

  const rows = fields.map(([l, v]) => `
    <tr>
      <td style="padding:12px 16px;background:#f8f7ff;color:#6C3BFF;font-weight:600;font-size:13px;border-bottom:1px solid #ede9fe;width:40%">${l}</td>
      <td style="padding:12px 16px;color:#1a1a2e;font-size:13px;border-bottom:1px solid #ede9fe;">${v || "—"}</td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f0ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0ff;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(108,59,255,0.15)">
        <tr><td style="background:linear-gradient(135deg,#6C3BFF,#A78BFA);padding:32px;text-align:center">
          <div style="font-size:36px;margin-bottom:8px">🤖</div>
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800">New Merchant Lead</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">Submitted via GoKwik Onboarding Bot</p>
        </td></tr>
        <tr><td style="background:#6C3BFF;padding:0 32px 24px;text-align:center">
          <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:14px 20px;display:inline-block">
            <span style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Brand</span>
            <div style="color:white;font-size:24px;font-weight:800;margin-top:4px">
              ${data.brand_name} ${lead.score >= 70 ? "🔥" : ""}
            </div>
            <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:4px">Lead Score: ${lead.score}/100</div>
          </div>
        </td></tr>
        <tr><td style="background:white;padding:24px 32px">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #ede9fe">
            ${rows}
          </table>
        </td></tr>
        <tr><td style="background:white;padding:0 32px 28px;text-align:center">
          <a href="mailto:${data.email}" style="display:inline-block;background:linear-gradient(135deg,#6C3BFF,#A78BFA);color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:14px">
            📩 Reply to ${data.brand_name}
          </a>
        </td></tr>
        <tr><td style="background:#f8f7ff;padding:16px 32px;text-align:center;border-top:1px solid #ede9fe">
          <p style="color:#aaa;font-size:12px;margin:0">
            Submitted on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })} IST
          </p>
        </td></tr>
        <tr><td style="background:#1a1a2e;padding:20px 32px;text-align:center">
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
    subject: `🚀 New Lead: ${data.brand_name} (Score: ${lead.score}/100) — GoKwik`,
    html,
  });

  return NextResponse.json({ success: true });
}