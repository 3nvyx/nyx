"use client";

import { useState } from "react";

export default function ActionBar({ currentUrl, onScanStateChange }: { currentUrl?: string, onScanStateChange?: (running: boolean) => void }) {
  const [url, setUrl] = useState(currentUrl || "https://target-alpha.com");
  const [isRunning, setIsRunning] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const handleInitiate = async () => {
    setIsPending(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        setIsRunning(true);
        onScanStateChange?.(true);
      }
    } catch (err) {
      console.error("Initiate failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  const handleKill = async () => {
    setIsPending(true);
    try {
      const res = await fetch("/api/kill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        setIsRunning(false);
        onScanStateChange?.(false);
      }
    } catch (err) {
      console.error("Kill failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className="panel"
      style={{
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Status indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isRunning ? "var(--green)" : "var(--text-muted)",
            boxShadow: isRunning ? "0 0 8px var(--green-glow)" : "none",
            transition: "all 0.3s ease",
          }}
        />
        {isRunning ? "Scanning" : "Idle"}
      </div>

      {/* URL Input */}
      <div
        style={{
          flex: 1,
          minWidth: 200,
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--green)",
            opacity: 0.6,
          }}
        >
          TARGET://
        </span>
        <input
          type="text"
          id="target-url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isPending}
          style={{
            width: "100%",
            background: "var(--bg)",
            border: "1px solid var(--border-bright)",
            borderRadius: 6,
            padding: "10px 14px 10px 90px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--text-primary)",
            outline: "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            opacity: isPending ? 0.5 : 1,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--green)";
            e.target.style.boxShadow = "0 0 12px var(--green-glow)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border-bright)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Initiate Button */}
      <button
        id="initiate-btn"
        className={isRunning ? "" : "animate-pulse-green"}
        onClick={handleInitiate}
        disabled={isPending || isRunning}
        style={{
          background: isRunning
            ? "linear-gradient(135deg, #004d14, #002a0a)"
            : "linear-gradient(135deg, #00802b, #004d14)",
          border: "1px solid var(--green)",
          boxShadow: isRunning ? "none" : "0 0 16px var(--green-glow)",
          borderRadius: 6,
          padding: "10px 24px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "var(--green)",
          cursor: isPending || isRunning ? "default" : "pointer",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          transition: "all 0.2s ease",
          opacity: isRunning ? 0.6 : 1,
        }}
      >
        {isPending ? "⏳ Processing..." : isRunning ? "⟳ Scanning..." : "▶ Initiate Pen Test"}
      </button>

      {/* Kill Switch */}
      <button
        id="kill-switch-btn"
        className={isRunning ? "animate-pulse-red" : ""}
        onClick={handleKill}
        disabled={isPending || !isRunning}
        style={{
          background: "linear-gradient(135deg, #4d0000, #2a0000)",
          border: "1px solid var(--red)",
          boxShadow: isRunning ? "0 0 12px var(--red-glow)" : "none",
          borderRadius: 6,
          padding: "10px 20px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "var(--red)",
          cursor: isPending || !isRunning ? "default" : "pointer",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          transition: "all 0.2s ease",
          opacity: !isRunning ? 0.3 : 1,
        }}
      >
        ⛔ Kill Switch
      </button>
    </div>
  );
}
