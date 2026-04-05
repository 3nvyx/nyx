"use client";

import { useEffect, useState } from "react";
import NyxRobot3D from "./NyxRobot3D";
import DraggableSpeechBubble from "./DraggableSpeechBubble";

interface Message {
  id: number;
  text: string;
  timestamp: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: 1, text: "Initializing reconnaissance on target-alpha.com...", timestamp: "04:00:01" },
  { id: 2, text: "Port scan complete. 4 services detected: HTTP(80), HTTPS(443), SSH(22), MySQL(3306).", timestamp: "04:02:15" },
  { id: 3, text: "Crawling web application. 47 unique endpoints discovered so far.", timestamp: "04:08:33" },
  { id: 4, text: "Interesting — /config/settings.json is publicly accessible. Extracting contents now.", timestamp: "04:15:09" },
  { id: 5, text: "Found database credentials in the exposed config file. Severity: CRITICAL.", timestamp: "04:19:22" },
  { id: 6, text: "I've detected an unusual response header in the API endpoint. It looks like the server is leaking version info. Checking for known CVEs now...", timestamp: "04:25:41" },
  { id: 7, text: "CVE-2024-3127 matches the detected Apache/2.4.49 version. Verifying exploitability...", timestamp: "04:28:05" },
  { id: 8, text: "Reflected XSS confirmed on /search?q= parameter. Payload: <script>alert(1)</script>", timestamp: "04:32:18" },
];

interface NyxAvatarProps {
  working?: boolean;
}

export default function NyxAvatar({ working = false }: NyxAvatarProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingText, setTypingText] = useState("");

  useEffect(() => {
    if (!working) return;
    
    if (visibleCount >= MOCK_MESSAGES.length) {
      setTypingText("All scans complete. Awaiting further commands.");
      return;
    }

    const showNext = () => {
      const msg = MOCK_MESSAGES[visibleCount];
      setTypingText("");

      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < msg.text.length) {
          setTypingText(msg.text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setVisibleCount((c) => c + 1);
        }
      }, 30);

      return () => clearInterval(typeInterval);
    };

    const delay = visibleCount === 0 ? 500 : 2500;
    const timer = setTimeout(showNext, delay);
    return () => clearTimeout(timer);
  }, [visibleCount, working]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
    }}>
      {/* Speech bubble — rendered as regular HTML absolutely positioned to the right */}
      {typingText && (
        <DraggableSpeechBubble initialTop="30px" initialLeft="170px" width="220px">
          <div style={{
            background: "rgba(10, 10, 10, 0.92)",
            border: "1px solid var(--green)",
            borderRadius: "8px",
            padding: "8px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 600,
            lineHeight: 1.5,
            color: "var(--green)",
            boxShadow: "0 0 12px var(--green-glow)",
            position: "relative",
          }}>
            {typingText}
            <span className="animate-blink" style={{ fontWeight: 800 }}>|</span>
            {/* Triangle pointer — pointing left toward the robot */}
            <div style={{
              position: "absolute",
              top: "16px",
              left: "-8px",
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderRight: "8px solid var(--green)",
            }} />
          </div>
        </DraggableSpeechBubble>
      )}

      {/* 3D Robot Avatar */}
      <div style={{ flex: 1, minHeight: 0, width: "100%" }}>
        <NyxRobot3D working={working} />
      </div>
    </div>
  );
}
