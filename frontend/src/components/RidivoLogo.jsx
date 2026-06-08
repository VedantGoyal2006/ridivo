export default function RidivoLogo({ size = 38, showText = true, textColor = "#093C5D" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
        <defs>
          <linearGradient id="rgrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B7597" />
            <stop offset="100%" stopColor="#093C5D" />
          </linearGradient>
        </defs>
        <rect width="72" height="72" rx="16" fill="url(#rgrad)" />
        <rect x="16" y="12" width="8" height="46" rx="4" fill="white" />
        <path d="M24 14 Q48 14 48 26 Q48 38 24 38" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="24" y1="38" x2="50" y2="58" stroke="white" strokeWidth="8" strokeLinecap="round" />
      </svg>
      {showText && (
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "22px",
          fontWeight: "700",
          color: textColor,
          letterSpacing: "-0.5px",
        }}>Ridivo</span>
      )}
    </div>
  );
}