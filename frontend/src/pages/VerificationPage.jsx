import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Search,
  Upload,
  Car,
} from "lucide-react";

const theme = {
  bgCard: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#093C5D",
  textSecondary: "#6B7280",
  textMuted: "#94A3B8",
  accent: "#3B7597",
  accentDark: "#093C5D",
  accentLight: "#EFF6FF",
  success: "#10B981",
  successBg: "#EFFDF4",
  successText: "#10B981",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  warningText: "#D97706",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
  errorText: "#EF4444",
};

function GlassInput({ label, type = "text", value, onChange, placeholder, disabled, hint, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "700",
        color: theme.textSecondary, marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.8px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label} {required && <span style={{ color: theme.danger }}>*</span>}
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
          backgroundColor: disabled ? "#F3F4F6" : "#F9FAFB",
          border: `1.5px solid ${focused ? theme.accent : theme.border}`,
          borderRadius: "12px", color: disabled ? theme.textMuted : theme.textPrimary,
          fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
          outline: "none", transition: "all 0.2s ease",
          cursor: disabled ? "not-allowed" : "text",
          boxShadow: focused ? `0 0 0 3px rgba(59,117,151,0.1)` : "none",
          boxSizing: "border-box",
        }}
      />
      {hint && <div style={{ fontSize: "11px", color: theme.textSecondary, marginTop: "5px", fontFamily: "'DM Sans', sans-serif", fontWeight: "500" }}>{hint}</div>}
    </div>
  );
}

function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    success: { bg: theme.successBg, border: "rgba(16,185,129,0.2)", color: theme.successText, icon: CheckCircle },
    error: { bg: theme.dangerBg, border: "rgba(239,68,68,0.2)", color: theme.errorText, icon: AlertTriangle },
  };
  const s = styles[type];
  const IconComp = s.icon;
  return (
    <div style={{
      padding: "12px 16px", borderRadius: "10px",
      backgroundColor: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
      marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px",
      fontWeight: "600"
    }}>
      <IconComp size={16} /> {message}
    </div>
  );
}

export default function VerificationPage() {
  const navigate = useNavigate();

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
        setStatus(null); // Force it to fetch profile status or route directly
        // Let's call getMyProfile or verify endpoint
      }
    };
    
    // Actually we can check /verification/status endpoint
    const checkVerificationStatus = async () => {
      try {
        const res = await axiosInstance.get("/verification/status");
        setStatus(res.data.verification || null);
      } catch (err) {
        console.error("Failed to fetch verification status:", err);
      } finally {
        setLoading(false);
      }
    };
    checkVerificationStatus();
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 0" }}>
        <div style={{ color: theme.accent, fontFamily: "'DM Sans', sans-serif", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Navigation back button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => navigate("/profile")} style={{
            background: "white", border: `1px solid ${theme.border}`,
            borderRadius: "8px", padding: "8px 14px", color: theme.textSecondary,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
            display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
            fontWeight: "600"
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.textPrimary; e.currentTarget.style.borderColor = theme.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.border; }}
          >
            <ArrowLeft size={14} /> Back to Profile
          </button>
        </div>

        {/* STATUS: PENDING */}
        {status && status.status === "PENDING" && (
          <div style={{
            background: theme.warningBg, border: `1px solid rgba(245, 158, 11, 0.15)`,
            borderRadius: "20px", padding: "40px", textAlign: "center",
            marginBottom: "24px", boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)"
          }}>
            <Clock size={56} style={{ color: theme.warningText, margin: "0 auto 16px" }} />
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: "800", color: theme.warningText, marginBottom: "10px" }}>
              Verification Under Review
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: theme.textSecondary, maxWidth: "420px", margin: "0 auto 24px", lineHeight: "1.7", fontWeight: "500" }}>
              Your documents have been submitted successfully. The Ridivo admin team is reviewing your application. This usually takes up to 24 hours.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              {["Documents Submitted ✓", "Admin Review In Progress", "Approval Pending"].map((s, i) => (
                <div key={i} style={{
                  padding: "8px 16px", borderRadius: "100px",
                  backgroundColor: i === 0 ? theme.successBg : i === 1 ? "rgba(245, 158, 11, 0.1)" : "white",
                  border: `1px solid ${i === 0 ? "rgba(16, 185, 129, 0.2)" : i === 1 ? "rgba(245, 158, 11, 0.2)" : theme.border}`,
                  color: i === 0 ? theme.success : i === 1 ? theme.warningText : theme.textSecondary,
                  fontSize: "12px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif",
                }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* STATUS: APPROVED */}
        {status && status.status === "APPROVED" && (
          <div style={{
            background: theme.successBg, border: `1px solid rgba(16, 185, 129, 0.15)`,
            borderRadius: "20px", padding: "40px", textAlign: "center",
            marginBottom: "24px", boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)"
          }}>
            <CheckCircle size={56} style={{ color: theme.success, margin: "0 auto 16px" }} />
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: "800", color: theme.success, marginBottom: "10px" }}>
              Verified Driver!
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: theme.textSecondary, maxWidth: "440px", margin: "0 auto 24px", lineHeight: "1.7", fontWeight: "500" }}>
              Congratulations! Your driver identity verification is approved. You can now register vehicles under your profile and post ride offers.
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/edit-profile?tab=vehicles")} style={{
                padding: "12px 24px", background: theme.textPrimary,
                color: "white", border: "none", borderRadius: "12px",
                fontSize: "13.5px", fontWeight: "700", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 12px rgba(9, 60, 93, 0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#07304b"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.textPrimary}
              >
                <Car size={16} /> Add a Vehicle
              </button>
              <button onClick={() => navigate("/dashboard")} style={{
                padding: "12px 24px", background: "white",
                color: theme.textPrimary, border: `1px solid ${theme.border}`,
                borderRadius: "12px", fontSize: "13.5px", fontWeight: "700",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F9FAFB"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* STATUS: REJECTED */}
        {status && status.status === "REJECTED" && (
          <div style={{
            background: theme.dangerBg, border: `1px solid rgba(239, 68, 68, 0.15)`,
            borderRadius: "20px", padding: "28px", marginBottom: "28px",
            display: "flex", alignItems: "flex-start", gap: "16px",
            boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)"
          }}>
            <XCircle size={32} style={{ color: theme.danger, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.danger, marginBottom: "6px" }}>
                Verification Application Rejected
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", color: theme.textSecondary, lineHeight: "1.6", fontWeight: "500" }}>
                Rejection Reason: {status.rejection_reason || "Document details did not match your profile details. Please review your entries and resubmit correct details."}
              </div>
            </div>
          </div>
        )}

        {/* FORM APPLICATION */}
        {(!status || status.status === "REJECTED") && (
          <>
            {/* How it works banner */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px",
              marginBottom: "28px",
            }}>
              {[
                { icon: FileText, step: "01", title: "Submit Details", desc: "Upload license & Aadhar details" },
                { icon: Search, step: "02", title: "Admin Audit", desc: "Our team reviews within 24 hours" },
                { icon: ShieldCheck, step: "03", title: "Become Verified", desc: "Start posting rides immediately" },
              ].map((s, idx) => {
                const IconComp = s.icon;
                return (
                  <div key={idx} style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`, borderRadius: "16px",
                    padding: "20px", textAlign: "center",
                    boxShadow: "0 4px 12px rgba(9, 60, 93, 0.01)"
                  }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: theme.accentLight, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textPrimary, margin: "0 auto 12px" }}>
                      <IconComp size={20} />
                    </div>
                    <div style={{ fontSize: "10px", color: theme.accent, fontWeight: "700", letterSpacing: "0.8px", marginBottom: "6px", fontFamily: "'DM Sans', sans-serif" }}>STEP {s.step}</div>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: "700", color: theme.textPrimary, marginBottom: "6px" }}>{s.title}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary, lineHeight: "1.5", fontWeight: "500" }}>{s.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Steps Indicator */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "28px", gap: "8px", backgroundColor: theme.bgCard, padding: "16px 20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              {[1, 2].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    backgroundColor: step >= s ? theme.textPrimary : "white",
                    border: `2px solid ${step >= s ? theme.textPrimary : theme.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: "700", color: step >= s ? "white" : theme.textSecondary,
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s ease",
                  }}>{s}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: step >= s ? theme.textPrimary : theme.textSecondary, fontWeight: step >= s ? "700" : "500" }}>
                    {s === 1 ? "Driving License" : "Aadhaar Card"}
                  </div>
                  {s < 2 && <div style={{ width: "60px", height: "2px", backgroundColor: step > s ? theme.textPrimary : theme.border, transition: "all 0.3s ease" }} />}
                </div>
              ))}
            </div>

            <Alert type={alert.type} message={alert.message} />

            {/* Step 1: License */}
            {step === 1 && (
              <div style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`, borderRadius: "20px",
                padding: "28px", marginBottom: "20px",
                boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)",
              }}>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>
                  🪪 Driving License Details
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: theme.textSecondary, marginBottom: "24px" }}>
                  Provide your valid Indian Driving License details.
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
                  label="License Front Image URL"
                  value={licenseImageUrl}
                  onChange={(e) => setLicenseImageUrl(e.target.value)}
                  placeholder="https://cloud.com/your-license.jpg"
                  hint="Upload an image of your license card front and copy-paste the URL here."
                />

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
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
                      backgroundColor: theme.textPrimary,
                      color: "white", border: "none", borderRadius: "12px",
                      fontSize: "14px", fontWeight: "700", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: `0 4px 12px rgba(9, 60, 93, 0.15)`,
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#07304b"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.textPrimary; }}
                  >
                    Next Step <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Aadhaar */}
            {step === 2 && (
              <div style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`, borderRadius: "20px",
                padding: "28px", marginBottom: "20px",
                boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)",
              }}>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>
                  🪪 Aadhaar Identity Details
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: theme.textSecondary, marginBottom: "24px" }}>
                  Provide your 12-digit Aadhaar Card details.
                </div>

                <GlassInput
                  label="Aadhaar Card Number" value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="12 digit Aadhaar number" required
                  hint={`${aadharNumber.length}/12 digits entered`}
                />
                <GlassInput
                  label="Aadhaar Front Image URL"
                  value={aadharImageUrl}
                  onChange={(e) => setAadharImageUrl(e.target.value)}
                  placeholder="https://cloud.com/your-aadhar.jpg"
                  hint="Upload an image of your Aadhaar card front and copy-paste the URL here."
                />

                {/* Application Summary Checklist */}
                <div style={{
                  backgroundColor: theme.accentLight, border: `1px solid rgba(9, 60, 93, 0.1)`,
                  borderRadius: "12px", padding: "18px", marginBottom: "24px",
                }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: "700", color: theme.textPrimary, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Application Summary
                  </div>
                  {[
                    { label: "License Number", value: licenseNumber },
                    { label: "License Expiry Date", value: licenseExpiry },
                    { label: "License Image File", value: licenseImageUrl ? "✓ Provided" : "Not Provided" },
                    { label: "Aadhaar Card Number", value: aadharNumber ? `XXXX XXXX ${aadharNumber.slice(-4)}` : "Not Provided" },
                    { label: "Aadhaar Image File", value: aadharImageUrl ? "✓ Provided" : "Not Provided" },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: theme.textSecondary, fontWeight: "500" }}>{item.label}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: theme.textPrimary, fontWeight: "700" }}>{item.value || "—"}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button onClick={() => { setStep(1); setAlert({ type: "", message: "" }); }} style={{
                    padding: "12px 20px", background: "white",
                    color: theme.textSecondary, border: `1px solid ${theme.border}`,
                    borderRadius: "12px", fontSize: "13.5px", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                    fontWeight: "600", display: "flex", alignItems: "center", gap: "6px"
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = theme.textPrimary; e.currentTarget.style.borderColor = theme.textPrimary; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.border; }}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    style={{
                      padding: "12px 28px",
                      background: submitLoading ? theme.border : theme.textPrimary,
                      color: "white", border: "none", borderRadius: "12px",
                      fontSize: "14px", fontWeight: "700",
                      cursor: submitLoading ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: submitLoading ? "none" : `0 4px 12px rgba(9, 60, 93, 0.15)`,
                      display: "flex", alignItems: "center", gap: "8px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => { if (!submitLoading) e.currentTarget.style.backgroundColor = "#07304b"; }}
                    onMouseLeave={(e) => { if (!submitLoading) e.currentTarget.style.backgroundColor = theme.textPrimary; }}
                  >
                    <Upload size={16} />
                    {submitLoading ? "Submitting Application..." : "Submit Application"}
                  </button>
                </div>
              </div>
            )}

            {/* Confidentially pledge */}
            <div style={{
              padding: "16px", borderRadius: "12px",
              backgroundColor: "rgba(9, 60, 93, 0.02)", border: `1px solid ${theme.border}`,
              display: "flex", gap: "12px", alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>🛡️</span>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary, lineHeight: "1.6", fontWeight: "500" }}>
                All document uploads are processed securely. Your identity card values are solely used to verify driving eligibility on Ridivo and are protected under strict encryption policies.
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
