"use client";

import { useEffect, useState } from "react";
import { createEmptySnapshot, type OpenClawRunSnapshot, type OpenClawStreamMessage } from "@/lib/openclaw/types";

type OpenClawRunState = {
  snapshot: OpenClawRunSnapshot | null;
  connectedRunId: string | null;
  errorRunId: string | null;
  errorMessage: string | null;
};

type UseOpenClawRunResult = {
  snapshot: OpenClawRunSnapshot | null;
  isConnecting: boolean;
  error: string | null;
};

export function useOpenClawRun(runId: string | null): UseOpenClawRunResult {
  const [state, setState] = useState<OpenClawRunState>({
    snapshot: null,
    connectedRunId: null,
    errorRunId: null,
    errorMessage: null,
  });

  useEffect(() => {
    if (!runId) {
      return;
    }

    const activeRunId = runId;
    let eventSource: EventSource | null = null;
    let closed = false;

    async function loadSnapshot() {
      const response = await fetch(`/api/openclaw/status?runId=${encodeURIComponent(activeRunId)}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load run state (${response.status}).`);
      }

      const body = (await response.json()) as { snapshot: OpenClawRunSnapshot };
      if (!closed) {
        setState((current) => ({
          ...current,
          snapshot: body.snapshot,
        }));
      }
    }

    function connectStream() {
      eventSource = new EventSource(`/api/openclaw/stream?runId=${encodeURIComponent(activeRunId)}`);

      eventSource.onopen = () => {
        if (!closed) {
          setState((current) => ({
            ...current,
            connectedRunId: activeRunId,
            errorRunId: null,
            errorMessage: null,
          }));
        }
      };

      eventSource.onmessage = (message) => {
        if (closed) return;

        const parsed = JSON.parse(message.data) as OpenClawStreamMessage;
        setState((current) => ({
          ...current,
          snapshot: parsed.snapshot,
          connectedRunId: activeRunId,
          errorRunId: null,
          errorMessage: null,
        }));
      };

      eventSource.onerror = () => {
        if (!closed) {
          setState((current) => ({
            ...current,
            connectedRunId: null,
            errorRunId: activeRunId,
            errorMessage: "Live connection interrupted. Retrying…",
          }));
        }
      };
    }

    loadSnapshot()
      .then(connectStream)
      .catch((caughtError: unknown) => {
        if (!closed) {
          setState((current) => ({
            ...current,
            connectedRunId: null,
            errorRunId: activeRunId,
            errorMessage: caughtError instanceof Error ? caughtError.message : "Unable to load run state.",
          }));
        }
      });

    return () => {
      closed = true;
      eventSource?.close();
    };
  }, [runId]);

  const snapshot = runId
    ? state.snapshot?.runId === runId
      ? state.snapshot
      : createEmptySnapshot(runId)
    : null;

  return {
    snapshot,
    isConnecting: runId ? state.connectedRunId !== runId : false,
    error: runId && state.errorRunId === runId ? state.errorMessage : null,
  };
}
