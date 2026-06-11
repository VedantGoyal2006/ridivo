import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getMyBookings, getMyRides, triggerSOS } from '../services/rideService';
import {
  Luggage,
  Car,
  Coins,
  Star,
  Search,
  PlusCircle,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Flag,
  Calendar,
  Users,
  ChevronRight,
  Ticket,
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
};

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ icon: IconComponent, label, value, sub, color, bg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: theme.bgCard,
        borderRadius: "16px", padding: "20px 22px",
        border: `1px solid ${hovered ? color : theme.border}`,
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", alignItems: "center", gap: "16px",
        boxShadow: hovered ? "0 10px 30px rgba(9, 60, 93, 0.06)" : "0 4px 20px rgba(9, 60, 93, 0.01)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)"
      }}
    >
      <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", color: color, flexShrink: 0 }}>
        <IconComponent size={24} />
      </div>
      <div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary, marginTop: "4px" }}>{label}</div>
        {sub && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color, marginTop: "2px", fontWeight: "600" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── SEARCH SECTION ────────────────────────────────────────────────────────────
function SearchSection() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("find");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleSearchClick = () => {
    if (tab === "find") {
      navigate(`/rides?origin=${from}&destination=${to}`);
    } else {
      navigate(`/rides?tab=post&origin=${from}&destination=${to}`);
    }
  };

  return (
    <div style={{
      borderRadius: "20px", overflow: "hidden",
      boxShadow: "0 10px 30px rgba(9, 60, 93, 0.03)",
      border: `1px solid ${theme.border}`,
      marginBottom: "32px",
      backgroundColor: theme.bgCard,
    }}>
      <div style={{
        background: `linear-gradient(135deg, rgba(9,60,93,0.95) 0%, rgba(59,117,151,0.9) 100%), url('/src/assets/hero.jpg') center/cover`,
        padding: "24px 28px 0", borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "0" }}>
          {[
            { id: "find", label: "Find a Ride", icon: Search },
            { id: "offer", label: "Offer a Ride", icon: Car }
          ].map((t) => {
            const IconComp = t.icon;
            const isActive = tab === t.id;
            return (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id)} 
                style={{
                  padding: "12px 24px", border: "none", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "600",
                  borderRadius: "12px 12px 0 0", transition: "all 0.2s ease",
                  backgroundColor: isActive ? theme.bgCard : "transparent",
                  color: isActive ? theme.textPrimary : "rgba(255, 255, 255, 0.7)",
                  display: "flex", alignItems: "center", gap: "8px"
                }}
              >
                <IconComp size={15} style={{ color: isActive ? theme.textPrimary : "rgba(255, 255, 255, 0.7)" }} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "28px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px auto", gap: "16px", alignItems: "end" }}>
        {[
          { label: "From", placeholder: "Leaving from", value: from, onChange: setFrom, icon: MapPin },
          { label: "To", placeholder: "Going to", value: to, onChange: setTo, icon: Flag },
        ].map((f) => {
          const IconComp = f.icon;
          return (
            <div key={f.label}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: theme.textSecondary, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "'DM Sans', sans-serif" }}>{f.label}</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "12px 14px", backgroundColor: "#F9FAFB" }}>
                <IconComp size={16} style={{ color: theme.textSecondary }} />
                <input value={f.value} onChange={(e) => f.onChange(e.target.value)} placeholder={f.placeholder} style={{ border: "none", outline: "none", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: theme.textPrimary, width: "100%", background: "transparent" }} />
              </div>
            </div>
          );
        })}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: theme.textSecondary, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "'DM Sans', sans-serif" }}>Date</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "12px 14px", backgroundColor: "#F9FAFB" }}>
            <Calendar size={16} style={{ color: theme.textSecondary }} />
            <input type="date" style={{ width: "100%", border: "none", outline: "none", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: theme.textPrimary, background: "transparent" }} />
          </div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: theme.textSecondary, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "'DM Sans', sans-serif" }}>Seats</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "12px 14px", backgroundColor: "#F9FAFB" }}>
            <Users size={16} style={{ color: theme.textSecondary }} />
            <select style={{ width: "100%", border: "none", outline: "none", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: theme.textPrimary, background: "transparent", cursor: "pointer" }}>
              {[1, 2, 3, 4].map(n => <option key={n}>{n} Seat{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>
        </div>
        <button 
          onClick={handleSearchClick}
          style={{
            backgroundColor: theme.textPrimary, color: "white", border: "none",
            borderRadius: "12px", padding: "14px 24px", fontSize: "14px",
            fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap", transition: "all 0.2s ease",
            boxShadow: `0 4px 12px rgba(9, 60, 93, 0.15)`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#07304b"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.textPrimary; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {tab === "find" ? "Search" : "Post"}
        </button>
      </div>
    </div>
  );
}

// ── UPCOMING RIDES ────────────────────────────────────────────────────────────
function UpcomingRides({ bookings, onSOS }) {
  const navigate = useNavigate();
  const upcoming = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));

  return (
    <div style={{ backgroundColor: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: "24px", boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)" }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary }}>Upcoming Journeys</div>
        <button onClick={() => navigate("/bookings")} style={{ background: "none", border: "none", color: theme.accent, fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>View all →</button>
      </div>

      {upcoming.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: theme.textSecondary, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ color: theme.textMuted, marginBottom: "12px" }}>
            <Ticket size={32} />
          </div>
          <div style={{ fontSize: "14px", fontWeight: "500", color: theme.textSecondary }}>No upcoming journeys scheduled</div>
          <button onClick={() => navigate("/rides")} style={{ border: "none", background: "none", color: theme.accentDark, fontSize: "13px", fontWeight: "700", marginTop: "12px", cursor: "pointer" }}>Find a Ride now</button>
        </div>
      ) : upcoming.map((booking, i) => (
        <div key={booking.id} style={{
          padding: "20px 24px", display: "grid",
          gridTemplateColumns: "70px 1fr 1fr auto",
          gap: "16px", alignItems: "center",
          borderBottom: i < upcoming.length - 1 ? `1px solid ${theme.border}` : "none",
          transition: "background 0.2s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.accentLight}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <div style={{ textAlign: "center", backgroundColor: theme.accentLight, borderRadius: "12px", padding: "10px 8px", border: `1px solid rgba(59, 117, 151, 0.1)` }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
              {new Date(booking.departure_time).getDate()}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.accent, fontWeight: "700", textTransform: "uppercase", marginTop: "2px" }}>
              {new Date(booking.departure_time).toLocaleString('default', { month: 'short' })}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary }}>{booking.origin}</span>
              <span style={{ color: theme.textSecondary, fontSize: "12px" }}>→</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary }}>{booking.destination}</span>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary }}>
              {new Date(booking.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {booking.seats_booked} seat{booking.seats_booked > 1 ? "s" : ""}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: theme.textPrimary, fontSize: "14px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif", flexShrink: 0, border: `1px solid ${theme.border}` }}>
              {booking.driver_name?.[0] || 'D'}
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600", color: theme.textPrimary }}>{booking.driver_name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary, display: "flex", alignItems: "center", gap: "4px" }}>
                <Star size={11} fill="#FCD34D" stroke="#FCD34D" />
                <span>{booking.avg_rating} · {booking.vehicle_name}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "800", color: theme.textPrimary, marginBottom: "4px" }}>₹{booking.total_fare}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
              <div style={{
                display: "inline-block", padding: "3px 10px", borderRadius: "100px",
                backgroundColor: booking.status === "CONFIRMED" ? theme.successBg : theme.warningBg,
                color: booking.status === "CONFIRMED" ? theme.successText : theme.warningText,
                fontSize: "10px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif",
                border: `1px solid ${booking.status === "CONFIRMED" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)"}`
              }}>{booking.status}</div>

              {booking.status === 'CONFIRMED' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSOS(booking);
                  }}
                  style={{
                    padding: "3px 8px", borderRadius: "6px",
                    backgroundColor: theme.dangerBg, color: theme.danger,
                    border: `1px solid rgba(239, 68, 68, 0.2)`,
                    fontSize: "10px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.dangerBg}
                >
                  🚨 SOS Alert
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── RECENT ACTIVITY ───────────────────────────────────────────────────────────
function RecentActivity({ bookings = [], rides = [] }) {
  const navigate = useNavigate();

  const combined = [
    ...bookings.map(b => ({
      id: b.id,
      origin: b.origin,
      destination: b.destination,
      created_at: b.created_at,
      status: b.status,
      fare: b.total_fare,
      type: 'BOOKING',
    })),
    ...rides.map(r => {
      const bookedSeats = r.total_seats - r.available_seats;
      return {
        id: r.id,
        origin: r.origin,
        destination: r.destination,
        created_at: r.created_at,
        status: r.status,
        fare: parseFloat(r.total_trip_cost) || (parseFloat(r.price_per_seat) * r.total_seats),
        type: 'RIDE_OFFER',
        bookedSeats,
        totalSeats: r.total_seats
      };
    })
  ];

  const recent = combined
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const getStatusColor = (status) => {
    if (['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(status)) return theme.success;
    if (['PENDING', 'ONGOING'].includes(status)) return theme.warningText || '#D97706';
    return theme.danger;
  };

  return (
    <div style={{ backgroundColor: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden", boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)" }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary }}>Recent Activity</div>
      </div>

      {recent.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: theme.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
          No recent activity
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recent.map((activity, i) => {
              const isBooking = activity.type === 'BOOKING';
              return (
                <div 
                  key={activity.id} 
                  onClick={() => navigate(isBooking ? '/bookings?tab=my' : '/bookings?tab=driver')}
                  style={{
                    padding: "14px 24px", display: "flex", alignItems: "center", gap: "14px",
                    borderBottom: i < recent.length - 1 ? `1px solid ${theme.border}` : "none",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.accentLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: theme.bgBase, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textPrimary, flexShrink: 0 }}>
                    {isBooking ? <Luggage size={16} /> : <Car size={16} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", fontWeight: "600", color: theme.textPrimary }}>
                      {activity.origin} → {activity.destination}
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary }}>
                      {new Date(activity.created_at).toLocaleDateString()} · {
                        isBooking 
                          ? `Booking request ${activity.status.toLowerCase()}` 
                          : `Offered ride (${activity.status.toLowerCase()})`
                      }
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "800", color: theme.textPrimary }}>₹{activity.fare}</div>
                    <div style={{ 
                      fontFamily: "'DM Sans', sans-serif", 
                      fontSize: "11px", 
                      color: isBooking ? getStatusColor(activity.status) : theme.accent, 
                      fontWeight: "600" 
                    }}>
                      {isBooking ? activity.status : `${activity.bookedSeats}/${activity.totalSeats} booked`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {combined.length > 5 && (
            <div style={{ padding: "12px 24px", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", backgroundColor: "#FCFDFE" }}>
              <button 
                onClick={() => navigate('/bookings?tab=my')}
                style={{ background: "none", border: "none", color: theme.accent, fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                Show More Bookings →
              </button>
              <button 
                onClick={() => navigate('/bookings?tab=driver')}
                style={{ background: "none", border: "none", color: theme.accent, fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                Show More Ride Requests →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── RIGHT PANEL ───────────────────────────────────────────────────────────────
function RightPanel({ user, navigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Profile summary card */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.accentDark} 0%, ${theme.accent} 100%)`,
        borderRadius: "20px", padding: "24px", color: "white", position: "relative", overflow: "hidden",
        boxShadow: "0 8px 24px rgba(9, 60, 93, 0.15)"
      }}>
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent)", borderRadius: "50%" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", position: "relative" }}>
          {user?.profile_pic ? (
            <img src={user.profile_pic} alt="Profile" style={{ width: "52px", height: "52px", borderRadius: "14px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }} />
          ) : (
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700" }}>
              {user?.name?.[0] || 'U'}
            </div>
          )}
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: "#FFFFFF" }}>{user?.name || 'User'}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>{user?.email || ''}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", position: "relative" }}>
          {[["12", "Rides"], ["3", "Offered"], ["4.8★", "Rating"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "10px 8px" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "800", color: "#FFFFFF" }}>{val}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ backgroundColor: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}`, padding: "24px", boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary, marginBottom: "16px" }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { icon: Search, label: "Find Ride", bg: theme.accentLight, border: "rgba(59,117,151,0.1)", textColor: theme.accentDark, path: "/rides" },
            { icon: PlusCircle, label: "Offer Ride", bg: theme.successBg, border: "rgba(16,185,129,0.1)", textColor: theme.success, path: "/rides?tab=post" },
            { icon: ClipboardList, label: "Bookings", bg: theme.warningBg, border: "rgba(245,158,11,0.1)", textColor: theme.warningText, path: "/bookings" },
            { icon: ShieldCheck, label: "Verify", bg: "rgba(167, 139, 250, 0.08)", border: "rgba(167, 139, 250, 0.15)", textColor: "#7C3AED", path: "/verify" },
          ].map((action) => {
            const IconComp = action.icon;
            return (
              <button key={action.label} onClick={() => navigate(action.path)} style={{
                padding: "16px 10px", borderRadius: "14px", border: `1px solid ${action.border}`,
                backgroundColor: action.bg, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 16px ${action.bg}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <IconComp size={24} style={{ color: action.textColor }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: "600", color: action.textColor }}>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Savings tracker */}
      <div style={{ backgroundColor: theme.bgCard, borderRadius: "20px", border: `1px solid ${theme.border}`, padding: "24px", boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary, marginBottom: "16px" }}>Monthly Savings</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary }}>Total Saved</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: "800", color: theme.success }}>₹2,450</span>
        </div>
        <div style={{ backgroundColor: theme.bgBase, borderRadius: "8px", height: "6px", marginBottom: "12px", border: `1px solid ${theme.border}` }}>
          <div style={{ width: "68%", height: "100%", borderRadius: "8px", backgroundColor: theme.success }} />
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary }}>68% saved vs solo travel this month 🎉</div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [stats, setStats] = useState({
    ridesTaken: 0,
    ridesOffered: 0,
  });

  // SOS State Variables
  const [sosBooking, setSosBooking] = useState(null);
  const [sosConfirmOpen, setSosConfirmOpen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosAlertText, setSosAlertText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSOS = (booking) => {
      setSosBooking(booking);
      setSosConfirmOpen(true);
      setSosAlertText('');
      setError('');
      setSuccess('');
  };

  const confirmSOS = async () => {
      if (!sosBooking) return;
      setSosLoading(true);
      setError('');
      setSuccess('');
      try {
          const data = await triggerSOS(sosBooking.id);
          setSosAlertText(data.alertText);
          setSuccess(data.message);
      } catch (err) {
          setError(err.response?.data?.message || 'Failed to dispatch SOS alert.');
      } finally {
          setSosLoading(false);
          setSosConfirmOpen(false);
      }
  };

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const bookingsData = await getMyBookings();
      setMyBookings(bookingsData.bookings);
      setStats(prev => ({
        ...prev,
        ridesTaken: bookingsData.bookings.length,
      }));
    } catch (err) {
      console.error('Failed to fetch bookings');
    }

    try {
      const ridesData = await getMyRides();
      setMyRides(ridesData.rides);
      setStats(prev => ({
        ...prev,
        ridesOffered: ridesData.rides.length,
      }));
    } catch (err) {
      console.log('User is not a driver');
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>
        
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "28px" }}>
          <StatCard icon={Luggage} label="Rides Taken" value={stats.ridesTaken} sub="Total bookings" color={theme.accentDark} bg={theme.accentLight} />
          <StatCard icon={Car} label="Rides Offered" value={stats.ridesOffered} sub="Total rides posted" color={theme.success} bg={theme.successBg} />
          <StatCard icon={Coins} label="Total Saved" value="₹2,450" sub="vs solo travel" color={theme.warningText} bg={theme.warningBg} />
          <StatCard icon={Star} label="Avg Rating" value="4.8" sub="From 12 reviews" color="#7C3AED" bg="rgba(167, 139, 250, 0.08)" />
        </div>

        {/* Search */}
        <SearchSection />

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
          <div>
            <UpcomingRides bookings={myBookings} onSOS={handleSOS} />
            <RecentActivity bookings={myBookings} rides={myRides} />
          </div>
          <RightPanel user={user} navigate={navigate} />
        </div>
      </div>

      {/* SOS Confirmation Modal */}
      {sosConfirmOpen && (
          <div style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 60, 93, 0.4)',
              backdropFilter: 'blur(4px)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
              <div style={{
                  backgroundColor: 'white', border: `1px solid ${theme.border}`,
                  borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '440px',
                  boxShadow: '0 20px 50px rgba(9, 60, 93, 0.15)', fontFamily: "'DM Sans', sans-serif"
              }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ fontSize: '24px' }}>🚨</div>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '700', color: theme.textPrimary, margin: 0 }}>
                          Confirm SOS Emergency Alert
                      </h3>
                  </div>
                  <p style={{ color: theme.textSecondary, fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                      Are you sure you want to send an emergency alert to your trusted contacts? This will instantly compile and dispatch your current passenger, driver, vehicle, and trip route details via simulated SMS.
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                          onClick={() => setSosConfirmOpen(false)}
                          style={{
                              flex: 1, padding: '12px', border: `1px solid ${theme.border}`,
                              backgroundColor: 'white', color: theme.textSecondary,
                              borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                          }}
                      >
                          Cancel
                      </button>
                      <button
                          onClick={confirmSOS}
                          disabled={sosLoading}
                          style={{
                              flex: 1, padding: '12px', border: 'none',
                              backgroundColor: theme.danger, color: 'white',
                              borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                          }}
                      >
                          {sosLoading ? 'Sending Alert...' : 'Send Alert'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* SOS Success & Alert Text Modal */}
      {sosAlertText && (
          <div style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 60, 93, 0.4)',
              backdropFilter: 'blur(4px)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
              <div style={{
                  backgroundColor: 'white', border: `1px solid ${theme.border}`,
                  borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '500px',
                  boxShadow: '0 20px 50px rgba(9, 60, 93, 0.15)', fontFamily: "'DM Sans', sans-serif"
              }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ fontSize: '24px' }}>✅</div>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '700', color: theme.success, margin: 0 }}>
                          Emergency Alert Dispatched
                      </h3>
                  </div>
                  {error && (
                      <div style={{
                          backgroundColor: theme.dangerBg, color: theme.danger, border: `1px solid rgba(239, 68, 68, 0.15)`,
                          padding: "10px 14px", borderRadius: 8, fontSize: "12.5px", fontWeight: "600", marginBottom: 16
                      }}>
                          ⚠️ {error}
                      </div>
                  )}
                  <p style={{ color: theme.textSecondary, fontSize: '14.5px', lineHeight: '1.6', marginBottom: '16px' }}>
                      Your emergency contacts have been notified with the following trip safety information:
                  </p>
                  <div style={{
                      backgroundColor: '#F9FAFB', border: `1px solid ${theme.border}`,
                      borderRadius: '10px', padding: '16px', whiteSpace: 'pre-wrap',
                      fontSize: '12.5px', fontFamily: 'monospace', color: theme.textPrimary,
                      maxHeight: '220px', overflowY: 'auto', marginBottom: '24px'
                  }}>
                      {sosAlertText}
                  </div>
                  <button
                      onClick={() => setSosAlertText('')}
                      style={{
                          width: '100%', padding: '12px', border: 'none',
                          backgroundColor: theme.textPrimary, color: 'white',
                          borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                      }}
                  >
                      Close Window
                  </button>
              </div>
          </div>
      )}
    </>
  );
}