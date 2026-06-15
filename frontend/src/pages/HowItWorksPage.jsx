import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Handshake,
  Coins,
  Car,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  ChevronDown,
  ArrowRight,
  Check,
  Info,
} from "lucide-react";

const theme = {
  bgBase: "#F4F7FA",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#093C5D",
  textSecondary: "#6B7280",
  accent: "#3B7597",
  accentDark: "#093C5D",
  accentLight: "#EFF6FF",
  success: "#10B981",
  successBg: "#EFFDF4",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
};

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("passenger"); // "passenger" or "driver"
  const [openFaq, setOpenFaq] = useState(null);

  const passengerSteps = [
    {
      num: "01",
      title: "Complete Your Verification",
      desc: "Complete your profile by uploading your Aadhar and verifying your phone number. Trust is our number one priority, and verified accounts receive a checkmark badge to show others they are safe co-travelers.",
      icon: UserCheck,
      color: theme.success,
      details: [
        "Government ID verification (Aadhar)",
        "Verified mobile number and email",
        "Trust badge shown on booking requests",
      ],
    },
    {
      num: "02",
      title: "Find Your Perfect Ride",
      desc: "Enter your origin city, destination, date, and number of seats needed. Browse through rides offered by verified drivers, checking stops, driver ratings, and seat costs.",
      icon: Search,
      color: theme.accent,
      details: [
        "Flexible departure date search window (+3 days support)",
        "Inspect driver profiles, reviews, and vehicle models",
        "View detailed intermediate stops along the route",
      ],
    },
    {
      num: "03",
      title: "Book & Wait for Approval",
      desc: "Submit a booking request. The driver will receive an instant real-time notification on their device to accept or decline your request. You'll get notified immediately upon their response.",
      icon: Handshake,
      color: theme.warning,
      details: [
        "Instant real-time Socket.IO notifications",
        "One-click request cancellation by traveler",
        "Direct routing to bookings page to monitor requests",
      ],
    },
    {
      num: "04",
      title: "Travel Safely & Split Cost",
      desc: "Meet at the designated pickup point. During your trip, you can trigger the safety SOS button to notify your emergency contacts with vehicle and driver details. Split the travel cost fairly inside the app.",
      icon: Coins,
      color: theme.success,
      details: [
        "Real-time SOS safety alerts to trusted contacts",
        "Pre-calculated fair distance-based cost splitting",
        "Mark ride complete once you reach your destination",
      ],
    },
  ];

  const driverSteps = [
    {
      num: "01",
      title: "Submit Verification Documents",
      desc: "To offer rides, you must pass our driver vetting process. Upload your Driving License, Aadhar Card, and Vehicle Registration Certificate. Our admins review these manually to ensure safety.",
      icon: ShieldCheck,
      color: theme.success,
      details: [
        "Driving License authenticity checks",
        "Vehicle model and license plate verification",
        "Admin control panel approval process",
      ],
    },
    {
      num: "02",
      title: "Publish Your Offered Ride",
      desc: "List your trip in seconds. Define your pickup location, drop-off destination, scheduled departure time, seat capacity, cost per seat, and any intermediate stops.",
      icon: Car,
      color: theme.accent,
      details: [
        "Simple ride publishing flow",
        "Pre-filled vehicle options once verified",
        "Fair-share pricing bounds enforced by system rules",
      ],
    },
    {
      num: "03",
      title: "Manage Traveler Requests",
      desc: "Receive instant notifications when passengers request seats. Check their profiles, government-verified badges, and ratings before accepting or declining the request.",
      icon: Handshake,
      color: theme.warning,
      details: [
        "Inspect traveler profile ratings and verification stats",
        "Single click Accept/Decline from bookings dashboard",
        "Instant live alert sent to traveler upon your action",
      ],
    },
    {
      num: "04",
      title: "Complete Journey & Split Fuel",
      desc: "Pick up your confirmed travelers, follow your route, and complete the ride on your dashboard. Cost sharing is processed automatically, splitting expenses without any cash hassles.",
      icon: Coins,
      color: theme.success,
      details: [
        "Automated booking status updates on ride completion",
        "Organized co-traveler manifest on driver console",
        "Eco-friendly sharing of vehicle carbon footprint",
      ],
    },
  ];

  const faqs = [
    {
      q: "How does cost-splitting work in Ridivo?",
      a: "Ridivo is a peer-to-peer carpooling platform designed purely for expense sharing. When publishing a ride, drivers set a cost per seat based on split fuel and toll expenses. The system restricts prices to prevent profit-making, complying fully with carpooling laws. Passengers pay their fair share to support the trip costs.",
    },
    {
      q: "What is the verification process for drivers and riders?",
      a: "All users can upload their Aadhar Card for government-verified profiles. Drivers are strictly required to also upload their Driving License and Vehicle Registration (RC) details. These documents are verified manually by Ridivo admins before drivers are allowed to publish trips.",
    },
    {
      q: "How does the emergency SOS button work?",
      a: "Your safety is our priority. Travelers can add up to 5 Emergency Contacts in their settings. If a passenger feels unsafe during an active, confirmed trip, they can click the 'SOS' button. The platform instantly simulates SMS alerts to their contacts, sending the driver's name, vehicle plate number, model, and pickup/drop-off route info.",
    },
    {
      q: "Can I cancel my request or booking?",
      a: "Yes. Passengers can cancel pending or confirmed requests at any time from their Bookings page. Drivers can also cancel active rides if plans change, which automatically cancels all associated passenger bookings and sends immediate real-time notifications.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const currentSteps = activeRole === "passenger" ? passengerSteps : driverSteps;

  return (
    <div style={{ backgroundColor: "#F9FAFB", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingTop: "68px" }}>
      {/* ── HERO SECTION ── */}
      <section style={{
        background: `linear-gradient(135deg, ${theme.accentDark} 0%, #1E3A5F 100%)`,
        padding: "80px 40px 100px",
        color: "white",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(59, 117, 151, 0.25)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", filter: "blur(80px)" }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span style={{
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#60A5FA",
            backgroundColor: "rgba(96, 165, 250, 0.1)",
            padding: "6px 16px",
            borderRadius: "20px",
            display: "inline-block",
            marginBottom: "20px"
          }}>
            Complete Platform Guide
          </span>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: "800", marginBottom: "20px", lineHeight: "1.2" }}>
            How Ridivo Works
          </h1>
          <p style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.85)", lineHeight: "1.6", maxWidth: "650px", margin: "0 auto 36px" }}>
            Learn how we connect verified travelers, split costs fairly, and keep you safe with real-time tracking and SOS features.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <button
              onClick={() => navigate("/rides")}
              style={{
                padding: "14px 28px",
                backgroundColor: theme.success,
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0f9f6e";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.success;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Find a Ride
            </button>
            <button
              onClick={() => navigate("/rides?tab=post")}
              style={{
                padding: "14px 28px",
                backgroundColor: "transparent",
                color: "white",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
            >
              Offer a Ride
            </button>
          </div>
        </div>
      </section>

      {/* ── ROLE SWITCHER & STEPS ── */}
      <section style={{ maxWidth: "1100px", margin: "-40px auto 80px", padding: "0 20px", position: "relative", zIndex: 5 }}>
        {/* Toggle Bar */}
        <div style={{
          display: "flex",
          backgroundColor: "white",
          padding: "6px",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(9, 60, 93, 0.06)",
          border: `1px solid ${theme.border}`,
          maxWidth: "450px",
          margin: "0 auto 48px"
        }}>
          <button
            onClick={() => setActiveRole("passenger")}
            style={{
              flex: 1,
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeRole === "passenger" ? theme.accentDark : "transparent",
              color: activeRole === "passenger" ? "white" : theme.textSecondary,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14.5px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            I am a Passenger
          </button>
          <button
            onClick={() => setActiveRole("driver")}
            style={{
              flex: 1,
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: activeRole === "driver" ? theme.accentDark : "transparent",
              color: activeRole === "driver" ? "white" : theme.textSecondary,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14.5px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            I am a Driver
          </button>
        </div>

        {/* Steps Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {currentSteps.map((step, idx) => {
            const IconComponent = step.icon;
            const isEven = idx % 2 === 1;
            return (
              <div
                key={step.num}
                style={{
                  display: "flex",
                  flexDirection: isEven ? "row-reverse" : "row",
                  alignItems: "center",
                  gap: "60px",
                  backgroundColor: "white",
                  padding: "40px",
                  borderRadius: "24px",
                  boxShadow: "0 4px 20px rgba(9, 60, 93, 0.02)",
                  border: `1px solid ${theme.border}`,
                  flexWrap: "wrap"
                }}
              >
                {/* Visual / Left */}
                <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
                  <div style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "32px",
                    backgroundColor: step.color === theme.success ? theme.successBg : step.color === theme.warning ? theme.warningBg : theme.accentLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step.color,
                    boxShadow: "0 10px 30px rgba(9, 60, 93, 0.04)",
                    position: "relative"
                  }}>
                    <IconComponent size={56} strokeWidth={1.5} />
                    <div style={{
                      position: "absolute",
                      top: "-10px",
                      left: "-10px",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: theme.textPrimary,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: "700"
                    }}>
                      {step.num}
                    </div>
                  </div>
                </div>

                {/* Content / Right */}
                <div style={{ flex: "1.2 1 400px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: step.color, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                    Step {step.num}
                  </div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: "700", color: theme.textPrimary, marginBottom: "16px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "15px", color: theme.textSecondary, lineHeight: "1.6", marginBottom: "20px" }}>
                    {step.desc}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {step.details.map((detail, dIdx) => (
                      <div key={dIdx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: theme.accentLight,
                          color: theme.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: "14px", color: theme.textPrimary, fontWeight: "500" }}>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CORE PILLARS SECTION ── */}
      <section style={{ backgroundColor: "white", padding: "80px 40px", borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "32px", fontWeight: "800", color: theme.textPrimary, marginBottom: "12px" }}>
              Built for Trust, Safety & Fairness
            </h2>
            <p style={{ fontSize: "16px", color: theme.textSecondary, maxWidth: "600px", margin: "0 auto" }}>
              Explore the advanced features under the hood that keep Ridivo running smoothly.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
            <div style={cardStyle}>
              <div style={{ ...iconContainerStyle, color: theme.success, backgroundColor: theme.successBg }}>
                <ShieldCheck size={24} />
              </div>
              <h4 style={cardTitleStyle}>Government Verification</h4>
              <p style={cardDescStyle}>
                We verify government-issued Aadhar credentials, user identities, driving licenses, and vehicle registrations manually to secure a trusted pool of travel partners.
              </p>
            </div>

            <div style={cardStyle}>
              <div style={{ ...iconContainerStyle, color: theme.warning, backgroundColor: theme.warningBg }}>
                <Coins size={24} />
              </div>
              <h4 style={cardTitleStyle}>Fair Cost Splitting</h4>
              <p style={cardDescStyle}>
                Our system enforces price caps on a distance and consumption basis. Drivers cannot make commercial profits, ensuring rides remain cooperative, affordable, and legal.
              </p>
            </div>

            <div style={cardStyle}>
              <div style={{ ...iconContainerStyle, color: theme.danger, backgroundColor: theme.dangerBg }}>
                <PhoneCall size={24} />
              </div>
              <h4 style={cardTitleStyle}>Emergency SOS Safety</h4>
              <p style={cardDescStyle}>
                In-ride tracking and a dedicated SOS mechanism notify your emergency contacts with vehicle specifications and trip status immediately in case of emergency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section style={{ maxWidth: "800px", margin: "80px auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "32px", fontWeight: "800", color: theme.textPrimary, marginBottom: "12px" }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: "16px", color: theme.textSecondary }}>
            Got questions? We've got answers.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  border: `1px solid ${theme.border}`,
                  boxShadow: "0 4px 12px rgba(9, 60, 93, 0.01)",
                  overflow: "hidden",
                  transition: "all 0.2s ease"
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: theme.textSecondary,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease"
                    }}
                  />
                </button>
                {isOpen && (
                  <div style={{
                    padding: "0 24px 24px",
                    fontSize: "14.5px",
                    color: theme.textSecondary,
                    lineHeight: "1.6",
                    borderTop: `1px solid ${theme.border}`,
                    paddingTop: "16px"
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{
        maxWidth: "1100px",
        margin: "0 auto 80px",
        padding: "0 20px"
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentDark} 100%)`,
          borderRadius: "24px",
          padding: "60px 40px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 12px 40px rgba(9, 60, 93, 0.15)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", filter: "blur(50px)" }} />
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "32px", fontWeight: "800", marginBottom: "16px" }}>
            Ready to Travel Smarter?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.8)", maxWidth: "500px", margin: "0 auto 32px", lineHeight: "1.5" }}>
            Sign up or log in now to verify your profile, publish a trip, or book your next shared ride in seconds.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/signup")}
              style={{
                padding: "14px 32px",
                backgroundColor: "white",
                color: theme.textPrimary,
                border: "none",
                borderRadius: "10px",
                fontSize: "14.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "14px 32px",
                backgroundColor: "transparent",
                color: "white",
                border: "2px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "10px",
                fontSize: "14.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.borderColor = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── STYLE CONSTANTS ──
const cardStyle = {
  backgroundColor: "white",
  padding: "36px",
  borderRadius: "20px",
  border: `1px solid ${theme.border}`,
  boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)",
  textAlign: "left"
};

const iconContainerStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "24px"
};

const cardTitleStyle = {
  fontFamily: "'Sora', sans-serif",
  fontSize: "18px",
  fontWeight: "700",
  color: theme.textPrimary,
  marginBottom: "12px"
};

const cardDescStyle = {
  fontSize: "14px",
  color: theme.textSecondary,
  lineHeight: "1.6",
  margin: 0
};
