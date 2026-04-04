"use client";

import { useRef, useState } from "react";
import ActionBar from "./components/ActionBar";
import EvidenceLocker from "./components/EvidenceLocker";
import NyxAvatar from "./components/NyxAvatar";
import ThoughtStream from "./components/ThoughtStream";
import LiveConsole, { type LiveConsoleHandle } from "./components/LiveConsole";
import ImpactMeter from "./components/ImpactMeter";
import LandingScreen from "./components/LandingScreen";
import { useOpenClawRun } from "./hooks/useOpenClawRun";
import type { OpenClawCommandType } from "@/lib/openclaw/types";

type Phase = "landing" | "transitioning" | "dashboard";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [runId, setRunId] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const consoleRef = useRef<LiveConsoleHandle>(null);
  const { snapshot, isConnecting, error } = useOpenClawRun(runId);

  const handleCommand = async (type: OpenClawCommandType, payload: Record<string, unknown> = {}) => {
    if (!runId && type !== "start_scan") {
      return;
    }

    try {
      setCommandError(null);

      const response = await fetch("/api/openclaw/commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runId: runId ?? undefined,
          type,
          payload,
          issuedBy: "dashboard",
        }),
      });

      if (!response.ok) {
        throw new Error(`Command failed (${response.status}).`);
      }

      const body = (await response.json()) as {
        command: {
          runId: string;
        };
      };

      if (!runId) {
        setRunId(body.command.runId);
      }
    } catch (caughtError: unknown) {
      setCommandError(caughtError instanceof Error ? caughtError.message : "Command failed.");
    }
  };

  const handleStartScan = async (url: string) => {
    setIsStarting(true);
    setStartError(null);

    try {
      const response = await fetch("/api/openclaw/commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "start_scan",
          payload: {
            target: url,
          },
          issuedBy: "dashboard",
        }),
      });

      if (!response.ok) {
        throw new Error(`Unable to queue run (${response.status}).`);
      }

      const body = (await response.json()) as {
        command: {
          runId: string;
        };
      };

      setRunId(body.command.runId);
      setPhase("transitioning");
      setTimeout(() => {
        setPhase("dashboard");
      }, 1500);
    } catch (caughtError: unknown) {
      setStartError(caughtError instanceof Error ? caughtError.message : "Unable to start the run.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectFinding = (findingId: string, evidenceLogId?: string) => {
    setSelectedFindingId(findingId);
    if (evidenceLogId) {
      consoleRef.current?.scrollToLine(evidenceLogId);
    }
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

  const target = snapshot?.target ?? "Awaiting bridge target";
  const status = snapshot?.status ?? "idle";
  const logs = snapshot?.logs ?? [];
  const thoughts = snapshot?.thoughts ?? [];
  const findings = snapshot?.findings ?? [];
  const metrics = snapshot?.metrics ?? {
    progress: 0,
    riskPercent: 0,
    totalFindings: 0,
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
          <NyxAvatar working={status === "running" || status === "queued"} />
        </div>
        <ThoughtStream thoughts={thoughts} />
      </div>

      {/* Center — Live Console */}
      <div 
        className="tab-appear stagger-2"
        style={{ gridRow: "1 / 2", gridColumn: "2 / 3", minHeight: 0 }}
      >
        <LiveConsole ref={consoleRef} lines={logs} />
      </div>

      {/* Right Column — Evidence Locker */}
      <div 
        className="tab-appear stagger-3" 
        style={{ gridRow: "1 / 2", gridColumn: "3 / 4", minHeight: 0 }}
      >
        <EvidenceLocker
          findings={findings}
          selectedFindingId={selectedFindingId}
          onSelectFinding={handleSelectFinding}
        />
      </div>

      {/* Bottom Bar — Impact Meter */}
      <div 
        className="tab-appear stagger-4"
        style={{ gridRow: "2 / 3", gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 8 }}
      >
        {runId ? (
          <ActionBar
            runId={runId}
            target={target}
            status={status}
            disabled={isConnecting}
            onCommand={handleCommand}
          />
        ) : null}
        <div className="panel" style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
          <span style={{ color: "var(--text-secondary)" }}>Target:</span>{" "}
          <span style={{ color: "var(--green)" }}>{target}</span>
          <span
            style={{
              marginLeft: 16,
              color: error || commandError ? "var(--red)" : "var(--text-secondary)",
            }}
          >
            {commandError ?? error ?? (isConnecting ? "Connecting to live stream..." : "Live stream connected")}
          </span>
        </div>
        <ImpactMeter metrics={metrics} status={status} />
      </div>
    </div>
  );
}
