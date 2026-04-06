"use client";
import { useState, useEffect } from "react";

const BRAND = "#6C3BFF";
const ACCENT = "#FF6B6B";
const GREEN = "#00C48C";
const YELLOW = "#FFB800";

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  New:       { bg: "#EEF2FF", text: BRAND,    dot: BRAND  },
  Contacted: { bg: "#FFF7E6", text: "#D97706", dot: YELLOW },
  Qualified: { bg: "#ECFDF5", text: "#059669", dot: GREEN  },
  Rejected:  { bg: "#FEF2F2", text: "#DC2626", dot: ACCENT },
};
const STATUS_OPTIONS = ["New", "Contacted", "Qualified", "Rejected"];
const SOURCE_OPTIONS  = ["All Sources", "Agency", "GoKwik Employee", "Other"];

interface Lead {
  id: string; brand_name: string; website: string; email: string; mobile: string;
  gmv: string; avg_orders: string; aov: string; cod_percent: string;
  prepaid_percent: string; legal_structure: string; referral: string;
  status: string; notes: string; submitted_at: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.New;
  return (
    <span style={{ background: c.bg, color: c.text, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />{status}
    </span>
  );
};

const LeadModal = ({ lead, onClose, onUpdate }: { lead: Lead; onClose: () => void; onUpdate: (l: Lead) => void }) => {
  const [status, setStatus] = useState(lead.status);
  const [notes,  setNotes]  = useState(lead.notes);
  const [saving, setSaving] = useState(false);

  const fields: [string, string][] = [
    ["Brand Name", lead.brand_name], ["Website", lead.website],
    ["Email", lead.email],           ["Mobile", lead.mobile],
    ["GMV / Month", lead.gmv],       ["Avg Orders / Day", lead.avg_orders],
    ["AOV", lead.aov],               ["COD %", lead.cod_percent],
    ["Prepaid %", lead.prepaid_percent], ["Legal Structure", lead.legal_structure],
    ["Lead Referral", lead.referral],
  ];

  const save = async () => {
    setSaving(true);
    const updated = { ...lead, status, notes };
    try {
      await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": localStorage.getItem("admin_token") || "" },
        body: JSON.stringify(updated),
      });
      onUpdate(updated);
    } catch (_) { onUpdate(updated); }
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "fadeUp 0.3s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${BRAND}, #A78BFA)`, padding: "20px 24px", borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 18 }}>{lead.brand_name}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
              {new Date(lead.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {fields.map(([l, v]) => (
              <div key={l} style={{ background: "#f8f7ff", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</div>
                <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600, marginTop: 3, wordBreak: "break-word" }}>{v || "—"}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 8 }}>Status</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{ padding: "7px 16px", borderRadius: 20, border: `2px solid ${status === s ? STATUS_COLORS[s].dot : "#e0e0e0"}`, background: status === s ? STATUS_COLORS[s].bg : "white", color: status === s ? STATUS_COLORS[s].text : "#888", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 8 }}>Internal Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add notes about this lead..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <button onClick={save} disabled={saving} style={{ width: "100%", padding: 13, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND}, #A78BFA)`, color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [pw, setPw]     = useState("");
  const [err, setErr]   = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (pw.trim()) { onLogin(pw.trim()); }
    else { setErr(true); setShake(true); setTimeout(() => setShake(false), 500); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 24, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(108,59,255,0.25)", animation: shake ? "shake 0.4s ease" : "none" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${BRAND},#A78BFA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🔐</div>
          <h2 style={{ margin: 0, color: "#1a1a2e", fontWeight: 800, fontSize: 22 }}>Admin Panel</h2>
          <p style={{ color: "#888", fontSize: 14, margin: "6px 0 0" }}>GoKwik Lead Dashboard</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6 }}>Password</label>
          <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }} onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Enter admin password"
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `2px solid ${err ? "#EF4444" : "#e0e0e0"}`, fontSize: 15, boxSizing: "border-box", outline: "none" }} autoFocus />
          {err && <p style={{ color: "#EF4444", fontSize: 12, margin: "6px 0 0" }}>❌ Please enter a password.</p>}
        </div>
        <button onClick={submit} style={{ width: "100%", padding: 13, borderRadius: 12, background: `linear-gradient(135deg,${BRAND},#A78BFA)`, color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Login →
        </button>
        <p style={{ textAlign: "center", color: "#ccc", fontSize: 11, marginTop: 20 }}>✦ Crafted & Built by <span style={{ color: BRAND, fontWeight: 600 }}>Nikhil Sharda</span></p>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [token,        setToken]        = useState<string | null>(null);
  const [leads,        setLeads]        = useState<Lead[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [sortBy,       setSortBy]       = useState("newest");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [authErr,      setAuthErr]      = useState(false);

  const fetchLeads = async (t: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", { headers: { "x-admin-token": t } });
      if (res.status === 401) { setAuthErr(true); setToken(null); setLoading(false); return; }
      const json = await res.json();
      setLeads(json.leads || []);
    } catch (_) {}
    setLoading(false);
  };

  const handleLogin = (t: string) => {
    setAuthErr(false);
    setToken(t);
    if (typeof window !== "undefined") localStorage.setItem("admin_token", t);
    fetchLeads(t);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_token");
      if (saved) handleLogin(saved);
    }
  }, []);

  const filtered = leads
    .filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.brand_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.referral.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || l.status === statusFilter;
      const matchSource = sourceFilter === "All Sources" || l.referral.startsWith(sourceFilter);
      return matchSearch && matchStatus && matchSource;
    })
    .sort((a, b) => sortBy === "newest"
      ? new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      : new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    );

  const stats = {
    total:     leads.length,
    new:       leads.filter(l => l.status === "New").length,
    qualified: leads.filter(l => l.status === "Qualified").length,
    contacted: leads.filter(l => l.status === "Contacted").length,
  };

  const exportCSV = () => {
    const headers = ["Brand Name","Website","Email","Mobile","GMV/Month","Avg Orders/Day","AOV","COD %","Prepaid %","Legal Structure","Referral","Status","Notes","Submitted At"];
    const rows = leads.map(l => [l.brand_name,l.website,l.email,l.mobile,l.gmv,l.avg_orders,l.aov,l.cod_percent,l.prepaid_percent,l.legal_structure,l.referral,l.status,l.notes,new Date(l.submitted_at).toLocaleString("en-IN")]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "gokwik_leads.csv";
    a.click();
  };

  const updateLead = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLead(null);
  };

  if (!token) return (
    <>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
      {authErr && <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: "#FEF2F2", color: "#DC2626", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999 }}>❌ Incorrect password. Try again.</div>}
      <Login onLogin={handleLogin} />
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f0ff", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;}
        input:focus,textarea:focus,select:focus{outline:none!important;border-color:${BRAND}!important;}
        button{transition:all 0.2s;cursor:pointer;}
        button:hover{opacity:0.88;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#c4b5fd;border-radius:4px;}
      `}</style>

      {/* Topbar */}
      <div style={{ background: `linear-gradient(135deg,${BRAND},#A78BFA)`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 18 }}>GoKwik Lead Dashboard</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Admin Panel · Nikhil Sharda</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={exportCSV} style={{ padding: "8px 18px", borderRadius: 20, background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", color: "white", fontWeight: 700, fontSize: 13 }}>⬇ Export CSV</button>
          <button onClick={() => { setToken(null); localStorage.removeItem("admin_token"); }} style={{ padding: "8px 16px", borderRadius: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontWeight: 600, fontSize: 13 }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: "24px 20px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Leads", val: stats.total,     icon: "📋", color: BRAND  },
            { label: "New",         val: stats.new,        icon: "🆕", color: BRAND  },
            { label: "Contacted",   val: stats.contacted,  icon: "📞", color: YELLOW },
            { label: "Qualified",   val: stats.qualified,  icon: "✅", color: GREEN  },
          ].map(s => (
            <div key={s.label} style={{ background: "white", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 12px rgba(108,59,255,0.08)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(108,59,255,0.06)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search brand, email, referral..." style={{ flex: "1 1 200px", padding: "9px 14px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 13, minWidth: 180 }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "9px 12px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 13, background: "white", cursor: "pointer" }}>
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ padding: "9px 12px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 13, background: "white", cursor: "pointer" }}>
            {SOURCE_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "9px 12px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 13, background: "white", cursor: "pointer" }}>
            <option value="newest">🕐 Newest First</option>
            <option value="oldest">🕐 Oldest First</option>
          </select>
          <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(108,59,255,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 48, color: "#888" }}>Loading leads...</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#f8f7ff" }}>
                    {["Brand", "GMV/Mo", "Avg Orders", "AOV", "COD%", "Source", "Status", "Date", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#ccc", fontSize: 14 }}>No leads match your filters 🔍</td></tr>
                  ) : filtered.map((l, i) => (
                    <tr key={l.id} style={{ borderTop: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fdfcff", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f3f0ff")}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "white" : "#fdfcff")}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{l.brand_name}</div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{l.email}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#1a1a2e", fontWeight: 600 }}>{l.gmv}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{l.avg_orders}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{l.aov}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{l.cod_percent}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: "#EEF2FF", color: BRAND, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{l.referral.split(":")[0]}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}><StatusBadge status={l.status} /></td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>
                        {new Date(l.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => setSelectedLead(l)} style={{ padding: "6px 14px", borderRadius: 20, background: `linear-gradient(135deg,${BRAND},#A78BFA)`, color: "white", border: "none", fontWeight: 600, fontSize: 12 }}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, color: "#aaa", fontSize: 12 }}>
          ✦ Crafted & Built by <span style={{ color: BRAND, fontWeight: 600 }}>Nikhil Sharda</span>
        </div>
      </div>

      {selectedLead && <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={updateLead} />}
    </div>
  );
}