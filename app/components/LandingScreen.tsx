"use client";

import { useState, useEffect } from "react";
import NyxRobot3D from "./NyxRobot3D";
import DraggableSpeechBubble from "./DraggableSpeechBubble";

interface LandingScreenProps {
  onStartScan: (url: string) => void;
  isExiting?: boolean;
}

export default function LandingScreen({ onStartScan, isExiting = false }: LandingScreenProps) {
  const [url, setUrl] = useState("https://target-alpha.com");
  const [showCredentials, setShowCredentials] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const fullText = "Hey, I'm NyX — your autonomous cybersecurity bug and vulnerability hunter. Let's get to work!";

  useEffect(() => {
    if (isExiting) {
      setTypedText("");
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [isExiting]);

  const handleStartScan = async () => {
    setIsDispatching(true);
    setDispatchError(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          username: username || undefined,
          password: password || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Dispatch failed");
      }

      onStartScan(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to dispatch scan";
      setDispatchError(message);
      setIsDispatching(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(circle at center, #1a1a1a 0%, #0d0d0d 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end", // Move UI to bottom
        position: "relative",
        overflow: "hidden",
        paddingBottom: 60, // Space for bottom UI
      }}
    >
      {/* 3D Robot Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Speech bubble — rendered as regular HTML absolutely positioned to the right */}
        {typedText && !isExiting && (
          <DraggableSpeechBubble 
            initialTop="calc(50% - 100px)"
            initialLeft="calc(50% + 120px)"
            width="300px"
          >
            <div style={{
              background: "rgba(10, 10, 10, 0.92)",
              border: "1px solid var(--green)",
              borderRadius: "8px",
              padding: "10px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              fontWeight: 600,
              lineHeight: 1.5,
              color: "var(--green)",
              boxShadow: "0 0 16px var(--green-glow)",
              position: "relative",
            }}>
              {typedText}
              <span className="animate-blink" style={{ fontWeight: 800 }}>|</span>
              {/* Triangle pointer — pointing left toward the robot */}
              <div style={{
                position: "absolute",
                top: "20px",
                left: "-10px",
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderRight: "10px solid var(--green)",
              }} />
            </div>
          </DraggableSpeechBubble>
        )}
        
        {/* The 3D robot fills its container in the center */}
        <div style={{ width: "100%", height: "100%" }}>
          <NyxRobot3D isExiting={isExiting} />
        </div>
      </div>

      {/* Bottom UI Overlay */}
      <div
        className={isExiting ? "" : "animate-fade-in-up"}
        style={{
          zIndex: 1,
          maxWidth: 600,
          width: "90%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "24px",
          background: "rgba(20, 20, 20, 0.7)",
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          boxShadow: "0 0 30px rgba(0,0,0,0.5)",
          opacity: isExiting ? 0 : 1,
          transform: isExiting ? "translateY(20px)" : "none",
          transition: "all 0.5s ease-in-out",
          pointerEvents: isExiting ? "none" : "auto",
        }}
      >
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "var(--green)",
              opacity: 0.6,
            }}
          >
            Target URL:
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border-bright)",
              borderRadius: 8,
              padding: "12px 12px 12px 105px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.9rem",
              color: "var(--text-primary)",
              outline: "none",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--green)";
              e.target.style.boxShadow = "0 0 15px var(--green-glow)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-bright)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Optional Credentials Toggle */}
        <div
          onClick={() => setShowCredentials(!showCredentials)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: showCredentials ? "var(--amber)" : "var(--text-muted)",
            letterSpacing: "0.1em",
            userSelect: "none",
            transition: "color 0.2s ease",
          }}
        >
          <span style={{ fontSize: "0.8rem" }}></span>
          Login (Optional)
          <span style={{ marginLeft: "auto", fontSize: "0.6rem", opacity: 0.5 }}>
            {showCredentials ? "▲" : "▼"}
          </span>
        </div>

        {/* Credentials Fields */}
        {showCredentials && (
          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--text-primary)",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--amber)";
                e.target.style.boxShadow = "0 0 10px var(--amber-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--text-primary)",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--amber)";
                e.target.style.boxShadow = "0 0 10px var(--amber-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                color: "var(--text-muted)",
                opacity: 0.5,
                letterSpacing: "0.05em",
              }}
            >
              Credentials are used for authenticated scanning only and are not stored.
            </span>
          </div>
        )}

        {dispatchError && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "#ff2d2d",
              textAlign: "center",
              padding: "6px 0",
              letterSpacing: "0.05em",
            }}
          >
            ⚠ {dispatchError}
          </div>
        )}

        <button
          onClick={handleStartScan}
          disabled={isDispatching}
          style={{
            background: isDispatching
              ? "linear-gradient(135deg, #333, #222)"
              : "linear-gradient(135deg, #00802b, #004d14)",
            border: "1px solid var(--green)",
            boxShadow: "0 0 15px var(--green-glow)",
            borderRadius: 8,
            padding: "14px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "var(--green)",
            cursor: isDispatching ? "wait" : "pointer",
            textTransform: "uppercase",
            transition: "all 0.2s ease",
            opacity: isDispatching ? 0.6 : 1,
          }}
        >
          {isDispatching ? "⏳ DISPATCHING..." : "▶ START SECURITY SCAN"}
        </button>
      </div>

      {/* Decor/Scanlines */}
      <div className="scanline" style={{ zIndex: 2 }}></div>
    </div>
  );
}
