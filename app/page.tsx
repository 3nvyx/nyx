"use client";

import { useRef, useState, useEffect } from "react";
import ActionBar from "./components/ActionBar";
import EvidenceLocker from "./components/EvidenceLocker";
import OpenclawMessage from "./components/OpenclawMessage";
import ReportModal from "./components/ReportModal";
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
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [finalReport, setFinalReport] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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

  useEffect(() => {
    if (phase !== "dashboard") return;

    const startupSequence = [
      { text: "Initializing NyX core interceptors...", delay: 200, type: "info" },
      { text: "Bootstrapping Openclaw cognitive array...", delay: 700, type: "info" },
      { text: `Target locked: ${targetUrl}`, delay: 1200, type: "header" },
      { text: "Establishing secure neural bridge via Discord...", delay: 1600, type: "info" },
      { text: "$ proxychains4 -q nmap -sn", delay: 2200, type: "cmd" },
      { text: "Bypassing peripheral firewall signatures...", delay: 2600, type: "warning" },
      { text: "System ready. Autonomy granted. Awaiting telemetry...", delay: 3400, type: "info" },
    ];

    const timeouts = startupSequence.map((log) =>
      setTimeout(() => {
        addEvent({
          event: "console",
          data: { text: log.text, type: log.type }
        });
      }, log.delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [phase, targetUrl, addEvent]);

  useEffect(() => {
    if (phase !== "dashboard") return;

    let count = 0;
    const maxPings = 4;

    const pingOpenclaw = async () => {
      count++;
      let message = "Please continue the scan.";
      if (count === maxPings) {
        message = "Finish the scan and set impact to 100.";
      }
      message += " Please execute the relevant curl commands in order to respond.";

      try {
        await fetch("/api/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
      } catch (err) {
        console.error("Failed to auto-ping Discord:", err);
      }

      if (count >= maxPings) {
        clearInterval(intervalId);
      }
    };

    pingOpenclaw(); // Start the first ping at the beginning
    const intervalId = setInterval(pingOpenclaw, 25000);

    return () => clearInterval(intervalId);
  }, [phase]);

  // Track completion to generate Grok Report
  useEffect(() => {
    if (phase !== "dashboard") return;
    if (impact >= 100 && !isReportGenerating && !finalReport) {
      const generateReport = async () => {
        setIsReportGenerating(true);
        try {
          const res = await fetch("/api/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ findings, thoughts }),
          });

          if (res.ok) {
            const data = await res.json();
            setFinalReport(data.report);
          } else {
            console.error("Failed to generate report");
            setFinalReport("## Error\nCould not retrieve remote report from API.");
          }
        } catch (err) {
          console.error(err);
          setFinalReport("## Error\nException: Could not reach report endpoint.");
        } finally {
          setIsReportGenerating(false);
        }
      };

      generateReport();
    }
  }, [impact, phase, isReportGenerating, finalReport, findings, thoughts]);

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
        <div style={{ flex: 2, minHeight: 0 }}>
          <EvidenceLocker bugs={findings} selectedBugId={selectedFindingId} onSelectBug={handleSelectBug} />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <OpenclawMessage />
        </div>

        {isReportGenerating && (
          <div
            className="animate-pulse-green"
            style={{
              padding: "10px",
              background: "var(--bg-card)",
              border: "1px dashed var(--green)",
              color: "var(--green)",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: "bold",
              borderRadius: "4px",
              boxShadow: "0 0 6px rgba(0,255,65,0.1)",
              textTransform: "uppercase"
            }}
          >
            Synthesizing Security Report...
          </div>
        )}

        {!isReportGenerating && finalReport && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            style={{
              padding: "10px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-bright)",
              color: "var(--green)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: "bold",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: "0 0 6px rgba(0,255,65,0.1)",
              textTransform: "uppercase"
            }}
          >
            View Security Report
          </button>
        )}
      </div>

      {/* Bottom Bar — Action + Impact */}
      <div
        className="tab-appear stagger-4"
        style={{ gridRow: "2 / 3", gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 8 }}
      >
        <ImpactMeter progress={metrics.progress} status={status} totalFindings={metrics.totalFindings} />
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        report={finalReport}
        isGenerating={isReportGenerating}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
