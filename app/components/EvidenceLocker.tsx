"use client";

import { useState } from "react";

interface Bug {
  id: string;
  severity: "P1" | "P2" | "P3" | "P4";
  name: string;
  timestamp: string;
  evidenceLine: number;
}

const MOCK_BUGS: Bug[] = [
  { id: "bug-1", severity: "P1", name: "Sensitive File Exposure", timestamp: "04:32:18", evidenceLine: 42 },
  { id: "bug-2", severity: "P2", name: "Reflected XSS", timestamp: "04:28:05", evidenceLine: 28 },
  { id: "bug-3", severity: "P1", name: "SQL Injection Vector", timestamp: "04:25:41", evidenceLine: 35 },
  { id: "bug-4", severity: "P3", name: "Server Version Leak", timestamp: "04:19:22", evidenceLine: 18 },
  { id: "bug-5", severity: "P2", name: "Open Redirect", timestamp: "04:15:09", evidenceLine: 22 },
  { id: "bug-6", severity: "P4", name: "Missing HSTS Header", timestamp: "04:10:33", evidenceLine: 8 },
  { id: "bug-7", severity: "P3", name: "Directory Listing", timestamp: "04:05:17", evidenceLine: 14 },
  { id: "bug-8", severity: "P1", name: "Auth Bypass via IDOR", timestamp: "04:01:44", evidenceLine: 48 },
  { id: "bug-9", severity: "P2", name: "CORS Misconfiguration", timestamp: "03:56:28", evidenceLine: 32 },
  { id: "bug-10", severity: "P4", name: "Cookie Without Secure", timestamp: "03:50:11", evidenceLine: 5 },
];

const SEVERITY_STYLES: Record<string, string> = {
  P1: "severity-p1",
  P2: "severity-p2",
  P3: "severity-p3",
  P4: "severity-p4",
};

export default function EvidenceLocker({
  selectedBugId,
  onSelectBug,
}: {
  selectedBugId: string | null;
  onSelectBug: (bugId: string, evidenceLine: number) => void;
}) {
  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="dot" />
        Evidence Locker
        <span style={{ marginLeft: "auto", color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>
          {MOCK_BUGS.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {MOCK_BUGS.map((bug, i) => (
          <button
            key={bug.id}
            id={bug.id}
            onClick={() => onSelectBug(bug.id, bug.evidenceLine)}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${i * 60}ms`,
              background: selectedBugId === bug.id ? "var(--bg-elevated)" : "var(--bg-card)",
              border: selectedBugId === bug.id ? "1px solid var(--green)" : "1px solid var(--border)",
              boxShadow: selectedBugId === bug.id ? "0 0 12px var(--green-glow)" : "none",
              borderRadius: 6,
              padding: "10px 12px",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "all 0.2s ease",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className={SEVERITY_STYLES[bug.severity]}
                style={{
                  fontSize: "0.6rem",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 3,
                  letterSpacing: "0.05em",
                }}
              >
                {bug.severity}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  color: selectedBugId === bug.id ? "var(--green)" : "var(--text-primary)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {bug.name}
              </span>
            </div>
            <span
              style={{
                fontSize: "0.6rem",
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
              }}
            >
              {bug.timestamp}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
