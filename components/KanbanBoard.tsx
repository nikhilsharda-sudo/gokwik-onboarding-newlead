"use client";
import { useState } from "react";
import { Lead, isHighValue, isStale } from "@/lib/leads";

const BRAND  = "#6C3BFF";
const GREEN  = "#00C48C";
const YELLOW = "#FFB800";
const ACCENT = "#FF6B6B";

const COLUMNS = [
  { status: "New",       label: "🆕 New",       color: BRAND,  bg: "#EEF2FF" },
  { status: "Contacted", label: "📞 Contacted",  color: YELLOW, bg: "#FFF7E6" },
  { status: "Qualified", label: "✅ Qualified",  color: GREEN,  bg: "#ECFDF5" },
  { status: "Rejected",  label: "❌ Rejected",   color: ACCENT, bg: "#FEF2F2" },
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High:   { bg: "#FFF1F0", text: "#CF1322" },
  Medium: { bg: "#FFF7E6", text: "#D46B08" },
  Low:    { bg: "#F6FFED", text: "#389E0D" },
};

function LeadCard({
  lead, onSelect, onDragStart,
}: {
  lead: Lead;
  onSelect: (l: Lead) => void;
  onDragStart: (e: React.DragEvent, l: Lead) => void;
}) {
  const highV = isHighValue(lead);
  const stale = isStale(lead);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, lead)}
      onClick={() => onSelect(lead)}
      style={{
        background: "white",
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        cursor: "grab",
        border: stale ? `1px solid ${ACCENT}33` : "1px solid #f0f0f0",
        transition: "box-shadow 0.2s, transform 0.2s",
        userSelect: "none",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(108,59,255,0.15)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Brand + badges */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e", lineHeight: 1.3, flex: 1 }}>
          {lead.brand_name}
          {highV && <span style={{ marginLeft: 4 }}>🔥</span>}
        </div>
        {lead.priority && (
          <span style={{ background: PRIORITY_COLORS[lead.priority]?.bg, color: PRIORITY_COLORS[lead.priority]?.text, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, marginLeft: 6, flexShrink: 0 }}>
            {lead.priority}
          </span>
        )}
      </div>

      {/* Stale warning */}
      {stale && (
        <div style={{ background: "#FEF2F2", color: ACCENT, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, marginBottom: 8, display: "inline-block" }}>
          ⚠️ Stale — needs follow-up
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ background: "#f8f7ff", color: BRAND, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 8 }}>{lead.gmv || "—"}</span>
        <span style={{ background: "#f8f7ff", color: "#555", fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 8 }}>AOV {lead.aov || "—"}</span>
        {lead.score != null && (
          <span style={{ background: lead.score >= 70 ? "#ECFDF5" : lead.score >= 40 ? "#FFF7E6" : "#FEF2F2", color: lead.score >= 70 ? GREEN : lead.score >= 40 ? YELLOW : ACCENT, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8 }}>
            {lead.score}pts
          </span>
        )}
      </div>

      {/* Referral + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#aaa" }}>{lead.referral?.split(":")[0]}</span>
        <span style={{ fontSize: 10, color: "#ccc" }}>
          {new Date(lead.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>

      {/* Notes indicator */}
      {(lead.notes?.length ?? 0) > 0 && (
        <div style={{ marginTop: 8, fontSize: 10, color: "#aaa" }}>
          📝 {lead.notes.length} note{lead.notes.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default function KanbanBoard({
  leads, onSelect, onStatusChange,
}: {
  leads: Lead[];
  onSelect: (l: Lead) => void;
  onStatusChange: (lead: Lead, newStatus: string) => void;
}) {
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<Lead | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDragging(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (dragging && dragging.status !== status) {
      onStatusChange(dragging, status);
    }
    setDragOver(null);
    setDragging(null);
  };

  return (
    <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
      {COLUMNS.map(col => {
        const colLeads = leads.filter(l => l.status === col.status);
        const isDragTarget = dragOver === col.status;

        return (
          <div
            key={col.status}
            onDragOver={e => { e.preventDefault(); setDragOver(col.status); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => handleDrop(e, col.status)}
            style={{
              flex: "0 0 260px",
              minWidth: 240,
              background: isDragTarget ? col.bg : "#f8f7ff",
              borderRadius: 16,
              padding: "14px 12px",
              border: isDragTarget ? `2px dashed ${col.color}` : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {/* Column header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: col.color }}>{col.label}</div>
              <div style={{ background: col.bg, color: col.color, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, border: `1px solid ${col.color}33` }}>
                {colLeads.length}
              </div>
            </div>

            {/* Drop hint */}
            {isDragTarget && dragging && dragging.status !== col.status && (
              <div style={{ background: col.bg, border: `2px dashed ${col.color}`, borderRadius: 12, padding: "16px", textAlign: "center", color: col.color, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                Drop to move here
              </div>
            )}

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {colLeads.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#ccc", fontSize: 12 }}>
                  No leads here
                </div>
              ) : (
                colLeads.map(l => (
                  <LeadCard
                    key={l.id}
                    lead={l}
                    onSelect={onSelect}
                    onDragStart={handleDragStart}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}