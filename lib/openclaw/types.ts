export type RunStatus =
  | "idle"
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "stopped";

export type Severity = "P1" | "P2" | "P3" | "P4";

export type LogLevel = "cmd" | "info" | "header" | "data" | "finding" | "warning" | "critical";

export type OpenClawCommandType =
  | "start_scan"
  | "pause"
  | "resume"
  | "stop"
  | "set_scope"
  | "note";

export type OpenClawEventKind =
  | "log"
  | "thought"
  | "finding"
  | "metric"
  | "status"
  | "command_ack";

export interface OpenClawLogLine {
  id: string;
  seq: number;
  ts: string;
  text: string;
  level: LogLevel;
}

export interface OpenClawThought {
  id: string;
  ts: string;
  text: string;
}

export interface OpenClawFinding {
  id: string;
  ts: string;
  severity: Severity;
  title: string;
  description?: string;
  evidenceLogId?: string;
}

export interface OpenClawMetrics {
  progress: number;
  riskPercent: number;
  totalFindings: number;
  countsBySeverity: Record<Severity, number>;
}

export interface OpenClawCommand {
  id: string;
  runId: string;
  type: OpenClawCommandType;
  payload: Record<string, unknown>;
  issuedBy: string;
  status: "queued" | "acknowledged" | "completed" | "failed";
  createdAt: string;
  acknowledgedAt?: string;
  result?: string;
}

export interface TelegramCommandEnvelope {
  version: 1;
  kind: "openclaw_command";
  command: Pick<OpenClawCommand, "id" | "runId" | "type" | "payload" | "issuedBy" | "createdAt">;
}

export interface OpenClawTelemetryEvent {
  id: string;
  runId: string;
  seq: number;
  ts: string;
  kind: OpenClawEventKind;
  payload: Record<string, unknown>;
}

export interface OpenClawRunSnapshot {
  runId: string;
  target: string | null;
  agentId: string | null;
  status: RunStatus;
  logs: OpenClawLogLine[];
  thoughts: OpenClawThought[];
  findings: OpenClawFinding[];
  metrics: OpenClawMetrics;
  commands: OpenClawCommand[];
  updatedAt: string | null;
}

export type OpenClawStreamMessage =
  | {
      type: "snapshot";
      snapshot: OpenClawRunSnapshot;
    }
  | {
      type: "event";
      event: OpenClawTelemetryEvent;
      snapshot: OpenClawRunSnapshot;
    };

export interface CreateCommandInput {
  runId?: string;
  type: OpenClawCommandType;
  payload?: Record<string, unknown>;
  issuedBy?: string;
}

export function createEmptySnapshot(runId: string): OpenClawRunSnapshot {
  return {
    runId,
    target: null,
    agentId: null,
    status: "idle",
    logs: [],
    thoughts: [],
    findings: [],
    metrics: {
      progress: 0,
      riskPercent: 0,
      totalFindings: 0,
      countsBySeverity: {
        P1: 0,
        P2: 0,
        P3: 0,
        P4: 0,
      },
    },
    commands: [],
    updatedAt: null,
  };
}
