"use strict";(()=>{var e={};e.id=751,e.ids=[751],e.modules={4646:e=>{e.exports=require("@upstash/redis")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},852:e=>{e.exports=require("async_hooks")},6113:e=>{e.exports=require("crypto")},4492:e=>{e.exports=require("node:stream")},2781:e=>{e.exports=require("stream")},3837:e=>{e.exports=require("util")},7043:(e,t,d)=>{d.r(t),d.d(t,{originalPathname:()=>h,patchFetch:()=>u,requestAsyncStorage:()=>g,routeModule:()=>x,serverHooks:()=>c,staticGenerationAsyncStorage:()=>f});var i={};d.r(i),d.d(i,{GET:()=>s,dynamic:()=>p,runtime:()=>l});var o=d(9303),n=d(8716),r=d(670),a=d(7070);let p="force-dynamic",l="nodejs";async function s(e){if((e.headers.get("x-admin-token")||e.nextUrl.searchParams.get("secret"))!==process.env.ADMIN_PASSWORD)return a.NextResponse.json({error:"Unauthorized"},{status:401});let{Resend:t}=await d.e(495).then(d.bind(d,6495)),{getAllLeads:i}=await d.e(228).then(d.bind(d,6228)),o=new t(process.env.RESEND_API_KEY),n=await i(),r=Date.now(),p=n.filter(e=>r-new Date(e.submitted_at).getTime()<6048e5),l=n.filter(e=>(e.score||0)>=70),s=n.filter(e=>r-new Date(e.last_updated||e.submitted_at).getTime()>2592e5&&"Qualified"!==e.status&&"Rejected"!==e.status),x={New:n.filter(e=>"New"===e.status).length,Contacted:n.filter(e=>"Contacted"===e.status).length,Qualified:n.filter(e=>"Qualified"===e.status).length,Rejected:n.filter(e=>"Rejected"===e.status).length},g=p.map(e=>`
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;font-weight:700;color:#1a1a2e;font-size:13px">
        ${e.brand_name} ${(e.score||0)>=70?"\uD83D\uDD25":""}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;color:#6C3BFF;font-size:13px;font-weight:600">${e.gmv||"—"}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;font-size:13px;color:#555">${e.referral?.split(":")[0]||"—"}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;font-size:13px">
        <span style="background:#EEF2FF;color:#6C3BFF;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700">${e.status}</span>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede9fe;font-size:12px;color:#aaa">
        ${new Date(e.submitted_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
      </td>
    </tr>`).join(""),f=s.slice(0,5).map(e=>`
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid #ede9fe;font-weight:700;color:#1a1a2e;font-size:13px">${e.brand_name}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #ede9fe;font-size:13px;color:#555">${e.status}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #ede9fe;font-size:12px;color:#aaa">
        ${Math.floor((r-new Date(e.last_updated||e.submitted_at).getTime())/864e5)} days ago
      </td>
    </tr>`).join(""),c=`
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
      Week of ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
    </p>
  </td></tr>
  <tr><td style="background:white;padding:24px 32px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;padding:0 8px">
          <div style="background:#f8f7ff;border-radius:14px;padding:14px 10px">
            <div style="font-size:26px;font-weight:800;color:#6C3BFF">${n.length}</div>
            <div style="font-size:11px;color:#888;margin-top:4px">Total Leads</div>
          </div>
        </td>
        <td style="text-align:center;padding:0 8px">
          <div style="background:#f8f7ff;border-radius:14px;padding:14px 10px">
            <div style="font-size:26px;font-weight:800;color:#00C48C">${p.length}</div>
            <div style="font-size:11px;color:#888;margin-top:4px">New This Week</div>
          </div>
        </td>
        <td style="text-align:center;padding:0 8px">
          <div style="background:#f8f7ff;border-radius:14px;padding:14px 10px">
            <div style="font-size:26px;font-weight:800;color:#FFB800">${l.length}</div>
            <div style="font-size:11px;color:#888;margin-top:4px">High Value 🔥</div>
          </div>
        </td>
        <td style="text-align:center;padding:0 8px">
          <div style="background:#f8f7ff;border-radius:14px;padding:14px 10px">
            <div style="font-size:26px;font-weight:800;color:#FF6B6B">${s.length}</div>
            <div style="font-size:11px;color:#888;margin-top:4px">Need Follow-up</div>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="background:white;padding:0 32px 24px">
    <h2 style="font-size:14px;font-weight:800;color:#1a1a2e;margin:0 0 12px">Pipeline Status</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #ede9fe">
      ${Object.entries(x).map(([e,t])=>`
        <tr>
          <td style="padding:10px 16px;background:#f8f7ff;color:#6C3BFF;font-weight:700;font-size:13px;width:40%;border-bottom:1px solid #ede9fe">${e}</td>
          <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1a1a2e;border-bottom:1px solid #ede9fe">${t} leads</td>
        </tr>`).join("")}
    </table>
  </td></tr>
  ${p.length>0?`
  <tr><td style="background:white;padding:0 32px 24px">
    <h2 style="font-size:14px;font-weight:800;color:#1a1a2e;margin:0 0 12px">🆕 New This Week (${p.length})</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #ede9fe">
      <tr style="background:#f8f7ff">
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Brand</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">GMV</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Source</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Status</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Date</th>
      </tr>
      ${g}
    </table>
  </td></tr>`:""}
  ${s.length>0?`
  <tr><td style="background:white;padding:0 32px 24px">
    <h2 style="font-size:14px;font-weight:800;color:#FF6B6B;margin:0 0 12px">⚠️ Stale Leads (${s.length})</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #ede9fe">
      <tr style="background:#FEF2F2">
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Brand</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Status</th>
        <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:700">Last Touched</th>
      </tr>
      ${f}
    </table>
  </td></tr>`:""}
  <tr><td style="background:white;padding:0 32px 28px;text-align:center">
    <a href="https://your-app.vercel.app/admin"
      style="display:inline-block;background:linear-gradient(135deg,#6C3BFF,#A78BFA);color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:14px">
      🚀 Open Admin Dashboard
    </a>
  </td></tr>
  <tr><td style="background:#1a1a2e;padding:18px 32px;text-align:center">
    <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">
      GoKwik Merchant Onboarding \xb7 ✦ Crafted & Built by
      <span style="color:#A78BFA;font-weight:600">Nikhil Sharda</span>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;return await o.emails.send({from:"GoKwik Bot <onboarding@resend.dev>",to:"nikhil.sharda@gokwik.co",subject:`📊 Weekly Digest — ${p.length} new, ${s.length} stale \xb7 GoKwik`,html:c}),a.NextResponse.json({success:!0,newLeads:p.length,stale:s.length})}let x=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/digest/route",pathname:"/api/digest",filename:"route",bundlePath:"app/api/digest/route"},resolvedPagePath:"/workspaces/gokwik-onboarding-newlead/gokwik-onboarding/app/api/digest/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:g,staticGenerationAsyncStorage:f,serverHooks:c}=x,h="/api/digest/route";function u(){return(0,r.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:f})}}};var t=require("../../../webpack-runtime.js");t.C(e);var d=e=>t(t.s=e),i=t.X(0,[948,972],()=>d(7043));module.exports=i})();