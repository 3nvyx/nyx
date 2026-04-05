"use client";

interface Bug {
  id: string;
  severity: "P1" | "P2" | "P3" | "P4";
  name: string;
  category: string;
  timestamp: string;
  evidenceLine: number;
}

const MOCK_BUGS: Bug[] = [
  { id: "bug-1", severity: "P1", name: "Sensitive File Exposure", category: "Info Disclosure", timestamp: "04:32:18", evidenceLine: 42 },
  { id: "bug-2", severity: "P2", name: "Reflected XSS", category: "Cross-Site Scripting", timestamp: "04:28:05", evidenceLine: 28 },
  { id: "bug-3", severity: "P1", name: "SQL Injection Vector", category: "Injection", timestamp: "04:25:41", evidenceLine: 35 },
  { id: "bug-4", severity: "P3", name: "Server Version Leak", category: "Info Disclosure", timestamp: "04:19:22", evidenceLine: 18 },
  { id: "bug-5", severity: "P2", name: "Open Redirect", category: "Redirect", timestamp: "04:15:09", evidenceLine: 22 },
  { id: "bug-6", severity: "P4", name: "Missing HSTS Header", category: "Security Headers", timestamp: "04:10:33", evidenceLine: 8 },
  { id: "bug-7", severity: "P3", name: "Directory Listing", category: "Info Disclosure", timestamp: "04:05:17", evidenceLine: 14 },
  { id: "bug-8", severity: "P1", name: "Auth Bypass via IDOR", category: "Broken Access Control", timestamp: "04:01:44", evidenceLine: 48 },
  { id: "bug-9", severity: "P2", name: "CORS Misconfiguration", category: "Security Headers", timestamp: "03:56:28", evidenceLine: 32 },
  { id: "bug-10", severity: "P4", name: "Cookie Without Secure", category: "Security Headers", timestamp: "03:50:11", evidenceLine: 5 },
];

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; glow: string; label: string }> = {
  P1: { color: "#ff2d2d", bg: "rgba(255,45,45,0.12)", glow: "rgba(255,45,45,0.3)", label: "CRIT" },
  P2: { color: "#ffaa00", bg: "rgba(255,170,0,0.12)", glow: "rgba(255,170,0,0.3)", label: "HIGH" },
  P3: { color: "#00ff41", bg: "rgba(0,255,65,0.12)", glow: "rgba(0,255,65,0.3)", label: "MED" },
  P4: { color: "#888888", bg: "rgba(136,136,136,0.12)", glow: "rgba(136,136,136,0.15)", label: "LOW" },
};

export default function EvidenceLocker({
  selectedBugId,
  onSelectBug,
}: {
  selectedBugId: string | null;
  onSelectBug: (bugId: string, evidenceLine: number) => void;
}) {
  const counts = { P1: 0, P2: 0, P3: 0, P4: 0 };
  MOCK_BUGS.forEach((b) => counts[b.severity]++);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Target URL Header */}
      <div style={{
        padding: "10px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        color: "var(--green)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        background: "rgba(0, 255, 65, 0.05)",
      }}>
        <div style={{ 
          width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green-glow)" 
        }} />
        TARGET: https://target-alpha.com/
      </div>

      {/* Header */}
      <div style={{
        padding: "8px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.55rem",
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span>Vulnerability Report</span>
        <span style={{ color: "var(--red)", letterSpacing: 0, fontVariantNumeric: "tabular-nums" }}>
          {MOCK_BUGS.length}
        </span>
      </div>

      {/* Severity summary */}
      <div style={{
        display: "flex",
        gap: 1,
        padding: "6px 10px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        {(["P1", "P2", "P3", "P4"] as const).map((sev) => {
          const cfg = SEVERITY_CONFIG[sev];
          return (
            <div key={sev} style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              padding: "3px 0",
              background: cfg.bg,
              borderRadius: 3,
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                fontWeight: 800,
                color: cfg.color,
              }}>
                {counts[sev]}
              </span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.4rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: cfg.color,
                opacity: 0.7,
              }}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bug list */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {MOCK_BUGS.map((bug, i) => {
          const cfg = SEVERITY_CONFIG[bug.severity];
          const isSelected = selectedBugId === bug.id;
          return (
            <button
              key={bug.id}
              id={bug.id}
              onClick={() => onSelectBug(bug.id, bug.evidenceLine)}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${i * 50}ms`,
                width: "100%",
                background: isSelected ? cfg.bg : "transparent",
                border: "none",
                borderLeft: isSelected ? `3px solid ${cfg.color}` : "3px solid transparent",
                borderBottom: "1px solid var(--border)",
                borderRadius: 0,
                padding: "8px 10px",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: cfg.color,
                boxShadow: `0 0 6px ${cfg.glow}`,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: isSelected ? cfg.color : "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {bug.name}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.45rem",
                  color: "var(--text-muted)",
                  marginTop: 1,
                }}>
                  {bug.category}
                </div>
              </div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.45rem",
                color: "var(--text-muted)",
                flexShrink: 0,
                opacity: 0.5,
              }}>
                {bug.timestamp}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
