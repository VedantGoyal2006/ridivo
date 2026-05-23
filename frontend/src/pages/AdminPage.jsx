import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";

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

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("pending");
  const [verifications, setVerifications] = useState([]);
  const [allVerifications, setAllVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // useEffect(() => {
//   if (user && !user.is_admin) {
//     navigate("/dashboard");
//   }
// }, [user]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        axiosInstance.get("/verification/admin/pending"),
        axiosInstance.get("/verification/admin/all"),
      ]);
      setVerifications(pendingRes.data.verifications || []);
      setAllVerifications(allRes.data.verifications || []);
    } catch (err) {
      console.error("Failed to fetch verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await axiosInstance.put(`/verification/admin/${id}/approve`);
      setAlert({ type: "success", message: "Driver verified and approved successfully!" });
      fetchData();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Failed to approve" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(rejectModal);
    try {
      await axiosInstance.put(`/verification/admin/${rejectModal}/reject`, {
        rejection_reason: rejectReason,
      });
      setAlert({ type: "success", message: "Verification rejected." });
      setRejectModal(null);
      setRejectReason("");
      fetchData();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Failed to reject" });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: "rgba(251,191,36,0.15)", color: "#FBBF24", label: "⏳ Pending" },
      APPROVED: { bg: "rgba(52,211,153,0.15)", color: "#34D399", label: "✅ Approved" },
      REJECTED: { bg: "rgba(239,68,68,0.15)", color: "#FCA5A5", label: "❌ Rejected" },
    };
    const s = styles[status] || styles.PENDING;
    return (
      <span style={{
        padding: "4px 12px", borderRadius: "100px",
        backgroundColor: s.bg, color: s.color,
        fontSize: "12px", fontWeight: "600",
        fontFamily: "'DM Sans', sans-serif",
      }}>{s.label}</span>
    );
  };

  const displayList = activeTab === "pending" ? verifications : allVerifications;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        minHeight: "100vh", backgroundColor: theme.bgBase,
        backgroundImage: `radial-gradient(circle at 15% 50%, rgba(56,189,248,0.06), transparent 25%), radial-gradient(circle at 85% 30%, rgba(167,139,250,0.06), transparent 25%)`,
        fontFamily: "'DM Sans', sans-serif", color: theme.textPrimary,
      }}>

        {/* Topbar */}
        <header style={{
          height: "64px", backgroundColor: theme.glassCardHeavy,
          backdropFilter: "blur(16px)", borderBottom: `1px solid ${theme.glassBorder}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #38BDF8, #0284C7)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 72 72" fill="none">
                  <rect width="72" height="72" rx="16" fill="white" fillOpacity="0.2" />
                  <rect x="16" y="12" width="8" height="46" rx="4" fill="white" />
                  <path d="M24 14 Q48 14 48 26 Q48 38 24 38" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
                  <line x1="24" y1="38" x2="50" y2="58" stroke="white" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: "white" }}>Ridivo</span>
            </div>
            <div style={{ width: "1px", height: "20px", backgroundColor: theme.glassBorder }} />
            <span style={{ fontSize: "14px", color: theme.accent, fontWeight: "600" }}>⚙️ Admin Panel</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate("/dashboard")} style={{
              background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.glassBorder}`,
              borderRadius: "8px", padding: "6px 14px", color: theme.textSecondary,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
              transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = theme.textPrimary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary; }}
            >
              ← Dashboard
            </button>
            <button onClick={() => { logout(); navigate("/"); }} style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", padding: "6px 14px", color: "#FCA5A5",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600",
            }}>
              🚪 Sign Out
            </button>
          </div>
        </header>

        <main style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "28px" }}>
            {[
              { icon: "⏳", label: "Pending", value: verifications.length, color: theme.warningText, bg: "rgba(251,191,36,0.1)" },
              { icon: "✅", label: "Approved", value: allVerifications.filter(v => v.status === "APPROVED").length, color: theme.successText, bg: "rgba(52,211,153,0.1)" },
              { icon: "❌", label: "Rejected", value: allVerifications.filter(v => v.status === "REJECTED").length, color: theme.errorText, bg: "rgba(239,68,68,0.1)" },
            ].map((s) => (
              <div key={s.label} style={{
                backgroundColor: theme.glassCard, backdropFilter: "blur(16px)",
                border: `1px solid ${theme.glassBorder}`, borderRadius: "16px",
                padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px",
              }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary, marginTop: "4px" }}>{s.label} Verifications</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert */}
          {alert.message && (
            <div style={{
              padding: "12px 16px", borderRadius: "10px", marginBottom: "20px",
              backgroundColor: alert.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${alert.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: alert.type === "success" ? theme.successText : theme.errorText,
              fontSize: "13px", display: "flex", alignItems: "center", gap: "8px",
            }}>
              {alert.type === "success" ? "✅" : "⚠️"} {alert.message}
              <button onClick={() => setAlert({ type: "", message: "" })} style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display: "flex", gap: "4px", backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "12px", padding: "4px", marginBottom: "20px",
            width: "fit-content", border: `1px solid ${theme.glassBorder}`,
          }}>
            {[
              { id: "pending", label: `⏳ Pending (${verifications.length})` },
              { id: "all", label: "📋 All Verifications" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: "9px 20px", borderRadius: "8px", border: "none",
                backgroundColor: activeTab === tab.id ? "rgba(56,189,248,0.2)" : "transparent",
                color: activeTab === tab.id ? theme.accent : theme.textSecondary,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: activeTab === tab.id ? "700" : "400",
                transition: "all 0.2s ease",
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: theme.accent, fontSize: "16px" }}>
              Loading verifications...
            </div>
          ) : displayList.length === 0 ? (
            <div style={{
              backgroundColor: theme.glassCard, border: `1px solid ${theme.glassBorder}`,
              borderRadius: "20px", padding: "60px", textAlign: "center",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: theme.textPrimary, marginBottom: "8px" }}>
                {activeTab === "pending" ? "No Pending Verifications" : "No Verifications Yet"}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary }}>
                {activeTab === "pending" ? "All caught up! No drivers waiting for approval." : "No verification applications submitted yet."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {displayList.map((v) => (
                <div key={v.id} style={{
                  backgroundColor: theme.glassCard, backdropFilter: "blur(16px)",
                  border: `1px solid ${theme.glassBorder}`, borderRadius: "20px",
                  padding: "24px", transition: "border-color 0.2s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(56,189,248,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.glassBorder}
                >
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "46px", height: "46px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #38BDF8, #0284C7)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: "18px", fontWeight: "700",
                        fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                      }}>
                        {v.name?.[0] || "U"}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary }}>{v.name}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary }}>{v.email} · {v.phone || "No phone"}</div>
                      </div>
                    </div>
                    {getStatusBadge(v.status)}
                  </div>

                  {/* Details grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" }}>
                    {[
                      { label: "License Number", value: v.license_number },
                      { label: "License Expiry", value: new Date(v.license_expiry).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                      { label: "Aadhar Number", value: v.aadhar_number ? `XXXX XXXX ${v.aadhar_number.slice(-4)}` : "—" },
                      { label: "Submitted On", value: new Date(v.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                      { label: "License Image", value: v.license_image_url ? "✓ Provided" : "Not provided", color: v.license_image_url ? theme.successText : theme.errorText },
                      { label: "Aadhar Image", value: v.aadhar_image_url ? "✓ Provided" : "Not provided", color: v.aadhar_image_url ? theme.successText : theme.errorText },
                    ].map((item) => (
                      <div key={item.label} style={{
                        backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "10px",
                        padding: "12px 14px",
                      }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{item.label}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: item.color || theme.textPrimary, fontWeight: "600" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Document links */}
                  {(v.license_image_url || v.aadhar_image_url) && (
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                      {v.license_image_url && (
                        <a href={v.license_image_url} target="_blank" rel="noreferrer" style={{
                          padding: "7px 14px", backgroundColor: "rgba(56,189,248,0.1)",
                          border: `1px solid rgba(56,189,248,0.2)`, borderRadius: "8px",
                          color: theme.accent, textDecoration: "none",
                          fontSize: "12px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}>
                          🪪 View License
                        </a>
                      )}
                      {v.aadhar_image_url && (
                        <a href={v.aadhar_image_url} target="_blank" rel="noreferrer" style={{
                          padding: "7px 14px", backgroundColor: "rgba(56,189,248,0.1)",
                          border: `1px solid rgba(56,189,248,0.2)`, borderRadius: "8px",
                          color: theme.accent, textDecoration: "none",
                          fontSize: "12px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}>
                          🪪 View Aadhar
                        </a>
                      )}
                    </div>
                  )}

                  {/* Rejection reason */}
                  {v.status === "REJECTED" && v.rejection_reason && (
                    <div style={{
                      padding: "12px 14px", backgroundColor: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px",
                      marginBottom: "16px",
                    }}>
                      <div style={{ fontSize: "11px", color: theme.errorText, fontWeight: "600", marginBottom: "4px", fontFamily: "'DM Sans', sans-serif" }}>REJECTION REASON</div>
                      <div style={{ fontSize: "13px", color: theme.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>{v.rejection_reason}</div>
                    </div>
                  )}

                  {/* Action buttons - only for pending */}
                  {v.status === "PENDING" && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleApprove(v.id)}
                        disabled={actionLoading === v.id}
                        style={{
                          padding: "10px 24px",
                          background: actionLoading === v.id ? "rgba(52,211,153,0.3)" : "linear-gradient(135deg, #34D399, #10B981)",
                          color: "white", border: "none", borderRadius: "10px",
                          fontSize: "13px", fontWeight: "700", cursor: actionLoading === v.id ? "not-allowed" : "pointer",
                          fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
                          boxShadow: "0 4px 12px rgba(52,211,153,0.3)",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}
                        onMouseEnter={(e) => { if (actionLoading !== v.id) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {actionLoading === v.id ? "Processing..." : "✅ Approve Driver"}
                      </button>
                      <button
                        onClick={() => { setRejectModal(v.id); setRejectReason(""); }}
                        disabled={actionLoading === v.id}
                        style={{
                          padding: "10px 24px",
                          background: "rgba(239,68,68,0.1)",
                          color: theme.errorText, border: "1px solid rgba(239,68,68,0.3)",
                          borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                          cursor: actionLoading === v.id ? "not-allowed" : "pointer",
                          fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}
                        onMouseEnter={(e) => { if (actionLoading !== v.id) { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            backgroundColor: "#1a1f2e", border: `1px solid ${theme.glassBorder}`,
            borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: theme.textPrimary, marginBottom: "8px" }}>
              ❌ Reject Verification
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary, marginBottom: "20px" }}>
              Please provide a reason so the user knows what to fix when reapplying.
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. License image is blurry, please upload a clearer photo"
              rows={4}
              style={{
                width: "100%", padding: "12px 14px",
                backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.glassBorder}`,
                borderRadius: "12px", color: theme.textPrimary,
                fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                outline: "none", resize: "vertical", boxSizing: "border-box",
                marginBottom: "20px",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} style={{
                flex: 1, padding: "11px", backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${theme.glassBorder}`, borderRadius: "10px",
                color: theme.textSecondary, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
              }}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                style={{
                  flex: 1, padding: "11px",
                  background: !rejectReason.trim() ? "rgba(239,68,68,0.3)" : "linear-gradient(135deg, #EF4444, #DC2626)",
                  border: "none", borderRadius: "10px",
                  color: "white", cursor: !rejectReason.trim() ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "700",
                }}
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`* { box-sizing: border-box; }`}</style>
    </>
  );
}
