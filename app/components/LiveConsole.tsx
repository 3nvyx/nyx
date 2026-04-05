"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";

import { ConsoleLine } from "../hooks/useNyxEvents";

const LINE_COLORS: Record<string, string> = {
  cmd: "var(--amber)",
  header: "var(--text-secondary)",
  data: "var(--text-primary)",
  info: "var(--text-secondary)",
  finding: "var(--green)",
  warning: "var(--amber)",
  critical: "var(--red)",
  blank: "transparent",
};

export interface LiveConsoleHandle {
  scrollToLine: (lineId: number) => void;
}

const LiveConsole = forwardRef<LiveConsoleHandle, { lines: ConsoleLine[] }>(function LiveConsole({ lines }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToLine(lineId: number) {
      const el = document.getElementById(`console-line-${lineId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.background = "rgba(0,255,65,0.1)";
        el.style.borderLeft = "3px solid var(--green)";
        setTimeout(() => {
          el.style.background = "transparent";
          el.style.borderLeft = "3px solid transparent";
        }, 2500);
      }
    },
  }));

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="panel scanline flex flex-col h-full">
      <div className="panel-header">
        <span className="dot" />
        Live Console
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#27c93f" }} />
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        style={{
          padding: "12px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          lineHeight: 1.7,
          minHeight: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            id={`console-line-${line.id}`}
            style={{
              color: LINE_COLORS[line.type] || "var(--text-primary)",
              fontWeight: line.type === "critical" ? 700 : 400,
              minHeight: line.type === "blank" ? 12 : "auto",
              paddingLeft: 8,
              borderLeft: "3px solid transparent",
              transition: "all 0.3s ease",
            }}
          >
            <span style={{ color: "var(--text-muted)", marginRight: 12, userSelect: "none", opacity: 0.4 }}>
              {String(line.id).padStart(2, "0")}
            </span>
            {line.text}
          </div>
        ))}
        <span className="animate-blink" style={{ color: "var(--green)" }}>
          ▊
        </span>
      </div>
    </div>
  );
});

export default LiveConsole;
