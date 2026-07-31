import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Skeleton } from "../components/Skeleton";
import { toast } from "react-hot-toast";
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
  ShieldAlert,
  IndianRupee,
  Activity,
  UserCheck,
  CreditCard,
  Trash
} from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("verifications"); // verifications, users, payments, sos
  const [verifications, setVerifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, completed_rides: 0, active_rides: 0, total_revenue: 0 });
  const [activeSos, setActiveSos] = useState([]);
  const [demandCorridors, setDemandCorridors] = useState([]);
  const [moderationText, setModerationText] = useState("");
  const [moderationResult, setModerationResult] = useState(null);
  const [moderating, setModerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reject drivers state
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate("/dashboard");
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch verifications
      const verifRes = await axiosInstance.get("/verification/admin/all");
      setVerifications(verifRes.data.verifications || []);

      // 2. Fetch stats & SOS signals
      const statsRes = await axiosInstance.get("/admin/stats");
      setStats(statsRes.data.stats || { total_users: 0, completed_rides: 0, active_rides: 0, total_revenue: 0 });
      setActiveSos(statsRes.data.active_sos || []);

      // 3. Fetch users
      const usersRes = await axiosInstance.get("/admin/users");
      setUsers(usersRes.data.users || []);

      // 4. Fetch payments & refunds
      const paymentsRes = await axiosInstance.get("/admin/payments");
      setPayments(paymentsRes.data.payments || []);
      setRefunds(paymentsRes.data.refunds || []);

      // 5. Fetch demand corridors
      const demandRes = await axiosInstance.get("/ai/demand-analytics");
      setDemandCorridors(demandRes.data.corridors || []);

    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      toast.error("Failed to retrieve administrative data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckReview = async (e) => {
    e.preventDefault();
    if (!moderationText.trim()) return;
    setModerating(true);
    try {
      const res = await axiosInstance.post("/ai/check-review", { review_text: moderationText });
      setModerationResult(res.data);
      toast.success("Content moderation check complete!");
    } catch (err) {
      toast.error("Failed to run content check.");
    } finally {
      setModerating(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Approve driver verification
  const handleApproveDriver = async (id) => {
    setActionLoading(id);
    try {
      await axiosInstance.put(`/verification/admin/${id}/approve`);
      toast.success("Driver credentials verified and approved!");
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve application.");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject driver verification
  const handleRejectDriver = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(rejectModal);
    try {
      await axiosInstance.put(`/verification/admin/${rejectModal}/reject`, {
        rejection_reason: rejectReason
      });
      toast.success("Driver application marked as rejected.");
      setRejectModal(null);
      setRejectReason("");
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject application.");
    } finally {
      setActionLoading(null);
    }
  };

  // Update User Role/Admin Status
  const handleUpdateRole = async (userId, role, isAdmin) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/role`, {
        role,
        is_admin: isAdmin
      });
      toast.success("User credentials updated successfully.");
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to update user parameters.");
    }
  };

  // Resolve Active SOS Threat
  const handleResolveSos = async (bookingId) => {
    try {
      await axiosInstance.put(`/admin/sos/${bookingId}/resolve`);
      toast.success("SOS alarm deactivated successfully!");
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to resolve SOS alarm.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-8">
        <Skeleton variant="rect" className="h-16 w-full" />
        <Skeleton variant="rect" className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" /> Admin Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">Audit traveler verifications, cost splitting payments, and monitor safety alerts.</p>
        </div>
        <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-50" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      {/* Flashing SOS emergency banner */}
      {activeSos.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 flex items-center justify-between flex-wrap gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-950">🚨 ACTIVE EMERGENCY SOS ALARMS ({activeSos.length})</h4>
              <p className="text-xs text-red-700 mt-0.5">Co-travelers need urgent assistance. Track coordinates immediately.</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setActiveTab("sos")}>
            Open Safety Desk
          </Button>
        </div>
      )}

      {/* STATS OVERVIEW ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Co-Travelers", value: stats.total_users, desc: "Registered platform users", icon: UserCheck, color: "text-blue-600 bg-blue-50" },
          { label: "Completed Journeys", value: stats.completed_rides, desc: "Cost-split rides completed", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          { label: "Active Trips", value: stats.active_rides, desc: "Ongoing/available intercity trips", icon: Activity, color: "text-indigo-600 bg-indigo-50" },
          { label: "Platform Revenue Settle", value: `₹${Math.round(stats.total_revenue)}`, desc: "Total transactions captured", icon: IndianRupee, color: "text-amber-600 bg-amber-50" }
        ].map((stat, idx) => {
          const IconComp = stat.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.color} flex-shrink-0`}>
                <IconComp className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-lg font-black text-slate-800">{stat.value}</h5>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* TAB BAR NAVIGATION */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { id: "verifications", label: `⏳ Driver Audits (${verifications.filter(v => v.status === 'PENDING').length})` },
          { id: "users", label: `📋 Users Directory` },
          { id: "payments", label: `💳 Payments Settle` },
          { id: "sos", label: `🚨 Safety Alarms (${activeSos.length})` },
          { id: "demand", label: `📈 Route Demand` },
          { id: "moderator", label: `🤖 Review Moderator` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3.5 text-sm font-semibold border-b-2 transition-all focus:outline-none ${
              activeTab === tab.id ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 1. DRIVER AUDITS SUB-PAGE ── */}
      {activeTab === "verifications" && (
        <div className="space-y-4">
          {verifications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 mt-4">All Verifications Done</h4>
              <p className="text-xs text-slate-500 mt-1">No driver verification applications are currently pending audit review.</p>
            </div>
          ) : (
            verifications.map((v) => (
              <div key={v.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-xs">
                      {v.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{v.name}</h4>
                      <p className="text-[10px] text-slate-500">{v.email} · {v.phone || "No phone number"}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    v.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                    v.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {v.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">License Number</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{v.license_number}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">License Expiry</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{new Date(v.license_expiry).toLocaleDateString("en-IN", { dateStyle: 'medium' })}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Aadhaar Number</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">XXXX XXXX {v.aadhar_number?.slice(-4)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Submitted On</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{new Date(v.submitted_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>

                {/* Image Upload Previews */}
                {(v.license_image_url || v.aadhar_image_url) && (
                  <div className="flex gap-3 flex-wrap">
                    {v.license_image_url && (
                      <a href={v.license_image_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                        View License Document ➔
                      </a>
                    )}
                    {v.aadhar_image_url && (
                      <a href={v.aadhar_image_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                        View Aadhaar Document ➔
                      </a>
                    )}
                  </div>
                )}

                {/* Rejection Notice */}
                {v.status === 'REJECTED' && v.rejection_reason && (
                  <div className="bg-red-50/50 border border-red-100 p-3 rounded-xl text-xs text-red-900 leading-relaxed font-mono">
                    <span className="font-bold block uppercase text-[9px] mb-0.5">Rejection Reason</span>
                    {v.rejection_reason}
                  </div>
                )}

                {/* Driver Action Buttons */}
                {v.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button variant="success" size="sm" onClick={() => handleApproveDriver(v.id)} isLoading={actionLoading === v.id}>
                      Approve Driver
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => { setRejectModal(v.id); setRejectReason(""); }}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── 2. USERS DIRECTORY SUB-PAGE ── */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Users Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Admin Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <select 
                        defaultValue={u.role} 
                        onChange={(e) => handleUpdateRole(u.id, e.target.value, u.is_admin)}
                        className="bg-white border border-slate-200 rounded-lg p-1.5 font-semibold text-slate-700 outline-none"
                      >
                        <option value="USER">USER</option>
                        <option value="DRIVER">DRIVER</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        defaultChecked={u.is_admin} 
                        onChange={(e) => handleUpdateRole(u.id, u.role, e.target.checked)}
                        className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] text-slate-400 font-mono block">Registered {new Date(u.created_at).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. PAYMENTS & REFUNDS SUB-PAGE ── */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          
          {/* Active Settle Logs */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Co-Traveler Checkout Settle Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Traveler</th>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Paid At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{p.traveler_name}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-400">{p.razorpay_order_id}</td>
                      <td className="p-4 font-bold">₹{Math.round(p.amount)}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' :
                          p.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Refund audit logs */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Automated Refund Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Traveler</th>
                    <th className="p-4">Refund ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Dispatched At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {refunds.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{ref.traveler_name}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-400">{ref.razorpay_refund_id}</td>
                      <td className="p-4 font-bold text-red-600">₹{Math.round(ref.refund_amount)}</td>
                      <td className="p-4">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                          {ref.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(ref.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── 4. SAFETY ALARMS SUB-PAGE (ACTIVE SOS) ── */}
      {activeTab === "sos" && (
        <div className="space-y-4">
          {activeSos.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 mt-4">Safety Desk Normal</h4>
              <p className="text-xs text-slate-500 mt-1">No active emergency signals or SOS alerts require coordinates lookup.</p>
            </div>
          ) : (
            activeSos.map((sos) => (
              <div key={sos.booking_id} className="bg-red-50/70 border border-red-200 rounded-3xl p-6 shadow-md space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-pulse">
                
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-red-700 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Active Passenger Danger Alert
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-red-100 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">Passenger</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{sos.passenger_name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">Driver</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{sos.driver_name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">Vehicle Number</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{sos.vehicle_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">Route Path</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{sos.origin} ➔ {sos.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 self-start md:self-center">
                  <a href={`/track-sos/${sos.booking_id}`} target="_blank" rel="noreferrer" className="text-xs font-bold bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-1">
                    Trace Coordinates Live
                  </a>
                  <Button variant="success" size="sm" onClick={() => handleResolveSos(sos.booking_id)}>
                    Mark Resolved
                  </Button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* ── 5. CORRIDOR DEMAND SUB-PAGE ── */}
      {activeTab === "demand" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Intercity Travel Demand Density</h3>
          </div>

          {demandCorridors.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No demand metrics compiled yet.</p>
          ) : (
            <div className="space-y-4">
              {demandCorridors.map((c, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-baseline text-slate-700">
                    <span className="font-bold">{c.origin} ➔ {c.destination}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{c.request_count} requests ({c.total_seats} seats)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((c.request_count / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 6. REVIEW MODERATION SUB-PAGE ── */}
      {activeTab === "moderator" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Content Moderation Sandbox</h3>
          </div>

          <form onSubmit={handleCheckReview} className="space-y-4">
            <textarea
              rows={4}
              value={moderationText}
              onChange={(e) => setModerationText(e.target.value)}
              placeholder="Paste co-traveler review text here to scan for spam/fraud content patterns..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 outline-none resize-none"
              required
            />
            <Button type="submit" variant="primary" className="w-full font-bold" isLoading={moderating}>
              Analyze Content Safety
            </Button>
          </form>

          {moderationResult && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-xs animate-fade-in">
              <h4 className="font-bold text-slate-800">Scan Results:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Spam Score</span>
                  <span className={`text-lg font-black mt-1 block ${
                    moderationResult.rating > 70 ? 'text-red-500' :
                    moderationResult.rating > 30 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {moderationResult.rating} / 100
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Moderation Status</span>
                  <span className={`text-lg font-black mt-1 block ${moderationResult.is_spam ? 'text-red-500' : 'text-emerald-500'}`}>
                    {moderationResult.is_spam ? 'Flagged Spam' : 'Passed Review'}
                  </span>
                </div>
              </div>
              <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-100/55 leading-relaxed">
                <span className="font-bold text-slate-800">Safety Context:</span> {moderationResult.reason}
              </p>
            </div>
          )}
        </div>
      )}

      {/* REJECT DRIVER REASON DIALOG */}
      {rejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in-up">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Reject Application</h3>
              <p className="text-[11px] text-slate-500 mt-1">Specify verification mismatch reasons below.</p>
            </div>
            
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Driving License Scan is blurry, or Expired credentials."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-700 outline-none resize-none"
            />

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setRejectModal(null)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1 font-bold" onClick={handleRejectDriver} isLoading={actionLoading}>
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
