"use client";
import { Lead } from "@/lib/leads";

const BRAND  = "#6C3BFF";
const GREEN  = "#00C48C";
const YELLOW = "#FFB800";
const ACCENT = "#FF6B6B";
const ORANGE = "#FF8C00";

function parseIndianNumber(val: string): number {
  if (!val) return 0;
  const v = val.toLowerCase().replace(/[₹,\s]/g, "");
  if (v.includes("crore") || v.includes("cr")) return parseFloat(v) * 10000000;
  if (v.includes("lakh") || v.includes("lac") || v.includes("l")) return parseFloat(v) * 100000;
  return parseFloat(v) || 0;
}

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

// Mini bar chart for leads over last 7 days
function LeadsOverTime({ leads }: { leads: Lead[] }) {
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const count = leads.filter(l => {
      const ld = new Date(l.submitted_at);
      return ld.toDateString() === d.toDateString();
    }).length;
    days.push({ label, count });
  }
  const max = Math.max(...days.map(d => d.count), 1);

  return (
    <div style={{ background: "white", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 12px rgba(108,59,255,0.07)", flex: "1 1 220px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>Leads — Last 7 Days</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 70 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, color: BRAND, fontWeight: 700 }}>{d.count > 0 ? d.count : ""}</div>
            <div style={{ width: "100%", background: `linear-gradient(180deg,${BRAND},#A78BFA)`, borderRadius: "4px 4px 0 0", height: `${(d.count / max) * 52 + (d.count > 0 ? 8 : 2)}px`, minHeight: 3, transition: "height 0.4s ease", opacity: d.count === 0 ? 0.2 : 1 }} />
            <div style={{ fontSize: 9, color: "#aaa", fontWeight: 500 }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Source pie-like breakdown
function SourceBreakdown({ leads }: { leads: Lead[] }) {
  const total = leads.length || 1;
  const agency   = leads.filter(l => l.referral?.startsWith("Agency")).length;
  const employee = leads.filter(l => l.referral?.startsWith("GoKwik")).length;
  const other    = leads.length - agency - employee;
  const items = [
    { label: "Agency",          count: agency,   color: BRAND  },
    { label: "GoKwik Employee", count: employee, color: GREEN  },
    { label: "Other",           count: other,    color: YELLOW },
  ];

  return (
    <div style={{ background: "white", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 12px rgba(108,59,255,0.07)", flex: "1 1 180px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>Lead Sources</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(item => (
          <div key={item.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.count}</span>
            </div>
            <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${(item.count / total) * 100}%`, background: item.color, borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Status funnel
function StatusFunnel({ leads }: { leads: Lead[] }) {
  const total = leads.length || 1;
  const statuses = [
    { label: "New",       color: BRAND,  count: leads.filter(l => l.status === "New").length },
    { label: "Contacted", color: YELLOW, count: leads.filter(l => l.status === "Contacted").length },
    { label: "Qualified", color: GREEN,  count: leads.filter(l => l.status === "Qualified").length },
    { label: "Rejected",  color: ACCENT, count: leads.filter(l => l.status === "Rejected").length },
  ];

  return (
    <div style={{ background: "white", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 12px rgba(108,59,255,0.07)", flex: "1 1 180px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>Status Funnel</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {statuses.map(s => (
          <div key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.count} <span style={{ color: "#ccc", fontWeight: 400 }}>({Math.round((s.count / total) * 100)}%)</span></span>
            </div>
            <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${(s.count / total) * 100}%`, background: s.color, borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// GMV distribution
function GMVDistribution({ leads }: { leads: Lead[] }) {
  const buckets = [
    { label: "< ₹10L",   color: "#e0e0e0", count: 0 },
    { label: "₹10-50L",  color: YELLOW,    count: 0 },
    { label: "₹50L-1Cr", color: ORANGE,    count: 0 },
    { label: "> ₹1Cr",   color: GREEN,     count: 0 },
  ];
  leads.forEach(l => {
    const g = parseIndianNumber(l.gmv);
    if (g >= 10000000)      buckets[3].count++;
    else if (g >= 5000000)  buckets[2].count++;
    else if (g >= 1000000)  buckets[1].count++;
    else                    buckets[0].count++;
  });
  const max = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div style={{ background: "white", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 12px rgba(108,59,255,0.07)", flex: "1 1 180px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>GMV Distribution</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 70 }}>
        {buckets.map((b, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>{b.count > 0 ? b.count : ""}</div>
            <div style={{ width: "100%", background: b.color, borderRadius: "4px 4px 0 0", height: `${(b.count / max) * 52 + (b.count > 0 ? 8 : 2)}px`, minHeight: 3, transition: "height 0.4s ease", opacity: b.count === 0 ? 0.15 : 1 }} />
            <div style={{ fontSize: 9, color: "#aaa", fontWeight: 500, textAlign: "center" }}>{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top summary KPIs
function KPICards({ leads }: { leads: Lead[] }) {
  const totalGMV   = leads.reduce((s, l) => s + parseIndianNumber(l.gmv), 0);
  const avgScore   = leads.length ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0;
  const highValue  = leads.filter(l => parseIndianNumber(l.gmv) >= 10000000).length;
  const stale      = leads.filter(l => {
    const last = new Date(l.last_updated || l.submitted_at).getTime();
    return Date.now() - last > 3 * 86400000 && l.status !== "Qualified" && l.status !== "Rejected";
  }).length;

  const cards = [
    { label: "Total Pipeline GMV", val: formatINR(totalGMV), icon: "💰", color: BRAND  },
    { label: "Avg Lead Score",     val: `${avgScore}/100`,   icon: "⭐", color: YELLOW },
    { label: "High Value 🔥",      val: highValue,            icon: "🚀", color: GREEN  },
    { label: "Stale Leads ⚠️",     val: stale,                icon: "🕐", color: ACCENT },
  ];

  return (
    <>
      {cards.map(c => (
        <div key={c.label} style={{ background: "white", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 12px rgba(108,59,255,0.08)", display: "flex", alignItems: "center", gap: 12, flex: "1 1 140px" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>{c.val}</div>
            <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginTop: 1 }}>{c.label}</div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function AnalyticsBar({ leads }: { leads: Lead[] }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* KPI row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 14 }}>
        <KPICards leads={leads} />
      </div>
      {/* Charts row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        <LeadsOverTime    leads={leads} />
        <SourceBreakdown  leads={leads} />
        <StatusFunnel     leads={leads} />
        <GMVDistribution  leads={leads} />
      </div>
    </div>
  );
}