"use client";

import { useState } from "react";

import { Bug } from "../hooks/useNyxEvents";

const SEVERITY_STYLES: Record<string, string> = {
  P1: "severity-p1",
  P2: "severity-p2",
  P3: "severity-p3",
  P4: "severity-p4",
};

export default function EvidenceLocker({
  bugs,
  selectedBugId,
  onSelectBug,
}: {
  bugs: Bug[];
  selectedBugId: string | null;
  onSelectBug: (bugId: string, evidenceLine: number) => void;
}) {
  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="dot" />
        Evidence Locker
        <span style={{ marginLeft: "auto", color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>
          {bugs.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {bugs.map((bug, i) => (
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
              {new Date(bug.timestamp).toLocaleTimeString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
