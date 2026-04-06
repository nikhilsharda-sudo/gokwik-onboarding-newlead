"use client";
import { useState, useEffect } from "react";
import { Lead, isHighValue, isStale, isDuplicate } from "@/lib/leads";

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

function parseIndianNumber(val: string): number {
  if (!val) return 0;
  const v = val.toLowerCase().replace(/[₹,\s]/g, "");
  if (v.includes("crore") || v.includes("cr")) return parseFloat(v) * 10000000;
  if (v.includes("lakh") || v.includes("lac") || v.includes("l")) return parseFloat(v) * 100000;
  return parseFloat(v) || 0;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <mark key={i} style={{ background: "#FFE066", borderRadius: 2, padding: "0 1px" }}>{p}</mark>
          : p
      )}
    </>
  );
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 70 ? GREEN : score >= 40 ? YELLOW : ACCENT;
  return (
    <span style={{ background: `${color}18`, color, fontWeight: 700, fontSize: 12, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {score}pts
    </span>
  );
}

export default function LeadTable({
  leads, onSelect, onBulkUpdate,
}: {
  leads: Lead[];
  onSelect: (l: Lead) => void;
  onBulkUpdate: (ids: string[], status: string) => void;
}) {
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState<string[]>([]);
  const [sourceFilter,  setSourceFilter]  = useState("All");
  const [priorityFilter,setPriorityFilter]= useState("All");
  const [legalFilter,   setLegalFilter]   = useState("All");
  const [sortBy,        setSortBy]        = useState("newest");
  const [gmvMin,        setGmvMin]        = useState("");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [compact,       setCompact]       = useState(false);
  const [selected,      setSelected]      = useState<string[]>([]);
  const [bulkStatus,    setBulkStatus]    = useState("Contacted");
  const [showFilters,   setShowFilters]   = useState(false);

  // Auto-refresh every 20 seconds
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setLastRefresh(Date.now()), 20000);
    return () => clearInterval(t);
  }, []);

  const toggleStatus = (s: string) =>
    setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const filtered = leads
    .filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        l.brand_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.referral.toLowerCase().includes(q) ||
        l.mobile.includes(q);
      const matchStatus   = statusFilter.length === 0 || statusFilter.includes(l.status);
      const matchSource   = sourceFilter === "All" || l.referral.startsWith(sourceFilter);
      const matchPriority = priorityFilter === "All" || l.priority === priorityFilter;
      const matchLegal    = legalFilter === "All" || l.legal_structure === legalFilter;
      const matchGmv      = !gmvMin || parseIndianNumber(l.gmv) >= parseIndianNumber(gmvMin);
      const matchFrom     = !dateFrom || new Date(l.submitted_at) >= new Date(dateFrom);
      const matchTo       = !dateTo   || new Date(l.submitted_at) <= new Date(dateTo + "T23:59:59");
      return matchSearch && matchStatus && matchSource && matchPriority && matchLegal && matchGmv && matchFrom && matchTo;
    })
    .sort((a, b) => {
      if (sortBy === "newest")   return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      if (sortBy === "oldest")   return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
      if (sortBy === "score")    return (b.score || 0) - (a.score || 0);
      if (sortBy === "gmv")      return parseIndianNumber(b.gmv) - parseIndianNumber(a.gmv);
      return 0;
    });

  const exportFilteredCSV = () => {
    const headers = ["Brand","Website","Email","Mobile","GMV","Avg Orders","AOV","COD%","Prepaid%","Legal","Referral","Status","Priority","Score","Submitted"];
    const rows = filtered.map(l => [
      l.brand_name, l.website, l.email, l.mobile, l.gmv,
      l.avg_orders, l.aov, l.cod_percent, l.prepaid_percent,
      l.legal_structure, l.referral, l.status, l.priority || "",
      l.score || 0, new Date(l.submitted_at).toLocaleString("en-IN"),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `gokwik_leads_filtered_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const selectAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(l => l.id));

  const activeFilterCount = [
    statusFilter.length > 0, sourceFilter !== "All", priorityFilter !== "All",
    legalFilter !== "All", !!gmvMin, !!dateFrom, !!dateTo,
  ].filter(Boolean).length;

  return (
    <div>
      {/* Search + toolbar */}
      <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", marginBottom: 10, boxShadow: "0 2px 12px rgba(108,59,255,0.06)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search brand, email, mobile, referral..."
            style={{ flex: "1 1 220px", padding: "9px 14px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 13 }} />

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 13, background: "white", cursor: "pointer" }}>
            <option value="newest">🕐 Newest First</option>
            <option value="oldest">🕐 Oldest First</option>
            <option value="score">⭐ Highest Score</option>
            <option value="gmv">💰 Highest GMV</option>
          </select>

          <button onClick={() => setShowFilters(f => !f)}
            style={{ padding: "9px 14px", borderRadius: 10, border: `2px solid ${activeFilterCount > 0 ? BRAND : "#e0e0e0"}`, background: activeFilterCount > 0 ? "#EEF2FF" : "white", color: activeFilterCount > 0 ? BRAND : "#888", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            🎛 Filters {activeFilterCount > 0 && <span style={{ background: BRAND, color: "white", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{activeFilterCount}</span>}
          </button>

          <button onClick={() => setCompact(c => !c)}
            style={{ padding: "9px 14px", borderRadius: 10, border: "2px solid #e0e0e0", background: "white", color: "#888", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            {compact ? "⬜ Expanded" : "▤ Compact"}
          </button>

          <button onClick={exportFilteredCSV}
            style={{ padding: "9px 14px", borderRadius: 10, background: `linear-gradient(135deg,${BRAND},#A78BFA)`, color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            ⬇ Export ({filtered.length})
          </button>

          <span style={{ fontSize: 12, color: "#aaa" }}>{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0", display: "flex", flexWrap: "wrap", gap: 12 }}>
            {/* Multi-status */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>Status</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["New","Contacted","Qualified","Rejected"].map(s => (
                  <button key={s} onClick={() => toggleStatus(s)}
                    style={{ padding: "5px 12px", borderRadius: 20, border: `2px solid ${statusFilter.includes(s) ? STATUS_COLORS[s].dot : "#e0e0e0"}`, background: statusFilter.includes(s) ? STATUS_COLORS[s].bg : "white", color: statusFilter.includes(s) ? STATUS_COLORS[s].text : "#888", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Source */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>Source</div>
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                style={{ padding: "7px 10px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 12, background: "white" }}>
                <option value="All">All Sources</option>
                <option value="Agency">Agency</option>
                <option value="GoKwik">GoKwik Employee</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>Priority</div>
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                style={{ padding: "7px 10px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 12, background: "white" }}>
                <option value="All">All Priorities</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>

            {/* Legal Structure */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>Legal Structure</div>
              <select value={legalFilter} onChange={e => setLegalFilter(e.target.value)}
                style={{ padding: "7px 10px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 12, background: "white" }}>
                <option value="All">All</option>
                <option value="Proprietorship">Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="LLP">LLP</option>
                <option value="Private Limited Company">Pvt Ltd</option>
              </select>
            </div>

            {/* GMV min */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>Min GMV</div>
              <input value={gmvMin} onChange={e => setGmvMin(e.target.value)}
                placeholder="e.g. 50 Lakhs"
                style={{ padding: "7px 10px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 12, width: 110 }} />
            </div>

            {/* Date range */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>Date Range</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  style={{ padding: "7px 10px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 12 }} />
                <span style={{ color: "#aaa", fontSize: 12 }}>to</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  style={{ padding: "7px 10px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 12 }} />
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button onClick={() => { setStatusFilter([]); setSourceFilter("All"); setPriorityFilter("All"); setLegalFilter("All"); setGmvMin(""); setDateFrom(""); setDateTo(""); }}
                  style={{ padding: "7px 14px", borderRadius: 10, background: "#FEF2F2", color: ACCENT, border: `1px solid ${ACCENT}`, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  ✕ Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div style={{ background: "#EEF2FF", borderRadius: 12, padding: "10px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: BRAND }}>{selected.length} lead{selected.length > 1 ? "s" : ""} selected</span>
          <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: `2px solid ${BRAND}`, fontSize: 13, color: BRAND, fontWeight: 600, background: "white" }}>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Rejected</option>
            <option>New</option>
          </select>
          <button onClick={() => { onBulkUpdate(selected, bulkStatus); setSelected([]); }}
            style={{ padding: "6px 16px", borderRadius: 8, background: BRAND, color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Apply to All
          </button>
          <button onClick={() => setSelected([])}
            style={{ padding: "6px 12px", borderRadius: 8, background: "white", color: "#888", border: "1px solid #e0e0e0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Deselect
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(108,59,255,0.06)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr style={{ background: "#f8f7ff" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", width: 36 }}>
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={selectAll} style={{ cursor: "pointer", width: 15, height: 15 }} />
                </th>
                {["Brand", "GMV", "Score", "Orders/Day", "COD%", "Source", "Priority", "Status", "Date", ""].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: "center", padding: 48, color: "#ccc", fontSize: 14 }}>No leads match your filters 🔍</td></tr>
              ) : filtered.map((l, i) => {
                const stale  = isStale(l);
                const highV  = isHighValue(l);
                const dup    = isDuplicate(l, leads);
                const rowBg  = stale ? "#FFF8F8" : i % 2 === 0 ? "white" : "#fdfcff";

                return (
                  <tr key={l.id}
                    style={{ borderTop: "1px solid #f0f0f0", background: rowBg, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f3f0ff")}
                    onMouseLeave={e => (e.currentTarget.style.background = rowBg)}>

                    <td style={{ padding: compact ? "8px 14px" : "14px 14px" }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggleSelect(l.id)}
                        style={{ cursor: "pointer", width: 15, height: 15 }} />
                    </td>

                    <td style={{ padding: compact ? "8px 14px" : "14px 14px" }} onClick={() => onSelect(l)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                            {highlight(l.brand_name, search)}
                            {highV && <span title="High Value">🔥</span>}
                            {dup   && <span title="Duplicate" style={{ fontSize: 10, background: YELLOW, color: "#000", padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>DUP</span>}
                            {stale && <span title="Stale" style={{ fontSize: 10, background: "#FEF2F2", color: ACCENT, padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>STALE</span>}
                          </div>
                          {!compact && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{highlight(l.email, search)}</div>}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: compact ? "8px 14px" : "14px 14px", fontSize: 13, fontWeight: 700, color: "#1a1a2e", whiteSpace: "nowrap" }} onClick={() => onSelect(l)}>{l.gmv || "—"}</td>
                    <td style={{ padding: compact ? "8px 14px" : "14px 14px" }} onClick={() => onSelect(l)}><ScorePill score={l.score || 0} /></td>
                    <td style={{ padding: compact ? "8px 14px" : "14px 14px", fontSize: 13, color: "#555" }} onClick={() => onSelect(l)}>{l.avg_orders}</td>
                    <td style={{ padding: compact ? "8px 14px" : "14px 14px", fontSize: 13, color: "#555" }} onClick={() => onSelect(l)}>{l.cod_percent}</td>

                    <td style={{ padding: compact ? "8px 14px" : "14px 14px" }} onClick={() => onSelect(l)}>
                      <span style={{ background: "#EEF2FF", color: BRAND, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {highlight(l.referral.split(":")[0], search)}
                      </span>
                    </td>

                    <td style={{ padding: compact ? "8px 14px" : "14px 14px" }} onClick={() => onSelect(l)}>
                      {l.priority ? (
                        <span style={{ background: PRIORITY_COLORS[l.priority]?.bg, color: PRIORITY_COLORS[l.priority]?.text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{l.priority}</span>
                      ) : <span style={{ color: "#ddd", fontSize: 12 }}>—</span>}
                    </td>

                    <td style={{ padding: compact ? "8px 14px" : "14px 14px" }} onClick={() => onSelect(l)}>
                      <span style={{ background: STATUS_COLORS[l.status]?.bg, color: STATUS_COLORS[l.status]?.text, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_COLORS[l.status]?.dot }} />
                        {l.status}
                      </span>
                    </td>

                    <td style={{ padding: compact ? "8px 14px" : "14px 14px", fontSize: 11, color: "#aaa", whiteSpace: "nowrap" }} onClick={() => onSelect(l)}>
                      {new Date(l.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>

                    <td style={{ padding: compact ? "8px 14px" : "14px 14px" }}>
                      <button onClick={() => onSelect(l)}
                        style={{ padding: "5px 12px", borderRadius: 20, background: `linear-gradient(135deg,${BRAND},#A78BFA)`, color: "white", border: "none", fontWeight: 600, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                        View →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 16px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#ccc" }}>Auto-refreshes every 20s · Last refresh: {new Date(lastRefresh).toLocaleTimeString("en-IN")}</span>
          <span style={{ fontSize: 11, color: "#ccc" }}>✦ Crafted & Built by <span style={{ color: BRAND, fontWeight: 600 }}>Nikhil Sharda</span></span>
        </div>
      </div>
    </div>
  );
}