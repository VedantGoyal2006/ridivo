import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile } from "../services/userService";
import axiosInstance from "../utils/axiosInstance";
import RidivoLogo from "../components/RidivoLogo";

const theme = {
  bgBase: "#0B1120",
  glassCard: "rgba(255, 255, 255, 0.03)",
  glassCardHeavy: "rgba(15, 23, 42, 0.8)",
  glassHover: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  accent: "#38BDF8",
  accentHover: "#0284C7",
  successText: "#34D399",
  warningText: "#FBBF24",
  errorText: "#FCA5A5",
};

const navItems = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard" },
  { icon: "🔍", label: "Find a Ride", path: "/find-ride" },
  { icon: "🚗", label: "My Rides", path: "/my-rides" },
  { icon: "➕", label: "Offer a Ride", path: "/offer-ride" },
  { icon: "📋", label: "Bookings", path: "/bookings" },
  { icon: "💰", label: "Payments", path: "/payments" },
  { icon: "⭐", label: "Reviews", path: "/reviews" },
  { icon: "👤", label: "Profile", path: "/profile" },
  { icon: "⚙️", label: "Settings", path: "/settings" },
];

// ── INPUT COMPONENT ───────────────────────────────────────────────────────────
function GlassInput({ label, type = "text", value, onChange, placeholder, disabled, hint, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "600",
        color: theme.textSecondary, marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.8px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label} {required && <span style={{ color: theme.accent }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "12px 16px",
          backgroundColor: disabled ? "rgba(0,0,0,0.2)" : focused ? "rgba(56,189,248,0.05)" : "rgba(0,0,0,0.3)",
          border: `1px solid ${focused ? theme.accent : theme.glassBorder}`,
          borderRadius: "12px", color: disabled ? theme.textSecondary : theme.textPrimary,
          fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
          outline: "none", transition: "all 0.2s ease",
          cursor: disabled ? "not-allowed" : "text",
          boxShadow: focused ? `0 0 0 3px rgba(56,189,248,0.1)` : "none",
          boxSizing: "border-box",
        }}
      />
      {hint && <div style={{ fontSize: "11px", color: theme.textSecondary, marginTop: "5px", fontFamily: "'DM Sans', sans-serif" }}>{hint}</div>}
    </div>
  );
}

// ── SELECT COMPONENT ──────────────────────────────────────────────────────────
function GlassSelect({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "600",
        color: theme.textSecondary, marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.8px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label} {required && <span style={{ color: theme.accent }}>*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: "12px 16px",
          backgroundColor: "rgba(0,0,0,0.3)",
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "12px", color: theme.textPrimary,
          fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
          outline: "none", cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: "#0B1120" }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── SAVE BUTTON ───────────────────────────────────────────────────────────────
function SaveButton({ onClick, loading, label = "Add Vehicle" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "12px 28px",
        background: loading ? "rgba(56,189,248,0.3)" : `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
        color: "white", border: "none", borderRadius: "12px",
        fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
        boxShadow: loading ? "none" : `0 4px 16px rgba(56,189,248,0.3)`,
        display: "flex", alignItems: "center", gap: "8px",
      }}
      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(56,189,248,0.4)`; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px rgba(56,189,248,0.3)`; }}
    >
      {loading ? "⏳ Adding..." : `✓ ${label}`}
    </button>
  );
}

// ── ALERT COMPONENT ───────────────────────────────────────────────────────────
function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    success: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", color: theme.successText, icon: "✅" },
    error: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", color: theme.errorText, icon: "⚠️" },
  };
  const s = styles[type];
  return (
    <div style={{
      padding: "12px 16px", borderRadius: "10px",
      backgroundColor: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
      marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px",
    }}>
      {s.icon} {message}
    </div>
  );
}

// ── SECTION CARD ──────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{
      backgroundColor: theme.glassCard, backdropFilter: "blur(16px)",
      border: `1px solid ${theme.glassBorder}`, borderRadius: "20px",
      padding: "28px", marginBottom: "20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>{title}</div>
        {subtitle && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AddVehiclePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Form state
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [totalSeats, setTotalSeats] = useState("");
  const [color, setColor] = useState("");
  const [vehicleImageUrl, setVehicleImageUrl] = useState("");
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Fetch driver verification status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getMyProfile();
        setVerificationStatus(data.verification_status);
      } catch (err) {
        console.error("Failed to fetch profile/verification status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleAddVehicle = async () => {
    if (!vehicleName.trim() || !vehicleNumber.trim() || !totalSeats) {
      setAlert({ type: "error", message: "Vehicle name, number and seats are required" });
      return;
    }

    const seatsNum = parseInt(totalSeats);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 7) {
      setAlert({ type: "error", message: "Total seats must be a number between 1 and 7" });
      return;
    }

    setSubmitLoading(true);
    setAlert({ type: "", message: "" });
    try {
      await axiosInstance.post("/vehicles", {
        vehicle_name: vehicleName,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        total_seats: seatsNum,
        color,
        vehicle_image_url: vehicleImageUrl,
      });

      setAlert({ type: "success", message: "Vehicle added successfully! Redirecting..." });
      
      // Clear form
      setVehicleName("");
      setVehicleNumber("");
      setTotalSeats("");
      setColor("");
      setVehicleImageUrl("");

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Failed to add vehicle" });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: theme.bgBase, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: theme.accent, fontFamily: "'DM Sans', sans-serif", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  const premiumBg = {
    minHeight: "100vh", display: "flex",
    backgroundColor: theme.bgBase,
    backgroundImage: `
      radial-gradient(circle at 15% 50%, rgba(56,189,248,0.06), transparent 25%),
      radial-gradient(circle at 85% 30%, rgba(167,139,250,0.06), transparent 25%),
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 100% 100%, 40px 40px, 40px 40px",
    fontFamily: "'DM Sans', sans-serif",
    color: theme.textPrimary,
  };

  const isVerified = verificationStatus?.status === "APPROVED";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={premiumBg}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: "240px", flexShrink: 0,
          backgroundColor: "rgba(11,17,32,0.75)", backdropFilter: "blur(20px)",
          borderRight: `1px solid ${theme.glassBorder}`,
          height: "100vh", position: "fixed", left: 0, top: 0,
          display: "flex", flexDirection: "column", zIndex: 100, overflowY: "auto",
        }}>
          <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${theme.glassBorder}`, cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}>
            <RidivoLogo size={34} showText={true} textColor="white" />
          </div>

          <nav style={{ padding: "16px 12px", flex: 1 }}>
            {navItems.map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 12px", borderRadius: "10px", border: "none",
                backgroundColor: item.path === "/profile" ? "rgba(56,189,248,0.15)" : "transparent",
                color: item.path === "/profile" ? theme.textPrimary : theme.textSecondary,
                cursor: "pointer", fontSize: "14px",
                fontWeight: item.path === "/profile" ? "600" : "400",
                fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                transition: "all 0.2s ease", marginBottom: "2px",
                borderLeft: item.path === "/profile" ? `3px solid ${theme.accent}` : "3px solid transparent",
              }}
                onMouseEnter={(e) => { if (item.path !== "/profile") { e.currentTarget.style.backgroundColor = theme.glassHover; e.currentTarget.style.color = theme.textPrimary; } }}
                onMouseLeave={(e) => { if (item.path !== "/profile") { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = theme.textSecondary; } }}
              >
                <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ margin: "12px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(2,132,199,0.4))", border: `1px solid rgba(56,189,248,0.3)`, padding: "16px", marginBottom: "20px" }}>
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>🚗</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>Got Empty Seats?</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.7)", marginBottom: "12px" }}>Share your ride and split the cost</div>
            <button style={{ width: "100%", padding: "8px", backgroundColor: theme.accent, color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => navigate("/offer-ride")}>Offer a Ride</button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Top bar */}
          <header style={{
            height: "64px", backgroundColor: theme.glassCardHeavy,
            backdropFilter: "blur(16px)", borderBottom: `1px solid ${theme.glassBorder}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 32px", position: "sticky", top: 0, zIndex: 50,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => navigate("/profile")} style={{
                background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.glassBorder}`,
                borderRadius: "8px", padding: "6px 12px", color: theme.textSecondary,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
                display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = theme.textPrimary; e.currentTarget.style.borderColor = theme.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.glassBorder; }}
              >
                ← Back to Profile
              </button>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: theme.textPrimary }}>
                Add Vehicle
              </div>
            </div>
            <button onClick={() => { logout(); navigate("/"); }} style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", padding: "6px 16px", color: "#FCA5A5",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
              fontWeight: "600", transition: "all 0.2s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"}
            >
              🚪 Sign Out
            </button>
          </header>

          <main style={{ padding: "32px", maxWidth: "900px", width: "100%" }}>

            {/* ── DRIVER VERIFICATION WARNING BANNER ── */}
            {!isVerified && (
              <div style={{
                padding: "24px", borderRadius: "16px",
                backgroundColor: "rgba(239,68,68,0.08)", border: `1px solid rgba(239,68,68,0.25)`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px"
              }}>
                <span style={{ fontSize: "48px" }}>🛡️</span>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: theme.errorText }}>
                  Driver Verification Required
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: theme.textSecondary, maxWidth: "480px", margin: 0, lineHeight: "1.6" }}>
                  To register vehicles and offer rides on the Ridivo platform, you must first verify your driving license and Aadhaar details.
                </p>
                <button onClick={() => navigate("/verify")} style={{
                  padding: "12px 24px", backgroundColor: theme.accent, border: "none",
                  borderRadius: "10px", color: "white", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "700",
                  transition: "all 0.2s ease", boxShadow: `0 4px 16px rgba(56, 189, 248, 0.3)`,
                  marginTop: "8px"
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.accentHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.accent}
                >
                  Verify Now →
                </button>
              </div>
            )}

            {/* ── ADD NEW VEHICLE FORM ── */}
            {isVerified && (
              <SectionCard
                title="Add New Vehicle"
                subtitle="Register a new vehicle to your driver profile"
              >
                <Alert type={alert.type} message={alert.message} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                  <GlassInput label="Vehicle Name" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} placeholder="e.g. Swift Dzire" required />
                  <GlassInput label="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="e.g. MP09 AB 1234" required />
                  <GlassSelect label="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} options={[{ value: "CAR", label: "🚗 Car" }, { value: "SUV", label: "🚙 SUV" }, { value: "BIKE", label: "🏍️ Bike" }]} required />
                  <GlassInput label="Total Seats" type="number" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} placeholder="e.g. 4" hint="Excluding driver seat" required />
                  <GlassInput label="Color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. White" />
                  <GlassInput label="Vehicle Image URL" value={vehicleImageUrl} onChange={(e) => setVehicleImageUrl(e.target.value)} placeholder="https://..." hint="Optional — upload to cloud and paste URL" />
                </div>
                <SaveButton onClick={handleAddVehicle} loading={submitLoading} />
              </SectionCard>
            )}
          </main>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        select option { background: #0B1120; color: #F8FAFC; }
      `}</style>
    </>
  );
}
