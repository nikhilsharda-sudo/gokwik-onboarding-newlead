"use client";
import { useState, useEffect, useRef } from "react";

const BRAND = "#6C3BFF";
const ACCENT = "#FF6B6B";
const GREEN = "#00C48C";

const questions = [
  { id: "brand_name", text: "Hey there! 👋 Welcome to **GoKwik's Merchant Onboarding**. Let's get started!\n\nWhat's your **Brand Name**?", placeholder: "e.g. Bombay Shirt Company", type: "text" },
  { id: "website", text: "Love it! 🚀 What's your **Website URL**?", placeholder: "e.g. https://www.yourbrand.com", type: "text" },
  { id: "email", text: "What's your **Email Address**?", placeholder: "e.g. founder@yourbrand.com", type: "email" },
  { id: "mobile", text: "Your **Mobile Number**? (with country code)", placeholder: "e.g. +91 98765 43210", type: "tel" },
  { id: "gmv", text: "What's your **GMV per month**? 💰\n_GMV = total value of all orders processed through your store in a month._", placeholder: "e.g. ₹50 Lakhs", type: "text" },
  { id: "avg_orders", text: "How many **Average Orders per day** does your store get?", placeholder: "e.g. 200 orders/day", type: "text" },
  { id: "aov", text: "What's your **AOV** (Average Order Value)?\n_AOV = Total Revenue ÷ Number of Orders — the average amount spent per order._", placeholder: "e.g. ₹1,200", type: "text" },
  { id: "cod_percent", text: "What % of your orders are **Cash on Delivery (COD)**?", placeholder: "e.g. 65%", type: "text" },
  { id: "prepaid_percent", text: "And what % are **Prepaid** orders?", placeholder: "e.g. 35%", type: "text" },
  { id: "legal_structure", text: "What's your **Legal Structure**? Pick one 👇", type: "choice", options: ["Proprietorship", "Partnership", "LLP", "Private Limited Company"] },
  { id: "referral", text: "Last one! 🎉 How did you hear about us?", type: "referral" },
];

const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "12px 16px" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND, animation: `bounce 1s infinite ${i * 0.2}s`, display: "inline-block" }} />
    ))}
  </div>
);

const Bubble = ({ msg, isBot }: { msg: string; isBot: boolean }) => (
  <div style={{ display: "flex", flexDirection: isBot ? "row" : "row-reverse", alignItems: "flex-end", gap: 8, marginBottom: 12, animation: "fadeUp 0.3s ease" }}>
    {isBot && (
      <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${BRAND}, #A78BFA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
    )}
    <div style={{ maxWidth: "75%", background: isBot ? "white" : `linear-gradient(135deg, ${BRAND}, #A78BFA)`, color: isBot ? "#1a1a2e" : "white", borderRadius: isBot ? "18px 18px 18px 4px" : "18px 18px 4px 18px", padding: "10px 14px", fontSize: 14, lineHeight: 1.6, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
      {msg.split("\n").map((line, i) => {
        const b = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
        const it = b.replace(/_(.*?)_/g, (_, t) => `<em style="color:#A78BFA;font-size:12px">${t}</em>`);
        return <p key={i} style={{ margin: "2px 0" }} dangerouslySetInnerHTML={{ __html: it }} />;
      })}
    </div>
  </div>
);

const Summary = ({ data }: { data: Record<string, string> }) => {
  const labels: Record<string, string> = {
    brand_name: "Brand Name", website: "Website", email: "Email", mobile: "Mobile",
    gmv: "GMV / Month", avg_orders: "Avg Orders / Day", aov: "AOV",
    cod_percent: "COD %", prepaid_percent: "Prepaid %", legal_structure: "Legal Structure", referral: "Lead Referral",
  };
  return (
    <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 24px rgba(108,59,255,0.12)", margin: "8px 0", animation: "fadeUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🎉</span>
        <span style={{ fontWeight: 700, color: BRAND, fontSize: 15 }}>Your Lead Summary</span>
      </div>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
          <span style={{ color: "#888", fontWeight: 500 }}>{labels[k]}</span>
          <span style={{ color: "#1a1a2e", fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{v}</span>
        </div>
      ))}
      <div style={{ marginTop: 14, background: `${GREEN}22`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <span>✅</span>
        <span style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>Sending your details to the GoKwik team...</span>
      </div>
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; text?: string; data?: Record<string, string> }[]>([]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [data, setData] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [referralType, setReferralType] = useState<string | null>(null);
  const [referralName, setReferralName] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const addBot = (text: string, delay = 800) =>
    new Promise<void>(res => {
      setTyping(true);
      setTimeout(() => { setTyping(false); setMessages(m => [...m, { role: "bot", text }]); res(); }, delay);
    });

  useEffect(() => {
    addBot("Hey there! 👋 I'm **GoKwik's Onboarding Bot**. I'll help you submit your brand details in just a few minutes. Let's go! 🚀", 600)
      .then(() => addBot(questions[0].text, 500));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const handleUserMsg = async (val: string) => {
    setMessages(m => [...m, { role: "user", text: val }]);
    const q = questions[step];
    const newData = { ...data, [q.id]: val };
    setData(newData);
    const next = step + 1;
    setStep(next);
    if (next < questions.length) {
      await addBot(questions[next].text, 700);
    } else {
      await addBot("Awesome! 🎊 Here's a summary of everything you've shared:", 700);
      setMessages(m => [...m, { role: "summary", data: newData }]);
      try {
        await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });
      } catch (_) {}
      setDone(true);
      await addBot("All done! ✅ The GoKwik team will reach out to you soon. You're going to love what we do for your brand! 🛒💜", 900);
    }
  };

  const handleSubmit = () => { if (!input.trim()) return; handleUserMsg(input.trim()); setInput(""); };
  const q = step < questions.length ? questions[step] : null;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: 16 }}>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        input:focus { outline: none !important; border-color: ${BRAND} !important; }
        button { transition: all 0.2s; }
        button:hover { opacity: 0.88; transform: scale(1.02); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 4px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 500 }}>
        <div style={{ background: `linear-gradient(135deg, ${BRAND}, #A78BFA)`, borderRadius: "20px 20px 0 0", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>GoKwik Onboarding Bot</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>🟢 Online · Takes ~3 mins</div>
          </div>
          <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 12px", color: "white", fontSize: 12, whiteSpace: "nowrap" }}>
            {Math.min(step, questions.length)}/{questions.length} ✦
          </div>
        </div>

        <div style={{ height: 4, background: "rgba(108,59,255,0.15)" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${GREEN}, #00F5A0)`, width: `${(Math.min(step, questions.length) / questions.length) * 100}%`, transition: "width 0.5s ease" }} />
        </div>

        <div style={{ background: "#f8f7ff", padding: 16, height: 420, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {messages.map((m, i) =>
            m.role === "summary" ? <Summary key={i} data={m.data!} /> : <Bubble key={i} msg={m.text!} isBot={m.role === "bot"} />
          )}
          {typing && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND}, #A78BFA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
              <div style={{ background: "white", borderRadius: "18px 18px 18px 4px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}><TypingDots /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ background: "white", borderRadius: "0 0 20px 20px", padding: 12, borderTop: "1px solid #eee" }}>
          {!done && q?.type === "choice" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {q.options!.map(opt => (
                <button key={opt} onClick={() => handleUserMsg(opt)} style={{ padding: "8px 14px", borderRadius: 20, border: `2px solid ${BRAND}`, background: "white", color: BRAND, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>{opt}</button>
              ))}
            </div>
          )}
          {!done && q?.type === "referral" && !referralType && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Agency", "GoKwik Employee", "Other"].map(opt => (
                <button key={opt} onClick={() => setReferralType(opt)} style={{ padding: "8px 14px", borderRadius: 20, border: `2px solid ${ACCENT}`, background: "white", color: ACCENT, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>{opt}</button>
              ))}
            </div>
          )}
          {!done && q?.type === "referral" && referralType && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 13, color: "#888" }}>{referralType === "Other" ? "Who referred you?" : `Enter the ${referralType} name:`}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={referralName} onChange={e => setReferralName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && referralName.trim()) { handleUserMsg(`${referralType}: ${referralName.trim()}`); setReferralType(null); setReferralName(""); } }}
                  placeholder="Enter name..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 14 }} autoFocus />
                <button onClick={() => { if (referralName.trim()) { handleUserMsg(`${referralType}: ${referralName.trim()}`); setReferralType(null); setReferralName(""); } }}
                  style={{ background: `linear-gradient(135deg, ${BRAND}, #A78BFA)`, color: "white", border: "none", borderRadius: 10, padding: "0 16px", cursor: "pointer", fontWeight: 700, fontSize: 18 }}>→</button>
              </div>
            </div>
          )}
          {!done && q && q.type !== "choice" && q.type !== "referral" && (
            <div style={{ display: "flex", gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={q.placeholder} type={q.type}
                style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14 }} autoFocus />
              <button onClick={handleSubmit} style={{ background: `linear-gradient(135deg, ${BRAND}, #A78BFA)`, color: "white", border: "none", borderRadius: 12, width: 44, height: 44, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>→</button>
            </div>
          )}
          {done && <div style={{ textAlign: "center", padding: "8px 0", color: GREEN, fontWeight: 700, fontSize: 14 }}>🎉 Submission complete! GoKwik team will reach out soon.</div>}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
          ✦ Crafted & Built by <span style={{ color: "#A78BFA", fontWeight: 600 }}>Nikhil Sharda</span>
        </div>
      </div>
    </main>
  );
}