import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Shield,
  FileText,
  Calendar,
  Phone,
  Mail,
  User,
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

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("pending");
  const [verifications, setVerifications] = useState([]);
  const [allVerifications, setAllVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate("/dashboard");
    }
  }, [user]);

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
      PENDING: { bg: theme.warningBg, color: theme.warningText, label: "Pending", icon: Clock },
      APPROVED: { bg: theme.successBg, color: theme.success, label: "Approved", icon: CheckCircle },
      REJECTED: { bg: theme.dangerBg, color: theme.danger, label: "Rejected", icon: XCircle },
    };
    const s = styles[status] || styles.PENDING;
    const IconComponent = s.icon;
    return (
      <span style={{
        padding: "4px 12px", borderRadius: "100px",
        backgroundColor: s.bg, color: s.color,
        fontSize: "12px", fontWeight: "700",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", gap: "4px",
        border: `1px solid rgba(9, 60, 93, 0.03)`
      }}>
        <IconComponent size={12} />
        {s.label}
      </span>
    );
  };

  const displayList = activeTab === "pending" ? verifications : allVerifications;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Navigation Action Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => navigate("/dashboard")} style={{
            background: "white", border: `1px solid ${theme.border}`,
            borderRadius: "8px", padding: "8px 14px", color: theme.textSecondary,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
            display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
            fontWeight: "600"
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.textPrimary; e.currentTarget.style.borderColor = theme.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.border; }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "28px" }}>
          {[
            { icon: Clock, label: "Pending Audit", value: verifications.length, color: theme.warningText, bg: theme.warningBg },
            { icon: CheckCircle, label: "Approved Drivers", value: allVerifications.filter(v => v.status === "APPROVED").length, color: theme.success, bg: theme.successBg },
            { icon: XCircle, label: "Rejected Applications", value: allVerifications.filter(v => v.status === "REJECTED").length, color: theme.danger, bg: theme.dangerBg },
          ].map((s, idx) => {
            const IconComp = s.icon;
            return (
              <div key={idx} style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`, borderRadius: "16px",
                padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px",
                boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)"
              }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
                  <IconComp size={22} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary, marginTop: "4px", fontWeight: "600" }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alert */}
        {alert.message && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px", marginBottom: "20px",
            backgroundColor: alert.type === "success" ? theme.successBg : theme.dangerBg,
            border: `1px solid ${alert.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
            color: alert.type === "success" ? theme.success : theme.danger,
            fontSize: "13px", display: "flex", alignItems: "center", gap: "8px",
            fontWeight: "600"
          }}>
            {alert.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} 
            {alert.message}
            <button onClick={() => setAlert({ type: "", message: "" })} style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px" }}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex", gap: "4px", backgroundColor: "rgba(9, 60, 93, 0.03)",
          borderRadius: "12px", padding: "4px", marginBottom: "24px",
          width: "fit-content", border: `1px solid ${theme.border}`,
        }}>
          {[
            { id: "pending", label: `⏳ Pending Requests (${verifications.length})` },
            { id: "all", label: "📋 All Verification Audits" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "9px 20px", borderRadius: "8px", border: "none",
              backgroundColor: activeTab === tab.id ? "white" : "transparent",
              color: activeTab === tab.id ? theme.textPrimary : theme.textSecondary,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              fontSize: "13.5px", fontWeight: "600",
              transition: "all 0.2s ease",
              boxShadow: activeTab === tab.id ? "0 4px 10px rgba(9, 60, 93, 0.03)" : "none"
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* List content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: theme.accent, fontSize: "16px" }}>
            Loading verifications...
          </div>
        ) : displayList.length === 0 ? (
          <div style={{
            backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`,
            borderRadius: "20px", padding: "60px", textAlign: "center",
            boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: theme.textPrimary, marginBottom: "8px" }}>
              {activeTab === "pending" ? "No Pending Verifications" : "No Records Found"}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary }}>
              {activeTab === "pending" ? "All caught up! No drivers waiting for audit." : "No verification submissions to display."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {displayList.map((v) => (
              <div key={v.id} style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`, borderRadius: "20px",
                padding: "24px", transition: "all 0.2s",
                boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)"
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.accent}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
              >
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "46px", height: "46px", borderRadius: "12px",
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: "18px", fontWeight: "700",
                      fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                    }}>
                      {v.name?.[0] || "U"}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary }}>{v.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: theme.textSecondary }}>{v.email} · {v.phone || "No phone number"}</div>
                    </div>
                  </div>
                  {getStatusBadge(v.status)}
                </div>

                {/* Details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" }}>
                  {[
                    { label: "License Number", value: v.license_number, icon: FileText },
                    { label: "License Expiry Date", value: new Date(v.license_expiry).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), icon: Calendar },
                    { label: "Aadhaar Number", value: v.aadhar_number ? `XXXX XXXX ${v.aadhar_number.slice(-4)}` : "—", icon: FileText },
                    { label: "Submitted On", value: new Date(v.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), icon: Calendar },
                    { label: "License Scan Image", value: v.license_image_url ? "Provided" : "Not Provided", color: v.license_image_url ? theme.success : theme.danger, icon: FileText },
                    { label: "Aadhaar Scan Image", value: v.aadhar_image_url ? "Provided" : "Not Provided", color: v.aadhar_image_url ? theme.success : theme.danger, icon: FileText },
                  ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={idx} style={{
                        backgroundColor: "#F9FAFB", borderRadius: "12px",
                        padding: "12px 14px", border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}><IconComponent size={10} /> {item.label}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: item.color || theme.textPrimary, fontWeight: "700" }}>{item.value}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Document Links */}
                {(v.license_image_url || v.aadhar_image_url) && (
                  <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    {v.license_image_url && (
                      <a href={v.license_image_url} target="_blank" rel="noreferrer" style={{
                        padding: "8px 14px", backgroundColor: theme.accentLight,
                        border: `1px solid rgba(9, 60, 93, 0.1)`, borderRadius: "8px",
                        color: theme.textPrimary, textDecoration: "none",
                        fontSize: "12px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif",
                        display: "flex", alignItems: "center", gap: "6px",
                      }}>
                        🪪 View License Document
                      </a>
                    )}
                    {v.aadhar_image_url && (
                      <a href={v.aadhar_image_url} target="_blank" rel="noreferrer" style={{
                        padding: "8px 14px", backgroundColor: theme.accentLight,
                        border: `1px solid rgba(9, 60, 93, 0.1)`, borderRadius: "8px",
                        color: theme.textPrimary, textDecoration: "none",
                        fontSize: "12px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif",
                        display: "flex", alignItems: "center", gap: "6px",
                      }}>
                        🪪 View Aadhaar Document
                      </a>
                    )}
                  </div>
                )}

                {/* Rejection notice details */}
                {v.status === "REJECTED" && v.rejection_reason && (
                  <div style={{
                    padding: "12px 14px", backgroundColor: theme.dangerBg,
                    border: `1px solid rgba(239, 68, 68, 0.1)`, borderRadius: "10px",
                    marginBottom: "16px",
                  }}>
                    <div style={{ fontSize: "11px", color: theme.danger, fontWeight: "700", marginBottom: "4px", fontFamily: "'DM Sans', sans-serif" }}>REJECTION REASON DETAILS</div>
                    <div style={{ fontSize: "13px", color: theme.textSecondary, fontFamily: "'DM Sans', sans-serif", fontWeight: "500" }}>{v.rejection_reason}</div>
                  </div>
                )}

                {/* Action buttons */}
                {v.status === "PENDING" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleApprove(v.id)}
                      disabled={actionLoading === v.id}
                      style={{
                        padding: "10px 24px",
                        background: actionLoading === v.id ? theme.border : theme.textPrimary,
                        color: "white", border: "none", borderRadius: "10px",
                        fontSize: "13px", fontWeight: "700", cursor: actionLoading === v.id ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
                        boxShadow: "0 4px 12px rgba(9, 60, 93, 0.15)",
                        display: "flex", alignItems: "center", gap: "6px",
                      }}
                      onMouseEnter={(e) => { if (actionLoading !== v.id) { e.currentTarget.style.backgroundColor = "#07304b"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.textPrimary; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {actionLoading === v.id ? "Processing..." : "Approve Application"}
                    </button>
                    <button
                      onClick={() => { setRejectModal(v.id); setRejectReason(""); }}
                      disabled={actionLoading === v.id}
                      style={{
                        padding: "10px 24px",
                        background: "white",
                        color: theme.danger, border: `1px solid ${theme.border}`,
                        borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                        cursor: actionLoading === v.id ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
                        display: "flex", alignItems: "center", gap: "6px",
                      }}
                      onMouseEnter={(e) => { if (actionLoading !== v.id) { e.currentTarget.style.borderColor = theme.danger; e.currentTarget.style.backgroundColor = theme.dangerBg; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(9, 60, 93, 0.4)",
          backdropFilter: "blur(4px)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyStyle: "center", justifyContent: "center",
        }}>
          <div style={{
            backgroundColor: "white", border: `1px solid ${theme.border}`,
            borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px",
            boxShadow: "0 25px 60px rgba(9, 60, 93, 0.1)",
          }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "800", color: theme.textPrimary, marginBottom: "8px" }}>
              Reject Application
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary, marginBottom: "20px", fontWeight: "500" }}>
              Please specify the reason for rejecting this verification request.
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Uploaded Aadhaar image is blurry or expired driving license."
              rows={4}
              style={{
                width: "100%", padding: "12px 14px",
                backgroundColor: "#F9FAFB", border: `1px solid ${theme.border}`,
                borderRadius: "12px", color: theme.textPrimary,
                fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                outline: "none", resize: "vertical", boxSizing: "border-box",
                marginBottom: "20px",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} style={{
                flex: 1, padding: "11px", backgroundColor: "white",
                border: `1px solid ${theme.border}`, borderRadius: "10px",
                color: theme.textSecondary, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "600",
              }}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                style={{
                  flex: 1, padding: "11px",
                  background: !rejectReason.trim() ? theme.border : theme.danger,
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
