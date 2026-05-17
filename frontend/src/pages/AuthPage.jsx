import { useState, useEffect } from "react";

const colors = {
  dark: "#093C5D",
  mid: "#3B7597",
  light: "#EFF6FF",
  white: "#ffffff",
  gray: "#6B7280",
  border: "#E5E7EB",
};

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Verified & Trusted",
    desc: "All users are verified for a safe experience.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Save More",
    desc: "Share rides and split costs with reliable travel partners.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22V12M12 12C12 12 7 9 7 5a5 5 0 0110 0c0 4-5 7-5 7z" />
      </svg>
    ),
    title: "Eco Friendly",
    desc: "Reduce carbon footprint by sharing rides.",
  },
];

function InputField({ label, type = "text", placeholder, value, onChange, icon, showToggle }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const actualType = showToggle ? (show ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{
        display: "block", fontSize: "13px", fontWeight: "600",
        color: colors.dark, marginBottom: "7px",
        fontFamily: "'DM Sans', sans-serif",
      }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center",
        border: `1.5px solid ${focused ? colors.dark : colors.border}`,
        borderRadius: "12px", padding: "0 14px",
        backgroundColor: "white",
        transition: "all 0.2s ease",
        boxShadow: focused ? `0 0 0 3px rgba(9,60,93,0.08)` : "none",
      }}>
        <span style={{ color: focused ? colors.dark : "#9CA3AF", marginRight: "10px", transition: "color 0.2s", flexShrink: 0 }}>
          {icon}
        </span>
        <input
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", outline: "none",
            fontSize: "14px", color: "#111827",
            fontFamily: "'DM Sans', sans-serif",
            padding: "13px 0", background: "transparent",
          }}
        />
        {showToggle && (
          <button onClick={() => setShow(!show)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#9CA3AF", padding: "0", marginLeft: "8px",
            display: "flex", alignItems: "center",
          }}>
            {show ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [loaded, setLoaded] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // Signup state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const quotes = [
    "Travel Together. Spend Smarter.",
    "Share the Ride. Split the Cost.",
    "Every Journey is Better Together.",
  ];

  useEffect(() => {
    setTimeout(() => setLoaded(true), 80);
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Login: ${loginEmail}`);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    alert(`Signup: ${name}, ${email}`);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        minHeight: "100vh", display: "flex",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative", overflow: "hidden",
      }}>

        {/* ── LEFT SIDE ── */}
        <div style={{
          flex: "1 1 55%", position: "relative",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
        }}>
          {/* Background image */}
          <img
            src="/src/assets/hero.jpg"
            alt="Travel"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
            }}
            onError={(e) => { e.target.style.display = "none"; }}
          />

          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, rgba(9,60,93,0.92) 0%, rgba(9,60,93,0.75) 40%, rgba(13,82,128,0.65) 100%)`,
          }} />

          {/* Decorative circles */}
          <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(59,117,151,0.3), transparent)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-80px", right: "-40px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(59,117,151,0.2), transparent)", borderRadius: "50%", pointerEvents: "none" }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 2, padding: "40px 48px" }}>
            {/* Logo */}
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{ width: "38px", height: "38px", backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.25)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 11l19-9-9 19-2-8-8-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: "800", color: "white" }}>Ridivo</span>
            </a>
          </div>

          {/* Center content */}
          <div style={{ position: "relative", zIndex: 2, padding: "0 48px 0" }}>
            <div style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {/* Animated quote */}
              <div style={{ marginBottom: "48px" }}>
                <h1 style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "clamp(28px, 3.5vw, 46px)",
                  fontWeight: "800", color: "white",
                  lineHeight: "1.15", marginBottom: "16px",
                  transition: "opacity 0.5s ease",
                }}>
                  {quotes[quoteIndex]}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", lineHeight: "1.7", maxWidth: "420px" }}>
                  Join Ridivo and connect with verified drivers and passengers to share rides, split costs, and enjoy better journeys.
                </p>
              </div>

              {/* Feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {features.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "16px",
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? "translateX(0)" : "translateX(-20px)",
                    transition: `all 0.7s ease ${0.2 + i * 0.1}s`,
                  }}>
                    <div style={{
                      width: "42px", height: "42px", borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.12)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>{f.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: "white", marginBottom: "4px" }}>{f.title}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: "1.5" }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom stats */}
          <div style={{ position: "relative", zIndex: 2, padding: "40px 48px" }}>
            <div style={{ display: "flex", gap: "32px" }}>
              {[["10K+", "Happy Travelers"], ["5K+", "Rides Shared"], ["4.8★", "User Rating"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: "800", color: "white" }}>{val}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDE ── */}
        <div style={{
          flex: "0 0 480px", backgroundColor: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 48px",
          boxShadow: "-20px 0 60px rgba(9,60,93,0.12)",
          position: "relative", zIndex: 10,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateX(0)" : "translateX(30px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s",
          overflowY: "auto",
        }}>
          <div style={{ width: "100%", maxWidth: "380px" }}>

            {/* Tabs */}
            <div style={{
              display: "flex", backgroundColor: "#F3F4F6",
              borderRadius: "14px", padding: "4px", marginBottom: "36px",
            }}>
              {["login", "signup"].map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, padding: "10px", border: "none",
                  borderRadius: "10px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14.5px", fontWeight: "700",
                  transition: "all 0.25s ease",
                  backgroundColor: tab === t ? "white" : "transparent",
                  color: tab === t ? colors.dark : colors.gray,
                  boxShadow: tab === t ? "0 2px 8px rgba(9,60,93,0.1)" : "none",
                }}>
                  {t === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* ── LOGIN FORM ── */}
            {tab === "login" && (
              <div style={{ animation: "fadeSlideIn 0.3s ease" }}>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: "800", color: colors.dark, marginBottom: "6px" }}>Welcome back!</h2>
                <p style={{ color: colors.gray, fontSize: "14px", marginBottom: "28px", fontFamily: "'DM Sans', sans-serif" }}>Log in to continue your journey with Ridivo.</p>

                <form onSubmit={handleLogin}>
                  <InputField
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                  />
                  <InputField
                    label="Password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    showToggle
                    icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                        style={{ width: "16px", height: "16px", accentColor: colors.dark }} />
                      <span style={{ fontSize: "13px", color: colors.gray, fontFamily: "'DM Sans', sans-serif" }}>Remember me</span>
                    </label>
                    <a href="#" style={{ fontSize: "13px", color: colors.mid, fontWeight: "600", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Forgot password?</a>
                  </div>

                  <button type="submit" style={{
                    width: "100%", padding: "14px",
                    backgroundColor: colors.dark, color: "white",
                    border: "none", borderRadius: "12px",
                    fontSize: "15px", fontWeight: "700",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.25s ease",
                    boxShadow: "0 4px 16px rgba(9,60,93,0.3)",
                    marginBottom: "20px",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0a4d78"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(9,60,93,0.35)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.dark; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(9,60,93,0.3)"; }}
                  >Log In</button>
                </form>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
                  <span style={{ fontSize: "12px", color: colors.gray, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>or continue with</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
                </div>

                {/* Google */}
                <button style={{
                  width: "100%", padding: "13px",
                  backgroundColor: "white", color: "#374151",
                  border: `1.5px solid ${colors.border}`, borderRadius: "12px",
                  fontSize: "14.5px", fontWeight: "600",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  transition: "all 0.2s ease", marginBottom: "16px",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = "none"; }}
                  onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <p style={{ textAlign: "center", fontSize: "13.5px", color: colors.gray, fontFamily: "'DM Sans', sans-serif" }}>
                  Don't have an account?{" "}
                  <button onClick={() => setTab("signup")} style={{ background: "none", border: "none", color: colors.dark, fontWeight: "700", cursor: "pointer", fontSize: "13.5px", fontFamily: "'DM Sans', sans-serif" }}>
                    Sign Up
                  </button>
                </p>
              </div>
            )}

            {/* ── SIGNUP FORM ── */}
            {tab === "signup" && (
              <div style={{ animation: "fadeSlideIn 0.3s ease" }}>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: "800", color: colors.dark, marginBottom: "6px" }}>Create account</h2>
                <p style={{ color: colors.gray, fontSize: "14px", marginBottom: "28px", fontFamily: "'DM Sans', sans-serif" }}>Start your smarter journey today.</p>

                <form onSubmit={handleSignup}>
                  <InputField
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  />
                  <InputField
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                  />
                  <InputField
                    label="Phone Number"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.19 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>}
                  />
                  <InputField
                    label="Password"
                    placeholder="Create a password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    showToggle
                    icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>}
                  />

                  <button type="submit" style={{
                    width: "100%", padding: "14px",
                    backgroundColor: colors.dark, color: "white",
                    border: "none", borderRadius: "12px",
                    fontSize: "15px", fontWeight: "700",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.25s ease",
                    boxShadow: "0 4px 16px rgba(9,60,93,0.3)",
                    marginBottom: "20px", marginTop: "4px",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0a4d78"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.dark; e.currentTarget.style.transform = "translateY(0)"; }}
                  >Create Account</button>
                </form>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
                  <span style={{ fontSize: "12px", color: colors.gray, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>or continue with</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
                </div>

                {/* Google */}
                <button style={{
                  width: "100%", padding: "13px",
                  backgroundColor: "white", color: "#374151",
                  border: `1.5px solid ${colors.border}`, borderRadius: "12px",
                  fontSize: "14.5px", fontWeight: "600",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  transition: "all 0.2s ease", marginBottom: "16px",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.boxShadow = "none"; }}
                  onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <p style={{ textAlign: "center", fontSize: "13.5px", color: colors.gray, fontFamily: "'DM Sans', sans-serif" }}>
                  Already have an account?{" "}
                  <button onClick={() => setTab("login")} style={{ background: "none", border: "none", color: colors.dark, fontWeight: "700", cursor: "pointer", fontSize: "13.5px", fontFamily: "'DM Sans', sans-serif" }}>
                    Log In
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
