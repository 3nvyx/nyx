"use client";

import { useState, useRef, ReactNode } from "react";

interface DraggableSpeechBubbleProps {
  children: ReactNode;
  initialTop?: string | number;
  initialLeft?: string | number;
  width?: string | number;
}

export default function DraggableSpeechBubble({ children, initialTop, initialLeft, width }: DraggableSpeechBubbleProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "absolute",
        top: initialTop,
        left: initialLeft,
        width: width,
        zIndex: 10,
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none", // Prevent page scroll on touch drag
      }}
    >
      <div style={{ pointerEvents: "none" }}>
        {children}
      </div>
    </div>
  );
}
