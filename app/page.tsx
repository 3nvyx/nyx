"use client";

import { useRef, useState } from "react";
import EvidenceLocker from "./components/EvidenceLocker";
import NyxAvatar from "./components/NyxAvatar";
import ThoughtStream from "./components/ThoughtStream";
import LiveConsole, { type LiveConsoleHandle } from "./components/LiveConsole";
import ImpactMeter from "./components/ImpactMeter";
import LandingScreen from "./components/LandingScreen";
import ActionBar from "./components/ActionBar";
import AttackTree from "./components/AttackTree";
import { useNyxEvents } from "./hooks/useNyxEvents";

type Phase = "landing" | "transitioning" | "dashboard";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
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
    setSelectedBugId(bugId);
    consoleRef.current?.scrollToLine(evidenceLine);
  };

  if (phase === "landing" || phase === "transitioning") {
    return <LandingScreen onStartScan={handleStartScan} isExiting={phase === "transitioning"} />;
  }

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
          <NyxAvatar working={true} />
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
        <AttackTree />
        <EvidenceLocker bugs={findings} selectedBugId={selectedBugId} onSelectBug={handleSelectBug} />
      </div>

      {/* Bottom Bar — Action + Impact */}
      <div 
        className="tab-appear stagger-4"
        style={{ 
          gridRow: "2 / 3", 
          gridColumn: "1 / -1",
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
      >
        <ActionBar currentUrl={targetUrl} />
        <ImpactMeter progress={impact} />
      </div>
    </div>
  );
}
