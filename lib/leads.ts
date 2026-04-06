import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

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
  notes: string;
  submitted_at: string;
}

export async function saveLeadKV(lead: Lead) {
  await redis.lpush("leads", JSON.stringify(lead));
}

export async function getAllLeads(): Promise<Lead[]> {
  const raw = await redis.lrange("leads", 0, -1);
  return raw.map((r) =>
    typeof r === "string" ? JSON.parse(r) : r
  ) as Lead[];
}

export async function updateLeadKV(updated: Lead) {
  const all = await getAllLeads();
  const newAll = all.map((l) => (l.id === updated.id ? updated : l));
  await redis.del("leads");
  for (const l of newAll.reverse()) {
    await redis.lpush("leads", JSON.stringify(l));
  }
}