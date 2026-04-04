"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";

const SCAN_OUTPUT = [
  { id: 1, text: "$ nmap -sV -sC target-alpha.com", type: "cmd" },
  { id: 2, text: "Starting Nmap 7.94 ( https://nmap.org ) at 2026-04-04 04:00 UTC", type: "info" },
  { id: 3, text: "Nmap scan report for target-alpha.com (192.168.1.100)", type: "info" },
  { id: 4, text: "Host is up (0.023s latency).", type: "info" },
  { id: 5, text: "PORT     STATE SERVICE  VERSION", type: "header" },
  { id: 6, text: "22/tcp   open  ssh      OpenSSH 8.9p1 Ubuntu 3", type: "data" },
  { id: 7, text: "80/tcp   open  http     Apache httpd 2.4.49", type: "data" },
  { id: 8, text: "443/tcp  open  ssl/http Apache httpd 2.4.49", type: "data" },
  { id: 9, text: "3306/tcp open  mysql    MySQL 8.0.28", type: "data" },
  { id: 10, text: "", type: "blank" },
  { id: 11, text: "$ dirb https://target-alpha.com /usr/share/wordlists/common.txt", type: "cmd" },
  { id: 12, text: "-----------------", type: "info" },
  { id: 13, text: "DIRB v2.22 - Web Content Scanner", type: "info" },
  { id: 14, text: "WORDLIST_FILES: /usr/share/wordlists/common.txt", type: "info" },
  { id: 15, text: "-----------------", type: "info" },
  { id: 16, text: "GENERATED WORDS: 4612", type: "info" },
  { id: 17, text: "", type: "blank" },
  { id: 18, text: "---- Scanning URL: https://target-alpha.com/ ----", type: "info" },
  { id: 19, text: "==> DIRECTORY: https://target-alpha.com/admin/", type: "finding" },
  { id: 20, text: "==> DIRECTORY: https://target-alpha.com/api/", type: "finding" },
  { id: 21, text: "==> DIRECTORY: https://target-alpha.com/config/", type: "finding" },
  { id: 22, text: "+ https://target-alpha.com/robots.txt (CODE:200|SIZE:68)", type: "finding" },
  { id: 23, text: "", type: "blank" },
  { id: 24, text: "$ nuclei -u https://target-alpha.com -t cves/", type: "cmd" },
  { id: 25, text: "                     __     _", type: "info" },
  { id: 26, text: "   ____  __  _______/ /__  (_)", type: "info" },
  { id: 27, text: "  / __ \\/ / / / ___/ / _ \\/ /", type: "info" },
  { id: 28, text: " / / / / /_/ / /__/ /  __/ /   [INQ-2024.1.2]", type: "info" },
  { id: 29, text: "/_/ /_/\\__,_/\\___/_/\\___/_/", type: "info" },
  { id: 30, text: "", type: "blank" },
  { id: 31, text: "[2026-04-04 04:10:33] [info] Missing HSTS Header", type: "info" },
  { id: 32, text: "[2026-04-04 04:15:09] [medium] Open Redirect in /auth/callback", type: "warning" },
  { id: 33, text: "[2026-04-04 04:19:22] [info] Server version leak: Apache/2.4.49", type: "info" },
  { id: 34, text: "[2026-04-04 04:25:41] [critical] SQL Injection in /api/users?id=", type: "critical" },
  { id: 35, text: "[2026-04-04 04:28:05] [high] Reflected XSS in /search?q=", type: "warning" },
  { id: 36, text: "", type: "blank" },
  { id: 37, text: "$ curl -s https://target-alpha.com/config/settings.json", type: "cmd" },
  { id: 38, text: "{", type: "data" },
  { id: 39, text: '  "database": {', type: "data" },
  { id: 40, text: '    "host": "db.internal.target-alpha.com",', type: "data" },
  { id: 41, text: '    "user": "admin",', type: "data" },
  { id: 42, text: '    "password": "████████████████",', type: "critical" },
  { id: 43, text: '    "port": 3306', type: "data" },
  { id: 44, text: "  },", type: "data" },
  { id: 45, text: '  "api_key": "████████████████████████"', type: "critical" },
  { id: 46, text: "}", type: "data" },
  { id: 47, text: "", type: "blank" },
  { id: 48, text: "[!] CRITICAL: Auth bypass detected via IDOR on /api/users/{id}", type: "critical" },
  { id: 49, text: "[*] Testing privilege escalation vectors...", type: "info" },
  { id: 50, text: "[+] 9 vulnerabilities found | 3 Critical | 2 High | 2 Medium | 2 Low", type: "finding" },
];

const LINE_COLORS: Record<string, string> = {
  cmd: "var(--amber)",
  header: "var(--text-secondary)",
  data: "var(--text-primary)",
  info: "var(--text-secondary)",
  finding: "var(--green)",
  warning: "var(--amber)",
  critical: "var(--red)",
  blank: "transparent",
};

export interface LiveConsoleHandle {
  scrollToLine: (lineId: number) => void;
}

const LiveConsole = forwardRef<LiveConsoleHandle>(function LiveConsole(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState(0);

  useImperativeHandle(ref, () => ({
    scrollToLine(lineId: number) {
      const el = document.getElementById(`console-line-${lineId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.background = "rgba(0,255,65,0.1)";
        el.style.borderLeft = "3px solid var(--green)";
        setTimeout(() => {
          el.style.background = "transparent";
          el.style.borderLeft = "3px solid transparent";
        }, 2500);
      }
    },
  }));

  useEffect(() => {
    if (visibleLines >= SCAN_OUTPUT.length) return;
    const timer = setTimeout(() => {
      setVisibleLines((v) => v + 1);
    }, 80);
    return () => clearTimeout(timer);
  }, [visibleLines]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div className="panel scanline flex flex-col h-full">
      <div className="panel-header">
        <span className="dot" />
        Live Console
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#27c93f" }} />
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        style={{
          padding: "12px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          lineHeight: 1.7,
          minHeight: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        {SCAN_OUTPUT.slice(0, visibleLines).map((line) => (
          <div
            key={line.id}
            id={`console-line-${line.id}`}
            style={{
              color: LINE_COLORS[line.type] || "var(--text-primary)",
              fontWeight: line.type === "critical" ? 700 : 400,
              minHeight: line.type === "blank" ? 12 : "auto",
              paddingLeft: 8,
              borderLeft: "3px solid transparent",
              transition: "all 0.3s ease",
            }}
          >
            <span style={{ color: "var(--text-muted)", marginRight: 12, userSelect: "none", opacity: 0.4 }}>
              {String(line.id).padStart(2, "0")}
            </span>
            {line.text}
          </div>
        ))}
        {visibleLines < SCAN_OUTPUT.length && (
          <span className="animate-blink" style={{ color: "var(--green)" }}>
            ▊
          </span>
        )}
      </div>
    </div>
  );
});

export default LiveConsole;
