"use client";
import { useState } from "react";
import { Lead, Note, TimelineEvent } from "@/lib/leads";

const BRAND  = "#6C3BFF";
const GREEN  = "#00C48C";
const YELLOW = "#FFB800";
const ACCENT = "#FF6B6B";

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  New:       { bg: "#EEF2FF", text: BRAND,    dot: BRAND  },
  Contacted: { bg: "#FFF7E6", text: "#D97706", dot: YELLOW },
  Qualified: { bg: "#ECFDF5", text: "#059669", dot: GREEN  },
  Rejected:  { bg: "#FEF2F2", text: "#DC2626", dot: ACCENT },
};
const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High:   { bg: "#FFF1F0", text: "#CF1322" },
  Medium: { bg: "#FFF7E6", text: "#D46B08" },
  Low:    { bg: "#F6FFED", text: "#389E0D" },
};

const STATUS_OPTIONS   = ["New", "Contacted", "Qualified", "Rejected"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? GREEN : score >= 40 ? YELLOW : ACCENT;
  const r = 28, cx = 34, cy = 34;
  const circ = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 68, height: 68, flexShrink: 0 }}>
      <svg width="68" height="68">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth="5" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{score}</span>
        <span style={{ fontSize: 9, color: "#aaa", fontWeight: 600 }}>SCORE</span>
      </div>
    </div>
  );
}

interface Props {
  lead: Lead;
  allLeads: Lead[];
  onClose: () => void;
  onUpdate: (l: Lead) => void;
}

export default function LeadModal({ lead, allLeads, onClose, onUpdate }: Props) {
  const [tab,       setTab]       = useState<"details" | "timeline" | "notes">("details");
  const [status,    setStatus]    = useState<Lead["status"]>(lead.status);
  const [priority,  setPriority]  = useState<Lead["priority"]>(lead.priority || "");
  const [noteText,  setNoteText]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [localLead, setLocalLead] = useState<Lead>(lead);

  const isDup = allLeads.some(
    (l) => l.id !== lead.id &&
      (l.email.toLowerCase() === lead.email.toLowerCase() ||
       l.brand_name.toLowerCase() === lead.brand_name.toLowerCase())
  );

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      text: noteText.trim(),
      timestamp: new Date().toISOString(),
    };
    setLocalLead(prev => ({ ...prev, notes: [...(prev.notes || []), newNote], last_updated: new Date().toISOString() }));
    setNoteText("");
  };

  const save = async () => {
    setSaving(true);
    const newEvent: TimelineEvent = {
      timestamp: new Date().toISOString(),
      action: "Updated",
      detail: `Status → ${status}${priority ? ` · Priority → ${priority}` : ""}`,
    };
    const updated: Lead = {
      ...localLead,
      status,
      priority,
      timeline: [...(localLead.timeline || []), newEvent],
      last_updated: new Date().toISOString(),
    };
    try {
      await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": localStorage.getItem("admin_token") || "" },
        body: JSON.stringify(updated),
      });
      onUpdate(updated);
    } catch (_) {
      onUpdate(updated);
    }
    setSaving(false);
  };

  const fields: [string, string][] = [
    ["Brand Name",       lead.brand_name],
    ["Website",          lead.website],
    ["Email",            lead.email],
    ["Mobile",           lead.mobile],
    ["GMV / Month",      lead.gmv],
    ["Avg Orders / Day", lead.avg_orders],
    ["AOV",              lead.aov],
    ["COD %",            lead.cod_percent],
    ["Prepaid %",        lead.prepaid_percent],
    ["Legal Structure",  lead.legal_structure],
    ["Lead Referral",    lead.referral],
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 600, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "fadeUp 0.3s ease" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${BRAND},#A78BFA)`, padding: "20px 24px", borderRadius: "24px 24px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <ScoreRing score={lead.score || 0} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 18 }}>{lead.brand_name}</div>
                  {isDup && <span style={{ background: "#FFB800", color: "#000", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>⚠️ DUPLICATE</span>}
                  {(lead.score || 0) >= 70 && <span style={{ fontSize: 16 }}>🔥</span>}
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 3 }}>
                  Submitted {new Date(lead.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{ background: STATUS_COLORS[status]?.bg, color: STATUS_COLORS[status]?.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{status}</span>
                  {priority && <span style={{ background: PRIORITY_COLORS[priority]?.bg, color: PRIORITY_COLORS[priority]?.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{priority} Priority</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <a href={`tel:${lead.mobile}`} style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>📞 Call</a>
            <a href={`mailto:${lead.email}`} style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>✉️ Email</a>
            <a href={`https://wa.me/${lead.mobile.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>💬 WhatsApp</a>
            <a href={lead.website} target="_blank" rel="noreferrer" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>🌐 Website</a>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f0f0f0" }}>
          {(["details", "timeline", "notes"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: "12px", border: "none", background: "white", fontWeight: tab === t ? 700 : 500, color: tab === t ? BRAND : "#888", borderBottom: tab === t ? `2px solid ${BRAND}` : "none", cursor: "pointer", fontSize: 13, marginBottom: -2 }}>
              {t === "details" ? "📋 Details" : t === "timeline" ? "🕐 Timeline" : `📝 Notes (${(localLead.notes || []).length})`}
            </button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {/* Details Tab */}
          {tab === "details" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {fields.map(([l, v]) => (
                  <div key={l} style={{ background: "#f8f7ff", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</div>
                    <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600, marginTop: 3, wordBreak: "break-word" }}>{v || "—"}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 8 }}>Status</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => setStatus(s as Lead["status"])}
                      style={{ padding: "7px 16px", borderRadius: 20, border: `2px solid ${status === s ? STATUS_COLORS[s].dot : "#e0e0e0"}`, background: status === s ? STATUS_COLORS[s].bg : "white", color: status === s ? STATUS_COLORS[s].text : "#888", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 8 }}>Priority</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {PRIORITY_OPTIONS.map(p => (
                    <button key={p} onClick={() => setPriority(priority === p ? "" : p as Lead["priority"])}
                      style={{ padding: "7px 16px", borderRadius: 20, border: `2px solid ${priority === p ? PRIORITY_COLORS[p].text : "#e0e0e0"}`, background: priority === p ? PRIORITY_COLORS[p].bg : "white", color: priority === p ? PRIORITY_COLORS[p].text : "#888", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={save} disabled={saving}
                style={{ width: "100%", padding: 13, borderRadius: 12, background: `linear-gradient(135deg,${BRAND},#A78BFA)`, color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </>
          )}

          {/* Timeline Tab */}
          {tab === "timeline" && (
            <div>
              {(localLead.timeline || []).length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#ccc", fontSize: 14 }}>No activity yet. Changes will appear here.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[...(localLead.timeline || [])].reverse().map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: BRAND, flexShrink: 0, marginTop: 4 }} />
                        {i < (localLead.timeline || []).length - 1 && <div style={{ width: 2, flex: 1, background: "#e0e0e0", marginTop: 4 }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>{e.action}</div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{e.detail}</div>
                        <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                          {new Date(e.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: GREEN, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>Lead Created</div>
                      <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                        {new Date(lead.submitted_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {tab === "notes" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2}
                  placeholder="Add a note..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, resize: "none", fontFamily: "inherit" }} />
                <button onClick={addNote}
                  style={{ padding: "0 16px", borderRadius: 12, background: `linear-gradient(135deg,${BRAND},#A78BFA)`, color: "white", border: "none", fontWeight: 700, fontSize: 18, cursor: "pointer", alignSelf: "stretch" }}>
                  +
                </button>
              </div>
              {(localLead.notes || []).length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#ccc", fontSize: 14 }}>No notes yet. Add your first note above.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...(localLead.notes || [])].reverse().map(n => (
                    <div key={n.id} style={{ background: "#f8f7ff", borderRadius: 12, padding: "12px 16px", borderLeft: `3px solid ${BRAND}` }}>
                      <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>
                        🕐 {new Date(n.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(localLead.notes || []).length > 0 && (
                <button onClick={save}
                  style={{ width: "100%", marginTop: 16, padding: 12, borderRadius: 12, background: `linear-gradient(135deg,${BRAND},#A78BFA)`, color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  💾 Save Notes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}