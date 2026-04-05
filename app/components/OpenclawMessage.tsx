"use client";

import { useState } from "react";

interface SentMessage {
  id: string;
  text: string;
  timestamp: Date;
}

export default function OpenclawMessage() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);

  const handleSend = async () => {
    if (!message.trim()) return;

    let fullMessage = `"${message} Please execute the relevant curl commands in order to respond."`;

    setIsSending(true);
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: fullMessage }),
      });

      if (res.ok) {
        setSentMessages((prev) => [
          { id: Date.now().toString(), text: message, timestamp: new Date() },
          ...prev,
        ]);
        setMessage("");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="dot" style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber-glow)" }} />
        COMMS LINK
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col-reverse gap-1.5">
        {sentMessages.map((msg) => (
          <div
            key={msg.id}
            className="animate-fade-in-up"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-sans)",
                color: "var(--text-primary)",
              }}
            >
              {msg.text}
            </span>
            <span
              style={{
                fontSize: "0.6rem",
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
              }}
            >
              {msg.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
        {sentMessages.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", textAlign: "center", marginTop: "10px" }}>
            No messages sent to openclaw yet.
          </div>
        )}
      </div>
      <div style={{ padding: "8px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={isSending}
          placeholder="Message openclaw..."
          style={{
            flex: 1,
            background: "var(--bg-card)",
            border: "1px solid var(--border-bright)",
            borderRadius: "4px",
            padding: "6px 10px",
            color: "var(--text-primary)",
            fontSize: "0.8rem",
            outline: "none",
            fontFamily: "var(--font-sans)"
          }}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          style={{
            background: "var(--green)",
            color: "#000",
            border: "none",
            borderRadius: "4px",
            padding: "0 12px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            cursor: isSending || !message.trim() ? "not-allowed" : "pointer",
            opacity: isSending || !message.trim() ? 0.5 : 1,
            fontFamily: "var(--font-mono)",
            boxShadow: "0 0 6px var(--green-glow)",
          }}
        >
          {isSending ? "SENDING" : "SEND"}
        </button>
      </div>
    </div>
  );
}
