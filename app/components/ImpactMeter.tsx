"use client";

import type { OpenClawMetrics, RunStatus } from "@/lib/openclaw/types";

export default function ImpactMeter({
  progress,
  status = "idle",
  totalFindings = 0
}: {
  progress: number;
  status?: string;
  totalFindings?: number;
}) {
  const getBarColor = (pct: number): string => {
    if (pct === 100) return "#00ff41";     // solid green when done
    return "#00ff41";                      // green while scanning
  };

  const getLabel = (pct: number) => {
    if (pct === 0) return "READY";
    if (pct < 15) return "INITIALIZING...";
    if (pct < 40) return "RECONNAISSANCE...";
    if (pct < 80) return "DEEP SCANNING...";
    if (pct < 100) return "FINALIZING...";
    return "COMPLETE";
  };

  const barColor = getBarColor(progress);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "16px 40px",
        minHeight: 100,
        background: "rgba(8, 8, 12, 0.95)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Header: Label + Percentage */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
          }}
        >
          SCAN STATUS:{" "}
          <span style={{ color: barColor }}>{getLabel(progress)}</span>
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            fontWeight: 800,
            color: barColor,
          }}
        >
          {progress}%
        </span>
      </div>



      {/* ===== THE LOADING BAR ===== */}
      <div
        style={{
          width: "100%",
          height: 24,
          minHeight: 24,
          backgroundColor: "#1a1a2e",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        {/* Colored fill */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${progress}%`,
            backgroundColor: barColor,
            borderRadius: 12,
            transition: "width 0.8s ease, background-color 0.5s ease",
            boxShadow: `0 0 20px ${barColor}, 0 0 6px ${barColor}`,
          }}
        />
      </div>

      {/* Footer status */}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: "0.45rem",
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.12em",
        }}
      >
        <span>STATUS: {status.toUpperCase()}</span>
        <span>FINDINGS: {totalFindings}</span>
        <span>PROGRESS: {progress}%</span>
      </div>
    </div>
  );
}
