import { openClawStore } from "@/lib/openclaw/store";
import type { OpenClawStreamMessage } from "@/lib/openclaw/types";

export const runtime = "nodejs";

function encodeMessage(message: OpenClawStreamMessage) {
  return `data: ${JSON.stringify(message)}\n\n`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return Response.json({ error: "runId is required." }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          encodeMessage({
            type: "snapshot",
            snapshot: openClawStore.getSnapshot(runId),
          })
        )
      );

      const unsubscribe = openClawStore.subscribe(runId, (message) => {
        controller.enqueue(encoder.encode(encodeMessage(message)));
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15000);

      const close = () => {
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Client already disconnected.
        }
      };

      request.signal.addEventListener("abort", close, { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
