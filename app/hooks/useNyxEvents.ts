"use client";

import { useState, useCallback, useEffect } from "react";
import Pusher from "pusher-js";

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

  const addEvent = useCallback((payload: any) => {
    try {
      // The payload from pusher is already parsed
      let parsedPayload = payload;
      
      // Fallback in case it's passed as a string (e.g. legacy test scripts)
      if (typeof payload === "string") {
        parsedPayload = JSON.parse(payload.replace("NyX_EVENT:", ""));
      }
      
      const { event, data } = parsedPayload;

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

  // Subscribe to real-time events via Pusher
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

      if (!pusherKey || !pusherCluster) {
        console.warn("Pusher keys are missing, cannot connect to real-time UI. Add NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER to .env");
        return;
      }

      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });

      const channel = pusher.subscribe("nyx-channel");
      
      channel.bind("nyx-event", (data: any) => {
        addEvent(data);
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
    }
  }, [addEvent]);

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
