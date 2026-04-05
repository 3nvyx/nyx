"use client";

import { useState, useCallback } from "react";

export interface Thought {
  id: number;
  text: string;
  timestamp: string;
}

export interface ConsoleLine {
  id: number;
  text: string;
  type: "cmd" | "info" | "header" | "data" | "finding" | "warning" | "critical" | "blank";
}

export interface Bug {
  id: string;
  severity: "P1" | "P2" | "P3" | "P4";
  name: string;
  timestamp: string;
  evidenceLine: number;
}

export function useNyxEvents() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [findings, setFindings] = useState<Bug[]>([]);
  const [impact, setImpact] = useState(0);

  const addEvent = useCallback((eventStr: string) => {
    if (!eventStr.startsWith("NyX_EVENT:")) return;

    try {
      const { event, data } = JSON.parse(eventStr.replace("NyX_EVENT:", ""));

      switch (event) {
        case "thought":
          setThoughts((prev) => [
            ...prev,
            { ...data, id: Date.now() + Math.random() }
          ]);
          break;
        case "console":
          setConsoleLines((prev) => [
            ...prev,
            { ...data, id: prev.length + 1 }
          ]);
          break;
        case "finding":
          setFindings((prev) => [
            ...prev,
            data
          ]);
          break;
        case "impact":
          setImpact(data.progress);
          break;
      }
    } catch (err) {
      console.error("Failed to parse NyX event:", err);
    }
  }, []);

  return {
    thoughts,
    consoleLines,
    findings,
    impact,
    addEvent,
    clearEvents: () => {
      setThoughts([]);
      setConsoleLines([]);
      setFindings([]);
      setImpact(0);
    }
  };
}
