"use client";

const NODES = [
  { id: "root", label: "target-alpha.com", x: 200, y: 30, type: "root" as const },
  { id: "api", label: "/api", x: 70, y: 110, type: "branch" as const },
  { id: "admin", label: "/admin", x: 200, y: 110, type: "danger" as const },
  { id: "config", label: "/config", x: 330, y: 110, type: "danger" as const },
  { id: "search", label: "/search", x: 45, y: 190, type: "warning" as const },
  { id: "users", label: "/api/users", x: 140, y: 190, type: "danger" as const },
  { id: "settings", label: "settings.json", x: 310, y: 190, type: "danger" as const },
  { id: "auth", label: "/auth", x: 200, y: 190, type: "warning" as const },
  { id: "callback", label: "/callback", x: 260, y: 260, type: "warning" as const },
  { id: "robots", label: "robots.txt", x: 80, y: 260, type: "safe" as const },
];

const EDGES = [
  ["root", "api"],
  ["root", "admin"],
  ["root", "config"],
  ["api", "search"],
  ["api", "users"],
  ["config", "settings"],
  ["root", "auth"],
  ["auth", "callback"],
  ["api", "robots"],
];

const TYPE_COLORS: Record<string, string> = {
  root: "var(--green)",
  branch: "var(--text-secondary)",
  danger: "var(--red)",
  warning: "var(--amber)",
  safe: "var(--text-muted)",
};

const TYPE_GLOWS: Record<string, string> = {
  root: "var(--green-glow)",
  danger: "var(--red-glow)",
  warning: "var(--amber-glow)",
  branch: "none",
  safe: "none",
};

export default function AttackTree() {
  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div className="panel flex flex-col" style={{ flex: "1 1 0" }}>
      <div className="panel-header">
        <span className="dot" style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber-glow)" }} />
        Attack Surface Tree
      </div>
      <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ minHeight: 0 }}>
        <svg
          viewBox="0 0 400 300"
          width="100%"
          height="100%"
          style={{ maxHeight: 280, padding: 8 }}
        >
          {/* Edges */}
          {EDGES.map(([from, to]) => {
            const a = nodeMap[from];
            const b = nodeMap[to];
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y + 12}
                x2={b.x}
                y2={b.y - 12}
                stroke="var(--border-bright)"
                strokeWidth="1"
                strokeDasharray="4,3"
                opacity="0.5"
              />
            );
          })}
          {/* Nodes */}
          {NODES.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.type === "root" ? 10 : 6}
                fill={TYPE_COLORS[node.type]}
                opacity={0.9}
                filter={TYPE_GLOWS[node.type] !== "none" ? undefined : undefined}
              >
                {(node.type === "danger" || node.type === "root") && (
                  <animate
                    attributeName="opacity"
                    values="0.9;0.5;0.9"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              {/* Glow circle */}
              {(node.type === "danger" || node.type === "root") && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.type === "root" ? 16 : 12}
                  fill="none"
                  stroke={TYPE_COLORS[node.type]}
                  strokeWidth="1"
                  opacity="0.2"
                >
                  <animate
                    attributeName="r"
                    values={node.type === "root" ? "14;20;14" : "10;16;10"}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0.05;0.3"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <text
                x={node.x}
                y={node.y + (node.type === "root" ? 24 : 20)}
                textAnchor="middle"
                fill={TYPE_COLORS[node.type]}
                fontFamily="var(--font-mono)"
                fontSize="8"
                fontWeight={node.type === "root" ? "700" : "400"}
                opacity="0.85"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
