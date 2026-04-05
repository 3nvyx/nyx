import { openClawStore } from "@/lib/openclaw/store";
import { verifyBridgeRequest } from "@/lib/openclaw/auth";
import type { OpenClawEventKind } from "@/lib/openclaw/types";

export const runtime = "nodejs";

type IncomingEvent = {
  id?: string;
  runId: string;
  seq?: number;
  ts?: string;
  kind: OpenClawEventKind;
  payload?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const authError = verifyBridgeRequest(request);
  if (authError) return authError;

  const body = (await request.json()) as IncomingEvent | { events: IncomingEvent[] };
  const events = Array.isArray((body as { events?: IncomingEvent[] }).events)
    ? (body as { events: IncomingEvent[] }).events
    : [body as IncomingEvent];

  if (!events.length) {
    return Response.json({ error: "At least one event is required." }, { status: 400 });
  }

  const ingested = events.map((event) => {
    if (!event.runId || !event.kind) {
      throw new Error("Each event must include runId and kind.");
    }

    return openClawStore.ingestEvent({
      id: event.id,
      runId: event.runId,
      seq: event.seq,
      ts: event.ts,
      kind: event.kind,
      payload: event.payload ?? {},
    });
  });

  return Response.json({
    ok: true,
    ingested: ingested.length,
    runIds: [...new Set(ingested.map((item) => item.snapshot.runId))],
  });
}
