import { useState, useEffect, useRef } from "react";
import RidivoLogo from '../components/RidivoLogo';
import {
  Search,
  Car,
  MapPin,
  Flag,
  Coins,
  ShieldCheck,
  Leaf,
  Zap,
  Handshake,
  Users,
  Star,
  Play,
  Download,
  Calendar
} from "lucide-react";

const colors = {
  dark: "#093C5D",
  mid: "#3B7597",
  light: "#EFF6FF",
  white: "#ffffff",
  gray: "#6B7280",
  lightGray: "#F9FAFB",
};

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${colors.dark} 0%, #0d5280 55%, ${colors.mid} 100%)`,
      display: "flex",
      alignItems: "center",
      paddingTop: "68px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(59,117,151,0.35) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(9,60,93,0.5) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: "40%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 40px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>

        {/* Left */}
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "28px" }}>
            <div style={{ width: "8px", height: "8px", backgroundColor: "#4ADE80", borderRadius: "50%" }} />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: "500", fontFamily: "'DM Sans', sans-serif" }}>Trusted. Affordable. Together.</span>
          </div>

          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(38px, 5vw, 62px)", fontWeight: "800", lineHeight: "1.1", color: "white", marginBottom: "8px" }}>
            Travel Together.
          </h1>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(38px, 5vw, 62px)", fontWeight: "800", lineHeight: "1.1", color: "#7DD3FC", marginBottom: "28px" }}>
            Spend Smarter.
          </h1>

          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "17px", lineHeight: "1.7", maxWidth: "480px", marginBottom: "40px", fontFamily: "'DM Sans', sans-serif" }}>
            Ridivo connects you with verified co-travelers heading the same way. Share rides, split costs fairly, and enjoy safer, smarter journeys across India.
          </p>

          <div style={{ display: "flex", gap: "14px", marginBottom: "48px", flexWrap: "wrap" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: "10px",
              backgroundColor: "white", color: colors.dark,
              border: "none", borderRadius: "12px", padding: "14px 28px",
              fontSize: "15px", fontWeight: "700", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.25s ease",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"; }}
            >
              <Search size={18} strokeWidth={2.5} style={{ color: colors.dark }} />
              Find a Ride
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: "10px",
              backgroundColor: "transparent", color: "white",
              border: "2px solid rgba(255,255,255,0.4)", borderRadius: "12px", padding: "14px 28px",
              fontSize: "15px", fontWeight: "700", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.25s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Car size={18} strokeWidth={2.5} style={{ color: "white" }} />
              Offer a Ride
            </button>
          </div>

          {/* Avatars + Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex" }}>
              {["#F59E0B", "#10B981", "#3B82F6", "#EF4444"].map((c, i) => (
                <div key={i} style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  backgroundColor: c, border: "2px solid rgba(255,255,255,0.5)",
                  marginLeft: i > 0 ? "-10px" : "0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: "700", color: "white",
                }}>
                  {["R", "A", "S", "K"][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: "flex", gap: "2px", marginBottom: "2px" }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FCD34D"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                ))}
              </div>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>4.8/5 from 10K+ happy travelers</span>
            </div>
          </div>
        </div>

        {/* Right — Image + Floating Card */}
        <div style={{ position: "relative", opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s" }}>
          <div style={{
            borderRadius: "24px", overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
            height: "420px", position: "relative",
          }}>
            {imgFailed ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "linear-gradient(135deg, #0d5280, #3B7597)", color: "white" }}>
                <Car size={80} strokeWidth={1.5} />
              </div>
            ) : (
              <img src="/src/assets/hero.jpg" alt="Travel together" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={() => setImgFailed(true)}
              />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(9,60,93,0.3) 0%, transparent 60%)" }} />
          </div>

          {/* Floating Search Card */}
          <div style={{
            position: "absolute", bottom: "-30px", right: "-20px",
            backgroundColor: "white", borderRadius: "20px",
            padding: "20px", width: "260px",
            boxShadow: "0 20px 60px rgba(9,60,93,0.25)",
          }}>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", backgroundColor: colors.lightGray, borderRadius: "10px", marginBottom: "8px" }}>
                <div style={{ width: "8px", height: "8px", backgroundColor: colors.dark, borderRadius: "50%" }} />
                <input value={from} onChange={e => setFrom(e.target.value)} placeholder="From city" style={{ border: "none", background: "transparent", fontSize: "13px", color: "#111", fontFamily: "'DM Sans',sans-serif", outline: "none", width: "100%" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", backgroundColor: colors.lightGray, borderRadius: "10px" }}>
                <div style={{ width: "8px", height: "8px", backgroundColor: "#4ADE80", borderRadius: "2px" }} />
                <input value={to} onChange={e => setTo(e.target.value)} placeholder="To city" style={{ border: "none", background: "transparent", fontSize: "13px", color: "#111", fontFamily: "'DM Sans',sans-serif", outline: "none", width: "100%" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, padding: "8px 10px", backgroundColor: colors.lightGray, border: "none", borderRadius: "10px", fontSize: "12px", fontFamily: "'DM Sans',sans-serif", outline: "none", color: "#374151" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 10px", backgroundColor: colors.lightGray, borderRadius: "10px" }}>
                <Users size={13} style={{ color: colors.gray }} />
                <span style={{ fontSize: "12px", color: "#374151", fontFamily: "'DM Sans',sans-serif" }}>{seats}</span>
              </div>
            </div>
            <button style={{
              width: "100%", padding: "12px", backgroundColor: colors.dark,
              color: "white", border: "none", borderRadius: "12px",
              fontSize: "14px", fontWeight: "700", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0a4d78"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.dark; }}
            >Search Rides →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SEARCH BAR ──────────────────────────────────────────────────────────────
function SearchBar() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{ backgroundColor: "white", padding: "0 40px", position: "relative", zIndex: 10 }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        backgroundColor: "white", borderRadius: "20px",
        padding: "28px 32px",
        boxShadow: "0 8px 40px rgba(9,60,93,0.12)",
        border: "1px solid #e5e7eb",
        transform: inView ? "translateY(-30px)" : "translateY(0)",
        transition: "transform 0.6s ease",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "16px", alignItems: "end",
      }}>
        {[
          { label: "Leaving from", placeholder: "Enter departure city", icon: MapPin },
          { label: "Going to", placeholder: "Enter destination city", icon: Flag },
        ].map((f) => {
          const IconComp = f.icon;
          return (
            <div key={f.label}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: colors.gray, marginBottom: "8px", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", transition: "border-color 0.2s", backgroundColor: "white" }}
                onFocus={(e) => e.currentTarget.style.borderColor = colors.dark}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
              >
                <IconComp size={16} style={{ color: colors.dark }} />
                <input placeholder={f.placeholder} style={{ border: "none", outline: "none", fontSize: "14px", color: "#111", fontFamily: "'DM Sans',sans-serif", width: "100%", background: "transparent" }} />
              </div>
            </div>
          );
        })}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: colors.gray, marginBottom: "8px", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</label>
          <input type="date" style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", fontFamily: "'DM Sans',sans-serif", outline: "none", color: "#111" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: colors.gray, marginBottom: "8px", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>Passengers</label>
          <select style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", fontFamily: "'DM Sans',sans-serif", outline: "none", color: "#111", background: "white" }}>
            {[1, 2, 3, 4].map(n => <option key={n}>{n} Passenger{n > 1 ? "s" : ""}</option>)}
          </select>
        </div>
        <button style={{
          backgroundColor: colors.dark, color: "white", border: "none",
          borderRadius: "12px", padding: "12px 28px", fontSize: "15px",
          fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
          whiteSpace: "nowrap", transition: "all 0.2s ease",
          boxShadow: `0 4px 16px rgba(9,60,93,0.3)`,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0a4d78"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.dark; e.currentTarget.style.transform = "translateY(0)"; }}
        >Search Rides</button>
      </div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────────
function Features() {
  const [ref, inView] = useInView();
  const features = [
    { icon: Coins, title: "Save Money", color: "#10B981", desc: "Share travel costs and save up to 50% on every trip." },
    { icon: ShieldCheck, title: "Verified Profiles", color: "#3B82F6", desc: "All users go through verification for a safe experience." },
    { icon: Leaf, title: "Eco Friendly", color: "#84CC16", desc: "Reduce carbon footprint by sharing rides and reducing traffic." },
    { icon: Zap, title: "Instant Booking", color: "#F59E0B", desc: "Real-time seat availability and instant ride confirmations." },
  ];
  return (
    <section ref={ref} style={{ backgroundColor: "white", padding: "60px 40px 80px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "24px" }}>
        {features.map((f, i) => {
          const IconComp = f.icon;
          return (
            <div key={f.title} style={{
              padding: "28px 24px", borderRadius: "16px", border: "1px solid #f3f4f6",
              backgroundColor: "white", transition: "all 0.3s ease",
              opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)",
              transitionDelay: `${i * 0.1}s`,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(9,60,93,0.1)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#dbeafe"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#f3f4f6"; }}
            >
              <div style={{ width: "48px", height: "48px", backgroundColor: `${f.color}15`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: "16px" }}>
                <IconComp size={22} />
              </div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: "16px", fontWeight: "700", color: colors.dark, marginBottom: "8px" }}>{f.title}</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: colors.gray, lineHeight: "1.6" }}>{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────
function HowItWorks() {
  const [ref, inView] = useInView();
  const steps = [
    { icon: Search, num: "01", title: "Search or Offer", desc: "Find a ride or offer your seats for your next trip." },
    { icon: Handshake, num: "02", title: "Connect", desc: "Choose from verified travelers and confirm your ride." },
    { icon: Coins, num: "03", title: "Share Costs", desc: "Split the travel cost fairly and transparently within the app." },
    { icon: Car, num: "04", title: "Travel Together", desc: "Enjoy your journey safely and comfortably together." },
  ];
  return (
    <section ref={ref} style={{ backgroundColor: colors.lightGray, padding: "100px 40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease" }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: "800", color: colors.dark, marginBottom: "12px" }}>How Ridivo Works</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "17px", color: colors.gray }}>Four simple steps to start your journey</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "32px", position: "relative" }}>
          <div style={{ position: "absolute", top: "40px", left: "12%", right: "12%", height: "2px", background: `linear-gradient(to right, ${colors.dark}, ${colors.mid})`, opacity: 0.2, zIndex: 0 }} />
          {steps.map((s, i) => {
            const IconComp = s.icon;
            return (
              <div key={s.num} style={{
                textAlign: "center", position: "relative", zIndex: 1,
                opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.6s ease ${i * 0.15}s`,
              }}>
                <div style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  backgroundColor: "white", border: `3px solid ${colors.dark}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", color: colors.dark,
                  boxShadow: `0 8px 24px rgba(9,60,93,0.12)`,
                }}>
                  <IconComp size={28} />
                </div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: colors.mid, letterSpacing: "1px", marginBottom: "8px", fontFamily: "'DM Sans',sans-serif" }}>STEP {s.num}</div>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: "17px", fontWeight: "700", color: colors.dark, marginBottom: "10px" }}>{s.title}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: colors.gray, lineHeight: "1.6" }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── STATS ───────────────────────────────────────────────────────────────────
function Stats() {
  const [ref, inView] = useInView();
  const stats = [
    { icon: Users, value: "50K+", label: "Happy Members" },
    { icon: Car, value: "15K+", label: "Rides Shared" },
    { icon: MapPin, value: "1200+", label: "Cities Covered" },
    { icon: Star, value: "4.8/5", label: "User Rating" },
  ];
  return (
    <section ref={ref} style={{ position: "relative", overflow: "hidden" }}>
      <div style={{
        background: `linear-gradient(135deg, ${colors.dark} 0%, #0d5280 50%, ${colors.mid} 100%)`,
        padding: "80px 40px",
        position: "relative",
      }}>
        {/* Background texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "40px", position: "relative", zIndex: 1 }}>
          {stats.map((s, i) => {
            const IconComp = s.icon;
            return (
              <div key={s.label} style={{
                textAlign: "center",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
              }}>
                <div style={{ display: "flex", justifyContent: "center", color: "white", marginBottom: "16px" }}>
                  <IconComp size={36} />
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(32px,4vw,48px)", fontWeight: "800", color: "white", lineHeight: 1, marginBottom: "8px" }}>{s.value}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.65)" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── EARN SECTION ─────────────────────────────────────────────────────────────
function EarnSection() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{ backgroundColor: "white", padding: "100px 40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
        {/* Left visual */}
        <div style={{
          background: `linear-gradient(135deg, #EFF6FF, #DBEAFE)`,
          borderRadius: "28px", padding: "48px 40px",
          position: "relative", overflow: "hidden",
          opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-30px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(59,117,151,0.15), transparent)", borderRadius: "50%" }} />
          <div style={{ color: colors.dark, marginBottom: "16px" }}>
            <Car size={48} strokeWidth={1.5} />
          </div>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 8px 24px rgba(9,60,93,0.1)", marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: colors.gray, fontFamily: "'DM Sans',sans-serif", marginBottom: "6px" }}>This Month's Earnings</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "36px", fontWeight: "800", color: colors.dark }}>₹24,680</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
              <span style={{ color: "#10B981", fontSize: "13px", fontWeight: "600" }}>↑ 18% vs last month</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "60px" }}>
                <div style={{ width: "100%", height: `${h}%`, backgroundColor: colors.dark, borderRadius: "4px", opacity: 0.7 + i * 0.04 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right text */}
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(30px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#EFF6FF", borderRadius: "100px", padding: "6px 16px", marginBottom: "24px" }}>
            <Car size={14} style={{ color: colors.mid }} />
            <span style={{ fontSize: "13px", fontWeight: "600", color: colors.mid, fontFamily: "'DM Sans',sans-serif" }}>Drive & Earn</span>
          </div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: "800", color: colors.dark, lineHeight: "1.15", marginBottom: "8px" }}>Got Empty Seats?</h2>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: "800", color: colors.mid, lineHeight: "1.15", marginBottom: "24px" }}>Earn While You Travel.</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "17px", color: colors.gray, lineHeight: "1.7", marginBottom: "36px" }}>
            Offer your ride, fill your seats, and split the travel cost fairly while helping others travel affordably across India.
          </p>
          <button style={{
            display: "flex", alignItems: "center", gap: "10px",
            backgroundColor: colors.dark, color: "white",
            border: "none", borderRadius: "12px", padding: "14px 28px",
            fontSize: "15px", fontWeight: "700", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", transition: "all 0.25s ease",
            boxShadow: `0 4px 20px rgba(9, 60, 93, 0.25)`,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(9, 60, 93, 0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(9, 60, 93, 0.25)"; }}
          >
            <Car size={18} strokeWidth={2.5} style={{ color: "white" }} />
            Offer a Ride
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function Testimonials() {
  const [ref, inView] = useInView();
  const reviews = [
    { name: "Riya Sharma", role: "Student", rating: 5, text: "Ridivo helped me find amazing travel partners and reduced my travel cost by almost 40%!", avatar: "#F59E0B", initials: "RS" },
    { name: "Aman Verma", role: "Software Engineer", rating: 5, text: "Very reliable platform! I travel weekly for work and always find verified & friendly co-travelers.", avatar: "#10B981", initials: "AV" },
    { name: "Karan Patel", role: "Driver", rating: 5, text: "As a driver, I fill my empty seats and earn good money. Ridivo is a win-win for everyone.", avatar: "#3B82F6", initials: "KP" },
  ];
  return (
    <section ref={ref} style={{ backgroundColor: colors.lightGray, padding: "100px 40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease" }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: "800", color: colors.dark, marginBottom: "12px" }}>What Our Users Say</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "17px", color: colors.gray }}>Real stories from real people</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px" }}>
          {reviews.map((r, i) => (
            <div key={r.name} style={{
              backgroundColor: "white", borderRadius: "20px", padding: "32px 28px",
              boxShadow: "0 4px 20px rgba(9,60,93,0.06)", border: "1px solid #f3f4f6",
              transition: "all 0.3s ease",
              opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)",
              transitionDelay: `${i * 0.15}s`,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(9,60,93,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(9,60,93,0.06)"; }}
            >
              <div style={{ fontSize: "32px", color: colors.mid, marginBottom: "12px", fontFamily: "serif" }}>"</div>
              <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
                {[...Array(r.rating)].map((_, j) => (
                  <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#FCD34D"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                ))}
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", color: "#374151", lineHeight: "1.7", marginBottom: "24px" }}>{r.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: r.avatar, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px", fontFamily: "'DM Sans',sans-serif" }}>{r.initials}</div>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "14px", fontWeight: "700", color: colors.dark }}>{r.name}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: colors.gray }}>{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: "Company", links: ["About Us", "Careers", "Blog", "Contact Us"] },
    { title: "Features", links: ["Find a Ride", "Offer a Ride", "How it Works", "Safety"] },
    { title: "Support", links: ["Help Center", "FAQs", "Privacy Policy", "Terms & Conditions"] },
  ];
  return (
    <footer style={{ backgroundColor: colors.dark, padding: "64px 40px 32px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", gap: "40px", marginBottom: "48px" }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <RidivoLogo size={36} showText={true} textColor="white" />
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: "1.7", marginBottom: "24px", maxWidth: "220px" }}>Making travel affordable, social and sustainable.</p>
            <div style={{ display: "flex", gap: "12px" }}>
              {["f", "in", "tw", "li"].map((s) => (
                <div key={s} style={{ width: "36px", height: "36px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.16)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"}
                >
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontWeight: "700" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "'Sora',sans-serif", fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "20px", letterSpacing: "0.3px" }}>{col.title}</h4>
              {col.links.map((link) => (
                <a key={link} href="#" style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: "12px", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.target.style.color = "white"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.55)"}
                >{link}</a>
              ))}
            </div>
          ))}

          {/* Download */}
          <div>
            <h4 style={{ fontFamily: "'Sora',sans-serif", fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "20px" }}>Download App</h4>
            {[
              { store: "Google Play", icon: Play, isFill: true },
              { store: "App Store", icon: Download, isFill: false },
            ].map((app) => {
              const IconComp = app.icon;
              return (
                <div key={app.store} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "12px",
                  padding: "12px 16px", marginBottom: "12px", cursor: "pointer",
                  transition: "background 0.2s", color: "white"
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.14)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconComp size={20} fill={app.isFill ? "currentColor" : "none"} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>Get it on</div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "13px", fontWeight: "700", color: "white" }}>{app.store}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px", textAlign: "center" }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>© 2026 Ridivo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Hero />
      <SearchBar />
      <Features />
      <HowItWorks />
      <Stats />
      <EarnSection />
      <Testimonials />
      <Footer />
    </>
  );
}
