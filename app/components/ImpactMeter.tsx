"use client";

import { useEffect, useState } from "react";

export default function ImpactMeter({ progress }: { progress: number }) {
  // Hardcoded hex colors — no CSS variables
  const getBarColor = (pct: number): string => {
    if (pct < 25) return "#00ff41";       // bright green
    if (pct < 50) return "#ffaa00";       // matches P2 Evidence Locker
    if (pct < 65) return "#ffaa00";       // amber/orange
    return "#ff2d2d";                      // matches LiveConsole red text
  };

  const getLabel = (pct: number) => {
    if (pct === 0) return "READY";
    if (pct < 10) return "INITIALIZING...";
    if (pct < 30) return "ANALYZING...";
    if (pct < 60) return "MEDIUM RISK";
    if (pct < 80) return "HIGH RISK";
    return "CRITICAL";
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
          System Impact Correlation:{" "}
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

      {/* HIGH RISK Alert Text */}
      {progress >= 65 && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.1rem",
            fontWeight: 900,
            color: "#ff2d2d",
            textAlign: "center",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: 8,
            textShadow: "0 0 12px rgba(255,45,45,0.6)",
            animation: "pulse-opacity 1.5s ease-in-out infinite",
          }}
        >
          ⚠ HIGH RISK
        </div>
      )}

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
            animation: progress >= 65 ? "pulse-opacity 1.5s ease-in-out infinite" : "none",
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
        <span>STATUS: ACTIVE_MONITORING</span>
        <span>THREAT_ESTIMATION: STABLE</span>
        <span>v2.4.92-BETA</span>
      </div>
    </div>
  );
}
