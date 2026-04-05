"use client";

import { useEffect, useRef } from "react";

import { Thought } from "../hooks/useNyxEvents";

export default function ThoughtStream({ messages }: { messages: Thought[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="panel flex-1 flex flex-col" style={{ minHeight: 0 }}>
      <div className="panel-header">
        <span className="dot" style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber-glow)" }} />
        Thought Stream
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              lineHeight: 1.6,
              color: "var(--text-muted)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            No thought events yet. The bridge can post `thought` events to narrate what OpenClaw is doing.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              lineHeight: 1.6,
              color: "var(--text-primary)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
