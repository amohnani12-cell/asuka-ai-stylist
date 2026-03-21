"use client";
import { useState } from "react";

const B = "#8B654D", BL = "rgba(139,101,77,0.12)", CR = "#F5F0E8", CD = "#EDE6DA", CK = "#E5DCCD", TD = "#3A2A1D", TM = "rgba(139,101,77,0.7)", TL = "rgba(139,101,77,0.45)", W = "#FFFDF9";

const DESIGN_PROMPTS = [
  "Black kurta bundi for a Kashmir cocktail",
  "Ivory sherwani with gold dori work for baraat",
  "Modern bandhgala for a Goa sangeet",
];

const FORM_FIELDS = [
  { id: "occasion", label: "Occasion", type: "select", options: ["Wedding", "Sangeet / Mehendi", "Cocktail / Reception", "Festive / Puja", "Formal Event", "Casual Outing"] },
  { id: "garment", label: "Garment Type", type: "select", options: ["Sherwani", "Kurta Bundi Set", "Kurta Set", "Bandhgala", "Tuxedo", "Suit Set", "Co-ord Set", "Indo-Western", "Surprise Me"] },
  { id: "color", label: "Color Palette", type: "text", placeholder: "e.g. Deep Black, Ivory, Dusty Rose, Navy..." },
  { id: "fabric", label: "Fabric Preference", type: "select", options: ["Silk", "Linen", "Velvet", "Brocade", "Cotton", "Wool", "No Preference"] },
  { id: "embroidery", label: "Embroidery / Detailing", type: "select", options: ["Dori Work", "Zardozi", "Thread Embroidery", "Mirror Work", "Minimal / Clean", "Heavy Embellishment", "No Preference"] },
  { id: "details", label: "Additional Details", type: "textarea", placeholder: "Weather, personal style, budget, references..." },
];

export default function StudioPage() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const updateForm = (id, val) => setFormData(p => ({ ...p, [id]: val }));

  const handleFormSubmit = async () => {
    if (!formData.occasion || !formData.garment) return;
    setLoading(true);
    try {
      const prompt = `${formData.color || "elegant"} ${formData.fabric || ""} ${formData.garment} for ${formData.occasion}, ${formData.embroidery || ""} detailing, ${formData.details || ""}`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", text: `Design a ${prompt}` }],
          mode: "design",
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const inp = { width: "100%", padding: "11px 14px", background: CR, border: `1px solid ${CK}`, borderRadius: "10px", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: TD };

  return (
    <div style={{ minHeight: "100vh", background: CR, fontFamily: "'Outfit', sans-serif" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: `1px solid ${CK}`, background: W, position: "sticky", top: 0, zIndex: 100 }}>
        <a href="https://asukacouture.com" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "32px", height: "32px", border: `1.5px solid ${B}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "15px", color: B, fontWeight: 600 }}>A</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "12.5px", letterSpacing: "4px", textTransform: "uppercase", color: B, fontWeight: 600 }}>Asuka</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "9px", background: B, color: CR, padding: "2.5px 7px", borderRadius: "4px", fontWeight: 700, letterSpacing: "1px" }}>AI</span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: TD }}>Design Studio</span>
        </div>
        <a href="https://asukacouture.com" style={{ fontSize: "12px", color: B, fontWeight: 500, textDecoration: "none" }}>← Back to Store</a>
      </nav>

      <div style={{ padding: "56px 36px 100px", maxWidth: "920px", margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: B, fontWeight: 600, marginBottom: "12px" }}>✦ AI Design Studio</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 400, color: TD, lineHeight: 1.15, margin: "0 0 10px" }}>
            Imagine it. <span style={{ fontStyle: "italic", color: B }}>Asuka creates it.</span>
          </h1>
          <p style={{ fontSize: "14px", color: TM, maxWidth: "480px", margin: "0 auto", lineHeight: 1.7, fontWeight: 300 }}>
            Describe your dream outfit or fill a quick brief — our AI creates a photorealistic concept, our karigars bring it to life.
          </p>
        </div>

        {/* Two Paths */}
        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", marginBottom: "36px" }}>
          {/* Chat Path */}
          <div style={{ flex: "1 1 280px", background: W, border: `1px solid ${CK}`, borderRadius: "16px", padding: "28px 24px", boxShadow: "0 2px 14px rgba(139,101,77,0.05)" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>💬</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: TD, fontWeight: 400, marginBottom: "8px" }}>Chat Your Vision</h3>
            <p style={{ fontSize: "12.5px", color: TM, lineHeight: 1.7, fontWeight: 300, marginBottom: "18px" }}>
              Tell the AI Stylist naturally what you want — occasion, colors, vibe — and it creates a design with AI-generated visuals.
            </p>
            {DESIGN_PROMPTS.map(p => (
              <div key={p} style={{ background: CR, border: `1px solid ${CK}`, borderRadius: "10px", padding: "11px 14px", marginBottom: "7px", fontSize: "12px", color: TD, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <span style={{ color: B }}>✦</span> {p}
              </div>
            ))}
            <a href="https://asukacouture.com" style={{ display: "block", marginTop: "14px", width: "100%", background: B, color: CR, border: "none", borderRadius: "10px", padding: "12px", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.5px", textAlign: "center", textDecoration: "none" }}>
              Start Designing on Site →
            </a>
          </div>

          {/* Form Path */}
          <div style={{ flex: "1 1 280px", background: W, border: `1px solid ${CK}`, borderRadius: "16px", padding: "28px 24px", boxShadow: "0 2px 14px rgba(139,101,77,0.05)" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>📋</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: TD, fontWeight: 400, marginBottom: "8px" }}>Design Brief Form</h3>
            <p style={{ fontSize: "12.5px", color: TM, lineHeight: 1.7, fontWeight: 300, marginBottom: "18px" }}>
              Pick occasion, garment, fabric, and color — the AI builds a photorealistic concept from your brief.
            </p>
            {FORM_FIELDS.map(f => (
              <div key={f.id} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10.5px", fontWeight: 600, color: TD, letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>{f.label}</label>
                {f.type === "select" ? (
                  <select value={formData[f.id] || ""} onChange={e => updateForm(f.id, e.target.value)} style={{ ...inp, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B654D' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                    <option value="">Select...</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea value={formData[f.id] || ""} onChange={e => updateForm(f.id, e.target.value)} placeholder={f.placeholder} rows={2} style={{ ...inp, resize: "vertical" }} />
                ) : (
                  <input type="text" value={formData[f.id] || ""} onChange={e => updateForm(f.id, e.target.value)} placeholder={f.placeholder} style={inp} />
                )}
              </div>
            ))}
            <button onClick={handleFormSubmit} disabled={loading} style={{ marginTop: "6px", width: "100%", background: loading ? TM : "none", color: loading ? CR : B, border: loading ? "none" : `1.5px solid ${B}`, borderRadius: "10px", padding: "12px", fontSize: "12.5px", fontWeight: 600, cursor: loading ? "wait" : "pointer", letterSpacing: "0.5px" }}>
              {loading ? "Generating Design..." : "Generate Design ✦"}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: W, border: `1px solid ${CK}`, borderRadius: "16px", overflow: "hidden", marginBottom: "36px", boxShadow: "0 2px 14px rgba(139,101,77,0.05)" }}>
            {result.design?.image_url && (
              <div style={{ position: "relative" }}>
                <img src={result.design.image_url} alt="AI Generated Design" style={{ width: "100%", maxHeight: "500px", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(14,13,11,0.7))", padding: "20px", textAlign: "center" }}>
                  <span style={{ fontSize: "10px", color: CR, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>✦ AI Generated Design</span>
                </div>
              </div>
            )}
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: "14px", color: TD, lineHeight: 1.7, marginBottom: "16px" }}>{result.reply}</p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a href="https://asukacouture.com/pages/book-an-appointment" target="_blank" style={{ flex: "1 1 200px", background: B, color: CR, border: "none", borderRadius: "10px", padding: "13px", fontSize: "13px", fontWeight: 600, cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
                  Book Consultation at Store
                </a>
                <button onClick={() => setResult(null)} style={{ flex: "1 1 200px", background: "none", color: B, border: `1.5px solid ${B}`, borderRadius: "10px", padding: "13px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  Create Another Design
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div style={{ background: W, border: `1px solid ${CK}`, borderRadius: "16px", overflow: "hidden", display: "flex", flexWrap: "wrap", boxShadow: "0 2px 14px rgba(139,101,77,0.05)" }}>
          <div style={{ flex: "1 1 280px", padding: "32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "18px", height: "1px", background: B }} />
              <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: TL, fontWeight: 600 }}>How It Works</span>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 400, color: TD, marginBottom: "16px", lineHeight: 1.25 }}>
              From idea to <span style={{ fontStyle: "italic", color: B }}>couture</span>
            </h3>
            {["Describe your vision or fill the brief", "AI generates a photorealistic design concept", "Our karigars craft it to perfection"].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: B, fontWeight: 600, minWidth: "24px" }}>0{i + 1}</span>
                <span style={{ fontSize: "12.5px", color: TD }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: "1 1 300px", minHeight: "220px", background: `linear-gradient(135deg, ${CD}, rgba(139,101,77,0.08))`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${CK}`, cursor: "pointer" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(139,101,77,0.1)", border: "2px solid rgba(139,101,77,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={B}><polygon points="8,5 20,12 8,19" /></svg>
            </div>
            <span style={{ fontSize: "10px", color: TL, marginTop: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500 }}>3 min tutorial</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "20px 36px", borderTop: `1px solid ${CK}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", background: W }}>
        <span style={{ fontSize: "10.5px", color: TL }}>© 2026 Asuka Couture · Rituals of Fine Dressing</span>
        <div style={{ display: "flex", gap: "18px" }}>
          {["Privacy", "Terms", "Book Appointment"].map(t => <span key={t} style={{ fontSize: "10.5px", color: TM, cursor: "pointer" }}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}
