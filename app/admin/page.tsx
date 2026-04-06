"use client";
import { useState, useEffect, useCallback } from "react";
import { Lead, calculateScore, isHighValue, isDuplicate } from "@/lib/leads";
import AnalyticsBar  from "@/components/AnalyticsBar";
import LeadTable     from "@/components/LeadTable";
import KanbanBoard   from "@/components/KanbanBoard";
import LeadModal     from "@/components/LeadModal";

const BRAND = "#6C3BFF";
const GREEN = "#00C48C";
const ACCENT = "#FF6B6B";

// ── Login ──────────────────────────────────────────────────────
function Login({ onLogin, error }: { onLogin: (pw: string) => void; error: boolean }) {
  const [pw, setPw]       = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) { setShake(true); setTimeout(() => setShake(false), 500); }
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
      <div style={{ background: "white", borderRadius: 24, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(108,59,255,0.25)", animation: shake ? "shake 0.4s ease" : "none" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${BRAND},#A78BFA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🔐</div>
          <h2 style={{ margin: 0, color: "#1a1a2e", fontWeight: 800, fontSize: 22 }}>Admin Panel</h2>
          <p style={{ color: "#888", fontSize: 14, margin: "6px 0 0" }}>GoKwik Lead Dashboard</p>
        </div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6 }}>Password</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onLogin(pw)}
          placeholder="Enter admin password"
          style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `2px solid ${error ? "#EF4444" : "#e0e0e0"}`, fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: error ? 6 : 16 }} autoFocus />
        {error && <p style={{ color: "#EF4444", fontSize: 12, margin: "0 0 14px" }}>❌ Incorrect password. Try again.</p>}
        <button onClick={() => onLogin(pw)} style={{ width: "100%", padding: 13, borderRadius: 12, background: `linear-gradient(135deg,${BRAND},#A78BFA)`, color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Login →
        </button>
        <p style={{ textAlign: "center", color: "#ccc", fontSize: 11, marginTop: 20 }}>✦ Crafted & Built by <span style={{ color: BRAND, fontWeight: 600 }}>Nikhil Sharda</span></p>
      </div>
    </div>
  );
}

// ── Notification Bell ──────────────────────────────────────────
function NotifBell({ count }: { count: number }) {
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <span style={{ fontSize: 20 }}>🔔</span>
      {count > 0 && (
        <span style={{ position: "absolute", top: -4, right: -4, background: ACCENT, color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function AdminPage() {
  const [token,        setToken]        = useState<string | null>(null);
  const [authErr,      setAuthErr]      = useState(false);
  const [leads,        setLeads]        = useState<Lead[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [view,         setView]         = useState<"table" | "kanban" | "analytics">("table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [darkMode,     setDarkMode]     = useState(false);
  const [newSince,     setNewSince]     = useState(0);
  const [lastSeen,     setLastSeen]     = useState<number>(Date.now());
  const [digestSent,   setDigestSent]   = useState(false);
  const [digestLoading,setDigestLoading]= useState(false);

  const fetchLeads = useCallback(async (t: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/leads", { headers: { "x-admin-token": t } });
      if (res.status === 401) { setAuthErr(true); setToken(null); return; }
      const json = await res.json();
      const fetched: Lead[] = (json.leads || []).map((l: Lead) => ({
        ...l,
        score: l.score ?? calculateScore(l),
        notes: l.notes ?? [],
        timeline: l.timeline ?? [],
        priority: l.priority ?? "",
        last_updated: l.last_updated ?? l.submitted_at,
      }));
      // Count new leads since last seen
      const newCount = fetched.filter(l => new Date(l.submitted_at).getTime() > lastSeen).length;
      setNewSince(newCount);
      setLeads(fetched);
    } catch (_) {}
    if (!silent) setLoading(false);
  }, [lastSeen]);

  const handleLogin = async (pw: string) => {
    if (!pw.trim()) return;
    setAuthErr(false);
    // Verify password by calling API
    const res = await fetch("/api/leads", { headers: { "x-admin-token": pw } });
    if (res.status === 401) { setAuthErr(true); return; }
    setToken(pw);
    if (typeof window !== "undefined") localStorage.setItem("admin_token", pw);
    const json = await res.json();
    const fetched: Lead[] = (json.leads || []).map((l: Lead) => ({
      ...l,
      score: l.score ?? calculateScore(l),
      notes: l.notes ?? [],
      timeline: l.timeline ?? [],
      priority: l.priority ?? "",
      last_updated: l.last_updated ?? l.submitted_at,
    }));
    setLeads(fetched);
  };

  // Auto-login from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_token");
      if (saved) handleLogin(saved);
    }
  }, []);

  // Auto-refresh every 20 seconds
  useEffect(() => {
    if (!token) return;
    const t = setInterval(() => fetchLeads(token, true), 20000);
    return () => clearInterval(t);
  }, [token, fetchLeads]);

  const updateLead = async (updated: Lead) => {
    if (updated.id === "DELETED") {
  setLeads(prev => prev.filter(l => l.id !== updated.id));
  setSelectedLead(null);
  return;
}
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLead(null);
    try {
      await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token || "" },
        body: JSON.stringify(updated),
      });
    } catch (_) {}
  };

  const handleBulkUpdate = async (ids: string[], status: string) => {
    const updated = leads.map(l => ids.includes(l.id) ? { ...l, status: status as Lead["status"], last_updated: new Date().toISOString() } : l);
    setLeads(updated);
    for (const id of ids) {
      const lead = updated.find(l => l.id === id);
      if (lead) {
        try {
          await fetch("/api/leads/update", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin-token": token || "" },
            body: JSON.stringify(lead),
          });
        } catch (_) {}
      }
    }
  };

  const handleKanbanStatusChange = async (lead: Lead, newStatus: string) => {
    const updated = { ...lead, status: newStatus as Lead["status"], last_updated: new Date().toISOString(),
      timeline: [...(lead.timeline || []), { timestamp: new Date().toISOString(), action: "Status Changed", detail: `${lead.status} → ${newStatus} (via Kanban)` }] };
    await updateLead(updated);
  };

  const sendDigest = async () => {
    setDigestLoading(true);
    try {
      await fetch(`/api/digest?secret=${token}`);
      setDigestSent(true);
      setTimeout(() => setDigestSent(false), 4000);
    } catch (_) {}
    setDigestLoading(false);
  };

  const logout = () => {
    setToken(null);
    setLeads([]);
    if (typeof window !== "undefined") localStorage.removeItem("admin_token");
  };

  const bg  = darkMode ? "#0f0c29" : "#f3f0ff";
  const cardBg = darkMode ? "#1a1a2e" : "white";

  if (!token) return <Login onLogin={handleLogin} error={authErr} />;

  const highValueCount = leads.filter(l => isHighValue(l)).length;
  const dupCount       = leads.filter(l => isDuplicate(l, leads)).length;

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Inter','Segoe UI',sans-serif", transition: "background 0.3s" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        *{box-sizing:border-box;}
        input:focus,textarea:focus,select:focus{outline:none!important;border-color:${BRAND}!important;}
        button{transition:all 0.2s;cursor:pointer;}
        button:hover{opacity:0.88;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#c4b5fd;border-radius:4px;}
      `}</style>

      {/* Topbar */}
      <div style={{ background: `linear-gradient(135deg,${BRAND},#A78BFA)`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>GoKwik Lead Dashboard</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
              {leads.length} total · {highValueCount} 🔥 high-value · {dupCount > 0 ? `${dupCount} ⚠️ duplicate` : "no duplicates"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* View toggles */}
          {(["table","kanban","analytics"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", borderRadius: 20, background: view === v ? "white" : "rgba(255,255,255,0.15)", color: view === v ? BRAND : "white", border: "none", fontWeight: 700, fontSize: 12, textTransform: "capitalize" }}>
              {v === "table" ? "📋 Table" : v === "kanban" ? "🗂 Kanban" : "📊 Analytics"}
            </button>
          ))}

          {/* Digest button */}
          <button onClick={sendDigest} disabled={digestLoading} style={{ padding: "6px 14px", borderRadius: 20, background: digestSent ? GREEN : "rgba(255,255,255,0.15)", color: "white", border: "none", fontWeight: 700, fontSize: 12 }}>
            {digestLoading ? "Sending..." : digestSent ? "✅ Sent!" : "📧 Digest"}
          </button>

          {/* Dark mode */}
          <button onClick={() => setDarkMode(d => !d)} style={{ padding: "6px 12px", borderRadius: 20, background: "rgba(255,255,255,0.15)", color: "white", border: "none", fontWeight: 700, fontSize: 14 }}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Notification bell */}
          <button onClick={() => { setLastSeen(Date.now()); setNewSince(0); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 20, padding: "6px 10px", cursor: "pointer" }}>
            <NotifBell count={newSince} />
          </button>

          <button onClick={logout} style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.15)", color: "white", border: "none", fontWeight: 600, fontSize: 12 }}>Logout</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 16px", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#888", fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12, animation: "pulse 1s infinite" }}>⚡</div>
            Loading leads...
          </div>
        ) : (
          <>
            {/* Analytics always visible at top */}
            {view === "analytics" && <AnalyticsBar leads={leads} />}

            {/* Table view */}
            {view === "table" && (
              <>
                <AnalyticsBar leads={leads} />
                <LeadTable
                  leads={leads}
                  onSelect={setSelectedLead}
                  onBulkUpdate={handleBulkUpdate}
                />
              </>
            )}

            {/* Kanban view */}
            {view === "kanban" && (
              <>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: darkMode ? "white" : "#1a1a2e" }}>🗂 Kanban Board</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>Drag cards to change status</div>
                </div>
                <KanbanBoard
                  leads={leads}
                  onSelect={setSelectedLead}
                  onStatusChange={handleKanbanStatusChange}
                />
              </>
            )}
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 24, color: "#aaa", fontSize: 12 }}>
          ✦ Crafted & Built by <span style={{ color: BRAND, fontWeight: 600 }}>Nikhil Sharda</span>
        </div>
      </div>

      {/* Lead Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          allLeads={leads}
          onClose={() => setSelectedLead(null)}
          onUpdate={updateLead}
        />
      )}
    </div>
  );
}