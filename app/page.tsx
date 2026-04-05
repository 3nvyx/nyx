"use client";

import { useRef, useState } from "react";
import ActionBar from "./components/ActionBar";
import EvidenceLocker from "./components/EvidenceLocker";
import NyxAvatar from "./components/NyxAvatar";
import ThoughtStream from "./components/ThoughtStream";
import LiveConsole, { type LiveConsoleHandle } from "./components/LiveConsole";
import ImpactMeter from "./components/ImpactMeter";
import LandingScreen from "./components/LandingScreen";
import AttackTree from "./components/AttackTree";
import { useNyxEvents } from "./hooks/useNyxEvents";

type Phase = "landing" | "transitioning" | "dashboard";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [runId, setRunId] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string>("Awaiting bridge target");
  const consoleRef = useRef<LiveConsoleHandle>(null);
  
  const { thoughts, consoleLines, findings, impact, addEvent, clearEvents } = useNyxEvents();

  // Handle scan start transition
  const handleStartScan = (url: string) => {
    setTargetUrl(url);
    clearEvents();
    setPhase("transitioning");
    
    // Small transition before showing the dashboard
    setTimeout(() => {
      setPhase("dashboard");
    }, 1500);
  };

  const handleSelectBug = (bugId: string, evidenceLine: number) => {
    setSelectedFindingId(bugId);
    consoleRef.current?.scrollToLine(evidenceLine);
  };

  if (phase === "landing" || phase === "transitioning") {
    return (
      <LandingScreen
        onStartScan={handleStartScan}
        isExiting={phase === "transitioning"}
        isStarting={isStarting}
        error={startError}
      />
    );
  }

  const target = targetUrl;
  const status = phase === "dashboard" ? "running" : "idle";
  const logs: any[] = [];
  const metrics = {
    progress: impact,
    riskPercent: impact, 
    totalFindings: findings.length,
    countsBySeverity: { P1: 0, P2: 0, P3: 0, P4: 0 },
  };

  return (
    <div className="reveal-container">
      {/* Left Column — Avatar + Thought Stream */}
      <div
        className="tab-appear stagger-1"
        style={{
          gridRow: "1 / 2",
          gridColumn: "1 / 2",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minHeight: 0,
        }}
      >
        <div className="panel" style={{ flexShrink: 0 }}>
          <NyxAvatar working={status === "running"} />
        </div>
        <ThoughtStream messages={thoughts} />
      </div>

      {/* Center — Live Console */}
      <div 
        className="tab-appear stagger-2"
        style={{ gridRow: "1 / 2", gridColumn: "2 / 3", minHeight: 0 }}
      >
        <LiveConsole ref={consoleRef} lines={consoleLines} />
      </div>

      {/* Right Column — Evidence Locker & Attack Tree */}
      <div 
        className="tab-appear stagger-3" 
        style={{ 
          gridRow: "1 / 2", 
          gridColumn: "3 / 4", 
          display: "flex", 
          flexDirection: "column", 
          gap: 8,
          minHeight: 0 
        }}
      >
        <EvidenceLocker bugs={findings} selectedBugId={selectedFindingId} onSelectBug={handleSelectBug} />
      </div>

      {/* Bottom Bar — Action + Impact */}
      <div 
        className="tab-appear stagger-4"
        style={{ gridRow: "2 / 3", gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 8 }}
      >
        <ImpactMeter progress={metrics.progress} status={status} totalFindings={metrics.totalFindings} />
      </div>
    </div>
  );
}
