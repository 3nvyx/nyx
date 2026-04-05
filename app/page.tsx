"use client";

import { useRef, useState } from "react";
import EvidenceLocker from "./components/EvidenceLocker";
import NyxAvatar from "./components/NyxAvatar";
import LiveConsole, { type LiveConsoleHandle } from "./components/LiveConsole";
import LandingScreen from "./components/LandingScreen";

type Phase = "landing" | "transitioning" | "dashboard";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const consoleRef = useRef<LiveConsoleHandle>(null);

  const handleStartScan = (url: string) => {
    setPhase("transitioning");
    setTimeout(() => {
      setPhase("dashboard");
    }, 1500);
  };

  const handleSelectBug = (bugId: string, evidenceLine: number) => {
    setSelectedBugId(bugId);
    consoleRef.current?.scrollToLine(evidenceLine);
  };

  if (phase === "landing" || phase === "transitioning") {
    return <LandingScreen onStartScan={handleStartScan} isExiting={phase === "transitioning"} />;
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "300px 1fr",
      height: "100vh",
      width: "100vw",
      background: "var(--bg)",
      overflow: "hidden",
    }}>
      {/* Left — Vulnerability Report + Avatar stacked */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        overflow: "visible", // Allowed overflow so bubble can hang outside
        borderRight: "1px solid var(--border)",
      }}>
        {/* Vulnerability Report (scrollable) */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <EvidenceLocker selectedBugId={selectedBugId} onSelectBug={handleSelectBug} />
        </div>

        {/* NyX Avatar (fixed height at bottom) */}
        <div style={{
          height: 260,
          flexShrink: 0,
          borderTop: "1px solid var(--border)",
          position: "relative",
        }}>
          <NyxAvatar working={true} />
        </div>
      </div>

      {/* Right — Live Console (takes all remaining space) */}
      <div className="scanline" style={{
        overflowY: "auto",
        position: "relative",
      }}>
        <LiveConsole ref={consoleRef} />
      </div>
    </div>
  );
}
