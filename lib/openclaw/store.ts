import {
  createEmptySnapshot,
  type CreateCommandInput,
  type LogLevel,
  type OpenClawCommand,
  type OpenClawFinding,
  type OpenClawMetrics,
  type OpenClawRunSnapshot,
  type OpenClawStreamMessage,
  type OpenClawTelemetryEvent,
  type RunStatus,
  type Severity,
} from "@/lib/openclaw/types";

type Listener = (message: OpenClawStreamMessage) => void;

type RunRecord = {
  snapshot: OpenClawRunSnapshot;
  nextSeq: number;
};

const MAX_LOG_LINES = 500;
const MAX_THOUGHTS = 120;
const MAX_FINDINGS = 200;
const MAX_COMMANDS = 100;

function clampPercent(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, value));
}

function normalizeSeverity(value: unknown): Severity {
  if (value === "P1" || value === "critical") return "P1";
  if (value === "P2" || value === "high") return "P2";
  if (value === "P3" || value === "medium") return "P3";
  return "P4";
}

function normalizeStatus(value: unknown, fallback: RunStatus): RunStatus {
  if (
    value === "idle" ||
    value === "queued" ||
    value === "running" ||
    value === "paused" ||
    value === "completed" ||
    value === "failed" ||
    value === "stopped"
  ) {
    return value;
  }

  return fallback;
}

function normalizeLogLevel(value: unknown): LogLevel {
  if (
    value === "cmd" ||
    value === "info" ||
    value === "header" ||
    value === "data" ||
    value === "finding" ||
    value === "warning" ||
    value === "critical"
  ) {
    return value;
  }

  return "info";
}

function capList<T>(items: T[], limit: number): T[] {
  return items.length <= limit ? items : items.slice(items.length - limit);
}

function maybeString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

class OpenClawStore {
  private runs = new Map<string, RunRecord>();
  private listeners = new Map<string, Set<Listener>>();

  private getOrCreateRecord(runId: string): RunRecord {
    const existing = this.runs.get(runId);
    if (existing) {
      return existing;
    }

    const created: RunRecord = {
      snapshot: createEmptySnapshot(runId),
      nextSeq: 1,
    };
    this.runs.set(runId, created);
    return created;
  }

  getSnapshot(runId: string): OpenClawRunSnapshot {
    return this.getOrCreateRecord(runId).snapshot;
  }

  subscribe(runId: string, listener: Listener): () => void {
    const listeners = this.listeners.get(runId) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(runId, listeners);

    return () => {
      const activeListeners = this.listeners.get(runId);
      if (!activeListeners) return;
      activeListeners.delete(listener);
      if (activeListeners.size === 0) {
        this.listeners.delete(runId);
      }
    };
  }

  private publish(runId: string, message: OpenClawStreamMessage) {
    const listeners = this.listeners.get(runId);
    if (!listeners) return;

    for (const listener of listeners) {
      listener(message);
    }
  }

  createCommand(input: CreateCommandInput): OpenClawCommand {
    const runId = input.runId ?? crypto.randomUUID();
    const record = this.getOrCreateRecord(runId);
    const now = new Date().toISOString();

    const command: OpenClawCommand = {
      id: crypto.randomUUID(),
      runId,
      type: input.type,
      payload: input.payload ?? {},
      issuedBy: input.issuedBy ?? "dashboard",
      status: "queued",
      createdAt: now,
    };

    const snapshot = record.snapshot;
    snapshot.commands = capList([...snapshot.commands, command], MAX_COMMANDS);
    snapshot.updatedAt = now;

    if (input.type === "start_scan") {
      snapshot.status = "queued";
      snapshot.target = maybeString(command.payload.target) ?? snapshot.target;
    }

    const message: OpenClawStreamMessage = {
      type: "snapshot",
      snapshot: { ...snapshot },
    };
    this.publish(runId, message);

    return command;
  }

  updateCommandStatus(runId: string, commandId: string, status: OpenClawCommand["status"], result?: string) {
    const record = this.getOrCreateRecord(runId);
    const now = new Date().toISOString();

    record.snapshot.commands = record.snapshot.commands.map((command) =>
      command.id === commandId
        ? {
            ...command,
            status,
            acknowledgedAt: status === "queued" ? command.acknowledgedAt : now,
            result: result ?? command.result,
          }
        : command
    );
    record.snapshot.updatedAt = now;

    this.publish(runId, {
      type: "snapshot",
      snapshot: { ...record.snapshot },
    });
  }

  getPendingCommands(runId?: string): OpenClawCommand[] {
    const runs = runId ? [this.getOrCreateRecord(runId)] : Array.from(this.runs.values());
    return runs.flatMap((record) => record.snapshot.commands.filter((command) => command.status === "queued"));
  }

  ingestEvent(rawEvent: Omit<OpenClawTelemetryEvent, "id" | "seq" | "ts"> & Partial<Pick<OpenClawTelemetryEvent, "id" | "seq" | "ts">>) {
    const record = this.getOrCreateRecord(rawEvent.runId);
    const event: OpenClawTelemetryEvent = {
      id: rawEvent.id ?? crypto.randomUUID(),
      runId: rawEvent.runId,
      seq: rawEvent.seq ?? record.nextSeq,
      ts: rawEvent.ts ?? new Date().toISOString(),
      kind: rawEvent.kind,
      payload: rawEvent.payload ?? {},
    };

    record.nextSeq = Math.max(record.nextSeq + 1, event.seq + 1);

    const snapshot = record.snapshot;
    snapshot.updatedAt = event.ts;

    if (event.kind === "status") {
      snapshot.status = normalizeStatus(event.payload.status, snapshot.status);
      snapshot.target = maybeString(event.payload.target) ?? snapshot.target;
      snapshot.agentId = maybeString(event.payload.agentId) ?? snapshot.agentId;
      snapshot.metrics.progress = clampPercent(event.payload.progress, snapshot.metrics.progress);
      snapshot.metrics.riskPercent = clampPercent(event.payload.riskPercent, snapshot.metrics.riskPercent);
    }

    if (event.kind === "metric") {
      snapshot.metrics = this.mergeMetrics(snapshot.metrics, event.payload);
    }

    if (event.kind === "log") {
      snapshot.logs = capList(
        [
          ...snapshot.logs,
          {
            id: maybeString(event.payload.logId) ?? event.id,
            seq: event.seq,
            ts: event.ts,
            text: maybeString(event.payload.text) ?? "",
            level: normalizeLogLevel(event.payload.level),
          },
        ],
        MAX_LOG_LINES
      );
    }

    if (event.kind === "thought") {
      snapshot.thoughts = capList(
        [
          ...snapshot.thoughts,
          {
            id: maybeString(event.payload.thoughtId) ?? event.id,
            ts: event.ts,
            text: maybeString(event.payload.text) ?? "",
          },
        ],
        MAX_THOUGHTS
      );
    }

    if (event.kind === "finding") {
      const finding: OpenClawFinding = {
        id: maybeString(event.payload.findingId) ?? event.id,
        ts: event.ts,
        severity: normalizeSeverity(event.payload.severity),
        title: maybeString(event.payload.title) ?? "New finding",
        description: maybeString(event.payload.description),
        evidenceLogId: maybeString(event.payload.evidenceLogId),
      };

      const deduped = snapshot.findings.filter((item) => item.id !== finding.id);
      snapshot.findings = capList([...deduped, finding], MAX_FINDINGS);
      snapshot.metrics.totalFindings = snapshot.findings.length;
      snapshot.metrics.countsBySeverity = tallyFindings(snapshot.findings);
      snapshot.metrics.riskPercent = deriveRiskPercent(snapshot.findings, snapshot.metrics.riskPercent);
    }

    if (event.kind === "command_ack") {
      const commandId = maybeString(event.payload.commandId);
      if (commandId) {
        snapshot.commands = snapshot.commands.map((command) =>
          command.id === commandId
            ? {
                ...command,
                status:
                  event.payload.status === "completed" || event.payload.status === "failed"
                    ? event.payload.status
                    : "acknowledged",
                acknowledgedAt: event.ts,
                result: maybeString(event.payload.result),
              }
            : command
        );
      }

      const nextStatus = normalizeStatus(event.payload.runStatus, snapshot.status);
      snapshot.status = nextStatus;
    }

    const message: OpenClawStreamMessage = {
      type: "event",
      event,
      snapshot: { ...snapshot },
    };
    this.publish(event.runId, message);
    return message;
  }

  private mergeMetrics(current: OpenClawMetrics, payload: Record<string, unknown>): OpenClawMetrics {
    const counts = {
      ...current.countsBySeverity,
      ...(typeof payload.countsBySeverity === "object" && payload.countsBySeverity
        ? payload.countsBySeverity
        : {}),
    } as Record<Severity, number>;

    return {
      progress: clampPercent(payload.progress, current.progress),
      riskPercent: clampPercent(payload.riskPercent, current.riskPercent),
      totalFindings:
        typeof payload.totalFindings === "number" && !Number.isNaN(payload.totalFindings)
          ? Math.max(0, payload.totalFindings)
          : current.totalFindings,
      countsBySeverity: {
        P1: typeof counts.P1 === "number" ? counts.P1 : current.countsBySeverity.P1,
        P2: typeof counts.P2 === "number" ? counts.P2 : current.countsBySeverity.P2,
        P3: typeof counts.P3 === "number" ? counts.P3 : current.countsBySeverity.P3,
        P4: typeof counts.P4 === "number" ? counts.P4 : current.countsBySeverity.P4,
      },
    };
  }
}

function tallyFindings(findings: OpenClawFinding[]): Record<Severity, number> {
  return findings.reduce(
    (counts, finding) => {
      counts[finding.severity] += 1;
      return counts;
    },
    { P1: 0, P2: 0, P3: 0, P4: 0 }
  );
}

function deriveRiskPercent(findings: OpenClawFinding[], fallback: number): number {
  if (findings.length === 0) return fallback;

  const weightedScore = findings.reduce((score, finding) => {
    if (finding.severity === "P1") return score + 30;
    if (finding.severity === "P2") return score + 18;
    if (finding.severity === "P3") return score + 10;
    return score + 4;
  }, 0);

  return Math.max(5, Math.min(100, weightedScore));
}

declare global {
  var __openclawStore__: OpenClawStore | undefined;
}

export const openClawStore = globalThis.__openclawStore__ ?? new OpenClawStore();

if (process.env.NODE_ENV !== "production") {
  globalThis.__openclawStore__ = openClawStore;
}
