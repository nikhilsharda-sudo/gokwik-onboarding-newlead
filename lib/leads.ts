import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export interface TimelineEvent {
  timestamp: string;
  action: string;
  detail: string;
}

export interface Note {
  id: string;
  text: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  brand_name: string;
  website: string;
  email: string;
  mobile: string;
  gmv: string;
  avg_orders: string;
  aov: string;
  cod_percent: string;
  prepaid_percent: string;
  legal_structure: string;
  referral: string;
  status: "New" | "Contacted" | "Qualified" | "Rejected";
  priority: "High" | "Medium" | "Low" | "";
  notes: Note[];
  timeline: TimelineEvent[];
  score: number;
  submitted_at: string;
  last_updated: string;
}

// ── Score Calculation ──────────────────────────────────────────
// Parses Indian number formats like ₹50 Lakhs, ₹2 Crores, 1000000
function parseIndianNumber(val: string): number {
  if (!val) return 0;
  const v = val.toLowerCase().replace(/[₹,\s]/g, "");
  if (v.includes("crore") || v.includes("cr"))
    return parseFloat(v) * 10000000;
  if (v.includes("lakh") || v.includes("lac") || v.includes("l"))
    return parseFloat(v) * 100000;
  return parseFloat(v) || 0;
}

export function calculateScore(lead: Partial<Lead>): number {
  let score = 0;

  // GMV score (max 40 pts)
  const gmv = parseIndianNumber(lead.gmv || "");
  if (gmv >= 10000000) score += 40;       // ₹1 Crore+
  else if (gmv >= 5000000) score += 30;   // ₹50 Lakhs+
  else if (gmv >= 1000000) score += 20;   // ₹10 Lakhs+
  else if (gmv >= 500000)  score += 10;   // ₹5 Lakhs+

  // AOV score (max 20 pts)
  const aov = parseIndianNumber(lead.aov || "");
  if (aov >= 2000) score += 20;
  else if (aov >= 1000) score += 15;
  else if (aov >= 500)  score += 10;
  else if (aov >= 200)  score += 5;

  // Prepaid % score (max 20 pts) — higher prepaid = better
  const prepaid = parseFloat((lead.prepaid_percent || "0").replace("%", ""));
  if (prepaid >= 70) score += 20;
  else if (prepaid >= 50) score += 15;
  else if (prepaid >= 30) score += 10;
  else score += 5;

  // Avg orders score (max 20 pts)
  const orders = parseIndianNumber(lead.avg_orders || "");
  if (orders >= 500) score += 20;
  else if (orders >= 200) score += 15;
  else if (orders >= 100) score += 10;
  else if (orders >= 50)  score += 5;

  return Math.min(score, 100);
}

export function isHighValue(lead: Partial<Lead>): boolean {
  const gmv = parseIndianNumber(lead.gmv || "");
  return gmv >= 10000000; // ₹1 Crore+
}

export function isStale(lead: Lead): boolean {
  const last = new Date(lead.last_updated || lead.submitted_at).getTime();
  const diff = Date.now() - last;
  return diff > 3 * 24 * 60 * 60 * 1000 && lead.status !== "Qualified" && lead.status !== "Rejected";
}

export function isDuplicate(lead: Lead, all: Lead[]): boolean {
  return all.some(
    (l) =>
      l.id !== lead.id &&
      (l.email.toLowerCase() === lead.email.toLowerCase() ||
        l.brand_name.toLowerCase() === lead.brand_name.toLowerCase())
  );
}

// ── KV Operations ──────────────────────────────────────────────
export async function saveLeadKV(lead: Lead) {
  await redis.lpush("leads", JSON.stringify(lead));
}

export async function getAllLeads(): Promise<Lead[]> {
  const raw = await redis.lrange("leads", 0, -1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r)) as Lead[];
}

export async function updateLeadKV(updated: Lead) {
  const all = await getAllLeads();
  const newAll = all.map((l) => (l.id === updated.id ? updated : l));
  await redis.del("leads");
  for (const l of newAll.reverse()) {
    await redis.lpush("leads", JSON.stringify(l));
  }
}