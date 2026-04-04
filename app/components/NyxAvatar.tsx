"use client";

import NyxRobot3D from "./NyxRobot3D";

interface NyxAvatarProps {
  working?: boolean;
}

export default function NyxAvatar({ working = false }: NyxAvatarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: 180,
        position: "relative",
      }}
    >
      {/* 3D Robot Avatar - Floating freely */}
      <div style={{ width: "100%", height: "100%" }}>
        <NyxRobot3D working={working} />
      </div>
    </div>
  );
}
