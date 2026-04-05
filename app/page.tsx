"use client";

import { useRef, useState } from "react";
import ActionBar from "./components/ActionBar";
import EvidenceLocker from "./components/EvidenceLocker";
import NyxAvatar from "./components/NyxAvatar";
import ThoughtStream from "./components/ThoughtStream";
import LiveConsole, { type LiveConsoleHandle } from "./components/LiveConsole";
import ImpactMeter from "./components/ImpactMeter";
import LandingScreen from "./components/LandingScreen";
import { useNyxEvents } from "./hooks/useNyxEvents";

type Phase = "landing" | "transitioning" | "dashboard";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [runId, setRunId] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const consoleRef = useRef<LiveConsoleHandle>(null);
  
  const { thoughts, consoleLines, findings, impact, addEvent, clearEvents } = useNyxEvents();

  // Handle scan start
  const handleStartScan = (url: string) => {
    clearEvents();
    setPhase("transitioning");
    
    // Simulate events for the demo/simulation mode
    setTimeout(() => {
      setPhase("dashboard");
      runSimulation();
    }, 1500);
  };

  // Simulation logic to demonstrate the real-time hook
  const runSimulation = () => {
    const events = [
      { event: "thought", data: { text: "Initializing reconnaissance...", timestamp: "04:00:01" } },
      { event: "console", data: { text: "$ nmap -sV target-alpha.com", type: "cmd" } },
      { event: "impact", data: { progress: 5 } },
      { event: "console", data: { text: "Scan started. Detecting services...", type: "info" } },
      { event: "thought", data: { text: "Port 80/443 open. Web server detected.", timestamp: "04:00:15" } },
      { event: "impact", data: { progress: 12 } },
      { event: "console", data: { text: "80/tcp open http Apache 2.4.49", type: "data" } },
      { event: "thought", data: { text: "Apache 2.4.49 is vulnerable to CVE-2021-41773.", timestamp: "04:01:22" } },
      { event: "console", data: { text: "[!] CRITICAL: Found Directory Traversal vulnerability", type: "critical" } },
      { event: "finding", data: { id: "bug-1", severity: "P1", name: "Directory Traversal (CVE-2021-41773)", timestamp: "04:01:45", evidenceLine: 9 } },
      { event: "impact", data: { progress: 68 } },
      { event: "thought", data: { text: "Vulnerability confirmed. Impact depth high.", timestamp: "04:02:10" } },
    ];

    events.forEach((ev, i) => {
      setTimeout(() => {
        addEvent(`NyX_EVENT:${JSON.stringify(ev)}`);
      }, i * 2000); // 2s per event for visibility
    });
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

  const target = "Awaiting bridge target";
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

      {/* Right Column — Evidence Locker */}
      <div 
        className="tab-appear stagger-3" 
        style={{ gridRow: "1 / 2", gridColumn: "3 / 4", minHeight: 0 }}
      >
        <EvidenceLocker bugs={findings} selectedBugId={selectedFindingId} onSelectBug={handleSelectBug} />
      </div>

      {/* Bottom Bar — Impact Meter */}
      <div 
        className="tab-appear stagger-4"
        style={{ gridRow: "2 / 3", gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 8 }}
      >
        <ImpactMeter progress={metrics.progress} status={status} totalFindings={metrics.totalFindings} />
      </div>
    </div>
  );
}
