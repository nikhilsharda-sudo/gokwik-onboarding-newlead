"use strict";(()=>{var e={};e.id=499,e.ids=[499],e.modules={4646:e=>{e.exports=require("@upstash/redis")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},852:e=>{e.exports=require("async_hooks")},6113:e=>{e.exports=require("crypto")},4492:e=>{e.exports=require("node:stream")},2781:e=>{e.exports=require("stream")},3837:e=>{e.exports=require("util")},9574:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>b,patchFetch:()=>m,requestAsyncStorage:()=>c,routeModule:()=>g,serverHooks:()=>x,staticGenerationAsyncStorage:()=>u});var a={};r.r(a),r.d(a,{POST:()=>l,dynamic:()=>s,runtime:()=>p});var i=r(9303),o=r(8716),n=r(670),d=r(7070);let s="force-dynamic",p="nodejs";async function l(e){let{Resend:t}=await r.e(495).then(r.bind(r,6495)),{saveLeadKV:a,calculateScore:i}=await r.e(228).then(r.bind(r,6228)),o=await e.json(),n={...o,id:Date.now().toString(),status:"New",priority:"",notes:[],timeline:[{timestamp:new Date().toISOString(),action:"Lead Created",detail:"Submitted via onboarding bot"}],score:i(o),notes_text:"",submitted_at:new Date().toISOString(),last_updated:new Date().toISOString()};await a(n);let s=new t(process.env.RESEND_API_KEY),p=[["Brand Name",o.brand_name],["Website",o.website],["Email",o.email],["Mobile",o.mobile],["GMV / Month",o.gmv],["Avg Orders / Day",o.avg_orders],["AOV",o.aov],["COD %",o.cod_percent],["Prepaid %",o.prepaid_percent],["Legal Structure",o.legal_structure],["Lead Referral",o.referral],["Lead Score",`${n.score}/100`]].map(([e,t])=>`
    <tr>
      <td style="padding:12px 16px;background:#f8f7ff;color:#6C3BFF;font-weight:600;font-size:13px;border-bottom:1px solid #ede9fe;width:40%">${e}</td>
      <td style="padding:12px 16px;color:#1a1a2e;font-size:13px;border-bottom:1px solid #ede9fe;">${t||"—"}</td>
    </tr>`).join(""),l=`
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
              ${o.brand_name} ${n.score>=70?"\uD83D\uDD25":""}
            </div>
            <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:4px">Lead Score: ${n.score}/100</div>
          </div>
        </td></tr>
        <tr><td style="background:white;padding:24px 32px">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #ede9fe">
            ${p}
          </table>
        </td></tr>
        <tr><td style="background:white;padding:0 32px 28px;text-align:center">
          <a href="mailto:${o.email}" style="display:inline-block;background:linear-gradient(135deg,#6C3BFF,#A78BFA);color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:14px">
            📩 Reply to ${o.brand_name}
          </a>
        </td></tr>
        <tr><td style="background:#f8f7ff;padding:16px 32px;text-align:center;border-top:1px solid #ede9fe">
          <p style="color:#aaa;font-size:12px;margin:0">
            Submitted on ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata",dateStyle:"full",timeStyle:"short"})} IST
          </p>
        </td></tr>
        <tr><td style="background:#1a1a2e;padding:20px 32px;text-align:center">
          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">
            GoKwik Merchant Onboarding \xb7 ✦ Crafted & Built by
            <span style="color:#A78BFA;font-weight:600">Nikhil Sharda</span>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;return await s.emails.send({from:"GoKwik Bot <onboarding@resend.dev>",to:"nikhil.sharda@gokwik.co",subject:`🚀 New Lead: ${o.brand_name} (Score: ${n.score}/100) — GoKwik`,html:l}),d.NextResponse.json({success:!0})}let g=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/submit/route",pathname:"/api/submit",filename:"route",bundlePath:"app/api/submit/route"},resolvedPagePath:"/workspaces/gokwik-onboarding-newlead/gokwik-onboarding/app/api/submit/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:c,staticGenerationAsyncStorage:u,serverHooks:x}=g,b="/api/submit/route";function m(){return(0,n.patchFetch)({serverHooks:x,staticGenerationAsyncStorage:u})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[948,972],()=>r(9574));module.exports=a})();