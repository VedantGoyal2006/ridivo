import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
          width: "100%", padding: "13px 16px",
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

export default function VerificationPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [status, setStatus] = useState(null); // null | {status, rejection_reason}
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [step, setStep] = useState(1);

  // Form state
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseImageUrl, setLicenseImageUrl] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharImageUrl, setAadharImageUrl] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosInstance.get("/verification/status");
        setStatus(res.data.verification || null);
      } catch (err) {
        console.error("Failed to fetch verification status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async () => {
    if (!licenseNumber || !licenseExpiry || !aadharNumber) {
      setAlert({ type: "error", message: "License number, expiry and Aadhar number are required" });
      return;
    }
    if (aadharNumber.length !== 12 || !/^\d+$/.test(aadharNumber)) {
      setAlert({ type: "error", message: "Aadhar number must be exactly 12 digits" });
      return;
    }
    setSubmitLoading(true);
    setAlert({ type: "", message: "" });
    try {
      await axiosInstance.post("/verification/apply", {
        license_number: licenseNumber,
        license_expiry: licenseExpiry,
        license_image_url: licenseImageUrl,
        aadhar_number: aadharNumber,
        aadhar_image_url: aadharImageUrl,
      });
      setStatus({ status: "PENDING" });
      setAlert({ type: "success", message: "Verification submitted successfully! Admin will review within 24 hours." });
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Failed to submit verification" });
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
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={premiumBg}>

        {/* SIDEBAR */}
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
                backgroundColor: "transparent",
                color: theme.textSecondary,
                cursor: "pointer", fontSize: "14px", fontWeight: "400",
                fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                transition: "all 0.2s ease", marginBottom: "2px",
                borderLeft: "3px solid transparent",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.glassHover; e.currentTarget.style.color = theme.textPrimary; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = theme.textSecondary; }}
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
            <button style={{ width: "100%", padding: "8px", backgroundColor: theme.accent, color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Offer a Ride
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Topbar */}
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
                ← Back
              </button>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: theme.textPrimary }}>
                Driver Verification
              </div>
            </div>
            <button onClick={() => { logout(); navigate("/"); }} style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", padding: "6px 16px", color: "#FCA5A5",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600",
            }}>
              🚪 Sign Out
            </button>
          </header>

          <main style={{ padding: "32px", maxWidth: "800px", width: "100%" }}>

            {/* STATUS ALREADY SUBMITTED */}
            {status && status.status === "PENDING" && (
              <div style={{
                background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
                borderRadius: "20px", padding: "40px", textAlign: "center",
                marginBottom: "24px",
              }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>⏳</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: "800", color: theme.warningText, marginBottom: "10px" }}>
                  Verification Under Review
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: theme.textSecondary, maxWidth: "400px", margin: "0 auto 24px", lineHeight: "1.7" }}>
                  Your documents have been submitted and are being reviewed by our team. This usually takes up to 24 hours.
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                  {["Documents Submitted ✓", "Admin Review In Progress", "Approval Pending"].map((s, i) => (
                    <div key={i} style={{
                      padding: "8px 16px", borderRadius: "100px",
                      backgroundColor: i === 0 ? "rgba(52,211,153,0.1)" : i === 1 ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${i === 0 ? "rgba(52,211,153,0.3)" : i === 1 ? "rgba(251,191,36,0.3)" : theme.glassBorder}`,
                      color: i === 0 ? theme.successText : i === 1 ? theme.warningText : theme.textSecondary,
                      fontSize: "12px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif",
                    }}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            {status && status.status === "APPROVED" && (
              <div style={{
                background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: "20px", padding: "40px", textAlign: "center",
                marginBottom: "24px",
              }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: "800", color: theme.successText, marginBottom: "10px" }}>
                  Verified Driver!
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: theme.textSecondary, maxWidth: "400px", margin: "0 auto 24px", lineHeight: "1.7" }}>
                  Congratulations! You are now a verified driver on Ridivo. You can now add your vehicles and start offering rides.
                </div>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => navigate("/edit-profile")} style={{
                    padding: "12px 24px", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                    color: "white", border: "none", borderRadius: "12px",
                    fontSize: "14px", fontWeight: "700", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    🚗 Add Your Vehicle
                  </button>
                  <button onClick={() => navigate("/dashboard")} style={{
                    padding: "12px 24px", background: "rgba(255,255,255,0.05)",
                    color: theme.textPrimary, border: `1px solid ${theme.glassBorder}`,
                    borderRadius: "12px", fontSize: "14px", fontWeight: "600",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}

            {status && status.status === "REJECTED" && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "20px", padding: "28px", marginBottom: "24px",
                display: "flex", alignItems: "flex-start", gap: "16px",
              }}>
                <div style={{ fontSize: "32px", flexShrink: 0 }}>❌</div>
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.errorText, marginBottom: "6px" }}>
                    Verification Rejected
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary, lineHeight: "1.6" }}>
                    {status.rejection_reason || "Your documents were not accepted. Please reapply with correct documents."}
                  </div>
                </div>
              </div>
            )}

            {/* FORM — show if not submitted or rejected */}
            {(!status || status.status === "REJECTED") && (
              <>
                {/* How it works */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px",
                  marginBottom: "28px",
                }}>
                  {[
                    { icon: "📋", step: "01", title: "Submit Documents", desc: "Upload your driving license and Aadhar card details" },
                    { icon: "🔍", step: "02", title: "Admin Review", desc: "Our team verifies your documents within 24 hours" },
                    { icon: "🚗", step: "03", title: "Start Offering Rides", desc: "Once approved, add vehicles and offer rides" },
                  ].map((s) => (
                    <div key={s.step} style={{
                      backgroundColor: theme.glassCard, backdropFilter: "blur(16px)",
                      border: `1px solid ${theme.glassBorder}`, borderRadius: "16px",
                      padding: "20px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: "28px", marginBottom: "10px" }}>{s.icon}</div>
                      <div style={{ fontSize: "10px", color: theme.accent, fontWeight: "700", letterSpacing: "1px", marginBottom: "6px", fontFamily: "'DM Sans', sans-serif" }}>STEP {s.step}</div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: "700", color: theme.textPrimary, marginBottom: "6px" }}>{s.title}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary, lineHeight: "1.5" }}>{s.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "28px", gap: "8px" }}>
                  {[1, 2].map((s) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        backgroundColor: step >= s ? theme.accent : "rgba(255,255,255,0.05)",
                        border: `2px solid ${step >= s ? theme.accent : theme.glassBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: "700", color: step >= s ? "#0B1120" : theme.textSecondary,
                        fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s ease",
                      }}>{s}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: step >= s ? theme.textPrimary : theme.textSecondary, fontWeight: step >= s ? "600" : "400" }}>
                        {s === 1 ? "License Details" : "Aadhar Details"}
                      </div>
                      {s < 2 && <div style={{ width: "60px", height: "2px", backgroundColor: step > s ? theme.accent : theme.glassBorder, transition: "all 0.3s ease" }} />}
                    </div>
                  ))}
                </div>

                <Alert type={alert.type} message={alert.message} />

                {/* Step 1 — License */}
                {step === 1 && (
                  <div style={{
                    backgroundColor: theme.glassCard, backdropFilter: "blur(16px)",
                    border: `1px solid ${theme.glassBorder}`, borderRadius: "20px",
                    padding: "28px", marginBottom: "20px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>
                      🪪 Driving License
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary, marginBottom: "24px" }}>
                      Enter your valid driving license details
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                      <GlassInput
                        label="License Number" value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. MP09 20110012345" required
                      />
                      <GlassInput
                        label="License Expiry Date" type="date" value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)} required
                      />
                    </div>
                    <GlassInput
                      label="License Image URL"
                      value={licenseImageUrl}
                      onChange={(e) => setLicenseImageUrl(e.target.value)}
                      placeholder="https://your-image-url.com/license.jpg"
                      hint="Upload your license image to any cloud service (Google Drive, Cloudinary) and paste the link here"
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                      <button
                        onClick={() => {
                          if (!licenseNumber || !licenseExpiry) {
                            setAlert({ type: "error", message: "License number and expiry are required" });
                            return;
                          }
                          setAlert({ type: "", message: "" });
                          setStep(2);
                        }}
                        style={{
                          padding: "12px 28px",
                          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                          color: "white", border: "none", borderRadius: "12px",
                          fontSize: "14px", fontWeight: "700", cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          boxShadow: `0 4px 16px rgba(56,189,248,0.3)`,
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        Next → Aadhar Details
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Aadhar */}
                {step === 2 && (
                  <div style={{
                    backgroundColor: theme.glassCard, backdropFilter: "blur(16px)",
                    border: `1px solid ${theme.glassBorder}`, borderRadius: "20px",
                    padding: "28px", marginBottom: "20px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>
                      🪪 Aadhar Card
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary, marginBottom: "24px" }}>
                      Enter your Aadhar card details for identity verification
                    </div>

                    <GlassInput
                      label="Aadhar Number" value={aadharNumber}
                      onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      placeholder="12 digit Aadhar number" required
                      hint={`${aadharNumber.length}/12 digits`}
                    />
                    <GlassInput
                      label="Aadhar Image URL"
                      value={aadharImageUrl}
                      onChange={(e) => setAadharImageUrl(e.target.value)}
                      placeholder="https://your-image-url.com/aadhar.jpg"
                      hint="Upload your Aadhar image to any cloud service and paste the link here"
                    />

                    {/* Summary */}
                    <div style={{
                      backgroundColor: "rgba(56,189,248,0.05)", border: `1px solid rgba(56,189,248,0.15)`,
                      borderRadius: "12px", padding: "16px", marginBottom: "20px",
                    }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: "600", color: theme.accent, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Submission Summary
                      </div>
                      {[
                        { label: "License Number", value: licenseNumber },
                        { label: "License Expiry", value: licenseExpiry },
                        { label: "License Image", value: licenseImageUrl ? "✓ Provided" : "Not provided" },
                        { label: "Aadhar Number", value: aadharNumber ? `XXXX XXXX ${aadharNumber.slice(-4)}` : "Not entered" },
                        { label: "Aadhar Image", value: aadharImageUrl ? "✓ Provided" : "Not provided" },
                      ].map((item) => (
                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary }}>{item.label}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textPrimary, fontWeight: "500" }}>{item.value || "—"}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button onClick={() => { setStep(1); setAlert({ type: "", message: "" }); }} style={{
                        padding: "12px 20px", background: "rgba(255,255,255,0.05)",
                        color: theme.textSecondary, border: `1px solid ${theme.glassBorder}`,
                        borderRadius: "12px", fontSize: "14px", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = theme.textPrimary; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary; }}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitLoading}
                        style={{
                          padding: "12px 28px",
                          background: submitLoading ? "rgba(56,189,248,0.3)" : `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                          color: "white", border: "none", borderRadius: "12px",
                          fontSize: "14px", fontWeight: "700",
                          cursor: submitLoading ? "not-allowed" : "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          boxShadow: submitLoading ? "none" : `0 4px 16px rgba(56,189,248,0.3)`,
                          display: "flex", alignItems: "center", gap: "8px",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => { if (!submitLoading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {submitLoading ? "⏳ Submitting..." : "🛡️ Submit for Verification"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Privacy note */}
                <div style={{
                  padding: "14px 18px", borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.02)", border: `1px solid ${theme.glassBorder}`,
                  display: "flex", gap: "12px", alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>🔒</span>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary, lineHeight: "1.6" }}>
                    Your documents are kept strictly confidential and are only used for identity verification purposes. We never share your personal information with third parties.
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }
      `}</style>
    </>
  );
}
