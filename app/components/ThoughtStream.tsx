"use client";

import { useEffect, useState, useRef } from "react";

interface Message {
  id: number;
  text: string;
  timestamp: string;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Initializing reconnaissance on target-alpha.com...",
    timestamp: "04:00:01",
  },
  {
    id: 2,
    text: "Port scan complete. 4 services detected: HTTP(80), HTTPS(443), SSH(22), MySQL(3306).",
    timestamp: "04:02:15",
  },
  {
    id: 3,
    text: "Crawling web application. 47 unique endpoints discovered so far.",
    timestamp: "04:08:33",
  },
  {
    id: 4,
    text: "Interesting — /config/settings.json is publicly accessible. Extracting contents now.",
    timestamp: "04:15:09",
  },
  {
    id: 5,
    text: "Found database credentials in the exposed config file. Severity: CRITICAL.",
    timestamp: "04:19:22",
  },
  {
    id: 6,
    text: "I've detected an unusual response header in the API endpoint. It looks like the server is leaking version info. Checking for known CVEs now...",
    timestamp: "04:25:41",
  },
  {
    id: 7,
    text: "CVE-2024-3127 matches the detected Apache/2.4.49 version. Verifying exploitability...",
    timestamp: "04:28:05",
  },
  {
    id: 8,
    text: "Reflected XSS confirmed on /search?q= parameter. Payload: <script>alert(1)</script>",
    timestamp: "04:32:18",
  },
];

export default function ThoughtStream() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount >= MOCK_MESSAGES.length) return;

    const showNext = () => {
      const msg = MOCK_MESSAGES[visibleCount];
      setIsTyping(true);
      setTypingText("");

      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < msg.text.length) {
          setTypingText(msg.text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          setVisibleCount((c) => c + 1);
        }
      }, 18);

      return () => clearInterval(typeInterval);
    };

    const delay = visibleCount === 0 ? 500 : 2000;
    const timer = setTimeout(showNext, delay);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount, typingText]);

  return (
    <div className="panel flex-1 flex flex-col" style={{ minHeight: 0 }}>
      <div className="panel-header">
        <span className="dot" style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber-glow)" }} />
        Thought Stream
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ minHeight: 0 }}>
        {MOCK_MESSAGES.slice(0, visibleCount).map((msg) => (
          <div
            key={msg.id}
            className="animate-fade-in-up"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              lineHeight: 1.6,
              color: "var(--text-primary)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            <span style={{ color: "var(--green)", marginRight: 8, opacity: 0.6 }}>[{msg.timestamp}]</span>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              lineHeight: 1.6,
              color: "var(--text-primary)",
              background: "var(--bg-card)",
              border: "1px solid var(--green)",
              boxShadow: "0 0 8px var(--green-glow)",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            <span style={{ color: "var(--green)", marginRight: 8, opacity: 0.6 }}>
              [{MOCK_MESSAGES[visibleCount]?.timestamp}]
            </span>
            {typingText}
            <span className="animate-blink" style={{ color: "var(--green)", marginLeft: 1 }}>
              ▊
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
