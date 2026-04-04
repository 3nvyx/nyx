"use client";

import { useState, useEffect } from "react";
import NyxRobot3D from "./NyxRobot3D";

interface LandingScreenProps {
  onStartScan: (url: string) => void;
  isExiting?: boolean;
}

export default function LandingScreen({ onStartScan, isExiting = false }: LandingScreenProps) {
  const [url, setUrl] = useState("https://target-alpha.com");
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
        }}
      >
        <NyxRobot3D speechText={typedText} isExiting={isExiting} />
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
            TARGET://
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

        <button
          onClick={() => onStartScan(url)}
          style={{
            background: "linear-gradient(135deg, #00802b, #004d14)",
            border: "1px solid var(--green)",
            boxShadow: "0 0 15px var(--green-glow)",
            borderRadius: 8,
            padding: "14px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "var(--green)",
            cursor: "pointer",
            textTransform: "uppercase",
            transition: "all 0.2s ease",
          }}
        >
          ▶ START SECURITY SCAN
        </button>
      </div>

      {/* Decor/Scanlines */}
      <div className="scanline" style={{ zIndex: 2 }}></div>
    </div>
  );
}
