import { useState, useRef, useEffect } from "react";
import RidivoLogo from '../components/RidivoLogo'

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

const navLinks = [
  { label: "Find a Ride", href: "/rides" },
  { label: "Offer a Ride", href: "/rides" },
  { label: "My Bookings", href: "/bookings" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Safety", href: "#safety" },
  { label: "About Us", href: "#about" },
];

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        backgroundColor: "white",
        borderBottom: scrolled ? "1px solid #e5e7eb" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 16px rgba(9,60,93,0.08)" : "none",
        transition: "all 0.3s ease",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          maxWidth: "1400px", margin: "0 auto", padding: "0 40px",
          height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* Logo */}
          <a href="/" style={{ textDecoration: "none" }}>
            <RidivoLogo size={38} showText={true} textColor="#093C5D" />
          </a>

          {/* Desktop Nav Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }} className="desktop-nav">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} style={{
                color: "#374151", textDecoration: "none", fontSize: "14.5px",
                fontWeight: "500", padding: "8px 14px", borderRadius: "8px",
                transition: "all 0.2s ease", whiteSpace: "nowrap",
              }}
                onMouseEnter={(e) => { e.target.style.color = "#093C5D"; e.target.style.backgroundColor = "#EFF6FF"; }}
                onMouseLeave={(e) => { e.target.style.color = "#374151"; e.target.style.backgroundColor = "transparent"; }}
              >{link.label}</a>
            ))}
          </div>

          {/* Right Side */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

            {/* Language */}
            <div ref={langRef} style={{ position: "relative" }}>
              <button onClick={() => setLangOpen(!langOpen)} style={{
                display: "flex", alignItems: "center", gap: "6px",
                backgroundColor: "transparent", border: "1px solid #d1d5db",
                borderRadius: "8px", padding: "7px 12px", color: "#374151",
                cursor: "pointer", fontSize: "13.5px", fontWeight: "500",
                transition: "all 0.2s ease", fontFamily: "'DM Sans', sans-serif",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#093C5D"; e.currentTarget.style.color = "#093C5D"; e.currentTarget.style.backgroundColor = "#EFF6FF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                {selectedLang.code.toUpperCase()}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {langOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  backgroundColor: "white", borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(9,60,93,0.15)", border: "1px solid #e5e7eb",
                  padding: "8px", minWidth: "210px", zIndex: 1001, animation: "fadeInDown 0.15s ease",
                }}>
                  <p style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", padding: "4px 10px 8px", margin: 0 }}>
                    Select Language
                  </p>
                  {languages.map((lang) => (
                    <button key={lang.code} onClick={() => { if (lang.code === "en") { setSelectedLang(lang); setLangOpen(false); } }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "9px 10px", borderRadius: "8px", border: "none",
                        backgroundColor: selectedLang.code === lang.code ? "#EFF6FF" : "transparent",
                        cursor: lang.code === "en" ? "pointer" : "not-allowed",
                        color: lang.code === "en" ? "#111827" : "#9CA3AF",
                        fontSize: "14px", fontFamily: "'DM Sans', sans-serif", textAlign: "left", transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => { if (selectedLang.code !== lang.code && lang.code === "en") e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
                      onMouseLeave={(e) => { if (selectedLang.code !== lang.code) e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <span style={{ fontWeight: "500" }}>{lang.native}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{lang.label}</span>
                        {selectedLang.code === lang.code && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#093C5D" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login */}
            <a href="/login" style={{
              color: "#093C5D", textDecoration: "none", fontSize: "14.5px",
              fontWeight: "600", padding: "8px 18px", borderRadius: "8px", transition: "all 0.2s ease",
            }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = "#EFF6FF"; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = "transparent"; }}
            >Login</a>

            {/* Sign Up */}
            <a href="/signup" style={{
              backgroundColor: "#093C5D", color: "white", textDecoration: "none",
              fontSize: "14.5px", fontWeight: "600", padding: "9px 22px",
              borderRadius: "8px", transition: "all 0.2s ease", letterSpacing: "0.1px",
            }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = "#0a4d78"; e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 4px 12px rgba(9,60,93,0.3)"; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = "#093C5D"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
            >Sign Up</a>

            {/* Mobile btn */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn"
              style={{ display: "none", backgroundColor: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", color: "#093C5D", cursor: "pointer", padding: "7px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>)}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ backgroundColor: "white", borderTop: "1px solid #e5e7eb", padding: "12px 28px 20px" }}>
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} style={{
                display: "block", color: "#374151", textDecoration: "none",
                fontSize: "15px", fontWeight: "500", padding: "13px 0", borderBottom: "1px solid #f3f4f6",
              }}>{link.label}</a>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <a href="/login" style={{ flex: 1, textAlign: "center", color: "#093C5D", textDecoration: "none", fontSize: "14px", fontWeight: "600", padding: "11px", borderRadius: "8px", border: "1px solid #093C5D" }}>Login</a>
              <a href="/signup" style={{ flex: 1, textAlign: "center", backgroundColor: "#093C5D", color: "white", textDecoration: "none", fontSize: "14px", fontWeight: "600", padding: "11px", borderRadius: "8px" }}>Sign Up</a>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 960px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: block !important; } }
        `}</style>
      </nav>
    </>
  );
}
